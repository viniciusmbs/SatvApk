import { useState, useMemo, useCallback } from 'react';
import { Channel, GroupedChannels } from './types';
import { DEFAULT_PLAYLIST } from './data/playlist';
import {
  parseM3U,
  normalizeEmbedUrl,
  isDirectMediaStream,
  getChannelMirrors,
  isServerOnline,
} from './services/m3uParser';
import { useTvNavigation } from './services/useTvNavigation';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ChannelGrid from './components/ChannelGrid';
import Footer from './components/Footer';

const getServerLabel = (url: string): string => {
  if (!url) return 'Servidor Principal';
  if (url.includes('alerquina')) return 'Alecrim (Autoplay)';
  if (url.includes('w7')) return 'EmbedTV W7 (Reserva)';
  if (url.includes('rdcanais')) return 'Rede Canais';
  if (url.includes('rdse')) return 'RDSE';
  try {
    return new URL(url).hostname;
  } catch {
    return 'Servidor Alternativo';
  }
};

export function App() {
  // Parse static initial playlist
  const channels = useMemo(() => {
    return parseM3U(DEFAULT_PLAYLIST);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');

  // Extract unique categories in playlist
  const categories = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((ch) => {
      if (ch.group) set.add(ch.group);
    });
    return Array.from(set);
  }, [channels]);

  // Filter channels based on search and category
  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      const matchesSearch =
        !searchQuery ||
        ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.group.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'TODOS' ||
        ch.group.toUpperCase() === selectedCategory.toUpperCase();

      return matchesSearch && matchesCategory;
    });
  }, [channels, searchQuery, selectedCategory]);

  // Group channels by category
  const groupedChannels = useMemo(() => {
    const groups: GroupedChannels = {};
    filteredChannels.forEach((ch) => {
      const g = ch.group || 'OUTROS';
      if (!groups[g]) groups[g] = [];
      groups[g].push(ch);
    });
    return groups;
  }, [filteredChannels]);

  // TV Spatial and Tabulation remote navigation
  useTvNavigation({
    enabled: true,
  });

  // Estado de conexão e teste de espelhos em tempo real
  const [connectingState, setConnectingState] = useState<{
    channelName: string;
    serverName: string;
    attempt: number;
    total: number;
  } | null>(null);

  // Navegação inteligente de canais:
  // - Streams .ts / .m3u8 abrem imediatamente no player externo (MX Player)
  // - Canais web testam os 3 links (Alecrim -> W7 -> Rede Canais) e pulam direto para o online
  const handleSelectChannel = useCallback(async (channel: Channel) => {
    try {
      sessionStorage.setItem('satv_last_channel', channel.name);
    } catch {}

    const originalUrl = channel.url ? channel.url.trim() : '';
    if (!originalUrl) return;

    // 1. Streams diretos (.ts, .m3u8): abre imediatamente no app externo (MX Player)
    if (isDirectMediaStream(originalUrl)) {
      window.location.href = originalUrl;
      return;
    }

    // 2. Links web: obtém os espelhos candidatos (Alecrim, W7, Rede Canais)
    const candidates =
      channel.mirrors && channel.mirrors.length > 0
        ? channel.mirrors
        : getChannelMirrors(originalUrl);

    // Se só tiver 1 espelho disponível, navega direto
    if (candidates.length <= 1) {
      window.location.href = candidates[0] || originalUrl;
      return;
    }

    // 3. Testa os espelhos em ordem de prioridade para autoplay
    setConnectingState({
      channelName: channel.name,
      serverName: getServerLabel(candidates[0]),
      attempt: 1,
      total: candidates.length,
    });

    for (let i = 0; i < candidates.length; i++) {
      const candidateUrl = candidates[i];
      const isLast = i === candidates.length - 1;

      // Se for o último espelho, navega diretamente sem atraso
      if (isLast) {
        window.location.href = candidateUrl;
        return;
      }

      setConnectingState({
        channelName: channel.name,
        serverName: getServerLabel(candidateUrl),
        attempt: i + 1,
        total: candidates.length,
      });

      // Testa se o servidor responde em até 1200ms
      const isAlive = await isServerOnline(candidateUrl, 1200);
      if (isAlive) {
        window.location.href = candidateUrl;
        return;
      }

      console.warn(`[SatvApk] Servidor ${candidateUrl} indisponível. Pulando para o próximo...`);
    }

    // Fallback de segurança
    window.location.href = candidates[0] || originalUrl;
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('TODOS');
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Indicador de Conexão e Troca Automática de Servidor */}
      {connectingState && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-red-500/80 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fade-in pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-ping" />
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-red-400 font-bold uppercase tracking-wider">
              {connectingState.channelName}
            </span>
            <span className="text-xs font-semibold text-gray-200">
              Conectando via {connectingState.serverName} ({connectingState.attempt}/{connectingState.total})...
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header totalChannels={channels.length} />

      {/* Search & Category Filter Navigation */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filteredCount={filteredChannels.length}
      />

      {/* Main Channel Grid */}
      <main className="flex-1 pb-16">
        <ChannelGrid
          groupedChannels={groupedChannels}
          onSelectChannel={handleSelectChannel}
          onClearFilters={handleClearFilters}
        />
      </main>

      {/* Footer / Rodapé */}
      <Footer />
    </div>
  );
}

export default App;
