export interface AdminProfileRow {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PerfumeRow {
  id: string;
  name: string;
  brand: string;
  slug: string;
  description: string;
  price: number;
  previous_price: number | null;
  presentation: string;
  fragrance_family: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  intensity: string | null;
  longevity: string | null;
  image_url: string;
  image_path: string;
  is_available: boolean;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface PerfumeCategoryRow {
  perfume_id: string;
  category_id: string;
}

export interface SettingsRow {
  id: number;
  store_name: string;
  whatsapp_number: string;
  instagram_url: string;
  logo_url: string | null;
  logo_path: string | null;
  contact_info: string | null;
  updated_at: string;
}

export interface PerfumeWithCategories extends PerfumeRow {
  categories: CategoryRow[];
}

export type PerfumeInsert = Omit<PerfumeRow, 'id' | 'created_at' | 'updated_at'>;
export type PerfumeUpdate = Partial<PerfumeInsert>;

export type CategoryInsert = Omit<CategoryRow, 'id' | 'created_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

export type SettingsUpdate = Omit<SettingsRow, 'id' | 'updated_at'>;