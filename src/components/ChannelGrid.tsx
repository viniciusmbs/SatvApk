import React from 'react';
import { Tv } from 'lucide-react';
import { Channel, GroupedChannels } from '../types';
import ChannelCard from './ChannelCard';

interface ChannelGridProps {
  groupedChannels: GroupedChannels;
  onSelectChannel: (channel: Channel) => void;
  onClearFilters: () => void;
}

const CATEGORY_ORDER: Record<string, number> = {
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

const ChannelGrid: React.FC<ChannelGridProps> = ({
  groupedChannels,
  onSelectChannel,
  onClearFilters,
}) => {
  const sortedGroupNames = Object.keys(groupedChannels).sort((a, b) => {
    const upperA = a.toUpperCase();
    const upperB = b.toUpperCase();

    const orderA = CATEGORY_ORDER[upperA] ?? 50;
    const orderB = CATEGORY_ORDER[upperB] ?? 50;

    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b, 'pt-BR');
  });

  const totalVisible = Object.values(groupedChannels).reduce(
    (acc: number, list: Channel[]) => acc + (list ? list.length : 0),
    0
  );

  if (totalVisible === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
          <Tv className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-200 mb-1">
          Nenhum canal encontrado
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
          Tente buscar com outro nome de canal ou limpe os filtros de categoria.
        </p>
        <button
          onClick={onClearFilters}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition shadow-md cursor-pointer focus:ring-2 focus:ring-red-400 outline-none"
        >
          Limpar Filtros e Ver Todos os Canais
        </button>
      </div>
    );
  }

  let globalIndex = 0;

  return (
    <div className="w-full max-w-[1920px] mx-auto px-2.5 sm:px-4 lg:px-6 py-4 space-y-6 sm:space-y-8">
      {sortedGroupNames.map((groupName) => {
        const channels = groupedChannels[groupName];
        if (!channels || channels.length === 0) return null;

        return (
          <section key={groupName} className="space-y-2 sm:space-y-2.5">
            {/* Category Header - Sleek & Compact */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-3.5 bg-red-600 rounded-full" />
                <h2 className="text-xs sm:text-sm font-bold text-gray-100 tracking-wide uppercase">
                  {groupName}
                </h2>
                <span className="text-[10px] text-slate-400 font-medium px-2 py-0.2 rounded-full bg-slate-800/80 border border-slate-700/50">
                  {channels.length} canais
                </span>
              </div>
            </div>

            {/* Channels Grid - 8 columns on TV/desktop, 6 on tablets/720p, 3-4 on phones */}
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 2xl:grid-cols-8 gap-2 sm:gap-2.5 lg:gap-3">
              {channels.map((channel) => {
                const currentIndex = globalIndex++;
                return (
                  <ChannelCard
                    key={`${channel.name}-${channel.url}`}
                    channel={channel}
                    index={currentIndex}
                    onSelect={onSelectChannel}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ChannelGrid;
