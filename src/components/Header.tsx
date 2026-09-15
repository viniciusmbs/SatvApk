import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  CalendarDays,
  Rows3,
  Clock,
  Star,
  Menu as MenuIcon,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  MoreVertical,
} from 'lucide-react';
import { ViewMode, UiDensity } from '../types';
import { soundService } from '../services/soundService';

interface HeaderProps {
  totalChannels: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  favoritesCount?: number;
  isFavoritesActive?: boolean;
  onOpenFavorites?: () => void;
  onToggleChannelGuide?: () => void;
  density?: UiDensity;
  setDensity?: (density: UiDensity) => void;
}

const Header: React.FC<HeaderProps> = ({
  totalChannels,
  viewMode,
  setViewMode,
  favoritesCount = 0,
  isFavoritesActive = false,
  onOpenFavorites,
  onToggleChannelGuide,
  density = 'compact',
  setDensity,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [isMuted, setIsMuted] = useState(() => soundService.getIsMuted());

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

  const handleToggleMute = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundService.playClick();
    }
  };

  const cycleDensity = () => {
    if (!setDensity) return;
    if (density === 'compact') setDensity('normal');
    else if (density === 'normal') setDensity('large');
    else setDensity('compact');
  };

  const densityLabel =
    density === 'compact' ? 'Pequeno' : density === 'large' ? 'Grande' : 'Médio';

  return (
    <header 
      style={{ backgroundColor: '#330303' }}
      className="bg-[#450101] bg-satv-maroon text-white shadow-md border-b border-[#2d0000] select-none py-1 sm:py-1.5"
    >
      <div className="tv-safe-container">
        <div className="flex items-center justify-between h-11 sm:h-14 relative">
          {/* Logo & Signature Slogan (Left aligned) */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <img
              src="https://i.imgur.com/VWtF2t5.jpeg"
              alt="SATV Logo"
              className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border border-white/80 shadow-md object-cover bg-black"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span
              className="font-slogan-cursive text-white text-[15px] min-[400px]:text-xl sm:text-2xl md:text-3xl font-normal tracking-wide drop-shadow-md select-none whitespace-nowrap"
            >
              Aqui você é a nossa atração
            </span>
          </div>

          {/* Navigation Tabs & Controls (Right) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* View Mode Switcher (Fileiras / Mosaico / Guia EPG) + Favoritos */}
            <div className="flex items-center p-0.5 bg-black/40 rounded-lg sm:rounded-xl border border-white/15 shadow-inner">
              {onOpenFavorites && (
                <button
                  id="tab-btn-favoritos"
                  type="button"
                  data-tv-nav="tab"
                  tabIndex={0}
                  onClick={onOpenFavorites}
                  className={`tv-nav-focus flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer outline-none mr-0.5 ${
                    isFavoritesActive
                      ? 'bg-amber-400 text-black shadow-md ring-2 ring-amber-300 font-black'
                      : 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/20'
                  }`}
                  title={isFavoritesActive ? 'Exibindo Favoritos. Clique para ver Todos' : 'Ver canais favoritos'}
                >
                  <Star className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFavoritesActive ? 'fill-black text-black' : 'fill-amber-400 text-amber-400'}`} />
                  <span className="hidden min-[520px]:inline">Favoritos</span>
                  {favoritesCount > 0 && (
                    <span className={`px-1 sm:px-1.5 py-0.2 text-[8px] sm:text-[9px] rounded-full font-extrabold ml-0.5 ${
                      isFavoritesActive ? 'bg-black text-amber-300' : 'bg-amber-400 text-black'
                    }`}>
                      {favoritesCount}
                    </span>
                  )}
                </button>
              )}

              <button
                id="tab-btn-fileiras"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={() => setViewMode('rows')}
                className={`tv-nav-focus flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'rows' && !isFavoritesActive
                    ? 'bg-white text-[#450101] shadow-md ring-2 ring-white/70'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
                title="Modo TV: fileiras horizontais de canais"
              >
                <Rows3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden min-[520px]:inline">Fileiras</span>
              </button>

              <button
                id="tab-btn-canais"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={() => setViewMode('grid')}
                className={`tv-nav-focus flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'grid' && !isFavoritesActive
                    ? 'bg-white text-[#450101] shadow-md ring-2 ring-white/70'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
                title="Modo Mosaico: grade compacta de quadradinhos"
              >
                <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden min-[520px]:inline">Mosaico</span>
              </button>

              {/* Botão Guia de Canais (Três Tracinhos / Menu) */}
              <button
                id="tab-btn-guia-epg"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={() => {
                  if (onToggleChannelGuide) {
                    onToggleChannelGuide();
                  } else {
                    setViewMode(viewMode === 'epg' ? 'rows' : 'epg');
                  }
                }}
                className={`tv-nav-focus flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'epg'
                    ? 'bg-white text-[#450101] shadow-md ring-2 ring-white/70'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
                title="Guia de Canais (EPG) • Atalho no controle: botão com três tracinhos (Menu)"
              >
                <MenuIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>Guia</span>
              </button>
            </div>

            {/* Audio Feedback Toggle Button (Som de Clique) */}
            <button
              id="btn-toggle-sound"
              type="button"
              data-tv-nav="tab"
              tabIndex={0}
              onClick={handleToggleMute}
              className={`tv-nav-focus flex items-center justify-center p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-black/40 hover:bg-black/60 text-white border border-white/15 shadow-inner transition cursor-pointer outline-none ${
                isMuted ? 'text-white/40' : 'text-amber-300'
              }`}
              title={isMuted ? 'Som de clique desativado (Clique para ativar som)' : 'Som de clique ativado (clicksan.mp3)'}
              aria-label="Som de clique de navegação"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Smart TV Real-Time Clock */}
            {timeStr && (
              <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-xs font-mono font-bold text-white shadow-sm">
                <Clock className="w-3 h-3 text-red-300" />
                <span>{timeStr}</span>
              </div>
            )}

            {/* Botão de Três Pontinhos (Abre / Alterna Guia de Canais EPG) */}
            <button
              id="btn-three-dots-menu"
              type="button"
              data-tv-nav="tab"
              tabIndex={0}
              onClick={() => {
                soundService.playSelect();
                if (onToggleChannelGuide) {
                  onToggleChannelGuide();
                } else {
                  setViewMode(viewMode === 'epg' ? 'rows' : 'epg');
                }
              }}
              className={`tv-nav-focus flex items-center justify-center gap-1 px-2 py-1 rounded-lg sm:rounded-xl border border-white/20 shadow-inner transition cursor-pointer outline-none ${
                viewMode === 'epg'
                  ? 'bg-amber-400 text-black font-black shadow-md ring-2 ring-amber-300'
                  : 'bg-black/40 hover:bg-black/60 active:bg-black/80 text-white'
              }`}
              title="Guia de Canais (EPG) • Botão de três pontinhos ou menu do controle"
              aria-label="Abrir Guia de Canais EPG"
            >
              <MoreVertical className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-bold hidden sm:inline">Guia</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
