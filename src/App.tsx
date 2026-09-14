import { useState, useMemo, useCallback } from 'react';
import { Channel, GroupedChannels, ViewMode } from './types';
import { DEFAULT_PLAYLIST } from './data/playlist';
import { parseM3U, normalizeEmbedUrl } from './services/m3uParser';
import { useTvNavigation } from './services/useTvNavigation';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ChannelGrid from './components/ChannelGrid';
import EpgGrid from './components/EpgGrid';
import Footer from './components/Footer';

export function App() {
  // Parse static initial playlist
  const channels = useMemo(() => {
    return parseM3U(DEFAULT_PLAYLIST);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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

  // Navegação direta: abre exatamente o link configurado no canal (Rede Canais, W7, Alecrim, .ts, etc.)
  const handleSelectChannel = useCallback((channel: Channel) => {
    try {
      sessionStorage.setItem('satv_last_channel', channel.name);
    } catch {}

    const targetUrl = normalizeEmbedUrl(channel.url);
    if (!targetUrl) return;

    window.location.href = targetUrl;
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('TODOS');
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Header com seletor de Canais vs Guia EPG */}
      <Header
        totalChannels={channels.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Search & Category Filter Navigation */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filteredCount={filteredChannels.length}
      />

      {/* Main Channel View: Grid ou EPG */}
      <main className="flex-1 pb-16">
        {viewMode === 'grid' ? (
          <ChannelGrid
            groupedChannels={groupedChannels}
            onSelectChannel={handleSelectChannel}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <EpgGrid
            groupedChannels={groupedChannels}
            onSelectChannel={handleSelectChannel}
            onClearFilters={handleClearFilters}
          />
        )}
      </main>

      {/* Footer / Rodapé */}
      <Footer />
    </div>
  );
}

export default App;
