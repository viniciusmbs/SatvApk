import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredCount: number;
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
}) => {
  // Sort categories strictly: CANAL, DOCUMENTÁRIOS, etc.
  const sortedCategories = [...categories].sort((a, b) => {
    const pA = CATEGORY_PRIORITY[a.toUpperCase()] ?? 50;
    const pB = CATEGORY_PRIORITY[b.toUpperCase()] ?? 50;
    if (pA !== pB) return pA - pB;
    return a.localeCompare(b, 'pt-BR');
  });

  return (
    <div className="bg-[#111726] border-b border-slate-800/80 py-2 shadow-inner">
      <div className="w-full max-w-[1920px] mx-auto px-2.5 sm:px-4 lg:px-6 space-y-2">
        {/* Search input bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              id="channel-search-input"
              type="text"
              tabIndex={1}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar canal ou categoria (ex: ESPN, Globo, Telecine)..."
              className="w-full bg-[#1b2333] text-gray-100 placeholder-slate-400 text-xs sm:text-sm rounded-lg pl-8 pr-8 py-1.5 border border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-red-500/80 focus:border-red-500 transition shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                title="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Exibindo <span className="text-red-400 font-bold">{filteredCount}</span> canais
          </div>
        </div>

        {/* Tabulated Category Pills - Compact & Fast Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {/* Category 0: Todos */}
          <button
            data-tv-nav="category"
            data-category-index={0}
            tabIndex={0}
            onClick={() => setSelectedCategory('TODOS')}
            className={`tv-nav-focus px-2.5 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all outline-none cursor-pointer ${
              selectedCategory === 'TODOS'
                ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            [0] Todos
          </button>

          {/* Categories 1..N starting with CANAL, DOCUMENTÁRIOS, etc. */}
          {sortedCategories.map((category, idx) => {
            const catIndex = idx + 1;
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                data-tv-nav="category"
                data-category-index={catIndex}
                tabIndex={0}
                onClick={() => setSelectedCategory(category)}
                className={`tv-nav-focus px-2.5 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all outline-none cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                [{catIndex}] {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
