import React, { useState, useEffect } from 'react';
import { LayoutGrid, CalendarDays, Rows3, Clock, Star } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  totalChannels: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  totalChannels,
  viewMode,
  setViewMode,
  favoritesCount = 0,
  onOpenFavorites,
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

  return (
    <header className="bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d] text-white shadow-md border-b border-red-900/40 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-13">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="https://i.imgur.com/VWtF2t5.jpeg"
                alt="SATV Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white/80 shadow-md object-cover bg-black"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="sr-only">SATV</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="bg-white text-[#991b1b] text-[10px] font-black px-1.5 py-0.2 rounded shadow-sm tracking-wider">
                  SATV
                </span>
                <h1 className="text-xs sm:text-sm font-bold tracking-wide text-white drop-shadow-sm truncate">
                  SATV - Vinicius Mendes ®
                </h1>
              </div>
              <p className="text-[10px] text-red-200/90 hidden md:block">
                Web IPTV &bull; {totalChannels} Canais
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Clock */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* View Mode Switcher (Fileiras / Mosaico / Guia EPG) + Favoritos */}
            <div className="flex items-center p-0.5 sm:p-1 bg-black/40 rounded-xl border border-white/15 shadow-inner">
              {onOpenFavorites && (
                <button
                  id="tab-btn-favoritos"
                  type="button"
                  data-tv-nav="tab"
                  tabIndex={0}
                  onClick={onOpenFavorites}
                  className="tv-nav-focus flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.2 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer outline-none text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 mr-0.5"
                  title="Acessar canais favoritos"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="hidden xs:inline">Favoritos</span>
                  {favoritesCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-amber-400 text-black rounded-full font-extrabold ml-0.5">
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
                className={`tv-nav-focus flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.2 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'rows'
                    ? 'bg-white text-[#991b1b] shadow-md ring-2 ring-white/70'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
                title="Modo TV: fileiras horizontais de canais"
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
                className={`tv-nav-focus flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.2 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#991b1b] shadow-md ring-2 ring-white/70'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
                title="Modo Mosaico: grade compacta de quadradinhos"
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
                className={`tv-nav-focus flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.2 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'epg'
                    ? 'bg-white text-[#991b1b] shadow-md ring-2 ring-white/70'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
                title="Guia EPG com programação ao vivo (ou pressione Menu no controle)"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Guia</span>
                <span className="hidden sm:inline-flex items-center px-1 py-0.2 text-[9px] bg-red-600/90 text-white rounded font-bold">
                  ☰
                </span>
              </button>
            </div>

            {/* Smart TV Real-Time Clock */}
            {timeStr && (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-xs font-mono font-bold text-white shadow-sm">
                <Clock className="w-3 h-3 text-red-300" />
                <span>{timeStr}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
