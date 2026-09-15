import React, { useState, useEffect } from 'react';
import { LayoutGrid, Menu, Rows3, Clock, MoreVertical, Volume2, VolumeX } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  totalChannels: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
  onOpenMenu?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  totalChannels,
  viewMode,
  setViewMode,
  favoritesCount = 0,
  onOpenFavorites,
  onOpenMenu,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  // Atalho inteligente para Smart TV / Fire Stick (Botão Avançar ⏩ / Play / F12)
  useEffect(() => {
    const handleRemoteMenuKey = (e: KeyboardEvent) => {
      // Teclas comuns de atalho em controles de TV e navegador (Avançar, Play ou F12)
      const isMenuKey =
        e.key === 'MediaFastForward' ||
        e.key === 'MediaPlayPause' ||
        e.key === 'F12' ||
        e.keyCode === 415 || // Play code comum em TVs
        e.keyCode === 417;   // Fast Forward code comum em TVs

      if (isMenuKey) {
        e.preventDefault();
        if (onOpenMenu) {
          onOpenMenu();
        }
      }
    };

    window.addEventListener('keydown', handleRemoteMenuKey);
    return () => {
      window.removeEventListener('keydown', handleRemoteMenuKey);
    };
  }, [onOpenMenu]);

  const toggleSound = () => {
    setIsMuted((prev) => !prev);
    document.querySelectorAll('video, audio').forEach((el) => {
      (el as HTMLMediaElement).muted = !isMuted;
    });
  };

  return (
    <header className="bg-gradient-to-r from-[#5f0d0d] via-[#851616] to-[#4e0909] text-white shadow-lg border-b border-black/30 select-none">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-12 sm:h-13">
          {/* Logo & Calligraphic Slogan */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="https://i.imgur.com/VWtF2t5.jpeg"
                alt="SATV Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white/90 shadow-md object-cover bg-black"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="sr-only">SATV</span>
            </div>

            <div className="flex items-baseline gap-2 min-w-0">
              <h1
                style={{ fontFamily: "'Alex Brush', 'Great Vibes', cursive" }}
                className="text-lg sm:text-xl text-white font-normal tracking-wide drop-shadow-md truncate py-0.5"
              >
                Aqui você é a nossa atração
              </h1>
            </div>
          </div>

          {/* Navigation Tabs, Audio, Clock & Guia Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 bg-black/50 rounded-full border border-white/15 shadow-inner">
              <button
                id="tab-btn-fileiras"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={() => setViewMode('rows')}
                className={`tv-nav-focus flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'rows'
                    ? 'bg-white text-[#851616] shadow-md'
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
                title="Modo TV: fileiras horizontais"
              >
                <Rows3 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Fileiras</span>
              </button>

              <button
                id="tab-btn-canais"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={() => setViewMode('grid')}
                className={`tv-nav-focus flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#851616] shadow-md'
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
                title="Modo Mosaico"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Mosaico</span>
              </button>

              <button
                id="tab-btn-guia-epg"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={() => setViewMode('epg')}
                className={`tv-nav-focus flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'epg'
                    ? 'bg-white text-[#851616] shadow-md font-extrabold'
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
                title="Guia EPG"
              >
                <Menu className={`w-3.5 h-3.5 ${viewMode === 'epg' ? 'text-amber-500' : 'text-gray-200'}`} />
                <span>Guia</span>
              </button>
            </div>

            {/* Volume / Áudio Button */}
            <button
              id="btn-header-volume"
              type="button"
              data-tv-nav="tab"
              tabIndex={0}
              onClick={toggleSound}
              className="tv-nav-focus flex items-center justify-center w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-gray-200 hover:text-white border border-white/15 shadow-inner transition cursor-pointer outline-none"
              title={isMuted ? 'Ativar Som' : 'Desativar Som (Mudo)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-gray-200" />}
            </button>

            {/* Smart TV Real-Time Clock */}
            {timeStr && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-white/15 text-xs font-mono font-bold text-white shadow-inner">
                <Clock className="w-3.5 h-3.5 text-gray-300" />
                <span>{timeStr}</span>
              </div>
            )}

            {/* Botão Guia / Menu Principal */}
            {onOpenMenu && (
              <button
                id="btn-three-dots-menu"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={onOpenMenu}
                className="tv-nav-focus flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#eab308] hover:bg-[#facc15] active:bg-[#ca8a04] text-black font-extrabold text-xs shadow-md transition cursor-pointer outline-none border border-amber-300/60"
                title="Abrir Menu Principal (Atalho: Botão Avançar / Play)"
              >
                <MoreVertical className="w-4 h-4 text-black stroke-[2.5]" />
                <span>Guia</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;