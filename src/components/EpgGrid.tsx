import React, { useEffect, useState, useMemo } from 'react';
import { Channel, GroupedChannels, ChannelEpg } from '../types';
import { fetchEpgData, buildChannelEpg, RawEpgProgram } from '../services/epgService';
import { Tv, Play, Clock, ChevronRight, RefreshCw, Radio } from 'lucide-react';

interface EpgGridProps {
  groupedChannels: GroupedChannels;
  onSelectChannel: (channel: Channel) => void;
  onClearFilters: () => void;
}

const EpgGrid: React.FC<EpgGridProps> = ({
  groupedChannels,
  onSelectChannel,
  onClearFilters,
}) => {
  const [rawProgrammes, setRawProgrammes] = useState<Record<string, RawEpgProgram[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Atualiza relógio a cada 30 segundos para manter barra de progresso em tempo real
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Carrega dados do EPG
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchEpgData()
      .then((data) => {
        if (isMounted) {
          setRawProgrammes(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalChannelsCount = useMemo(() => {
    return (Object.values(groupedChannels) as Channel[][]).reduce((acc, list) => acc + list.length, 0);
  }, [groupedChannels]);

  if (totalChannelsCount === 0) {
    return (
      <div className="w-full max-w-[1920px] mx-auto px-4 py-16 text-center">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto">
          <Tv className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-200 font-semibold mb-2">Nenhum canal encontrado</p>
          <p className="text-slate-400 text-xs mb-4">Tente buscar por outro termo ou categoria.</p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-4 space-y-6">
      {/* Banner de status do EPG */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-slate-800/80 rounded-xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-400" />
            Guia de Programação (EPG) ao Vivo
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-amber-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Sincronizando grade...
            </span>
          ) : (
            <span>Atualizado • Horário Oficial de Brasília</span>
          )}
        </div>
      </div>

      {/* Grade por Categorias no estilo TV Samsung */}
      {(Object.entries(groupedChannels) as [string, Channel[]][]).map(([groupName, channels]) => {
        if (!channels || channels.length === 0) return null;

        return (
          <section key={groupName} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-1.5">
              <span className="w-1.5 h-4 bg-red-600 rounded-full" />
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                {groupName}
              </h2>
              <span className="text-xs text-slate-500 font-medium">({channels.length})</span>
            </div>

            <div className="flex flex-col gap-2">
              {channels.map((channel, idx) => {
                const epg = buildChannelEpg(channel, rawProgrammes, now);
                const current = epg.currentProgram;
                const next = epg.nextProgram;

                return (
                  <div
                    key={`${channel.name}-${idx}`}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800/80 hover:border-red-600/50 rounded-xl p-3 transition-all duration-150 focus-within:ring-2 focus-within:ring-red-500 shadow-sm"
                  >
                    {/* Canal info: Logo + Nome */}
                    <div className="flex items-center gap-3 min-w-[220px] max-w-full md:max-w-[260px] shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-black/80 border border-slate-700/60 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                        {channel.logo ? (
                          <img
                            src={channel.logo}
                            alt={channel.name}
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Tv className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                          {channel.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {channel.group}
                        </span>
                      </div>
                    </div>

                    {/* Bloco Central: Programa no Ar agora com Barra de Tempo */}
                    <div className="flex-1 min-w-0 px-0 md:px-3">
                      {current ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
                              <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
                                NO AR
                              </span>
                              {current.title}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0">
                              {current.start} - {current.stop}
                            </span>
                          </div>

                          {/* Barra de Progresso do Programa */}
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-red-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${current.progressPercent || 0}%` }}
                            />
                          </div>

                          {current.desc && (
                            <p className="text-[11px] text-slate-400 truncate line-clamp-1">
                              {current.desc}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          <span>Programação sob consulta na emissora</span>
                        </div>
                      )}
                    </div>

                    {/* Bloco Direita: A Seguir + Botão Assistir */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                      {next ? (
                        <div className="hidden xl:flex flex-col text-right max-w-[180px]">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">
                            A SEGUIR • {next.start}
                          </span>
                          <span className="text-xs text-slate-300 truncate font-medium">
                            {next.title}
                          </span>
                        </div>
                      ) : null}

                      <button
                        onClick={() => onSelectChannel(channel)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-white/80"
                        title={`Assistir ${channel.name}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Assistir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default EpgGrid;
