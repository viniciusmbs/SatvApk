import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Channel, GroupedChannels, ViewMode, UiDensity } from './types';
import { parseM3U } from './services/m3uParser';
import { m3uPlaylist } from './data/playlist';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ChannelRows from './components/ChannelRows';
import ChannelGrid from './components/ChannelGrid';
import EpgGrid from './components/EpgGrid';
import Footer from './components/Footer';
import { useTvNavigation } from './services/useTvNavigation';
import { soundService } from './services/soundService';

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

  // UI Density state (compact by default for optimal Fire TV Stick & Mobile rendering)
  const [uiDensity, setUiDensity] = useState<UiDensity>(() => {
    try {
      const saved = localStorage.getItem('satv_ui_density');
      if (saved === 'compact' || saved === 'normal' || saved === 'large') {
        return saved;
      }
      return 'compact';
    } catch {
      return 'compact';
    }
  });

  const handleSetUiDensity = (newDensity: UiDensity) => {
    setUiDensity(newDensity);
    soundService.playClick();
    try {
      localStorage.setItem('satv_ui_density', newDensity);
    } catch {
      // ignore
    }
    const label =
      newDensity === 'compact' ? 'Pequeno (Compacto)' : newDensity === 'large' ? 'Grande' : 'Médio';
    showToast(`📐 Tamanho dos Ícones: ${label}`);
  };

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

  // Toggle favorite channel explicitly
  const handleToggleFavorite = (channelName: string) => {
    soundService.playSelect();
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
          : `⭐ ${channelName} adicionado aos Favoritos!`
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
    soundService.playClick();
    setSearchQuery('');
    setSelectedCategory('TODOS');
  };

  // Active TV tabulation navigation hook
  const { lastFocusedCardRef } = useTvNavigation({ enabled: true });

  const handleSelectChannel = (ch: Channel) => {
    try {
      const channelId = ch.id || encodeURIComponent(ch.name);
      localStorage.setItem('satv_last_focused_channel_name', ch.name);
      localStorage.setItem('satv_last_focused_channel_id', channelId);
      localStorage.setItem('satv_last_scroll_y', String(window.scrollY));
      localStorage.setItem('satv_should_restore_channel', 'true');
      sessionStorage.setItem('satv_last_focused_channel_name', ch.name);
      sessionStorage.setItem('satv_last_focused_channel_id', channelId);
      sessionStorage.setItem('satv_last_scroll_y', String(window.scrollY));
      sessionStorage.setItem('satv_should_restore_channel', 'true');
    } catch {
      // ignore
    }

    const cardEl =
      document.getElementById(`channel-card-${ch.id || encodeURIComponent(ch.name)}`) ||
      document.getElementById(`epg-card-${ch.id || encodeURIComponent(ch.name)}`) ||
      document.querySelector<HTMLElement>(`[data-channel-name="${ch.name}"]`);

    if (cardEl) {
      lastFocusedCardRef.current = cardEl;
    }
  };

  // Sound feedback on window scroll (when scrolling down/up on mobile or TV)
  useEffect(() => {
    const handleScroll = () => {
      soundService.playScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global D-Pad / remote shortcut:
  // - Menu button (3 tracinhos / 3 pontinhos no controle remoto do IPTV / Fire TV = KeyCode 82 / ContextMenu / Guide / EPG / KeyCode 172):
  //    * Abre / Alterna diretamente a GUIA DE CANAIS (EPG)!
  // - Tecla 'g' ou 'm': abre a Guia de Canais
  // - Tecla '/' ou 's' para ir direto na busca
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const isGuideOrMenuKey =
        e.keyCode === 82 || // Android KEYCODE_MENU (Fire TV 3 Tracinhos)
        e.which === 82 ||
        e.keyCode === 172 || // Android KEYCODE_GUIDE
        e.which === 172 ||
        e.keyCode === 165 || // Android KEYCODE_INFO
        e.which === 165 ||
        e.keyCode === 458 || // Smart TV EPG Key
        e.keyCode === 93 || // ContextMenu
        e.which === 93 ||
        e.keyCode === 115 || // F4 (Mapped on some TV webviews)
        e.keyCode === 209 || // KEYCODE_PROG_RED / KEYCODE_TV
        e.keyCode === 170 || // KEYCODE_TV
        e.key === 'ContextMenu' ||
        e.code === 'ContextMenu' ||
        e.key === 'Menu' ||
        e.code === 'Menu' ||
        e.key === 'Guide' ||
        e.code === 'Guide' ||
        e.key === 'EPG' ||
        ((e.key === 'm' || e.key === 'M' || e.key === 'g' || e.key === 'G') &&
          document.activeElement?.tagName !== 'INPUT');

      if (isGuideOrMenuKey) {
        e.preventDefault();
        soundService.playClick();
        setViewMode((prev) => {
          const nextMode: ViewMode = prev === 'epg' ? 'rows' : 'epg';
          showToast(
            nextMode === 'epg'
              ? '📺 Guia de Canais (EPG) Aberta!'
              : '📺 Modo Fileiras Aberto!'
          );
          return nextMode;
        });
        return;
      }

      if ((e.key === '/' || e.key === 's') && document.activeElement?.tagName !== 'INPUT') {
        const searchInput = document.getElementById('channel-search-input');
        if (searchInput) {
          e.preventDefault();
          soundService.playClick();
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
          setViewMode={(mode) => {
            soundService.playClick();
            setViewMode(mode);
          }}
          favoritesCount={favorites.length}
          isFavoritesActive={selectedCategory === 'FAVORITOS'}
          onOpenFavorites={() => {
            soundService.playClick();
            if (selectedCategory === 'FAVORITOS') {
              setSelectedCategory('TODOS');
            } else {
              setSelectedCategory('FAVORITOS');
              if (viewMode === 'epg') setViewMode('rows');
            }
          }}
          onToggleChannelGuide={() => {
            soundService.playClick();
            setViewMode((prev) => (prev === 'epg' ? 'rows' : 'epg'));
          }}
          density={uiDensity}
          setDensity={handleSetUiDensity}
        />
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat) => {
            soundService.playClick();
            setSelectedCategory(cat);
          }}
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
            density={uiDensity}
          />
        )}
        {viewMode === 'grid' && (
          <ChannelGrid
            groupedChannels={groupedChannels}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectChannel={handleSelectChannel}
            onClearFilters={handleClearFilters}
            density={uiDensity}
          />
        )}
        {viewMode === 'epg' && (
          <EpgGrid
            groupedChannels={groupedChannels}
            onSelectChannel={handleSelectChannel}
            onClearFilters={handleClearFilters}
          />
        )}
      </main>

      {/* Floating Smart TV Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#171a23]/95 border border-amber-400/60 rounded-xl shadow-2xl text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-2 backdrop-blur-md transition-all animate-fadeIn">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean TV Footer */}
      <Footer totalChannels={channels.length} favoritesCount={favorites.length} />
    </div>
  );
}
