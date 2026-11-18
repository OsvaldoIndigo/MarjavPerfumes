import { supabase } from '@/lib/supbase/client';
import type {
  CategoryInsert,
  CategoryRow,
  CategoryUpdate,
} from '@/types/database';

const CATEGORY_COLUMNS = 'id, name, slug, description, is_active, created_at';

function mapCategoryError(error: { code?: string; message: string }, fallback: string): Error {
  if (error.code === '23505') {
    return new Error('Ya existe una categoría con ese nombre o slug.');
  }
  return new Error(`${fallback}: ${error.message}`);
}

export async function getAdminCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .order('name', { ascending: true });

  if (error) {
    throw mapCategoryError(error, 'No se pudieron cargar las categorías');
  }

  return (data ?? []) as CategoryRow[];
}

export async function createCategory(
  payload: CategoryInsert
): Promise<CategoryRow> {
  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select(CATEGORY_COLUMNS)
    .single();

  if (error || !data) {
    throw mapCategoryError(
      error ?? { message: 'Respuesta vacía del servidor' },
      'No se pudo crear la categoría'
    );
  }

  return data as CategoryRow;
}

export async function updateCategory(
  id: string,
  payload: CategoryUpdate
): Promise<CategoryRow> {
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select(CATEGORY_COLUMNS)
    .single();

  if (error || !data) {
    throw mapCategoryError(
      error ?? { message: 'Respuesta vacía del servidor' },
      'No se pudo actualizar la categoría'
    );
  }

  return data as CategoryRow;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    throw mapCategoryError(error, 'No se pudo eliminar la categoría');
  }
}