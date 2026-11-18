import { PERFUMES } from '@/data/perfumes';
import type { Perfume, PerfumeCategory } from '@/types/perfume';

export type CategoryFilter = PerfumeCategory | 'Todos';

export interface CatalogFilters {
  category?: CategoryFilter;
  searchQuery?: string;
  onlyInStock?: boolean;
}

export function getAllPerfumes(): Perfume[] {
  return PERFUMES;
}

export function getFeaturedPerfumes(): Perfume[] {
  return PERFUMES.filter((perfume) => perfume.featured);
}

export function getPerfumeBySlug(slug: string): Perfume | undefined {
  return PERFUMES.find((perfume) => perfume.slug === slug);
}

export function filterPerfumes({
  category = 'Todos',
  searchQuery = '',
  onlyInStock = false,
}: CatalogFilters): Perfume[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return PERFUMES.filter((perfume) => {
    const matchesCategory =
      category === 'Todos' || perfume.category === category;

    const matchesStock = !onlyInStock || perfume.inStock;

    if (!normalizedQuery) {
      return matchesCategory && matchesStock;
    }

    const allNotes = [
      ...perfume.notes.top,
      ...perfume.notes.heart,
      ...perfume.notes.base,
    ]
      .join(' ')
      .toLowerCase();

    const matchesText =
      perfume.name.toLowerCase().includes(normalizedQuery) ||
      perfume.brand.toLowerCase().includes(normalizedQuery) ||
      perfume.description.toLowerCase().includes(normalizedQuery) ||
      allNotes.includes(normalizedQuery);

    return matchesCategory && matchesStock && matchesText;
  });
}