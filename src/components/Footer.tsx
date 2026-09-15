import React from 'react';
import { Tv, Sparkles, Star } from 'lucide-react';

interface FooterProps {
  totalChannels?: number;
  favoritesCount?: number;
}

const Footer: React.FC<FooterProps> = ({ totalChannels = 0, favoritesCount = 0 }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-[#080b12]/95 backdrop-blur-md py-4 sm:py-5 text-slate-400 mt-auto transition-all select-none">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center gap-3">
        
        {/* Painel Explicativo do Controle do Fire TV Stick */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-[13px] shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Tv className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-semibold text-white">Controle Fire TV:</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold text-[11px] border border-red-500/30">
              Menu (3 tracinhos / 3 pontinhos)
            </span>
            <span>Abre Guia de Canais (EPG)</span>
          </div>

          <span className="hidden sm:inline text-white/20">&bull;</span>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/30">
              Botão Play/Pause ▶||
            </span>
            <span className="text-amber-300 font-medium flex items-center gap-1">
              Favoritar / Desfavoritar Canal <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
            </span>
          </div>

          <span className="hidden sm:inline text-white/20">&bull;</span>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-[11px] border border-blue-500/30">
              OK no meio
            </span>
            <span>Abrir Canal</span>
          </div>
        </div>

        {/* Linha de status e recursos da TV */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sistema Online {totalChannels > 0 && `• ${totalChannels} Canais`}
          </span>
          <span>&bull;</span>
          <span>HLS / MPEG-TS / Web Embed</span>
          <span>&bull;</span>
          <span>Navegação Fluida D-Pad 4K</span>
          {favoritesCount > 0 && (
            <>
              <span>&bull;</span>
              <span className="text-amber-300 font-semibold">
                ⭐ {favoritesCount} {favoritesCount === 1 ? 'favorito salvo' : 'favoritos salvos'}
              </span>
            </>
          )}
        </div>

        {/* Assinatura Vini©¿©ius Mendes ® - posicionada abaixo do menu explicativo */}
        <div className="pt-1 flex items-center justify-center gap-1.5 text-xs sm:text-sm text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
          <p className="tracking-wide">
            <span className="font-extrabold text-white tracking-wider">SATV</span>
            <span className="mx-1 text-slate-500">&bull;</span>
            <span className="text-slate-300 font-semibold hover:text-white transition-colors">
              Vinicius Mendes
            </span>
            <span className="ml-1 text-[11px] text-slate-400 font-normal">
              ® &copy; {currentYear} &bull; Todos os direitos reservados
            </span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
