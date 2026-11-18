import { supabase } from '@/lib/supbase/client';
import type { CategoryRow, PerfumeRow } from '@/types/database';

export type RecentPerfumeSummary = Pick<
  PerfumeRow,
  | 'id'
  | 'name'
  | 'brand'
  | 'price'
  | 'is_available'
  | 'is_published'
  | 'is_featured'
  | 'image_url'
  | 'created_at'
>;

export interface DashboardMetrics {
  totalPerfumes: number;
  publishedPerfumes: number;
  draftPerfumes: number;
  availablePerfumes: number;
  outOfStockPerfumes: number;
  featuredPerfumes: number;
  totalCategories: number;
  activeCategories: number;
  recentPerfumes: RecentPerfumeSummary[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [perfumesResponse, categoriesResponse] = await Promise.all([
    supabase
      .from('perfumes')
      .select(
        'id, name, brand, price, is_available, is_published, is_featured, image_url, created_at'
      )
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('id, is_active'),
  ]);

  if (perfumesResponse.error) {
    throw new Error(
      `No se pudieron cargar las métricas de perfumes: ${perfumesResponse.error.message}`
    );
  }

  if (categoriesResponse.error) {
    throw new Error(
      `No se pudieron cargar las métricas de categorías: ${categoriesResponse.error.message}`
    );
  }

  const perfumes = (perfumesResponse.data ?? []) as RecentPerfumeSummary[];
  const categories = (categoriesResponse.data ?? []) as Pick<
    CategoryRow,
    'id' | 'is_active'
  >[];

  const publishedPerfumes = perfumes.filter((item) => item.is_published).length;
  const availablePerfumes = perfumes.filter((item) => item.is_available).length;
  const featuredPerfumes = perfumes.filter((item) => item.is_featured).length;
  const activeCategories = categories.filter((cat) => cat.is_active).length;

  return {
    totalPerfumes: perfumes.length,
    publishedPerfumes,
    draftPerfumes: perfumes.length - publishedPerfumes,
    availablePerfumes,
    outOfStockPerfumes: perfumes.length - availablePerfumes,
    featuredPerfumes,
    totalCategories: categories.length,
    activeCategories,
    recentPerfumes: perfumes.slice(0, 5),
  };
}