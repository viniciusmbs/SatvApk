import React, { useEffect, useRef } from 'react';
import {
  X,
  Rows3,
  LayoutGrid,
  Menu,
  Play,
  Tv,
  Info,
  Radio,
  Sliders,
  Check,
  Download,
  ExternalLink,
  Sparkles,
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
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white">
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
        <div className="p-4 space-y-3.5 max-h-[82vh] overflow-y-auto no-scrollbar">
          {/* Seção 1: Visualização dos Canais */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-1">
              Modo de Exibição
            </span>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {/* Fileiras (Horizontal) */}
              <button
                ref={firstButtonRef}
                type="button"
                tabIndex={0}
                onClick={() => {
                  setViewMode('rows');
                  onClose();
                }}
                className={`tv-nav-focus flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left outline-none ${
                  viewMode === 'rows'
                    ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                    : 'bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      viewMode === 'rows' ? 'bg-red-600 text-white' : 'bg-black/40 text-slate-400'
                    }`}
                  >
                    <Rows3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Fileiras Horizontais (TV)</h4>
                    <p className="text-[11px] text-slate-400">
                      Estilo Netflix / Smart TV por categoria
                    </p>
                  </div>
                </div>
                {viewMode === 'rows' && <Check className="w-4 h-4 text-red-400 shrink-0" />}
              </button>

              {/* Mosaico (Grade Vertical / Quadrados) */}
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  setViewMode('grid');
                  onClose();
                }}
                className={`tv-nav-focus flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left outline-none ${
                  viewMode === 'grid'
                    ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                    : 'bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-black/40 text-slate-400'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Mosaico (Grade Vertical)</h4>
                    <p className="text-[11px] text-slate-400">
                      Todos os canais em quadradinhos compactos
                    </p>
                  </div>
                </div>
                {viewMode === 'grid' && <Check className="w-4 h-4 text-red-400 shrink-0" />}
              </button>

              {/* Guia EPG */}
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  setViewMode('epg');
                  onClose();
                }}
                className={`tv-nav-focus flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left outline-none ${
                  viewMode === 'epg'
                    ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                    : 'bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      viewMode === 'epg' ? 'bg-red-600 text-white' : 'bg-black/40 text-slate-400'
                    }`}
                  >
                    <Menu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Guia de Programação (EPG)</h4>
                    <p className="text-[11px] text-slate-400">
                      Grade com horários, sinopse e programas ao vivo
                    </p>
                  </div>
                </div>
                {viewMode === 'epg' && <Check className="w-4 h-4 text-red-400 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Seção 2: Meus Favoritos */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-1">
              Atalhos Rápidos
            </span>
            <div className="mt-2 space-y-2">
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  onOpenFavorites();
                  onClose();
                }}
                className="tv-nav-focus w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 focus:bg-amber-500/20 border border-amber-500/30 text-left transition cursor-pointer outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-amber-300">Meus Favoritos</h4>
                    <p className="text-[11px] text-slate-400">
                      Ver canais preferidos (ou aperte a tecla 0 no controle)
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[11px] font-extrabold">
                  {favoritesCount}
                </span>
              </button>

              {/* Download MX Player Pro v3.1.1 Button */}
              <a
                id="btn-download-mx-player"
                href="https://files-2.modyolo.com/MX%20Player%20Pro/MX%20Player%20Pro_v3_1_1.apk"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={0}
                className="tv-nav-focus group w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-900/30 to-blue-900/20 hover:from-blue-600/30 hover:to-indigo-600/30 focus:from-blue-600 focus:to-indigo-600 border border-blue-500/40 hover:border-blue-400 focus:border-white text-left transition-all cursor-pointer outline-none shadow-md"
                title="Baixar MX Player Pro v3.1.1 APK para Fire TV / Android"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600/30 group-focus:bg-white text-blue-300 group-focus:text-blue-700 shadow-inner">
                    <Download className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-focus:text-white">
                        Baixar MX Player Pro
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                        v3.1.1
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-200/80 group-focus:text-blue-100">
                      Player essencial para rodar canais TS e M3U na sua TV
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 group-focus:bg-white text-white group-focus:text-blue-900 text-xs font-bold shadow transition">
                  <span>Baixar APK</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>

              {onOpenIconManager && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenIconManager();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border border-white/10 text-left transition cursor-pointer outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Gerenciar Ícones & Logos</h4>
                      <p className="text-[11px] text-slate-400">Personalizar capas e logos dos canais</p>
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
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#171a24] hover:bg-[#202433] focus:bg-[#202433] border border-white/10 text-left transition cursor-pointer outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Testar Stream & Lista M3U</h4>
                      <p className="text-[11px] text-slate-400">Diagnóstico de links e servidores HLS</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Sinopse do Sistema & Protocolos */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#121520] to-[#0c0e15] border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span className="text-[11px] uppercase tracking-wider text-slate-200">
                  Sinopse do Sistema & Recursos
                </span>
              </div>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Online
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              O <strong className="text-white font-bold">SATV</strong> oferece{' '}
              <strong className="text-amber-300">{totalChannels} canais ao vivo</strong> com navegação ultrarrápida adaptada para Smart TVs e Fire Stick.
            </p>

            {/* Protocolos piscando / dinâmicos */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/15 text-red-300 text-[10px] font-mono font-bold border border-red-500/30 animate-pulse">
                HLS (.m3u8)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30 animate-pulse">
                MPEG-TS (.ts)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 text-[10px] font-mono font-bold border border-blue-500/30">
                Web M3U
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/30">
                Navegação Fluida
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                DPT 4K Ultra HD
              </span>
            </div>

            <p className="text-[10.5px] text-slate-400 italic pt-1 border-t border-white/5">
              * Para assistir aos canais com transmissão em <strong className="text-slate-200">TS</strong> e listas <strong className="text-slate-200">M3U</strong> pesadas, utilize o botão do <strong className="text-blue-300">MX Player Pro</strong> acima no Fire TV ou celular.
            </p>
          </div>

          {/* Dica do Controle */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>
              Aperte a tecla <strong className="text-amber-300 font-bold">[ 0 ]</strong> ou <strong className="text-white">Play/Pause</strong> para favoritar qualquer canal. Use o botão <strong className="text-white">Menu [☰]</strong> ou os <strong className="text-amber-300 font-bold">Três Pontinhos (⋮ Guia)</strong> para abrir este menu.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0c0e15] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>SATV © {new Date().getFullYear()}</span>
          <button
            type="button"
            tabIndex={0}
            onClick={onClose}
            className="tv-nav-focus px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 focus:bg-red-600 text-white font-semibold transition cursor-pointer outline-none"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
