import React from 'react';
import { Search, X, Star } from 'lucide-react';
import { soundService } from '../services/soundService';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  filteredCount: number;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
}

const CATEGORY_PRIORITY: Record<string, number> = {
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

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  setSelectedCategory,
  filteredCount,
  favoritesCount = 0,
  onOpenFavorites,
}) => {
  const sortedCategories = [...categories].sort((a, b) => {
    const pA = CATEGORY_PRIORITY[a.toUpperCase()] ?? 50;
    const pB = CATEGORY_PRIORITY[b.toUpperCase()] ?? 50;
    if (pA !== pB) return pA - pB;
    return a.localeCompare(b, 'pt-BR');
  });

  const handleSelectCategory = (cat: string) => {
    soundService.playSelect();
    setSelectedCategory(cat);
  };

  const handleClearSearch = () => {
    soundService.playSelect();
    setSearchQuery('');
  };

  const isFavoritesSelected = selectedCategory === 'FAVORITOS';

  return (
    <div className="w-full bg-[#10121a]/95 backdrop-blur-md border-b border-white/5 py-1.5 sm:py-2 shadow-md overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 space-y-1.5 min-w-0">
        {/* Search input bar & Counter - Reduzido o tamanho da barra em 1/4 (de max-w-xl para max-w-md) */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between min-w-0">
          <div className="relative w-full max-w-md min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              id="channel-search-input"
              type="text"
              tabIndex={1}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar canal por nome ou categoria..."
              className="w-full bg-[#171a23] text-gray-100 placeholder-slate-400 text-xs rounded-lg pl-9 pr-9 py-1.5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#6b0707] focus:border-[#6b0707] transition shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                title="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:block shrink-0">
            Mostrando <span className="text-red-400 font-semibold">{filteredCount}</span> canais
          </div>
        </div>

        {/* Tabulated Category Pills & Favorites integrated */}
        <div className="w-full min-w-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full min-w-0">
            {/* Botão Favoritos incorporado nas pílulas */}
            {onOpenFavorites && (
              <button
                id="tab-btn-favoritos"
                type="button"
                data-tv-nav="category"
                tabIndex={0}
                onClick={onOpenFavorites}
                style={{ outline: 'none', boxShadow: 'none' }}
                className={`flex items-center gap-1 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isFavoritesSelected
                    ? 'bg-amber-500 text-black border border-amber-300 font-bold'
                    : 'bg-[#171a23] hover:bg-[#3b0404] text-amber-400 border border-white/15 hover:border-[#6b0707]'
                }`}
                title="Acessar canais favoritos"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Favoritos</span>
                {favoritesCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] bg-amber-400 text-black rounded-full font-black ml-0.5">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}

            {/* Categoria: Todos */}
            <button
              data-tv-nav="category"
              data-category-index={0}
              tabIndex={0}
              onClick={() => handleSelectCategory('TODOS')}
              style={{ outline: 'none', boxShadow: 'none' }}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'TODOS'
                  ? 'bg-[#3b0404] text-white border border-[#6b0707]'
                  : 'bg-[#171a23] hover:bg-[#3b0404] text-slate-300 hover:text-white border border-white/15 hover:border-[#6b0707]'
              }`}
            >
              Todos
            </button>

            {/* Demais Categorias */}
            {sortedCategories.map((category, idx) => {
              const catIndex = idx + 1;
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  data-tv-nav="category"
                  data-category-index={catIndex}
                  tabIndex={0}
                  onClick={() => handleSelectCategory(category)}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#3b0404] text-white border border-[#6b0707]'
                      : 'bg-[#171a23] hover:bg-[#3b0404] text-slate-300 hover:text-white border border-white/15 hover:border-[#6b0707]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;