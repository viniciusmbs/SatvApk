import React from 'react';
import { ExternalLink, LayoutGrid, CalendarDays } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  totalChannels: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ totalChannels, viewMode, setViewMode }) => {
  return (
    <header className="bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d] text-white shadow-md border-b border-red-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-13">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="relative flex items-center justify-center">
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
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-white text-[#991b1b] text-[10px] font-black px-1.5 py-0.2 rounded shadow-sm tracking-wider">
                  SATV
                </span>
                <h1 className="text-xs sm:text-sm font-bold tracking-wide text-white drop-shadow-sm truncate">
                  SATV - Vinicius Mendes ®
                </h1>
              </div>
              <p className="text-[10px] text-red-200/90 hidden sm:block">
                Web IPTV &bull; {totalChannels} Canais Disponíveis
              </p>
            </div>
          </div>

          {/* Navigation Tabs: Canais vs Guia de Programação (EPG) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/15 shadow-inner">
              <button
                id="tab-btn-canais"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={() => setViewMode('grid')}
                className={`tv-nav-focus flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#991b1b] shadow-md ring-2 ring-white/70'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
                title="Visualizar grade de canais"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Canais</span>
              </button>

              <button
                id="tab-btn-guia-epg"
                type="button"
                data-tv-nav="tab"
                tabIndex={0}
                onClick={() => setViewMode('epg')}
                className={`tv-nav-focus flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer outline-none ${
                  viewMode === 'epg'
                    ? 'bg-white text-[#991b1b] shadow-md ring-2 ring-white/70'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
                title="Visualizar guia de programação (ou aperte o botão Menu / ☰ no controle)"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Guia (EPG)</span>
                <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-red-600/90 text-white rounded font-bold tracking-tight inline-flex items-center gap-1 shadow-sm">
                  <span>☰</span>
                  <span className="hidden sm:inline">Menu</span>
                </span>
              </button>
            </div>

            {/* Clean Indicator for Direct Tab Opening */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/30 text-red-100 border border-white/10 shadow-sm">
                <ExternalLink className="w-3 h-3 text-red-300" />
                <span>Abertura Direta</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
