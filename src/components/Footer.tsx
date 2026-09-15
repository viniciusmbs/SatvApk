import React from 'react';
import { Tv, Sparkles, Star } from 'lucide-react';

interface FooterProps {
  totalChannels?: number;
  favoritesCount?: number;
}

const Footer: React.FC<FooterProps> = ({ totalChannels = 0, favoritesCount = 0 }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-[#080b12]/95 backdrop-blur-md py-3 sm:py-4 text-slate-400 mt-auto transition-all select-none">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2">
        
        {/* Linha discreta de status do sistema */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sistema Online {totalChannels > 0 && `• ${totalChannels} Canais`}
          </span>
          {favoritesCount > 0 && (
            <>
              <span className="text-white/20">&bull;</span>
              <span className="text-amber-300 font-semibold">
                ⭐ {favoritesCount} {favoritesCount === 1 ? 'favorito' : 'favoritos'}
              </span>
            </>
          )}
          <span className="text-white/20 hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline text-slate-400">Fire TV D-Pad 4K</span>
        </div>

        {/* Assinatura Oficial com Logo Vinicius Mendes */}
        <div className="flex flex-col items-center justify-center gap-1 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center justify-center gap-2">
            <img
              src="https://i.imgur.com/VWtF2t5.jpeg"
              alt="Vinicius Mendes Logo"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/40 object-cover shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <p className="tracking-wide">
              <span className="font-extrabold text-white tracking-wider">SATV</span>
              <span className="mx-1 text-slate-500">&bull;</span>
              <span className="text-white font-bold">Vinicius Mendes</span>
              <span className="ml-1 text-[11px] text-slate-400 font-normal">
                ® &copy; {currentYear} &bull; Todos os direitos reservados
              </span>
            </p>
          </div>

          {/* Linha de Contato */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="text-slate-500">Contato:</span>
            <a
              href="mailto:vinicius@mail.bg"
              className="text-red-400 hover:text-red-300 font-medium underline underline-offset-2 transition-colors"
            >
              vinicius@mail.bg
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
