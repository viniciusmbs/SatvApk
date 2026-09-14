import React from 'react';
import { Tv, Info, LayoutGrid, Calendar } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  totalChannels: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ totalChannels, viewMode, setViewMode }) => {
  return (
    <header className="bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d] text-white shadow-md sticky top-0 z-40 border-b border-red-900/60">
      <div className="w-full max-w-[1920px] mx-auto px-2.5 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-11 sm:h-12">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="relative flex items-center justify-center">
              <img
                src="https://i.imgur.com/VWtF2t5.jpeg"
                alt="SATV Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/80 shadow-sm object-cover bg-black"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="bg-white text-[#991b1b] text-[10px] font-black px-1.5 py-0.2 rounded shadow-sm tracking-wider">
                  SATV
                </span>
                <h1 className="text-xs sm:text-sm font-bold tracking-wide text-white truncate">
                  SATV - Vinicius Mendes ®
                </h1>
              </div>
            </div>
          </div>

          {/* Seletor de Modo: Grade de Canais vs Guia EPG */}
          <div className="flex items-center bg-black/40 border border-white/15 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Canais</span>
            </button>
            <button
              onClick={() => setViewMode('epg')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'epg'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Guia (EPG)</span>
            </button>
          </div>

          {/* Quick TV Tip Indicator & Contador */}
          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-0.5 rounded-full text-[11px] text-red-100">
              <Tv className="w-3 h-3 text-red-300" />
              <span>D-Pad: Navegar &bull; OK: Assistir</span>
            </div>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-black/50 text-white border border-white/20">
              <Info className="w-3 h-3 text-amber-300" />
              <span>{totalChannels} Canais</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
