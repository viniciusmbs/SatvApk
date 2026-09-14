import React, { useState, useRef } from 'react';
import { Star } from 'lucide-react';
import { Channel } from '../types';
import { getChannelLogo } from '../data/channelLogos';

interface ChannelCardProps {
  channel: Channel;
  index: number;
  isFavorite?: boolean;
  onToggleFavorite?: (channelName: string) => void;
  onSelect?: (channel: Channel) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  index,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHoldingOk, setIsHoldingOk] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Fallback to official high-quality logo mapping
  const fallbackLogo = getChannelLogo(channel.name);
  const logoSrc = imgError || !channel.logo ? fallbackLogo : channel.logo;

  const handleOpenChannel = () => {
    window.open(channel.url, '_blank', 'noopener,noreferrer');
    if (onSelect) {
      onSelect(channel);
    }
  };

  const triggerFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(channel.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 1. Fire TV Stick Play/Pause button (KeyCode 85 / MediaPlayPause)
    if (
      (e.keyCode === 85 ||
        e.key === 'MediaPlayPause' ||
        e.code === 'MediaPlayPause' ||
        e.key === 'Play' ||
        e.key === 'Pause') &&
      onToggleFavorite
    ) {
      e.preventDefault();
      e.stopPropagation();
      triggerFavorite();
      return;
    }

    // 3. Keyboard shortcut 'f' / 'F'
    if ((e.key === 'f' || e.key === 'F') && onToggleFavorite) {
      e.preventDefault();
      e.stopPropagation();
      triggerFavorite();
      return;
    }

    // 4. Center OK button (Enter / Space / Android DPAD_CENTER = 23 / Android ENTER = 66)
    const isActivationKey =
      e.key === 'Enter' ||
      e.key === ' ' ||
      e.keyCode === 13 ||
      e.keyCode === 23 ||
      e.keyCode === 66;

    if (isActivationKey) {
      // If user holds OK for 650ms, trigger FAVORITE instead of opening channel!
      if (!longPressTimerRef.current && !isLongPressTriggeredRef.current) {
        setIsHoldingOk(true);
        longPressTimerRef.current = window.setTimeout(() => {
          isLongPressTriggeredRef.current = true;
          setIsHoldingOk(false);
          triggerFavorite();
        }, 650);
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    const isActivationKey =
      e.key === 'Enter' ||
      e.key === ' ' ||
      e.keyCode === 13 ||
      e.keyCode === 23 ||
      e.keyCode === 66;

    if (isActivationKey) {
      setIsHoldingOk(false);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // If it was a long press, do NOT open the channel (already favorited)
      if (isLongPressTriggeredRef.current) {
        e.preventDefault();
        e.stopPropagation();
        isLongPressTriggeredRef.current = false;
        return;
      }

      // Quick tap/press (< 650ms): open channel normally
      e.preventDefault();
      handleOpenChannel();
    }
  };

  // Touch & Pointer Long Press support for mobile / tablet
  const handlePointerDown = () => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      triggerFavorite();
    }, 650);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerFavorite();
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
        if (isLongPressTriggeredRef.current) {
          isLongPressTriggeredRef.current = false;
          return;
        }
        handleOpenChannel();
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => {
        // Prevent default browser context menu and toggle favorite
        e.preventDefault();
        triggerFavorite();
      }}
      className={`group tv-card-focus relative aspect-square bg-[#131620] hover:bg-[#1b1f2c] focus:bg-[#1b1f2c] border rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-between text-center transition-all duration-150 cursor-pointer outline-none select-none shadow-md shrink-0 ${
        isHoldingOk
          ? 'border-amber-400 ring-2 ring-amber-400/80 scale-95'
          : isFavorite
          ? 'border-amber-400/50 hover:border-amber-400 focus:border-amber-400'
          : 'border-white/10 hover:border-red-500 focus:border-red-500'
      }`}
    >
      {/* Visual Indicator when holding OK on Fire TV remote */}
      {isHoldingOk && (
        <div className="absolute inset-0 bg-amber-500/20 rounded-xl z-20 flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
          <span className="text-[10px] font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded-full shadow-lg border border-amber-400/50">
            Segure... ⭐
          </span>
        </div>
      )}

      {/* Favorite Star Badge */}
      {onToggleFavorite && (
        <button
          type="button"
          tabIndex={-1}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`absolute top-1.5 right-1.5 z-10 p-1 rounded-md transition-all ${
            isFavorite
              ? 'text-amber-400 bg-black/70 shadow-sm opacity-100 scale-105'
              : 'text-white/40 hover:text-amber-300 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100'
          }`}
        >
          <Star className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      )}

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
        className={`text-[10px] sm:text-[11px] font-bold truncate w-full leading-tight transition-colors pt-1 px-0.5 ${
          isFavorite ? 'text-amber-200' : 'text-gray-100 group-hover:text-red-400 group-focus:text-red-400'
        }`}
        title={channel.name}
      >
        {channel.name}
      </p>
    </a>
  );
};

export default ChannelCard;
