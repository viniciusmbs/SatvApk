import React, { useRef } from 'react';
import { Search, X, Star, Tv, ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  filteredCount: number;
  favoritesCount?: number;
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
}) => {
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Sort categories strictly: CANAL, DOCUMENTÁRIOS, etc.
  const sortedCategories = [...categories].sort((a, b) => {
    const pA = CATEGORY_PRIORITY[a.toUpperCase()] ?? 50;
    const pB = CATEGORY_PRIORITY[b.toUpperCase()] ?? 50;
    if (pA !== pB) return pA - pB;
    return a.localeCompare(b, 'pt-BR');
  });

  const handleScroll = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#10121a]/95 backdrop-blur-md border-b border-white/5 py-2.5 sm:py-3 shadow-md select-none">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 space-y-2.5">
        {/* Linha superior: Campo de Busca e Contador de Canais alinhados */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="channel-search-input"
              type="text"
              tabIndex={1}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar canal por nome ou categoria (ex: ESPN, Globo, Telecine)..."
              className="w-full bg-[#161924] hover:bg-[#1d2130] focus:bg-[#1d2130] text-gray-100 placeholder-slate-400 text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/80 focus:border-red-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                title="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Badge Contador de Canais elegante e alinhado */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-300 font-medium shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161924] border border-white/10 shadow-sm">
              <Tv className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>
                Mostrando <strong className="text-white font-bold">{filteredCount}</strong> {filteredCount === 1 ? 'canal' : 'canais'}
              </span>
            </div>
          </div>
        </div>

        {/* Linha de Categorias com navegação e scroll suave */}
        <div className="relative flex items-center">
          {/* Botão rolar esquerda (desktop / TV) */}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => handleScroll('left')}
            className="hidden sm:flex shrink-0 items-center justify-center w-7 h-7 mr-1 rounded-lg bg-[#161924] hover:bg-[#202535] text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
            title="Rolar categorias para a esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Carrossel de Categorias */}
          <div
            ref={categoryScrollRef}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth"
          >
            {/* Categoria: Todos */}
            <button
              data-tv-nav="category"
              data-category-index={0}
              tabIndex={0}
              onClick={() => setSelectedCategory('TODOS')}
              className={`tv-nav-focus shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all outline-none cursor-pointer border ${
                selectedCategory === 'TODOS'
                  ? 'bg-red-600 text-white border-red-500 shadow-md ring-1 ring-red-400 font-bold'
                  : 'bg-[#161924] hover:bg-[#202533] text-slate-300 hover:text-white border-white/10'
              }`}
            >
              Todos
            </button>

            {/* Categoria: ⭐ Favoritos */}
            <button
              data-tv-nav="category"
              data-category-index={1}
              tabIndex={0}
              onClick={() => setSelectedCategory('FAVORITOS')}
              className={`tv-nav-focus shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all outline-none cursor-pointer border ${
                selectedCategory === 'FAVORITOS'
                  ? 'bg-amber-500 text-black border-amber-300 shadow-md ring-1 ring-amber-300'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
              title="Ver somente os canais favoritos"
            >
              <Star className={`w-3.5 h-3.5 ${selectedCategory === 'FAVORITOS' ? 'fill-black' : 'fill-amber-400'}`} />
              <span>Favoritos</span>
              {favoritesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'FAVORITOS'
                      ? 'bg-black text-amber-300'
                      : 'bg-amber-400 text-black'
                  }`}
                >
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Categorias ordenadas */}
            {sortedCategories.map((category, idx) => {
              const catIndex = idx + 2;
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  data-tv-nav="category"
                  data-category-index={catIndex}
                  tabIndex={0}
                  onClick={() => setSelectedCategory(category)}
                  className={`tv-nav-focus shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all outline-none cursor-pointer border ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-500 shadow-md ring-1 ring-red-400 font-bold'
                      : 'bg-[#161924] hover:bg-[#202533] text-slate-300 hover:text-white border-white/10'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Botão rolar direita (desktop / TV) */}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => handleScroll('right')}
            className="hidden sm:flex shrink-0 items-center justify-center w-7 h-7 ml-1 rounded-lg bg-[#161924] hover:bg-[#202535] text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
            title="Rolar categorias para a direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
