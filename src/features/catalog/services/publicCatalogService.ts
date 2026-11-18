import { supabase } from '@/lib/supbase/client';
import type {
  CategoryRow,
  PerfumeCategoryRow,
  PerfumeRow,
  PerfumeWithCategories,
  SettingsRow,
} from '@/types/database';
import type { Perfume } from '@/types/perfume';

export const DEFAULT_WHATSAPP_NUMBER = '526674591996';

const PUBLIC_PERFUME_COLUMNS =
  'id, name, brand, slug, description, price, previous_price, presentation, fragrance_family, top_notes, heart_notes, base_notes, intensity, longevity, image_url, image_path, is_available, is_published, is_featured, created_at, updated_at';

const PUBLIC_CATEGORY_COLUMNS =
  'id, name, slug, description, is_active, created_at';

const PUBLIC_SETTINGS_COLUMNS =
  'id, store_name, whatsapp_number, instagram_url, logo_url, logo_path, contact_info, updated_at';

export function normalizeWhatsappNumber(raw?: string | null): string {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (!digits) return DEFAULT_WHATSAPP_NUMBER;
  if (digits.length === 10) return `52${digits}`;
  return digits;
}

export function buildWhatsAppUrl(
  message: string,
  whatsappNumber?: string | null
): string {
  const phone = normalizeWhatsappNumber(whatsappNumber);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function parsePresentation(presentation: string): {
  volumeMl: number;
  concentration: string;
} {
  const volumeMatch = presentation.match(/(\d+)\s*ml/i);
  const volumeMl = volumeMatch ? Number(volumeMatch[1]) : 100;

  const cleanedConcentration = presentation
    .replace(/(\d+)\s*ml/i, '')
    .replace(/^[-·\s]+|[-·\s]+$/g, '')
    .trim();

  return {
    volumeMl,
    concentration: cleanedConcentration || 'Eau de Parfum',
  };
}

export function mapSupabasePerfumeToFrontend(
  row: PerfumeWithCategories
): Perfume {
  const { volumeMl, concentration } = parsePresentation(row.presentation);
  const sortedCategories = [...row.categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: sortedCategories[0]?.name ?? 'Unisex',
    categories: sortedCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    })),
    concentration,
    volumeMl,
    presentation: row.presentation,
    fragranceFamily: row.fragrance_family,
    price: Number(row.price),
    previousPrice:
      row.previous_price !== null ? Number(row.previous_price) : null,
    currency: 'MXN',
    description: row.description,
    notes: {
      top: row.top_notes ?? [],
      heart: row.heart_notes ?? [],
      base: row.base_notes ?? [],
    },
    intensity: row.intensity,
    longevity: row.longevity,
    imageUrl: row.image_url,
    featured: row.is_featured,
    inStock: row.is_available,
  };
}

export async function getPublicSettings(): Promise<SettingsRow> {
  const { data, error } = await supabase
    .from('settings')
    .select(PUBLIC_SETTINGS_COLUMNS)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      id: 1,
      store_name: 'MARJAV',
      whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
      instagram_url: '',
      logo_url: null,
      logo_path: null,
      contact_info: null,
      updated_at: new Date().toISOString(),
    };
  }

  const settings = data as SettingsRow;
  return {
    ...settings,
    whatsapp_number: normalizeWhatsappNumber(settings.whatsapp_number),
  };
}

export async function getPublicCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from('categories')
    .select(PUBLIC_CATEGORY_COLUMNS)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  }

  return (data ?? []) as CategoryRow[];
}

export async function getPublishedPerfumes(): Promise<Perfume[]> {
  const [perfumesRes, relationsRes, categories] = await Promise.all([
    supabase
      .from('perfumes')
      .select(PUBLIC_PERFUME_COLUMNS)
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    supabase.from('perfume_categories').select('perfume_id, category_id'),
    getPublicCategories(),
  ]);

  if (perfumesRes.error) {
    throw new Error(
      `No se pudo cargar el catálogo de perfumes: ${perfumesRes.error.message}`
    );
  }
  if (relationsRes.error) {
    throw new Error(
      `No se pudieron cargar las categorías de productos: ${relationsRes.error.message}`
    );
  }

  const perfumes = (perfumesRes.data ?? []) as PerfumeRow[];
  const relations = (relationsRes.data ?? []) as PerfumeCategoryRow[];
  const activeCategoryMap = new Map<string, CategoryRow>(
    categories.map((cat) => [cat.id, cat])
  );

  const categoriesByPerfume = new Map<string, CategoryRow[]>();
  for (const rel of relations) {
    const category = activeCategoryMap.get(rel.category_id);
    if (!category) continue;
    const current = categoriesByPerfume.get(rel.perfume_id) ?? [];
    current.push(category);
    categoriesByPerfume.set(rel.perfume_id, current);
  }

  return perfumes.map((perfume) =>
    mapSupabasePerfumeToFrontend({
      ...perfume,
      categories: categoriesByPerfume.get(perfume.id) ?? [],
    })
  );
}

export async function getPublishedPerfumeBySlug(
  slug: string
): Promise<Perfume | null> {
  const { data: perfumeData, error: perfumeError } = await supabase
    .from('perfumes')
    .select(PUBLIC_PERFUME_COLUMNS)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (perfumeError) {
    throw new Error(
      `No se pudo consultar la fragancia: ${perfumeError.message}`
    );
  }

  if (!perfumeData) {
    return null;
  }

  const perfume = perfumeData as PerfumeRow;

  const [relationsRes, activeCategories] = await Promise.all([
    supabase
      .from('perfume_categories')
      .select('perfume_id, category_id')
      .eq('perfume_id', perfume.id),
    getPublicCategories(),
  ]);

  const relations = (relationsRes.data ?? []) as PerfumeCategoryRow[];
  const activeCategoryMap = new Map<string, CategoryRow>(
    activeCategories.map((cat) => [cat.id, cat])
  );

  const assignedCategories = relations
    .map((rel) => activeCategoryMap.get(rel.category_id))
    .filter((cat): cat is CategoryRow => Boolean(cat));

  return mapSupabasePerfumeToFrontend({
    ...perfume,
    categories: assignedCategories,
  });
}