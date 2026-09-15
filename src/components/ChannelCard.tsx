import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Channel, UiDensity } from '../types';
import { getChannelLogo } from '../data/channelLogos';
import { soundService } from '../services/soundService';

interface ChannelCardProps {
  channel: Channel;
  index: number;
  isFavorite?: boolean;
  onToggleFavorite?: (channelName: string) => void;
  onSelect?: (channel: Channel) => void;
  density?: UiDensity;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  index,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
  density = 'compact',
}) => {
  const [imgError, setImgError] = useState(false);

  // Fallback to official high-quality logo mapping
  const fallbackLogo = getChannelLogo(channel.name);
  const logoSrc = imgError || !channel.logo ? fallbackLogo : channel.logo;

  // Ação 1: Abrir o canal com o som BotaoRadio.mp3 (Enter / OK / Clique)
  const handleOpenChannel = () => {
    soundService.playSelect();
    window.open(channel.url, '_blank', 'noopener,noreferrer');
    if (onSelect) {
      onSelect(channel);
    }
  };

  // Ação 2: Alternar Favorito
  const handleToggleFavoriteAction = () => {
    soundService.playSelect();
    if (onToggleFavorite) {
      onToggleFavorite(channel.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const code = e.keyCode || e.which;
    const key = e.key;

    // 1. Botão Play / Pause do controle do Fire TV / Android TV (KeyCode 85 / MediaPlayPause)
    // Favorita ou Desfavorita o canal instantaneamente com o botão Play/Pause!
    const isPlayPauseKey =
      code === 85 || // KEYCODE_MEDIA_PLAY_PAUSE
      code === 126 || // KEYCODE_MEDIA_PLAY
      code === 127 || // KEYCODE_MEDIA_PAUSE
      key === 'MediaPlayPause' ||
      e.code === 'MediaPlayPause' ||
      key === 'Play' ||
      key === 'Pause' ||
      key === 'p' ||
      key === 'P';

    if (isPlayPauseKey) {
      e.preventDefault();
      e.stopPropagation();
      handleToggleFavoriteAction();
      return;
    }

    // 2. Botão OK / ENTER no meio do D-Pad do controle:
    // ABRE O CANAL IMEDIATAMENTE! Sem nenhum delay, sem popup de favoritos!
    const isOkEnterKey =
      key === 'Enter' ||
      key === ' ' ||
      code === 13 ||
      code === 23 || // KEYCODE_DPAD_CENTER
      code === 66; // KEYCODE_ENTER

    if (isOkEnterKey) {
      e.preventDefault();
      e.stopPropagation();
      handleOpenChannel();
      return;
    }

    // 3. Tecla 'f' / 'F' para alternar favorito pelo teclado
    if (key === 'f' || key === 'F') {
      e.preventDefault();
      e.stopPropagation();
      handleToggleFavoriteAction();
      return;
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
      aria-label={`Canal ${channel.name} - Abrir canal. Pressione Play/Pause para favoritar.`}
      data-tv-card="true"
      data-channel-name={channel.name}
      data-channel-index={index}
      onClick={(e) => {
        e.preventDefault();
        handleOpenChannel();
      }}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        // SOM 1 (clicksan.mp3): ao andar com o cursor pelos canais
        soundService.playNav();
      }}
      className={`group tv-card-focus relative aspect-square bg-[#131620] hover:bg-[#1b1f2c] focus:bg-[#1f2433] border rounded-lg sm:rounded-xl p-1 sm:p-1.5 flex flex-col items-center justify-between text-center transition-all duration-150 cursor-pointer outline-none select-none shadow-sm hover:shadow-md shrink-0 ${
        isFavorite
          ? 'border-amber-400/60 hover:border-amber-400 focus:border-amber-400 ring-1 ring-amber-400/30'
          : 'border-white/10 hover:border-red-500 focus:border-red-500'
      }`}
    >
      {/* Estrelinha indicadora de Favorito (clique do mouse ou toque na tela) */}
      {onToggleFavorite && (
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleFavoriteAction();
          }}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos (Botão Play/Pause)'}
          title={isFavorite ? 'Favorito ativo (Pressione Play/Pause no controle)' : 'Favoritar (Pressione Play/Pause no controle)'}
          className={`absolute top-1 right-1 z-10 p-0.5 sm:p-1 rounded-md transition-all ${
            isFavorite
              ? 'text-amber-400 bg-black/75 shadow-sm opacity-100 scale-100'
              : 'text-white/40 hover:text-amber-300 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100'
          }`}
        >
          <Star className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      )}

      {/* Auto-responsive Channel Logo Cradle */}
      <div className="relative w-full flex-1 min-h-0 flex items-center justify-center p-1 sm:p-1.5 channel-logo-cradle rounded-md sm:rounded-lg overflow-hidden transition">
        <img
          src={logoSrc}
          alt={`${channel.name} logo`}
          className="max-w-[85%] max-h-[75%] object-contain channel-logo-img drop-shadow-sm transition-transform duration-150 group-hover:scale-105 group-focus:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Auto-responsive Channel Title with Fluid Typography */}
      <p
        className={`w-full text-center font-bold truncate leading-tight transition-colors pt-0.5 sm:pt-1 px-0.5 text-[clamp(7px,1.9vw,10.5px)] sm:text-[clamp(8px,1.2vw,11.5px)] ${
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
