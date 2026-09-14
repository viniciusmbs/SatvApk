import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Channel } from '../types';
import { getChannelLogo } from '../data/channelLogos';

interface ChannelCardProps {
  channel: Channel;
  index: number;
  onSelect?: (channel: Channel) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  index,
  onSelect,
}) => {
  const [imgError, setImgError] = useState(false);

  // Fallback to official high-quality logo mapping
  const fallbackLogo = getChannelLogo(channel.name);
  const logoSrc = imgError || !channel.logo ? fallbackLogo : channel.logo;

  const handleOpenChannel = () => {
    window.open(channel.url, '_blank', 'noopener,noreferrer');
    if (onSelect) {
      onSelect(channel);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Standard Enter (13), Space (32), Android DPAD_CENTER (23), and Android KEYCODE_ENTER (66)
    const isActivationKey =
      e.key === 'Enter' ||
      e.key === ' ' ||
      e.keyCode === 13 ||
      e.keyCode === 23 ||
      e.keyCode === 66;

    if (isActivationKey) {
      e.preventDefault();
      handleOpenChannel();
    }
  };

  return (
    <a
      id={`channel-card-${channel.id || encodeURIComponent(channel.name)}`}
      href={channel.url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={0}
      role="button"
      aria-label={`Canal ${channel.name} - Abrir em nova aba`}
      data-tv-card="true"
      data-channel-name={channel.name}
      data-channel-index={index}
      onClick={(e) => {
        e.preventDefault();
        handleOpenChannel();
      }}
      onKeyDown={handleKeyDown}
      className="group tv-card-focus relative aspect-square bg-[#131620] hover:bg-[#1b1f2c] focus:bg-[#1b1f2c] border border-white/10 hover:border-red-500 focus:border-red-500 rounded-xl p-2 flex flex-col items-center justify-between text-center transition-all duration-150 cursor-pointer outline-none select-none shadow-md"
    >
      {/* Square-proportioned Channel Logo Box with contrasting cradle */}
      <div className="relative w-full flex-1 min-h-0 flex items-center justify-center p-2 channel-logo-cradle rounded-lg overflow-hidden transition">
        <img
          src={logoSrc}
          alt={`${channel.name} logo`}
          className="max-w-full max-h-full object-contain channel-logo-img"
          onError={() => setImgError(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Channel Name */}
      <p
        className="text-gray-100 text-[10px] sm:text-[11px] font-bold truncate w-full leading-tight group-hover:text-red-400 group-focus:text-red-400 transition-colors pt-1 px-0.5"
        title={channel.name}
      >
        {channel.name}
      </p>
    </a>
  );
};

export default ChannelCard;
