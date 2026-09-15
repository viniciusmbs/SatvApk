import React, { useState, useEffect } from 'react';
import { LayoutGrid, CalendarDays, Rows3, Clock, Star, MoreVertical, SlidersHorizontal } from 'lucide-react';
import { ViewMode, UiDensity } from '../types';

interface HeaderProps {
  totalChannels: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
  onOpenMenu?: () => void;
  density?: UiDensity;
  setDensity?: (density: UiDensity) => void;
}

const Header: React.FC<HeaderProps> = ({
  totalChannels,
  viewMode,
  setViewMode,
  favoritesCount = 0,
  onOpenFavorites,
  onOpenMenu,
  density = 'compact',
  setDensity,
}) => {
  const [timeStr, setTimeStr] = useState('');

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

  const cycleDensity = () => {
    if (!setDensity) return;
    if (density === 'compact') setDensity('normal');
    else if (density === 'normal') setDensity('large');
    else setDensity('compact');
  };

  const densityLabel =
    density === 'compact' ? 'Pequeno' : density === 'large' ? 'Grande' : 'Médio';

  return (
    <header className="bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d] text-white shadow-md border-b border-red-900/40 select-none">
      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-11 sm:h-12">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="https://i.imgur.com/VWtF2t5.jpeg"
                alt="SATV Logo"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/80 shadow-md object-cover bg-black"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="sr-only">SATV</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="bg-white text-[#991b1b] text-[9px] sm:text-[10px] font-black px-1 sm:px-1.5 py-0.2 rounded shadow-sm tracking-wider">
                  SATV
                </span>
                <h1 className="text-xs sm:text-sm font-bold tracking-wide text-white drop-shadow-sm truncate">
                  SATV - Vinicius Mendes ®
                </h1>
              </div>
              <p className="text-[9px] text-red-200/90 hidden md:block">
                Web IPTV &bull; {totalChannels} Canais
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* View Mode Switcher (Fileiras / Mosaico / Guia EPG) + Favoritos */}
            <div className="flex items-center p-0.5 bg-black/40 rounded-lg sm:rounded-xl border border-white/15 shadow-inner">
              {onOpenFavorites && (
                <button
                  id="tab-btn-favoritos"
                  type="button"
                  data-tv-nav="tab"
                  tabIndex={0}
                  onClick={onOpenFavorites}
                  className="tv-nav-focus flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer outline-none text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 mr-0.5"
                  title="Acessar canais favoritos"
                >
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                  <span className="hidden min-[520px]:inline">Favoritos</span>
                  {favoritesCount > 0 && (
                    <span className="px-1 sm:px-1.5 py-0.2 text-[8.5px] sm:text-[9px] bg-amber-400 text-black rounded-full font-extrabold ml-0.5">
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
                  viewMode === 'rows'
                    ? 'bg-white text-[#991b1b] shadow-md ring-2 ring-white/70'
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
                  viewMode === 'grid'
                    ? 'bg-white text-[#991b1b] shadow-md ring-2 ring-white/70'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
                title="Modo Mosaico: grade compacta de quadradinhos"
              >
                <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden min-[520px]:inline">Mosaico</span>
              </button>

              <button
                id="tab-btn-guia-epg"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={() => setViewMode('epg')}
                className={`tv-nav-focus flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'epg'
                    ? 'bg-white text-[#991b1b] shadow-md ring-2 ring-white/70'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
                title="Guia EPG com programação ao vivo (ou pressione Menu no controle)"
              >
                <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Guia</span>
                <span className="hidden sm:inline-flex items-center px-1 py-0.2 text-[8.5px] bg-red-600/90 text-white rounded font-bold">
                  ☰
                </span>
              </button>
            </div>

            {/* Quick Icon Size / Density Toggle */}
            {setDensity && (
              <button
                id="btn-toggle-density"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={cycleDensity}
                className="tv-nav-focus hidden min-[460px]:flex items-center gap-1 px-2 py-1 rounded-lg sm:rounded-xl bg-black/40 hover:bg-black/60 text-white/90 hover:text-white border border-white/15 text-[10.5px] sm:text-xs font-semibold shadow-inner transition cursor-pointer outline-none"
                title={`Alternar tamanho dos ícones (Atual: ${densityLabel}). Clique para mudar!`}
              >
                <SlidersHorizontal className="w-3 h-3 text-red-300" />
                <span className="hidden sm:inline">Ícones:</span>
                <span className="font-bold text-amber-300">{densityLabel}</span>
              </button>
            )}

            {/* Smart TV Real-Time Clock */}
            {timeStr && (
              <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-xs font-mono font-bold text-white shadow-sm">
                <Clock className="w-3 h-3 text-red-300" />
                <span>{timeStr}</span>
              </div>
            )}

            {/* Três Pontinhos Button (Menu List) */}
            {onOpenMenu && (
              <button
                id="btn-three-dots-menu"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={onOpenMenu}
                className="tv-nav-focus flex items-center justify-center p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-black/40 hover:bg-black/60 active:bg-black/80 text-white border border-white/15 shadow-inner transition cursor-pointer outline-none"
                title="Abrir Menu com lista de opções, escala de ícones e modos de exibição"
                aria-label="Menu de opções"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
