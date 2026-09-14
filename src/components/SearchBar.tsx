import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
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
    <div className="bg-[#10121a] border-b border-white/5 py-3 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2.5">
        {/* Search input bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full max-w-xl">
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
              className="w-full bg-[#171a23] text-gray-100 placeholder-slate-400 text-sm rounded-xl pl-10 pr-10 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/80 focus:border-red-500 transition shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                title="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results Badge */}
          <div className="text-xs text-slate-400 font-medium whitespace-nowrap self-end sm:self-center">
            Mostrando <span className="text-red-400 font-semibold">{filteredCount}</span> canais
          </div>
        </div>

        {/* Tabulated Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {/* Category: Todos */}
          <button
            data-tv-nav="category"
            data-category-index={0}
            tabIndex={0}
            onClick={() => setSelectedCategory('TODOS')}
            className={`tv-nav-focus px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all outline-none cursor-pointer ${
              selectedCategory === 'TODOS'
                ? 'bg-red-600 text-white shadow-md ring-1 ring-red-400'
                : 'bg-[#171a23] hover:bg-[#202533] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            Todos
          </button>

          {/* Categories starting with DOCUMENTÁRIOS, ESPORTES, etc. */}
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
                className={`tv-nav-focus px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all outline-none cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md ring-1 ring-red-400'
                    : 'bg-[#171a23] hover:bg-[#202533] text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
