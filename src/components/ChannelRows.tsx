import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Channel, GroupedChannels, UiDensity } from '../types';
import ChannelCard, { getCardWidthClass } from './ChannelCard';

interface ChannelRowsProps {
  groupedChannels: GroupedChannels;
  favorites: string[];
  onToggleFavorite: (channelName: string) => void;
  onSelectChannel: (channel: Channel) => void;
  onClearFilters: () => void;
  density?: UiDensity;
}

const CATEGORY_ORDER: Record<string, number> = {
  'FAVORITOS': 0,
  'CANAL': 1,
  'DOCUMENTÁRIOS': 2,
  'FILMES & SÉRIES': 3,
  'FILMES E SÉRIES': 3,
  'VARIEDADES': 4,
  'ESPORTES': 5,
  'ESPN': 6,
  'PREMIERE': 7,
  'ESPORTES PPV': 8,
  'HBO': 9,
  'NOTÍCIAS': 10,
  'INFANTIS': 11,
  'MÚSICA': 12,
  'RELIGIOSOS': 13,
};

const RowSection: React.FC<{
  title: string;
  isFavRow?: boolean;
  channels: Channel[];
  favorites: string[];
  startIndex: number;
  onToggleFavorite: (channelName: string) => void;
  onSelectChannel: (channel: Channel) => void;
  density: UiDensity;
}> = ({
  title,
  isFavRow = false,
  channels,
  favorites,
  startIndex,
  onToggleFavorite,
  onSelectChannel,
  density,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (channels.length === 0) return null;

  return (
    <div className="mb-6 group/row">
      <div className="flex items-center justify-between mb-3 px-4 md:px-12">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2">
          {isFavRow && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
          {title}
          <span className="text-xs font-normal text-zinc-400 ml-2">({channels.length})</span>
        </h2>
        <div className="hidden md:flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition-colors"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition-colors"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative px-4 md:px-12">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x snap-mandatory focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-xl"
          tabIndex={0}
        >
          {channels.map((channel, idx) => {
            const isFav = favorites.includes(channel.name);
            return (
              <div key={`${channel.name}-${idx}`} className="snap-start shrink-0">
                <ChannelCard
                  channel={channel}
                  isFavorite={isFav}
                  onToggleFavorite={onToggleFavorite}
                  onSelectChannel={onSelectChannel}
                  density={density}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ChannelRows: React.FC<ChannelRowsProps> = ({
  groupedChannels,
  favorites,
  onToggleFavorite,
  onSelectChannel,
  onClearFilters,
  density = 'normal',
}) => {
  const categories = Object.keys(groupedChannels);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-zinc-400 text-lg mb-4">Nenhum canal encontrado com os filtros atuais.</p>
        <button
          onClick={onClearFilters}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          Limpar Filtros e Busca
        </button>
      </div>
    );
  }

  // Ordena categorias de acordo com CATEGORY_ORDER
  const sortedCategories = categories.sort((a, b) => {
    const orderA = CATEGORY_ORDER[a.toUpperCase()] ?? 99;
    const orderB = CATEGORY_ORDER[b.toUpperCase()] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });

  return (
    <div className="py-6 space-y-2">
      {sortedCategories.map((category, index) => {
        const channels = groupedChannels[category];
        const isFavRow = category.toUpperCase() === 'FAVORITOS';
        return (
          <RowSection
            key={category}
            title={category}
            isFavRow={isFavRow}
            channels={channels}
            favorites={favorites}
            startIndex={index}
            onToggleFavorite={onToggleFavorite}
            onSelectChannel={onSelectChannel}
            density={density}
          />
        );
      })}
    </div>
  );
};

export default ChannelRows;
