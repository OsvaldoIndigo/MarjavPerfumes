import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  ImagePlus,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type {
  CategoryRow,
  PerfumeInsert,
  PerfumeWithCategories,
} from '@/types/database';
import { slugify } from '@/utils/slugify';
import {
  createPerfume,
  deletePerfumeImage,
  updatePerfume,
  uploadPerfumeImage,
} from '@/features/admin/services/perfumeService';

interface PerfumeFormModalProps {
  perfume: PerfumeWithCategories | null;
  categories: CategoryRow[];
  onClose: () => void;
  onSaved: (saved: PerfumeWithCategories, isNew: boolean) => void;
}

interface PerfumeFormState {
  name: string;
  brand: string;
  slug: string;
  description: string;
  price: string;
  previous_price: string;
  presentation: string;
  fragrance_family: string;
  top_notes: string;
  heart_notes: string;
  base_notes: string;
  intensity: string;
  longevity: string;
  is_available: boolean;
  is_published: boolean;
  is_featured: boolean;
}

function parseNotesInput(raw: string): string[] {
  return raw
    .split(',')
    .map((note) => note.trim())
    .filter((note) => note.length > 0);
}

export function PerfumeFormModal({
  perfume,
  categories,
  onClose,
  onSaved,
}: PerfumeFormModalProps) {
  const isEditing = Boolean(perfume);

  const [formState, setFormState] = useState<PerfumeFormState>(() => ({
    name: perfume?.name ?? '',
    brand: perfume?.brand ?? '',
    slug: perfume?.slug ?? '',
    description: perfume?.description ?? '',
    price: perfume ? String(perfume.price) : '',
    previous_price:
      perfume?.previous_price !== null && perfume?.previous_price !== undefined
        ? String(perfume.previous_price)
        : '',
    presentation: perfume?.presentation ?? '100 ml Eau de Parfum',
    fragrance_family: perfume?.fragrance_family ?? '',
    top_notes: perfume?.top_notes.join(', ') ?? '',
    heart_notes: perfume?.heart_notes.join(', ') ?? '',
    base_notes: perfume?.base_notes.join(', ') ?? '',
    intensity: perfume?.intensity ?? 'Moderada',
    longevity: perfume?.longevity ?? '8 - 10 horas',
    is_available: perfume?.is_available ?? true,
    is_published: perfume?.is_published ?? true,
    is_featured: perfume?.is_featured ?? false,
  }));

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    () => perfume?.categories.map((c) => c.id) ?? []
  );
  const [isSlugManual, setIsSlugManual] = useState<boolean>(isEditing);

  // Manejo de imagen
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    perfume?.image_url ?? ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleNameChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      name: value,
      slug: isSlugManual ? prev.slug : slugify(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setIsSlugManual(true);
    setFormState((prev) => ({
      ...prev,
      slug: slugify(value),
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const name = formState.name.trim();
    const brand = formState.brand.trim();
    const slug = slugify(formState.slug || name);
    const presentation = formState.presentation.trim();
    const fragranceFamily = formState.fragrance_family.trim();
    const parsedPrice = Number(formState.price);
    const parsedPreviousPrice = formState.previous_price.trim()
      ? Number(formState.previous_price)
      : null;

    if (!name) {
      setErrorMessage('El nombre del perfume es obligatorio.');
      return;
    }
    if (!brand) {
      setErrorMessage('La marca o casa perfumista es obligatoria.');
      return;
    }
    if (!slug) {
      setErrorMessage('El slug debe contener caracteres alfanuméricos válidos.');
      return;
    }
    if (!presentation) {
      setErrorMessage('La presentación (ej. 100 ml EDP) es obligatoria.');
      return;
    }
    if (!fragranceFamily) {
      setErrorMessage('La familia olfativa es obligatoria.');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMessage('Ingresa un precio válido mayor o igual a 0.');
      return;
    }
    if (
      parsedPreviousPrice !== null &&
      (Number.isNaN(parsedPreviousPrice) || parsedPreviousPrice < 0)
    ) {
      setErrorMessage('El precio anterior debe ser un número válido.');
      return;
    }
    if (!isEditing && !imageFile) {
      setErrorMessage('Selecciona una fotografía del perfume para continuar.');
      return;
    }

    setIsSaving(true);
    let newlyUploadedPath: string | null = null;

    try {
      let finalImageUrl = perfume?.image_url ?? '';
      let finalImagePath = perfume?.image_path ?? '';

      if (imageFile) {
        const uploaded = await uploadPerfumeImage(imageFile);
        finalImageUrl = uploaded.imageUrl;
        finalImagePath = uploaded.imagePath;
        newlyUploadedPath = uploaded.imagePath;
      }

      const payload: PerfumeInsert = {
        name,
        brand,
        slug,
        description: formState.description.trim(),
        price: parsedPrice,
        previous_price: parsedPreviousPrice,
        presentation,
        fragrance_family: fragranceFamily,
        top_notes: parseNotesInput(formState.top_notes),
        heart_notes: parseNotesInput(formState.heart_notes),
        base_notes: parseNotesInput(formState.base_notes),
        intensity: formState.intensity.trim() || null,
        longevity: formState.longevity.trim() || null,
        image_url: finalImageUrl,
        image_path: finalImagePath,
        is_available: formState.is_available,
        is_published: formState.is_published,
        is_featured: formState.is_featured,
      };

      if (perfume) {
        const oldImagePath = perfume.image_path;
        const saved = await updatePerfume(
          perfume.id,
          payload,
          selectedCategoryIds,
          categories
        );

        if (newlyUploadedPath && oldImagePath && oldImagePath !== newlyUploadedPath) {
          await deletePerfumeImage(oldImagePath);
        }

        onSaved(saved, false);
      } else {
        const saved = await createPerfume(
          payload,
          selectedCategoryIds,
          categories
        );
        onSaved(saved, true);
      }
    } catch (error) {
      if (newlyUploadedPath) {
        await deletePerfumeImage(newlyUploadedPath);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al guardar el perfume.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="perfume-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-obsidian/60 p-4 backdrop-blur-xs sm:p-6"
    >
      <div className="my-auto w-full max-w-3xl border border-hairline bg-ivory shadow-xl">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-hairline bg-sand/40 px-6 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-champagne-dark">
              {isEditing ? 'Editar fragancia' : 'Nueva fragancia'}
            </p>
            <h2
              id="perfume-modal-title"
              className="mt-0.5 font-serif text-xl text-obsidian"
            >
              {isEditing ? perfume?.name : 'Agregar perfume al catálogo'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar ventana"
            className="p-1.5 text-stone transition-colors hover:text-obsidian disabled:opacity-50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6" noValidate>
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 bg-obsidian px-4 py-3 text-xs text-ivory"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bloque 1: Imagen y datos principales */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Subida de fotografía */}
            <div className="space-y-2">
              <span className="block text-[11px] uppercase tracking-[0.14em] text-stone">
                Fotografía {isEditing ? '(opcional)' : '*'}
              </span>

              <label className="group relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden border border-dashed border-obsidian/30 bg-sand/30 text-center transition-colors hover:border-obsidian cursor-pointer">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Vista previa del perfume"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-obsidian/55 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 bg-ivory px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-obsidian">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Cambiar foto</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-4">
                    <ImagePlus className="mx-auto h-7 w-7 text-champagne-dark" />
                    <p className="mt-2 text-xs font-medium text-obsidian">
                      Subir imagen
                    </p>
                    <p className="mt-1 text-[11px] text-stone">
                      JPG, PNG o WEBP · Máx. 5 MB
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={isSaving}
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Campos principales */}
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="perfume-name"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Nombre del perfume *
                  </label>
                  <input
                    id="perfume-name"
                    type="text"
                    required
                    disabled={isSaving}
                    value={formState.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej. Khamrah Qahwa"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="perfume-brand"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Marca / Casa *
                  </label>
                  <input
                    id="perfume-brand"
                    type="text"
                    required
                    disabled={isSaving}
                    value={formState.brand}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                    placeholder="Ej. Lattafa Perfumes"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="perfume-slug"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Slug (URL) *
                  </label>
                  <input
                    id="perfume-slug"
                    type="text"
                    required
                    disabled={isSaving}
                    value={formState.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="khamrah-qahwa"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="perfume-presentation"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Presentación *
                  </label>
                  <input
                    id="perfume-presentation"
                    type="text"
                    required
                    disabled={isSaving}
                    value={formState.presentation}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        presentation: e.target.value,
                      }))
                    }
                    placeholder="100 ml Eau de Parfum"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="perfume-price"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Precio (MXN) *
                  </label>
                  <input
                    id="perfume-price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    disabled={isSaving}
                    value={formState.price}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="1250"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="perfume-previous-price"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Precio anterior
                  </label>
                  <input
                    id="perfume-previous-price"
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={isSaving}
                    value={formState.previous_price}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        previous_price: e.target.value,
                      }))
                    }
                    placeholder="Opcional"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="perfume-family"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Familia olfativa *
                  </label>
                  <input
                    id="perfume-family"
                    type="text"
                    required
                    disabled={isSaving}
                    value={formState.fragrance_family}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        fragrance_family: e.target.value,
                      }))
                    }
                    placeholder="Oriental Especiada"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="perfume-intensity"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Intensidad / Estela
                  </label>
                  <input
                    id="perfume-intensity"
                    type="text"
                    disabled={isSaving}
                    value={formState.intensity}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        intensity: e.target.value,
                      }))
                    }
                    placeholder="Intensa"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="perfume-longevity"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Duración estimada
                  </label>
                  <input
                    id="perfume-longevity"
                    type="text"
                    disabled={isSaving}
                    value={formState.longevity}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        longevity: e.target.value,
                      }))
                    }
                    placeholder="8 - 12 horas"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloque 2: Descripción */}
          <div>
            <label
              htmlFor="perfume-description"
              className="block text-[11px] uppercase tracking-[0.14em] text-stone"
            >
              Descripción de la fragancia
            </label>
            <textarea
              id="perfume-description"
              rows={3}
              disabled={isSaving}
              value={formState.description}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe el carácter, ocasiones de uso y sensaciones principales de esta fragancia..."
              className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
            />
          </div>

          {/* Bloque 3: Pirámide olfativa */}
          <div className="border-t border-hairline pt-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-champagne-dark">
              Pirámide olfativa (separa cada nota con coma)
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="perfume-top-notes"
                  className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                >
                  Notas de salida
                </label>
                <input
                  id="perfume-top-notes"
                  type="text"
                  disabled={isSaving}
                  value={formState.top_notes}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      top_notes: e.target.value,
                    }))
                  }
                  placeholder="Canela, Cardamomo, Jengibre"
                  className="mt-1.5 w-full border border-hairline bg-ivory px-3 py-2 text-xs text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="perfume-heart-notes"
                  className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                >
                  Notas de corazón
                </label>
                <input
                  id="perfume-heart-notes"
                  type="text"
                  disabled={isSaving}
                  value={formState.heart_notes}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      heart_notes: e.target.value,
                    }))
                  }
                  placeholder="Praliné, Flores blancas"
                  className="mt-1.5 w-full border border-hairline bg-ivory px-3 py-2 text-xs text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="perfume-base-notes"
                  className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                >
                  Notas de fondo
                </label>
                <input
                  id="perfume-base-notes"
                  type="text"
                  disabled={isSaving}
                  value={formState.base_notes}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      base_notes: e.target.value,
                    }))
                  }
                  placeholder="Café, Vainilla, Haba tonka"
                  className="mt-1.5 w-full border border-hairline bg-ivory px-3 py-2 text-xs text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bloque 4: Categorías asignadas */}
          <div className="border-t border-hairline pt-5">
            <span className="block text-[11px] uppercase tracking-[0.16em] text-champagne-dark">
              Categorías asignadas
            </span>
            {categories.length === 0 ? (
              <p className="mt-2 text-xs text-stone">
                No hay categorías creadas aún. Puedes crearlas en la sección Categorías.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isChecked = selectedCategoryIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-obsidian text-ivory'
                          : 'border border-hairline bg-sand/30 text-obsidian hover:border-obsidian'
                      }`}
                    >
                      {category.name}
                      {!category.is_active ? ' (Inactiva)' : ''}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bloque 5: Visibilidad y estado */}
          <div className="flex flex-wrap gap-6 border-t border-hairline pt-5">
            <label className="inline-flex items-center gap-2 text-xs text-obsidian cursor-pointer">
              <input
                type="checkbox"
                disabled={isSaving}
                checked={formState.is_published}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    is_published: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-obsidian cursor-pointer"
              />
              <span>Publicado en tienda</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-obsidian cursor-pointer">
              <input
                type="checkbox"
                disabled={isSaving}
                checked={formState.is_available}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    is_available: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-obsidian cursor-pointer"
              />
              <span>Disponible en stock</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-obsidian cursor-pointer">
              <input
                type="checkbox"
                disabled={isSaving}
                checked={formState.is_featured}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    is_featured: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-obsidian cursor-pointer"
              />
              <span>Destacado en portada</span>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 border-t border-hairline pt-5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{isEditing ? 'Guardar cambios' : 'Publicar perfume'}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}