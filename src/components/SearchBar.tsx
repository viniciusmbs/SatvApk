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
    <div className="w-full bg-[#10121a]/95 backdrop-blur-md border-b border-white/5 py-1 sm:py-1.5 shadow-md overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 space-y-1 min-w-0">
        
        {/* Linha superior: Input de busca compacto + Contador de canais */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          {/* Barra de busca redimensionada para ficar menor (max-w-xs / ~1/4 menor) */}
          <div className="relative w-full max-w-xs sm:max-w-sm min-w-0">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-3 w-3" />
            </div>
            <input
              id="channel-search-input"
              type="text"
              tabIndex={1}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar canal..."
              className="w-full bg-[#171a23] text-gray-100 placeholder-slate-400 text-xs rounded-md pl-8 pr-8 py-1 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#6b0707] focus:border-[#6b0707] transition shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                title="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Contador de canais alinhado na mesma linha */}
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">
            Mostrando <span className="text-red-400 font-semibold">{filteredCount}</span> canais
          </div>
        </div>

        {/* Linha inferior: Pílulas de Categorias e Favoritos */}
        <div className="w-full min-w-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar w-full min-w-0">
            
            {/* Botão Favoritos */}
            {onOpenFavorites && (
              <button
                id="tab-btn-favoritos"
                type="button"
                data-tv-nav="category"
                tabIndex={0}
                onClick={onOpenFavorites}
                style={{ outline: 'none', boxShadow: 'none' }}
                className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isFavoritesSelected
                    ? 'bg-amber-500 text-black border border-amber-300 font-bold'
                    : 'bg-[#171a23] hover:bg-[#3b0404] text-amber-400 border border-white/15 hover:border-[#6b0707]'
                }`}
                title="Acessar canais favoritos"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Favoritos</span>
                {favoritesCount > 0 && (
                  <span className="px-1 py-0.2 text-[9px] bg-amber-400 text-black rounded-full font-black ml-0.5">
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
              className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
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
                  className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
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