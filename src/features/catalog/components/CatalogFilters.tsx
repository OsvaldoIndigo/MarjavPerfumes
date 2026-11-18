import { Search, X } from 'lucide-react';
import type { CategoryRow } from '@/types/database';

interface CatalogFiltersProps {
  categories: CategoryRow[];
  selectedCategorySlug: string;
  onCategoryChange: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onlyInStock: boolean;
  onOnlyInStockChange: (onlyInStock: boolean) => void;
  totalResults: number;
}

export function CatalogFilters({
  categories,
  selectedCategorySlug,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onlyInStock,
  onOnlyInStockChange,
  totalResults,
}: CatalogFiltersProps) {
  return (
    <div className="space-y-5 pb-6 border-b border-hairline">
      {/* Fila superior: Pestañas de categoría + Buscador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Filtrar por categoría"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategorySlug === 'all'}
            onClick={() => onCategoryChange('all')}
            className={`px-4 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-200 whitespace-nowrap cursor-pointer border ${
              selectedCategorySlug === 'all'
                ? 'bg-obsidian text-ivory border-obsidian font-medium'
                : 'bg-transparent text-stone border-hairline hover:border-obsidian/40 hover:text-obsidian'
            }`}
          >
            Todos
          </button>

          {categories.map((category) => {
            const isSelected = selectedCategorySlug === category.slug;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onCategoryChange(category.slug)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-200 whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-obsidian text-ivory border-obsidian font-medium'
                    : 'bg-transparent text-stone border-hairline hover:border-obsidian/40 hover:text-obsidian'
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Campo de búsqueda por nombre, marca o nota olfativa */}
        <div className="relative w-full md:w-72">
          <Search
            className="w-4 h-4 text-stone absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.5]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar perfume, marca o nota..."
            aria-label="Buscar fragancia por nombre, marca o nota olfativa"
            className="w-full pl-10 pr-9 py-2 bg-transparent border border-hairline text-xs sm:text-sm text-obsidian placeholder:text-stone/70 focus:outline-none focus:border-obsidian transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-obsidian cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Fila inferior: Filtro de disponibilidad + Contador de resultados */}
      <div className="flex items-center justify-between gap-4 text-xs text-stone">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none hover:text-obsidian transition-colors">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => onOnlyInStockChange(e.target.checked)}
            className="accent-obsidian w-3.5 h-3.5 cursor-pointer"
          />
          <span>Mostrar solo disponibles en stock</span>
        </label>

        <span className="tracking-wider uppercase text-[11px]">
          {totalResults} {totalResults === 1 ? 'fragancia' : 'fragancias'}
        </span>
      </div>
    </div>
  );
}