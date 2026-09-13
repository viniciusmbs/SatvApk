import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#080c14] py-4 text-center text-slate-400">
      <div className="w-full max-w-[1920px] mx-auto px-4 space-y-1">
        <p className="text-xs sm:text-sm font-semibold text-slate-300 tracking-wide">
          SATV • Vinicius Mendes ® © 2026
        </p>
        <p className="text-[11px] sm:text-xs text-slate-400 tracking-normal font-medium">
          Suporte completo para Smart TV • D-Pad • MPEG-TS • HLS • Web Embed
        </p>
      </div>
    </footer>
  );
};

export default Footer;
