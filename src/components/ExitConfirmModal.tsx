import React, { useEffect, useRef } from 'react';
import { ShieldAlert, LogOut, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { soundService } from '../services/soundService';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirmExit,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const exitBtnRef = useRef<HTMLButtonElement>(null);

  // Focus inicial no botão 'Não' para segurança contra clique acidental
  useEffect(() => {
    if (!isOpen) return;

    soundService.playNav();
    const timer = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Controle de navegação D-Pad exclusivo do controle remoto e Fire TV
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.keyCode || e.which;

      const isLeft = key === 'ArrowLeft' || code === 37 || code === 21;
      const isRight = key === 'ArrowRight' || code === 39 || code === 22;
      const isUp = key === 'ArrowUp' || code === 38 || code === 19;
      const isDown = key === 'ArrowDown' || code === 40 || code === 20;

      const isBack =
        key === 'Escape' ||
        key === 'Backspace' ||
        key === 'GoBack' ||
        key === 'BrowserBack' ||
        key === 'Back' ||
        code === 27 ||
        code === 8 ||
        code === 4 || // KEYCODE_BACK Fire TV
        code === 10009 || // Samsung Tizen
        code === 461; // LG webOS

      // Pressionar Voltar enquanto a trava está na tela cancela e continua no app
      if (isBack) {
        e.preventDefault();
        e.stopPropagation();
        soundService.playSelect();
        onCancel();
        return;
      }

      // Alternância horizontal no D-Pad entre 'Não' e 'Sim'
      if (isLeft || isUp) {
        e.preventDefault();
        e.stopPropagation();
        soundService.playNav();
        cancelBtnRef.current?.focus();
      } else if (isRight || isDown) {
        e.preventDefault();
        e.stopPropagation();
        soundService.playNav();
        exitBtnRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#151923] border-2 border-red-500/40 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center space-y-5 transform animate-in zoom-in-95 duration-200"
      >
        {/* Ícone de Trava de Segurança */}
        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-pulse text-red-400" />
        </div>

        {/* Textos de Advertência */}
        <div className="space-y-2">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
            Trava de Segurança Ativa
          </div>
          <h2 id="exit-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Você deseja sair do SATV?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            Evite fechar o aplicativo sem querer pelo controle remoto. Pressione <strong className="text-emerald-400">Não</strong> para continuar assistindo aos canais ou <strong className="text-red-400">Sim</strong> para encerrar.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Botão NÃO (Foco inicial padrão) */}
          <button
            ref={cancelBtnRef}
            id="exit-btn-cancel"
            type="button"
            tabIndex={0}
            onClick={() => {
              soundService.playSelect();
              onCancel();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#222938] hover:bg-[#2c3548] active:bg-[#1a202c] text-white text-sm font-black border-2 border-emerald-500/60 transition cursor-pointer outline-none shadow-lg focus:ring-4 focus:ring-emerald-400 focus:bg-[#2b354a] focus:scale-105"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Não, Continuar</span>
          </button>

          {/* Botão SIM, SAIR */}
          <button
            ref={exitBtnRef}
            id="exit-btn-confirm"
            type="button"
            tabIndex={0}
            onClick={() => {
              soundService.playSelect();
              onConfirmExit();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-black border-2 border-red-400/40 transition cursor-pointer outline-none shadow-lg focus:ring-4 focus:ring-red-400 focus:scale-105"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sim, Sair</span>
          </button>
        </div>

        {/* Dica para o Usuário do Fire TV */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ArrowLeft className="w-3.5 h-3.5 text-slate-300" />
          <span>Dica Fire TV: Aperte <strong>Voltar</strong> no controle para cancelar</span>
        </div>
      </div>
    </div>
  );
};