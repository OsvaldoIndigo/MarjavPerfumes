import { supabase } from "@/lib/supbase/client";
import type {
  CategoryRow,
  PerfumeCategoryRow,
  PerfumeInsert,
  PerfumeRow,
  PerfumeUpdate,
  PerfumeWithCategories,
} from '@/types/database';

const STORAGE_BUCKET = 'perfume-images';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

const PERFUME_COLUMNS =
  'id, name, brand, slug, description, price, previous_price, presentation, fragrance_family, top_notes, heart_notes, base_notes, intensity, longevity, image_url, image_path, is_available, is_published, is_featured, created_at, updated_at';

function mapPerfumeError(
  error: { code?: string; message: string },
  fallback: string
): Error {
  if (error.code === '23505') {
    return new Error('Ya existe un perfume registrado con ese slug.');
  }
  return new Error(`${fallback}: ${error.message}`);
}

export async function uploadPerfumeImage(
  file: File
): Promise<{ imageUrl: string; imagePath: string }> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      'Formato de imagen no válido. Usa JPG, PNG, WEBP o AVIF.'
    );
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('La imagen supera el tamaño máximo permitido de 5 MB.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const uniqueId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const imagePath = `perfumes/${Date.now()}-${uniqueId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(imagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`No se pudo subir la imagen: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(imagePath);

  return {
    imageUrl: data.publicUrl,
    imagePath,
  };
}

export async function deletePerfumeImage(imagePath: string): Promise<void> {
  if (!imagePath) return;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([imagePath]);

  if (error) {
    console.warn(
      `No se pudo eliminar el archivo anterior en Storage (${imagePath}):`,
      error.message
    );
  }
}

async function syncPerfumeCategories(
  perfumeId: string,
  categoryIds: string[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('perfume_categories')
    .delete()
    .eq('perfume_id', perfumeId);

  if (deleteError) {
    throw new Error(
      `No se pudieron actualizar las categorías del perfume: ${deleteError.message}`
    );
  }

  if (categoryIds.length === 0) return;

  const rows: PerfumeCategoryRow[] = categoryIds.map((categoryId) => ({
    perfume_id: perfumeId,
    category_id: categoryId,
  }));

  const { error: insertError } = await supabase
    .from('perfume_categories')
    .insert(rows);

  if (insertError) {
    throw new Error(
      `No se pudieron asignar las categorías seleccionadas: ${insertError.message}`
    );
  }
}

export async function getAdminPerfumes(): Promise<PerfumeWithCategories[]> {
  const [perfumesRes, relationsRes, categoriesRes] = await Promise.all([
    supabase
      .from('perfumes')
      .select(PERFUME_COLUMNS)
      .order('created_at', { ascending: false }),
    supabase.from('perfume_categories').select('perfume_id, category_id'),
    supabase
      .from('categories')
      .select('id, name, slug, description, is_active, created_at'),
  ]);

  if (perfumesRes.error) {
    throw mapPerfumeError(perfumesRes.error, 'No se pudieron cargar los perfumes');
  }
  if (relationsRes.error) {
    throw new Error(
      `No se pudieron cargar las relaciones de categorías: ${relationsRes.error.message}`
    );
  }
  if (categoriesRes.error) {
    throw new Error(
      `No se pudieron cargar las categorías: ${categoriesRes.error.message}`
    );
  }

  const perfumes = (perfumesRes.data ?? []) as PerfumeRow[];
  const relations = (relationsRes.data ?? []) as PerfumeCategoryRow[];
  const categories = (categoriesRes.data ?? []) as CategoryRow[];

  const categoryMap = new Map<string, CategoryRow>(
    categories.map((cat) => [cat.id, cat])
  );

  const categoriesByPerfume = new Map<string, CategoryRow[]>();
  for (const rel of relations) {
    const category = categoryMap.get(rel.category_id);
    if (!category) continue;
    const current = categoriesByPerfume.get(rel.perfume_id) ?? [];
    current.push(category);
    categoriesByPerfume.set(rel.perfume_id, current);
  }

  return perfumes.map((perfume) => ({
    ...perfume,
    price: Number(perfume.price),
    previous_price:
      perfume.previous_price !== null ? Number(perfume.previous_price) : null,
    categories: (categoriesByPerfume.get(perfume.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  }));
}

export async function createPerfume(
  payload: PerfumeInsert,
  categoryIds: string[],
  availableCategories: CategoryRow[]
): Promise<PerfumeWithCategories> {
  const { data, error } = await supabase
    .from('perfumes')
    .insert(payload)
    .select(PERFUME_COLUMNS)
    .single();

  if (error || !data) {
    throw mapPerfumeError(
      error ?? { message: 'Respuesta vacía del servidor' },
      'No se pudo crear el perfume'
    );
  }

  const created = data as PerfumeRow;

  try {
    await syncPerfumeCategories(created.id, categoryIds);
  } catch (syncError) {
    await supabase.from('perfumes').delete().eq('id', created.id);
    throw syncError;
  }

  const assignedCategories = availableCategories
    .filter((cat) => categoryIds.includes(cat.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    ...created,
    price: Number(created.price),
    previous_price:
      created.previous_price !== null ? Number(created.previous_price) : null,
    categories: assignedCategories,
  };
}

export async function updatePerfume(
  id: string,
  payload: PerfumeUpdate,
  categoryIds?: string[],
  availableCategories?: CategoryRow[]
): Promise<PerfumeWithCategories> {
  const { data, error } = await supabase
    .from('perfumes')
    .update(payload)
    .eq('id', id)
    .select(PERFUME_COLUMNS)
    .single();

  if (error || !data) {
    throw mapPerfumeError(
      error ?? { message: 'Respuesta vacía del servidor' },
      'No se pudo actualizar el perfume'
    );
  }

  const updated = data as PerfumeRow;

  if (categoryIds !== undefined) {
    await syncPerfumeCategories(id, categoryIds);
  }

  const assignedCategories =
    categoryIds && availableCategories
      ? availableCategories
          .filter((cat) => categoryIds.includes(cat.id))
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];

  return {
    ...updated,
    price: Number(updated.price),
    previous_price:
      updated.previous_price !== null ? Number(updated.previous_price) : null,
    categories: assignedCategories,
  };
}

export async function deletePerfume(
  id: string,
  imagePath: string
): Promise<void> {
  const { error } = await supabase.from('perfumes').delete().eq('id', id);

  if (error) {
    throw mapPerfumeError(error, 'No se pudo eliminar el perfume');
  }

  await deletePerfumeImage(imagePath);
}