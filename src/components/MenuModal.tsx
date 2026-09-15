import React, { useEffect, useRef } from 'react';
import {
  X,
  Rows3,
  LayoutGrid,
  CalendarDays,
  Star,
  Download,
  ExternalLink,
  Check,
} from 'lucide-react';
import { ViewMode } from '../types';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
  totalChannels: number;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  viewMode,
  setViewMode,
  onOpenFavorites,
  favoritesCount,
  totalChannels,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Auto-focus no primeiro item para navegação direta no controle do Fire TV
      const timer = setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Fechar modal no Escape ou Voltar do controle (KEYCODE_BACK = 4)
      if (e.key === 'Escape' || e.keyCode === 27 || e.keyCode === 4 || e.keyCode === 10009) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#11141c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-gray-200 flex flex-col text-sm"
      >
        {/* Cabeçalho Minimalista e Compacto */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#161a24]">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <div className="flex items-baseline gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Menu Principal
              </h2>
              <span className="text-[11px] text-emerald-400/90 font-medium">
                {totalChannels > 0 ? `${totalChannels} canais online` : '131 canais online'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo do Menu */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* 1. Modo de Exibição */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Modo de Exibição
            </span>
            <div className="grid grid-cols-1 gap-1.5 pt-0.5">
              {/* Fileiras Horizontais (TV) */}
              <button
                ref={firstButtonRef}
                type="button"
                tabIndex={0}
                onClick={() => {
                  setViewMode('rows');
                  onClose();
                }}
                className={`tv-nav-focus flex items-center justify-between p-2.5 rounded-xl border transition text-left cursor-pointer outline-none ${
                  viewMode === 'rows'
                    ? 'bg-red-600/15 border-red-500/80 text-white'
                    : 'bg-[#171a23] hover:bg-[#1f2330] focus:bg-[#1f2330] border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Rows3
                    className={`w-4 h-4 shrink-0 ${
                      viewMode === 'rows' ? 'text-red-400' : 'text-slate-400'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white">Fileiras Horizontais (TV)</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Navegação por categoria estilo Smart TV
                    </div>
                  </div>
                </div>
                {viewMode === 'rows' && <Check className="w-4 h-4 text-red-400 shrink-0 ml-2" />}
              </button>

              {/* Mosaico (Grade Vertical) */}
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  setViewMode('grid');
                  onClose();
                }}
                className={`tv-nav-focus flex items-center justify-between p-2.5 rounded-xl border transition text-left cursor-pointer outline-none ${
                  viewMode === 'grid'
                    ? 'bg-red-600/15 border-red-500/80 text-white'
                    : 'bg-[#171a23] hover:bg-[#1f2330] focus:bg-[#1f2330] border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <LayoutGrid
                    className={`w-4 h-4 shrink-0 ${
                      viewMode === 'grid' ? 'text-red-400' : 'text-slate-400'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white">Mosaico (Grade Vertical)</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Todos os canais em grade compacta
                    </div>
                  </div>
                </div>
                {viewMode === 'grid' && <Check className="w-4 h-4 text-red-400 shrink-0 ml-2" />}
              </button>

              {/* Guia de Programação (EPG) */}
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  setViewMode('epg');
                  onClose();
                }}
                className={`tv-nav-focus flex items-center justify-between p-2.5 rounded-xl border transition text-left cursor-pointer outline-none ${
                  viewMode === 'epg'
                    ? 'bg-red-600/15 border-red-500/80 text-white'
                    : 'bg-[#171a23] hover:bg-[#1f2330] focus:bg-[#1f2330] border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CalendarDays
                    className={`w-4 h-4 shrink-0 ${
                      viewMode === 'epg' ? 'text-red-400' : 'text-slate-400'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white">Guia de Programação (EPG)</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Grade com horários e programas ao vivo
                    </div>
                  </div>
                </div>
                {viewMode === 'epg' && <Check className="w-4 h-4 text-red-400 shrink-0 ml-2" />}
              </button>
            </div>
          </div>

          {/* 2. Meus Favoritos */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Favoritos
            </span>
            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                onOpenFavorites();
                onClose();
              }}
              className="tv-nav-focus w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 focus:bg-amber-500/20 border border-amber-500/30 transition text-left cursor-pointer outline-none"
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-300">Meus Favoritos</div>
                  <div className="text-[11px] text-slate-400">
                    Aperte <strong className="text-slate-200">[ 0 ]</strong> ou <strong className="text-slate-200">Play/Pause</strong> para favoritar
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[11px] font-black">
                {favoritesCount}
              </span>
            </button>
          </div>

          {/* 3. Programa para Baixar (MX Player Pro) - Posicionado embaixo */}
          <div className="p-3 rounded-xl bg-[#151924] border border-white/10 space-y-2">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Para visualizar certos canais IPTV (como transmissões em formato <strong className="text-white">.TS</strong>), é necessário ter o aplicativo <strong className="text-blue-300">MX Player Pro v3.1.1</strong> instalado. Basta clicar no link abaixo:
            </p>
            <a
              id="btn-download-mx-player-minimal"
              href="https://files-2.modyolo.com/MX%20Player%20Pro/MX%20Player%20Pro_v3_1_1.apk"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={0}
              className="tv-nav-focus flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 focus:bg-blue-500 text-white text-xs font-bold transition outline-none cursor-pointer shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar MX Player Pro v3.1.1 (APK)</span>
              <ExternalLink className="w-3 h-3 text-blue-200" />
            </a>
          </div>
        </div>

        {/* Rodapé com Fechar */}
        <div className="px-4 py-2.5 bg-[#0e1118] border-t border-white/10 flex items-center justify-end">
          <button
            type="button"
            tabIndex={0}
            onClick={onClose}
            className="tv-nav-focus px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 focus:bg-red-600 text-white text-xs font-semibold transition cursor-pointer outline-none"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
