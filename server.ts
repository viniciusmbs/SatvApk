import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Proxy & de-sandbox endpoint for Web Embed players (e.g. EmbedTV, RDSE, RDCanais)
  app.get('/api/embed-frame', async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      res.status(400).send('Missing "url" query parameter');
      return;
    }

    try {
      // 1. Fetch initial upstream page with 10s timeout
      const upstream = await fetch(targetUrl, {
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Referer': targetUrl,
        },
      });

      if (!upstream.ok) {
        res.status(upstream.status).send(`Failed to fetch upstream embed: ${upstream.statusText}`);
        return;
      }

      let html = await upstream.text();
      let currentOrigin = new URL(targetUrl).origin;

      // 2. If the page is a container iframe wrapper (like in rdcanais or v1.rdse.buzz),
      // resolve directly to the real player frame so we have direct access to <video> and player controls
      const iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"/i);
      if (iframeMatch && iframeMatch[1] && !iframeMatch[1].startsWith('about:')) {
        const rawInner = iframeMatch[1].replace(/&amp;/g, '&');
        try {
          const innerUrl = new URL(rawInner, targetUrl).toString();
          const innerUpstream = await fetch(innerUrl, {
            signal: AbortSignal.timeout(8000),
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Referer': targetUrl,
            },
          });
          if (innerUpstream.ok) {
            const innerHtml = await innerUpstream.text();
            if (
              innerHtml.includes('<video') ||
              innerHtml.includes('Clappr') ||
              innerHtml.includes('player') ||
              innerHtml.includes('jwplayer')
            ) {
              html = innerHtml;
              currentOrigin = new URL(innerUrl).origin;
            }
          }
        } catch {
          // fallback to base html
        }
      }

      // 3. Strip ad popups, popunders (aclib, runPop) that cause white screens
      html = html.replace(/<script[^>]*src="[^"]*acscdn\.com[^"]*"[^>]*><\/script>/gi, '');
      html = html.replace(/<script[^>]*src="[^"]*adcash[^"]*"[^>]*><\/script>/gi, '');
      html = html.replace(/<script[^>]*src="[^"]*popads[^"]*"[^>]*><\/script>/gi, '');
      html = html.replace(/aclib\s*\.\s*runPop\s*\([^)]*\);?/gi, '');

      // 4. Neutralize all sandbox checking routines in upstream scripts
      html = html.replace(
        /function\s+detectSandbox\s*\([^)]*\{[\s\S]*?\}/gi,
        'function detectSandbox() { return false; }'
      );
      html = html.replace(/if\s*\(\s*detectSandbox\s*\(\s*\)\s*\)/gi, 'if (false)');
      html = html.replace(
        /function\s+sbChecker\s*\([^)]*\{[\s\S]*?\}/gi,
        'function sbChecker() { return false; }'
      );
      html = html.replace(/if\s*\(\s*sbChecker\s*\(\s*\)\s*\)/gi, 'if (false)');

      // 5. Inject auto-play enforcer, black background, remote controls & hardware acceleration
      const injectedTags = `
        <base href="${currentOrigin}/">
        <style>
          html, body {
            background-color: #000000 !important;
            color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          video, .player_screen, #video, .player, [class*="player"] {
            background-color: #000000 !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
          }
          iframe {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            border: none !important;
            z-index: 10 !important;
            background: #000000 !important;
          }
          #sandbox_detect, .sandbox-banner, [id*="sandbox"], #sb-message, div[class*="popup"], div[id*="popup"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          #satv-back-btn {
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 2147483647;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(15, 23, 42, 0.88);
            color: #ffffff;
            border: 1.5px solid rgba(239, 68, 68, 0.8);
            border-radius: 12px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            backdrop-filter: blur(8px);
            transition: opacity 0.4s ease, transform 0.15s ease;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.6);
            user-select: none;
            outline: none;
          }
          #satv-back-btn:hover, #satv-back-btn:focus {
            background: #ef4444;
            transform: scale(1.05);
            border-color: #ffffff;
          }
        </style>

        <div id="satv-back-btn" tabindex="0" role="button" aria-label="Voltar para a lista de canais">
          <span style="color:#ef4444;font-size:16px;font-weight:bold;line-height:1;">&#8592;</span>
          <span>Voltar aos Canais</span>
        </div>

        <script>
          // Neutralize sandbox check globals
          window.detectSandbox = function() { return false; };
          window.sbChecker = function() { return false; };
          window.open = function() { return null; }; // block ad popunders
          try {
            Object.defineProperty(window, 'detectSandbox', { value: function() { return false; }, writable: false });
            Object.defineProperty(window, 'sbChecker', { value: function() { return false; }, writable: false });
          } catch (e) {}

          // Back button logic with idle auto-hide and Remote Control Back button support
          (function() {
            var backBtn = document.getElementById('satv-back-btn');
            function goBack() {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }

            if (backBtn) {
              backBtn.addEventListener('click', goBack);
              backBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goBack();
                }
              });
            }

            var hideTimer = null;
            function showBackButton() {
              if (!backBtn) return;
              backBtn.style.opacity = '1';
              backBtn.style.pointerEvents = 'auto';
              clearTimeout(hideTimer);
              hideTimer = setTimeout(function() {
                backBtn.style.opacity = '0';
                backBtn.style.pointerEvents = 'none';
              }, 4500);
            }

            showBackButton();
            ['mousemove', 'keydown', 'touchstart'].forEach(function(evt) {
              window.addEventListener(evt, showBackButton, { passive: true });
            });

            // Remote control back keys (Escape, Backspace, Android Back 4, Tizen 10009)
            window.addEventListener('keydown', function(e) {
              var code = e.keyCode || e.which;
              if (code === 27 || code === 8 || code === 4 || code === 10009 || e.key === 'Escape' || e.key === 'Backspace') {
                e.preventDefault();
                goBack();
              }
            });
          })();

          // Auto-play trigger: continuously monitor and start video playback on Rede Canais, EmbedTV, and all sources
          (function() {
            var attemptCount = 0;
            var maxAttempts = 80; // Try for up to 40 seconds
            var playInterval = setInterval(function() {
              attemptCount++;
              if (attemptCount > maxAttempts) {
                clearInterval(playInterval);
                return;
              }

              // 1. Click center play button or play-pause button if present
              var playButtons = [
                '.player-poster',
                '[data-poster]',
                'button[data-playpause]',
                '[data-player]',
                '.media-control-button',
                '#center-play-btn',
                '.center-play-btn',
                '.vjs-big-play-button',
                '.jw-display-icon-container',
                '.jw-icon-playback',
                '[aria-label="Play"]',
                '[aria-label="Reproduzir"]',
                '.play-btn',
                '#play-button',
                '.play-button',
                'div[style*="z-index: 2147483647"]',
                'div[style*="z-index:2147483647"]'
              ];

              for (var b = 0; b < playButtons.length; b++) {
                var btn = document.querySelector(playButtons[b]);
                if (btn && btn.offsetParent !== null) {
                  try { btn.click(); } catch(e) {}
                }
              }

              // 2. Play all video elements directly with hardware acceleration
              var videos = document.querySelectorAll('video');
              var anyPlaying = false;
              for (var i = 0; i < videos.length; i++) {
                var v = videos[i];
                v.style.backgroundColor = '#000000';
                v.style.transform = 'translateZ(0)';
                if (!v.paused && v.currentTime > 0) {
                  anyPlaying = true;
                  continue;
                }
                try {
                  v.muted = false; // prioritize sound
                  var p = v.play();
                  if (p && typeof p.catch === 'function') {
                    p.catch(function() {
                      // If browser blocks unmuted autoplay, play muted first then unmute immediately
                      v.muted = true;
                      v.play().then(function() {
                        setTimeout(function() { v.muted = false; }, 300);
                      }).catch(function(){});
                    });
                  }
                } catch(e) {}
              }

              // 3. Trigger Clappr / JWPlayer if available
              if (window.player && typeof window.player.play === 'function') {
                try { window.player.play(); } catch(e) {}
              }
              if (window.jwplayer) {
                try {
                  var jw = window.jwplayer();
                  if (jw && typeof jw.play === 'function') jw.play();
                } catch(e) {}
              }

              // 4. Dispatch synthetic center click every 2 seconds if still not playing
              if (!anyPlaying && attemptCount % 4 === 0) {
                try {
                  var cx = window.innerWidth / 2;
                  var cy = window.innerHeight / 2;
                  var targetEl = document.elementFromPoint(cx, cy);
                  if (targetEl && targetEl !== document.body && targetEl !== document.documentElement && targetEl.id !== 'satv-back-btn') {
                    targetEl.click();
                  }
                } catch(e) {}
              }
            }, 500);

            // Also trigger play on any user remote control interaction anywhere in the window
            ['click', 'keydown', 'touchstart'].forEach(function(evt) {
              window.addEventListener(evt, function() {
                var videos = document.querySelectorAll('video');
                for (var i = 0; i < videos.length; i++) {
                  videos[i].muted = false;
                  videos[i].play().catch(function(){});
                }
                if (window.player && typeof window.player.play === 'function') {
                  try { window.player.play(); } catch(e) {}
                }
              }, { passive: true });
            });
          })();
        </script>
      `;

      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${injectedTags}`);
      } else {
        html = injectedTags + html;
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.send(html);
    } catch (err: any) {
      res.status(502).send('Error loading embed frame: ' + (err.message || String(err)));
    }
  });

  // Stream proxy endpoint to bypass CORS and mixed-content restrictions
  app.get('/api/stream', async (req, res) => {
    const streamUrl = req.query.url as string;
    if (!streamUrl) {
      res.status(400).json({ error: 'Missing "url" query parameter' });
      return;
    }

    try {
      const response = await fetch(streamUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        res.status(response.status).json({ error: `Upstream error: ${response.statusText}` });
        return;
      }

      // Forward relevant headers
      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lowerKey)) {
          res.setHeader(key, value);
        }
      });

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      if (!response.body) {
        res.end();
        return;
      }

      const reader = response.body.getReader();
      req.on('close', () => {
        reader.cancel().catch(() => {});
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (err: any) {
      if (!res.headersSent) {
        res.status(502).json({ error: err.message || 'Error connecting to upstream stream' });
      }
    }
  });

  // Proxy for M3U playlists
  app.get('/api/proxy-playlist', async (req, res) => {
    const playlistUrl = req.query.url as string;
    if (!playlistUrl) {
      res.status(400).json({ error: 'Missing "url" query parameter' });
      return;
    }

    try {
      const response = await fetch(playlistUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        res.status(response.status).json({ error: `Upstream error: ${response.statusText}` });
        return;
      }

      const content = await response.text();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(content);
    } catch (err: any) {
      res.status(502).json({ error: err.message || 'Error fetching playlist' });
    }
  });

  // Cached in-memory Brazil EPG data
  let cachedEpgData: any = null;
  let lastEpgFetch = 0;
  const EPG_CACHE_TTL = 30 * 60 * 1000; // 30 minutos

  app.get('/api/epg', async (req, res) => {
    const now = Date.now();
    if (cachedEpgData && now - lastEpgFetch < EPG_CACHE_TTL) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json(cachedEpgData);
      return;
    }

    try {
      const epgUrl = 'https://raw.githubusercontent.com/limaalef/BrazilTVEPG/main/claro.xml';
      const upstream = await fetch(epgUrl, {
        signal: AbortSignal.timeout(15000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/xml, application/xml, */*',
        },
      });

      if (!upstream.ok) {
        if (cachedEpgData) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.json(cachedEpgData);
          return;
        }
        res.status(502).json({ error: 'Failed to fetch upstream BrazilTVEPG' });
        return;
      }

      const xmlText = await upstream.text();
      const programmes: Record<string, any[]> = {};
      const progRegex = /<programme\s+start="([^"]+)"\s+stop="([^"]+)"\s+channel="([^"]+)">([\s\S]*?)<\/programme>/g;

      const parseTime = (str: string): number => {
        try {
          const clean = str.trim();
          const year = parseInt(clean.slice(0, 4), 10);
          const month = parseInt(clean.slice(4, 6), 10) - 1;
          const day = parseInt(clean.slice(6, 8), 10);
          const hour = parseInt(clean.slice(8, 10), 10);
          const min = parseInt(clean.slice(10, 12), 10);
          const sec = parseInt(clean.slice(12, 14), 10) || 0;
          let offsetMinutes = -180;
          const match = clean.match(/([+-])(\d{2})(\d{2})$/);
          if (match) {
            const sign = match[1] === '+' ? 1 : -1;
            offsetMinutes = sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
          }
          return Date.UTC(year, month, day, hour, min, sec) - offsetMinutes * 60 * 1000;
        } catch {
          return 0;
        }
      };

      const minRelevantTime = now - 6 * 60 * 60 * 1000;
      const maxRelevantTime = now + 24 * 60 * 60 * 1000;

      let match;
      while ((match = progRegex.exec(xmlText)) !== null) {
        const startMs = parseTime(match[1]);
        const stopMs = parseTime(match[2]);
        const rawChannel = match[3];
        const inner = match[4];

        if (stopMs < minRelevantTime || startMs > maxRelevantTime) continue;

        const titleMatch = inner.match(/<title[^>]*>([\s\S]*?)<\/title>/);
        const descMatch = inner.match(/<desc[^>]*>([\s\S]*?)<\/desc>/);
        const catMatch = inner.match(/<category[^>]*>([\s\S]*?)<\/category>/);

        const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : '';
        const desc = descMatch ? descMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : '';
        const category = catMatch ? catMatch[1].trim() : '';
        const chKey = rawChannel.replace(/&amp;/g, '&').trim();

        if (!programmes[chKey]) programmes[chKey] = [];
        programmes[chKey].push({ start: startMs, stop: stopMs, title, desc, category });
      }

      cachedEpgData = { updatedAt: now, channelCount: Object.keys(programmes).length, programmes };
      lastEpgFetch = now;

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json(cachedEpgData);
    } catch (err: any) {
      if (cachedEpgData) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(cachedEpgData);
        return;
      }
      res.status(500).json({ error: err.message || 'Error processing EPG' });
    }
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
