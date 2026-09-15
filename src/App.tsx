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
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { soundService } from './services/soundService';
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
  
  // Estado para controlar a confirmação de saída
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasExited, setHasExited] = useState(false);

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
      if (selectedCategory === 'FAVORITOS') {
        if (!favorites.includes(channel.name)) {
          return false;
        }
      } else if (selectedCategory !== 'TODOS' && channel.group !== selectedCategory) {
        return false;
      }

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

  const { lastFocusedCardRef } = useTvNavigation({ enabled: !isMenuOpen && !showExitConfirm });

  const handleSelectChannel = (ch: Channel) => {
    const cardEl =
      document.getElementById(`channel-card-${ch.id || encodeURIComponent(ch.name)}`) ||
      document.getElementById(`epg-card-${ch.id || encodeURIComponent(ch.name)}`);
    if (cardEl) {
      lastFocusedCardRef.current = cardEl;
    }
  };

  // Trava de segurança no histórico do navegador (botão voltar físico)
  useEffect(() => {
    try {
      window.history.pushState({ satvState: 'main' }, '');
    } catch {
      // ignore
    }

    const handlePopState = () => {
      try {
        window.history.pushState({ satvState: 'main' }, '');
      } catch {
        // ignore
      }

      if (isMenuOpen) {
        setIsMenuOpen(false);
        return;
      }

      if (showExitConfirm) {
        soundService.playSelect();
        setShowExitConfirm(false);
        return;
      }

      if (searchQuery) {
        soundService.playNav();
        setSearchQuery('');
        return;
      }

      if (selectedCategory !== 'TODOS') {
        soundService.playNav();
        setSelectedCategory('TODOS');
        return;
      }

      // Última tela: pergunta se quer sair
      soundService.playNav();
      setShowExitConfirm(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMenuOpen, showExitConfirm, searchQuery, selectedCategory]);

  // Interceptação pelo controle remoto do Fire TV Stick
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const isMenuKey =
        e.keyCode === 82 ||
        e.which === 82 ||
        e.key === 'ContextMenu' ||
        e.code === 'ContextMenu' ||
        e.key === 'Menu' ||
        ((e.key === 'm' || e.key === 'M') &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA');

      if (isMenuKey) {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen((prev) => !prev);
        return;
      }

      const isBackKey =
        e.keyCode === 4 ||
        e.key === 'GoBack' ||
        e.key === 'BrowserBack' ||
        e.key === 'Back' ||
        e.code === 'BrowserBack' ||
        e.key === 'Escape' ||
        e.keyCode === 27 ||
        e.keyCode === 10009 ||
        e.keyCode === 461 ||
        ((e.key === 'Backspace' || e.keyCode === 8) &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA');

      if (isBackKey) {
        // 1. Se o menu estiver aberto, fecha o menu
        if (isMenuOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsMenuOpen(false);
          return;
        }

        // 2. Se a confirmação já estiver aberta, fecha ela e cancela
        if (showExitConfirm) {
          e.preventDefault();
          e.stopPropagation();
          soundService.playSelect();
          setShowExitConfirm(false);
          return;
        }

        // 3. Se estiver pesquisando, limpa a pesquisa
        if (searchQuery) {
          e.preventDefault();
          e.stopPropagation();
          soundService.playNav();
          setSearchQuery('');
          const firstCard = document.querySelector<HTMLElement>('[data-channel-name]');
          firstCard?.focus();
          return;
        }

        // 4. Se estiver em uma categoria, volta para TODOS
        if (selectedCategory !== 'TODOS') {
          e.preventDefault();
          e.stopPropagation();
          soundService.playNav();
          setSelectedCategory('TODOS');
          return;
        }

        // 5. CHEGOU NA ÚLTIMA TELA: Pergunta se deseja sair
        e.preventDefault();
        e.stopPropagation();
        soundService.playNav();
        setShowExitConfirm(true);
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

    window.addEventListener('keydown', handleGlobalKey, true);
    return () => window.removeEventListener('keydown', handleGlobalKey, true);
  }, [isMenuOpen, showExitConfirm, searchQuery, selectedCategory]);

  const handleConfirmExit = () => {
    soundService.playSelect();
    setShowExitConfirm(false);
    try {
      window.close();
    } catch {
      // ignore
    }
    setHasExited(true);
  };

  if (hasExited) {
    return (
      <div className="min-h-screen bg-[#0c0e14] text-white flex flex-col items-center justify-center p-6 select-none text-center animate-in fade-in duration-300">
        <div className="max-w-md w-full bg-[#151923] border border-white/15 rounded-2xl p-8 shadow-2xl space-y-6">
          <img
            src="https://i.imgur.com/VWtF2t5.jpeg"
            alt="SATV Logo"
            className="w-16 h-16 mx-auto rounded-full border-2 border-white/80 shadow-lg object-cover bg-black"
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Aplicativo Encerrado</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Você saiu do SATV com segurança. Pode desligar a TV ou apertar a tecla <strong>Início (Home)</strong> no controle remoto do Fire TV.
            </p>
          </div>
          <button
            autoFocus
            type="button"
            onClick={() => {
              soundService.playSelect();
              setHasExited(false);
            }}
            className="w-full py-3 px-5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-sm transition cursor-pointer outline-none shadow-xl focus:ring-4 focus:ring-white"
          >
            Reabrir SATV
          </button>
        </div>
      </div>
    );
  }

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

      {/* Main View: Fileiras, Mosaico ou Guia EPG */}
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#171a23]/95 border border-amber-400/60 rounded-xl shadow-2xl text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-2 backdrop-blur-md transition-all">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal de Confirmação de Saída */}
      <ExitConfirmModal
        isOpen={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirmExit={handleConfirmExit}
      />

      {/* Rodapé */}
      <Footer totalChannels={channels.length} favoritesCount={favorites.length} />

      {/* Menu Modal (três pontinhos) */}
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