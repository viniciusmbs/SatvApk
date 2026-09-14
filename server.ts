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
      // 1. Fetch initial upstream page
      const upstream = await fetch(targetUrl, {
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
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Referer': targetUrl,
            },
          });
          if (innerUpstream.ok) {
            const innerHtml = await innerUpstream.text();
            if (innerHtml.includes('<video') || innerHtml.includes('Clappr') || innerHtml.includes('player')) {
              html = innerHtml;
              currentOrigin = new URL(innerUrl).origin;
            }
          }
        } catch {
          // fallback to base html
        }
      }

      // 3. Neutralize all sandbox checking routines in upstream scripts
      html = html.replace(
        /function\s+detectSandbox\s*\([^)]*\)\s*\{[\s\S]*?return\s+false;\s*\}/gi,
        'function detectSandbox() { return false; }'
      );
      html = html.replace(/if\s*\(\s*detectSandbox\s*\(\s*\)\s*\)/gi, 'if (false)');
      html = html.replace(/function\s+sbChecker\s*\([^)]*\)\s*\{[\s\S]*?return\s+false;\s*\}/gi, 'function sbChecker() { return false; }');
      html = html.replace(/if\s*\(\s*sbChecker\s*\(\s*\)\s*\)/gi, 'if (false)');

      // 4. Inject auto-play enforcer & sandbox neutralizer script
      const injectedTags = `
        <base href="${currentOrigin}/">
        <style>
          #sandbox_detect, .sandbox-banner, [id*="sandbox"], #sb-message {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        </style>
        <script>
          // Neutralize sandbox check globals
          window.detectSandbox = function() { return false; };
          window.sbChecker = function() { return false; };
          try {
            Object.defineProperty(window, 'detectSandbox', { value: function() { return false; }, writable: false });
            Object.defineProperty(window, 'sbChecker', { value: function() { return false; }, writable: false });
          } catch (e) {}

          // Auto-play trigger: continuously monitor and start video playback
          (function() {
            var attemptCount = 0;
            var maxAttempts = 60; // Try for up to 30 seconds
            var playInterval = setInterval(function() {
              attemptCount++;
              if (attemptCount > maxAttempts) {
                clearInterval(playInterval);
                return;
              }

              // 1. Click center play button or play-pause button if present
              var centerBtn = document.getElementById('center-play-btn') || 
                              document.querySelector('.center-play-btn') ||
                              document.querySelector('[aria-label="Play"]') ||
                              document.querySelector('.play-btn') ||
                              document.querySelector('.vjs-big-play-button');
              if (centerBtn && centerBtn.offsetParent !== null) {
                try { centerBtn.click(); } catch(e) {}
              }

              // 2. Play all video elements directly
              var videos = document.querySelectorAll('video');
              var anyPlaying = false;
              for (var i = 0; i < videos.length; i++) {
                var v = videos[i];
                if (!v.paused && v.currentTime > 0) {
                  anyPlaying = true;
                  continue;
                }
                try {
                  v.muted = false; // prioritize sound
                  var p = v.play();
                  if (p && typeof p.catch === 'function') {
                    p.catch(function() {
                      // If browser requires user interaction for unmuted autoplay, play muted first then unmute
                      v.muted = true;
                      v.play().catch(function(){});
                    });
                  }
                } catch(e) {}
              }

              // 3. Trigger Clappr player if available
              if (window.player && typeof window.player.play === 'function') {
                try { window.player.play(); } catch(e) {}
              }

              if (anyPlaying) {
                // If already playing smoothly, stop polling early
                clearInterval(playInterval);
              }
            }, 500);

            // Also trigger play on the very first user interaction anywhere in the window
            ['click', 'keydown', 'touchstart'].forEach(function(evt) {
              window.addEventListener(evt, function() {
                var videos = document.querySelectorAll('video');
                for (var i = 0; i < videos.length; i++) {
                  videos[i].muted = false;
                  videos[i].play().catch(function(){});
                }
              }, { once: true });
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
      const upstream = await fetch(playlistUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!upstream.ok) {
        res.status(upstream.status).json({ error: `Failed to fetch playlist: ${upstream.statusText}` });
        return;
      }

      const text = await upstream.text();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(text);
    } catch (err: any) {
      res.status(502).json({ error: err.message });
    }
  });

  // Cached in-memory Brazil EPG data
  let cachedEpgData: any = null;
  let lastEpgFetch = 0;
  const EPG_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  app.get('/api/epg', async (req, res) => {
    const now = Date.now();
    if (cachedEpgData && now - lastEpgFetch < EPG_CACHE_TTL) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json(cachedEpgData);
      return;
    }

    try {
      // Fetch both claro.xml and epg.xml from BrazilTVEPG to maximize channels and synopses
      const urls = [
        'https://raw.githubusercontent.com/limaalef/BrazilTVEPG/main/claro.xml',
        'https://raw.githubusercontent.com/limaalef/BrazilTVEPG/main/epg.xml',
      ];

      const responses = await Promise.allSettled(
        urls.map((u) =>
          fetch(u, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              Accept: 'text/xml, application/xml, */*',
            },
          }).then((r) => (r.ok ? r.text() : ''))
        )
      );

      const xmlTexts = responses
        .map((r) => (r.status === 'fulfilled' ? r.value : ''))
        .filter(Boolean);

      if (xmlTexts.length === 0) {
        if (cachedEpgData) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.json(cachedEpgData);
          return;
        }
        res.status(502).json({ error: 'Failed to fetch upstream BrazilTVEPG' });
        return;
      }

      // Lightweight regex parser for XMLTV programmes
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

      // Relevant time window: 6 hours ago to 24 hours ahead
      const minRelevantTime = now - 6 * 60 * 60 * 1000;
      const maxRelevantTime = now + 24 * 60 * 60 * 1000;

      for (const xmlText of xmlTexts) {
        let match;
        progRegex.lastIndex = 0;
        while ((match = progRegex.exec(xmlText)) !== null) {
          const startStr = match[1];
          const stopStr = match[2];
          const rawChannel = match[3];
          const inner = match[4];

          const startMs = parseTime(startStr);
          const stopMs = parseTime(stopStr);

          if (stopMs < minRelevantTime || startMs > maxRelevantTime) {
            continue;
          }

          const titleMatch = inner.match(/<title[^>]*>([\s\S]*?)<\/title>/);
          const descMatch = inner.match(/<desc[^>]*>([\s\S]*?)<\/desc>/);
          const catMatch = inner.match(/<category[^>]*>([\s\S]*?)<\/category>/);

          const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : '';
          const desc = descMatch ? descMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : '';
          const category = catMatch ? catMatch[1].trim() : '';

          const chKey = rawChannel.replace(/&amp;/g, '&').trim();
          if (!programmes[chKey]) {
            programmes[chKey] = [];
          }

          programmes[chKey].push({
            start: startMs,
            stop: stopMs,
            title,
            desc,
            category,
          });
        }
      }

      // Sort programmes for each channel
      for (const chKey of Object.keys(programmes)) {
        programmes[chKey].sort((a, b) => a.start - b.start);
      }

      cachedEpgData = {
        updatedAt: now,
        channelCount: Object.keys(programmes).length,
        programmes,
      };
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
      res.status(500).json({ error: err.message || 'Error processing EPG XML' });
    }
  });


  // Vite middleware for development
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
    console.log(`SATV Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
