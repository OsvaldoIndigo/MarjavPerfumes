import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CatalogFilters } from '@/features/catalog/components/CatalogFilters';
import { PerfumeCard } from '@/features/catalog/components/PerfumeCard';
import { useCart } from '@/features/cart/context/CartContext';
import { Button } from '@/components/ui/Button';
import {
  getPublicCategories,
  getPublishedPerfumes,
} from '@/features/catalog/services/publicCatalogService';
import type { CategoryRow } from '@/types/database';
import type { Perfume } from '@/types/perfume';

export function CatalogPage() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);

  const { addItem } = useCart();

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [perfumesData, categoriesData] = await Promise.all([
        getPublishedPerfumes(),
        getPublicCategories(),
      ]);
      setPerfumes(perfumesData);
      setCategories(categoriesData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el catálogo.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const filteredPerfumes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return perfumes.filter((perfume) => {
      if (onlyInStock && !perfume.inStock) return false;

      if (
        selectedCategorySlug !== 'all' &&
        !(perfume.categories ?? []).some(
          (cat) => cat.slug === selectedCategorySlug
        )
      ) {
        return false;
      }

      if (!query) return true;

      const allNotes = [
        ...perfume.notes.top,
        ...perfume.notes.heart,
        ...perfume.notes.base,
      ];

      return (
        perfume.name.toLowerCase().includes(query) ||
        perfume.brand.toLowerCase().includes(query) ||
        (perfume.fragranceFamily ?? '').toLowerCase().includes(query) ||
        allNotes.some((note) => note.toLowerCase().includes(query))
      );
    });
  }, [perfumes, selectedCategorySlug, searchQuery, onlyInStock]);

  const handleResetFilters = () => {
    setSelectedCategorySlug('all');
    setSearchQuery('');
    setOnlyInStock(false);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <header className="mb-8 sm:mb-12 text-center sm:text-left">
        <span className="text-[11px] uppercase tracking-[0.22em] text-champagne-dark font-medium">
          Colección Exclusiva
        </span>
        <h1 className="mt-2 font-serif text-3xl sm:text-5xl text-obsidian">
          Catálogo de Fragancias
        </h1>
        <p className="mt-3 text-sm text-stone max-w-2xl leading-relaxed">
          Explora nuestra curaduría por categoría o busca por notas olfativas. Selecciona tus fragancias favoritas y envía tu pedido directamente por WhatsApp.
        </p>
      </header>

      <CatalogFilters
        categories={categories}
        selectedCategorySlug={selectedCategorySlug}
        onCategoryChange={setSelectedCategorySlug}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onlyInStock={onlyInStock}
        onOnlyInStockChange={setOnlyInStock}
        totalResults={filteredPerfumes.length}
      />

      {isLoading ? (
        <div className="my-12 flex min-h-[240px] flex-col items-center justify-center border border-hairline bg-sand/25 p-8">
          <Loader2 className="h-7 w-7 animate-spin text-champagne-dark" />
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-stone">
            Cargando catálogo de fragancias...
          </p>
        </div>
      ) : errorMessage ? (
        <div className="my-12 border border-hairline bg-sand/40 p-8 text-center max-w-lg mx-auto">
          <p className="text-sm text-obsidian">{errorMessage}</p>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={loadCatalog}>
              Reintentar
            </Button>
          </div>
        </div>
      ) : filteredPerfumes.length > 0 ? (
        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPerfumes.map((perfume) => (
            <PerfumeCard
              key={perfume.id}
              perfume={perfume}
              onAddToCart={addItem}
            />
          ))}
        </div>
      ) : (
        <div className="my-16 py-14 px-4 border border-hairline bg-sand/40 text-center max-w-lg mx-auto">
          <h2 className="font-serif text-2xl text-obsidian">
            Sin coincidencias exactas
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone leading-relaxed">
            No encontramos fragancias con los filtros seleccionados. Prueba con otra nota olfativa o restablece la vista completa.
          </p>
          <div className="mt-6">
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              Mostrar todas las fragancias
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}