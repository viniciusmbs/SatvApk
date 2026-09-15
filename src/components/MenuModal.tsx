import React, { useEffect, useRef } from 'react';
import {
  X,
  Rows3,
  LayoutGrid,
  CalendarDays,
  Star,
  Tv,
  Info,
  Radio,
  Sliders,
  Check,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
} from 'lucide-react';
import { ViewMode, UiDensity } from '../types';
import { soundService } from '../services/soundService';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
  totalChannels: number;
  density?: UiDensity;
  setDensity?: (density: UiDensity) => void;
  onOpenIconManager?: () => void;
  onOpenStreamTester?: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  viewMode,
  setViewMode,
  onOpenFavorites,
  favoritesCount,
  totalChannels,
  density = 'compact',
  setDensity,
  onOpenIconManager,
  onOpenStreamTester,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Auto-focus first button for Fire TV D-Pad control
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Close modal on Escape or Back button (Android KEYCODE_BACK = 4)
      if (e.key === 'Escape' || e.keyCode === 4) {
        e.preventDefault();
        onClose();
        return;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#10131d] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-gray-100 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-white/15">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">Menu Principal • SATV</h2>
              <p className="text-[10px] text-red-200">Vinicius Mendes ® • {totalChannels} Canais</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Seção 1: Visualização dos Canais */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-1">
              Modo de Exibição
            </span>
            <div className="grid grid-cols-1 gap-1.5 mt-1.5">
              {/* Fileiras (Horizontal) */}
              <button
                ref={firstButtonRef}
                type="button"
                onClick={() => {
                  setViewMode('rows');
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer text-left outline-none ${
                  viewMode === 'rows'
                    ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                    : 'bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      viewMode === 'rows' ? 'bg-red-600 text-white' : 'bg-black/40 text-slate-400'
                    }`}
                  >
                    <Rows3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Fileiras Horizontais (TV)</h4>
                    <p className="text-[10.5px] text-slate-400">
                      Estilo Smart TV carrossel por categoria
                    </p>
                  </div>
                </div>
                {viewMode === 'rows' && <Check className="w-4 h-4 text-red-400 shrink-0" />}
              </button>

              {/* Mosaico (Grade Vertical / Quadrados) */}
              <button
                type="button"
                onClick={() => {
                  setViewMode('grid');
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer text-left outline-none ${
                  viewMode === 'grid'
                    ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                    : 'bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-black/40 text-slate-400'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Mosaico (Grade Vertical)</h4>
                    <p className="text-[10.5px] text-slate-400">
                      Todos os canais em quadradinhos compactos
                    </p>
                  </div>
                </div>
                {viewMode === 'grid' && <Check className="w-4 h-4 text-red-400 shrink-0" />}
              </button>

              {/* Guia EPG */}
              <button
                type="button"
                onClick={() => {
                  setViewMode('epg');
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer text-left outline-none ${
                  viewMode === 'epg'
                    ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                    : 'bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      viewMode === 'epg' ? 'bg-red-600 text-white' : 'bg-black/40 text-slate-400'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Guia de Programação (EPG)</h4>
                    <p className="text-[10.5px] text-slate-400">
                      Grade com horários e sinopses ao vivo
                    </p>
                  </div>
                </div>
                {viewMode === 'epg' && <Check className="w-4 h-4 text-red-400 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Seção 2: Tamanho dos Ícones & Renderização */}
          {setDensity && (
            <div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  Tamanho dos Ícones & Renderização
                </span>
                <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setDensity('compact')}
                  className={`p-2 rounded-xl border text-center transition outline-none cursor-pointer ${
                    density === 'compact'
                      ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                      : 'bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-xs font-bold mb-0.5">
                    <Minimize2 className="w-3 h-3 text-red-400" />
                    <span>Pequeno</span>
                  </div>
                  <div className="text-[9.5px] text-slate-400 leading-tight">
                    Ideal p/ Fire TV & Celular
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDensity('normal')}
                  className={`p-2 rounded-xl border text-center transition outline-none cursor-pointer ${
                    density === 'normal'
                      ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                      : 'bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5">Médio</div>
                  <div className="text-[9.5px] text-slate-400 leading-tight">
                    Padrão
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDensity('large')}
                  className={`p-2 rounded-xl border text-center transition outline-none cursor-pointer ${
                    density === 'large'
                      ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                      : 'bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-xs font-bold mb-0.5">
                    <Maximize2 className="w-3 h-3 text-slate-300" />
                    <span>Grande</span>
                  </div>
                  <div className="text-[9.5px] text-slate-400 leading-tight">
                    Aumentado
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Seção 3: Meus Favoritos */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-1">
              Atalhos Rápidos
            </span>
            <div className="mt-1.5 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  onOpenFavorites();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 focus:bg-amber-500/20 border border-amber-500/30 text-left transition cursor-pointer outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-amber-300">Meus Favoritos</h4>
                    <p className="text-[10.5px] text-slate-400">
                      Ver apenas os seus canais preferidos
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10.5px] font-extrabold">
                  {favoritesCount}
                </span>
              </button>

              {onOpenIconManager && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenIconManager();
                  }}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border border-white/10 text-left transition cursor-pointer outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Gerenciar Ícones & Logos</h4>
                      <p className="text-[10.5px] text-slate-400">Personalizar capas e logos dos canais</p>
                    </div>
                  </div>
                </button>
              )}

              {onOpenStreamTester && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenStreamTester();
                  }}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border border-white/10 text-left transition cursor-pointer outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Testar Stream & Lista M3U</h4>
                      <p className="text-[10.5px] text-slate-400">Diagnóstico de links e servidores HLS</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Dica do Controle */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2 text-[10.5px] text-slate-400">
            <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>
              Você também pode apertar o botão <strong className="text-white">Menu [☰]</strong> ou os <strong className="text-white">Três Pontinhos</strong> no controle do Fire TV para abrir este menu a qualquer momento.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0c0e15] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>SATV © {new Date().getFullYear()}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
