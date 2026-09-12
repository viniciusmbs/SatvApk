import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, Play, Pause, AlertCircle, Loader2 } from 'lucide-react';
import { Channel } from '../types';

interface NativeHlsPlayerProps {
  channel: Channel;
  onClose: () => void;
}

export const NativeHlsPlayer: React.FC<NativeHlsPlayerProps> = ({ channel, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    setLoading(true);
    setError(null);

    const isHlsUrl = channel.url.includes('.m3u8') || !channel.url.endsWith('.mp4');

    if (Hls.isSupported() && isHlsUrl) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(channel.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              setError('Não foi possível carregar o sinal deste canal.');
              setLoading(false);
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || channel.url.endsWith('.mp4')) {
      // Suporte nativo do navegador/WebView (Ex: Safari ou MP4 direto)
      video.src = channel.url;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setError('Erro ao reproduzir stream nativo.');
        setLoading(false);
      });
    } else {
      setError('Formato de vídeo não suportado neste dispositivo.');
      setLoading(false);
    }

    // Tecla Voltar ou OK do controle remoto
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.keyCode === 27 || e.keyCode === 8 || e.key === 'Backspace' || e.key === 'Escape') {
        // Voltar
        e.preventDefault();
        onClose();
      } else if (e.keyCode === 13 || e.keyCode === 23 || e.key === 'Enter') {
        // Play / Pause no OK do controle
        e.preventDefault();
        if (video.paused) {
          video.play();
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (hls) {
        hls.destroy();
      }
    };
  }, [channel.url, onClose]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Botão de Fechar / Voltar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 hover:bg-red-600/80 text-white px-4 py-2 rounded-lg border border-white/20 transition-all cursor-pointer"
        autoFocus
      >
        <X className="w-5 h-5" />
        <span className="text-sm font-medium">Voltar aos Canais (ESC / Voltar)</span>
      </button>

      {/* Info do canal no topo */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-lg border border-white/10 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-white font-bold tracking-wide uppercase">{channel.name}</span>
        <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded">{channel.group}</span>
      </div>

      {/* Vídeo */}
      <div className="relative w-full h-full flex items-center justify-center" onClick={togglePlay}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          autoPlay
        />

        {/* Indicador de Carregamento */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
            <p className="text-white font-medium">Sintonizando {channel.name}...</p>
          </div>
        )}

        {/* Indicador de Erro */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 px-6 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500" />
            <p className="text-white font-medium text-lg">{error}</p>
            <p className="text-gray-400 text-sm max-w-md">O servidor IPTV do canal pode estar temporariamente fora do ar ou com limite de conexões.</p>
            <button
              onClick={onClose}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold"
            >
              Voltar aos Canais
            </button>
          </div>
        )}

        {/* Overlay Pause/Play quando clicado */}
        {!loading && !error && !isPlaying && (
          <div className="absolute pointer-events-none bg-black/50 p-4 rounded-full border border-white/20">
            <Play className="w-10 h-10 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};
