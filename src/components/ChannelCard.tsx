import React, { useState } from 'react';
import { Play, Tv } from 'lucide-react';
import { Channel } from '../types';

interface ChannelCardProps {
  channel: Channel;
  index: number;
  onSelect: (channel: Channel) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  index,
  onSelect,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      sessionStorage.setItem('satv_last_channel', channel.name);
    } catch {}
    onSelect(channel);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      try {
        sessionStorage.setItem('satv_last_channel', channel.name);
      } catch {}
      onSelect(channel);
    }
  };

  return (
    <a
      href={channel.url}
      data-tv-card="true"
      data-channel-name={channel.name}
      data-channel-index={index + 1}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="tv-card-focus group relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl bg-[#141a29] hover:bg-[#1b2438] border border-slate-800 hover:border-red-500/80 transition-all duration-150 cursor-pointer shadow-md hover:shadow-red-950/20 select-none outline-none focus:outline-none no-underline text-inherit"
      title={`Assistir ${channel.name} (${channel.group})`}
    >
      {/* Logo Container - Compact & Lightweight for TV Decoders */}
      <div className="w-full aspect-[16/10] rounded-lg bg-black/60 border border-slate-800/70 flex items-center justify-center p-1 my-1 overflow-hidden relative group-hover:border-slate-600 transition-colors">
        {!imgError && channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 group-focus:scale-105 transition-transform duration-150"
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 px-1">
            <Tv className="w-5 h-5 mb-0.5 text-slate-500 group-hover:text-red-400 transition-colors" />
            <span className="text-[8.5px] font-bold tracking-tight uppercase text-slate-400 max-w-[95%] truncate text-center">
              {channel.name}
            </span>
          </div>
        )}

        {/* Play Overlay on Hover / Focus */}
        <div className="absolute inset-0 bg-red-600/25 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 group-focus:scale-105 transition-transform">
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Channel Information - Compact Typography */}
      <div className="w-full text-center space-y-0.5">
        <h4 className="text-[10.5px] sm:text-[11.5px] font-bold text-gray-200 group-hover:text-white group-focus:text-white truncate px-0.5 leading-tight">
          {channel.name}
        </h4>
        <div className="flex items-center justify-center">
          <span className="text-[8px] sm:text-[8.5px] font-semibold text-slate-400 group-hover:text-slate-300 group-focus:text-red-200 truncate uppercase tracking-wider">
            {channel.group}
          </span>
        </div>
      </div>
    </a>
  );
};

export default ChannelCard;
