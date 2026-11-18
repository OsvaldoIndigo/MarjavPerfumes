export type PerfumeCategory = 'Hombre' | 'Mujer' | 'Unisex' | (string & {});

export type PerfumeConcentration =
  | 'Eau de Parfum'
  | 'Extrait de Parfum'
  | 'Eau de Toilette'
  | 'Parfum'
  | (string & {});

export interface OlfactoryNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface PerfumeCategoryTag {
  id: string;
  name: string;
  slug: string;
}

export interface Perfume {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: PerfumeCategory;
  categories?: PerfumeCategoryTag[];
  concentration: PerfumeConcentration;
  volumeMl: number;
  presentation?: string;
  fragranceFamily?: string;
  price: number;
  previousPrice?: number | null;
  currency: string;
  description: string;
  notes: OlfactoryNotes;
  intensity?: string | null;
  longevity?: string | null;
  imageUrl: string;
  featured: boolean;
  inStock: boolean;
}