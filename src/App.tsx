import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Channel, GroupedChannels, ViewMode } from './types';
import { parseM3U } from './services/m3uParser';
import { m3uPlaylist } from './data/playlist';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ChannelRows from './components/ChannelRows';
import ChannelGrid from './components/ChannelGrid';
import EpgGrid from './components/EpgGrid';
import Footer from './components/Footer';
import { MenuModal } from './components/MenuModal';
import { useTvNavigation } from './services/useTvNavigation';

export default function App() {
  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      return parseM3U(m3uPlaylist);
    } catch (err) {
      console.error('Erro ao processar canais:', err);
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [viewMode, setViewMode] = useState<ViewMode>('rows');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('satv_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2800);
  };

  // Toggle favorite channel
  const handleToggleFavorite = (channelName: string) => {
    setFavorites((prev) => {
      const isAlready = prev.includes(channelName);
      const next = isAlready
        ? prev.filter((name) => name !== channelName)
        : [...prev, channelName];
      try {
        localStorage.setItem('satv_favorites', JSON.stringify(next));
      } catch {
        // ignore localStorage errors
      }
      showToast(
        isAlready
          ? `Removido dos Favoritos: ${channelName}`
          : `⭐ ${channelName} adicionado aos Meus Favoritos!`
      );
      return next;
    });
  };

  // Load initial playlist
  useEffect(() => {
    try {
      const parsed = parseM3U(m3uPlaylist);
      setChannels(parsed);
    } catch (err) {
      console.error('Falha ao carregar playlist inicial:', err);
    }
  }, []);

  // Distinct categories from channels
  const categories = useMemo(() => {
    const cats = new Set<string>();
    channels.forEach((c) => {
      if (c.group) cats.add(c.group);
    });
    return Array.from(cats);
  }, [channels]);

  // Filter channels based on search and category
  const filteredChannels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return channels.filter((channel) => {
      // Category filter (handles FAVORITOS filter explicitly)
      if (selectedCategory === 'FAVORITOS') {
        if (!favorites.includes(channel.name)) {
          return false;
        }
      } else if (selectedCategory !== 'TODOS' && channel.group !== selectedCategory) {
        return false;
      }

      // Search query filter (matches channel name or group)
      if (q) {
        const nameMatch = channel.name.toLowerCase().includes(q);
        const groupMatch = channel.group.toLowerCase().includes(q);
        return nameMatch || groupMatch;
      }

      return true;
    });
  }, [channels, searchQuery, selectedCategory, favorites]);

  // Group filtered channels by group title
  const groupedChannels = useMemo(() => {
    const grouped: GroupedChannels = {};
    filteredChannels.forEach((ch) => {
      const g = ch.group || 'GERAL';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(ch);
    });
    return grouped;
  }, [filteredChannels]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('TODOS');
  };

  // Active TV tabulation navigation hook
  const { lastFocusedCardRef } = useTvNavigation({ enabled: true });

  const handleSelectChannel = (ch: Channel) => {
    const cardEl =
      document.getElementById(`channel-card-${ch.id || encodeURIComponent(ch.name)}`) ||
      document.getElementById(`epg-card-${ch.id || encodeURIComponent(ch.name)}`);
    if (cardEl) {
      lastFocusedCardRef.current = cardEl;
    }
  };

  // Global D-Pad / remote shortcut:
  // - Menu button (3 tracinhos / 3 pontinhos no Fire TV = KeyCode 82 / ContextMenu):
  //    * Abre o Menu Principal com a lista de opções e modos de exibição
  // - Favoritar no controle:
  //    * Basta SEGURAR o botão central (OK) por 1 segundo no canal, ou apertar Play/Pause!
  // - Tecla '/' ou 's' para ir direto na busca
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const isMenuKey =
        e.keyCode === 82 ||
        e.which === 82 ||
        e.key === 'ContextMenu' ||
        e.code === 'ContextMenu' ||
        e.key === 'Menu' ||
        ((e.key === 'm' || e.key === 'M') &&
          document.activeElement?.tagName !== 'INPUT');

      if (isMenuKey) {
        e.preventDefault();
        setIsMenuOpen((prev) => !prev);
        return;
      }

      if ((e.key === '/' || e.key === 's') && document.activeElement?.tagName !== 'INPUT') {
        const searchInput = document.getElementById('channel-search-input');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0e14] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Sticky Top Navigation & Filter Bar */}
      <div className="sticky top-0 z-40 shadow-xl">
        <Header
          totalChannels={channels.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          favoritesCount={favorites.length}
          onOpenFavorites={() => {
            setSelectedCategory('FAVORITOS');
            if (viewMode === 'epg') setViewMode('rows');
          }}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filteredCount={filteredChannels.length}
          favoritesCount={favorites.length}
        />
      </div>

      {/* Main View: Fileiras (Carrossel TV), Mosaico (Grid) ou Guia (EPG) */}
      <main className="flex-1">
        {viewMode === 'rows' && (
          <ChannelRows
            groupedChannels={groupedChannels}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectChannel={handleSelectChannel}
            onClearFilters={handleClearFilters}
          />
        )}
        {viewMode === 'grid' && (
          <ChannelGrid
            groupedChannels={groupedChannels}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectChannel={handleSelectChannel}
            onClearFilters={handleClearFilters}
          />
        )}
        {viewMode === 'epg' && (
          <EpgGrid
            groupedChannels={groupedChannels}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectChannel={handleSelectChannel}
            onClearFilters={handleClearFilters}
          />
        )}
      </main>

      {/* Floating Smart TV Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#171a23]/95 border border-amber-400/60 rounded-xl shadow-2xl text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-2 backdrop-blur-md transition-all">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean TV Footer */}
      <Footer totalChannels={channels.length} favoritesCount={favorites.length} />

      {/* Three Dots / Menu List Modal */}
      <MenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenFavorites={() => {
          setSelectedCategory('FAVORITOS');
          if (viewMode === 'epg') setViewMode('rows');
        }}
        favoritesCount={favorites.length}
        totalChannels={channels.length}
      />
    </div>
  );
}
