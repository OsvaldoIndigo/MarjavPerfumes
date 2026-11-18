import { supabase } from '@/lib/supbase/client';
import type { SettingsRow, SettingsUpdate } from '@/types/database';

const STORAGE_BUCKET = 'perfume-images';
const MAX_LOGO_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED_LOGO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
];

const SETTINGS_COLUMNS =
  'id, store_name, whatsapp_number, instagram_url, logo_url, logo_path, contact_info, updated_at';

export async function getStoreSettings(): Promise<SettingsRow> {
  const { data, error } = await supabase
    .from('settings')
    .select(SETTINGS_COLUMNS)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo cargar la configuración de la tienda: ${error.message}`
    );
  }

  if (!data) {
    return {
      id: 1,
      store_name: 'MARJAV',
      whatsapp_number: '',
      instagram_url: '',
      logo_url: null,
      logo_path: null,
      contact_info: null,
      updated_at: new Date().toISOString(),
    };
  }

  return data as SettingsRow;
}

export async function uploadStoreLogo(
  file: File
): Promise<{ logoUrl: string; logoPath: string }> {
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    throw new Error(
      'Formato de logotipo no válido. Usa PNG, JPG, WEBP, AVIF o SVG.'
    );
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    throw new Error('El logotipo supera el tamaño máximo permitido de 3 MB.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  const uniqueId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const logoPath = `settings/logo-${Date.now()}-${uniqueId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(logoPath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`No se pudo subir el logotipo: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(logoPath);

  return {
    logoUrl: data.publicUrl,
    logoPath,
  };
}

export async function deleteStoreLogo(logoPath: string): Promise<void> {
  if (!logoPath) return;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([logoPath]);

  if (error) {
    console.warn(
      `No se pudo eliminar el logotipo anterior (${logoPath}):`,
      error.message
    );
  }
}

export async function updateStoreSettings(
  id: number,
  payload: SettingsUpdate
): Promise<SettingsRow> {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ id, ...payload }, { onConflict: 'id' })
    .select(SETTINGS_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(
      `No se pudo guardar la configuración: ${error?.message ?? 'Respuesta vacía'}`
    );
  }

  return data as SettingsRow;
}