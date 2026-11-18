import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Check,
  Edit3,
  Loader2,
  Plus,
  Search,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CategoryRow } from '@/types/database';
import { slugify } from '@/utils/slugify';
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from '@/features/admin/services/categoryService';

type StatusFilter = 'all' | 'active' | 'inactive';

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

const INITIAL_FORM_STATE: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  is_active: true,
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Formulario de creación / edición
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [formState, setFormState] = useState<CategoryFormState>(INITIAL_FORM_STATE);
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Acciones por fila
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Error inesperado al cargar categorías.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && category.is_active) ||
        (statusFilter === 'inactive' && !category.is_active);

      if (!matchesStatus) return false;
      if (!query) return true;

      return (
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [categories, searchQuery, statusFilter]);

  const openCreateForm = () => {
    setEditingCategory(null);
    setFormState(INITIAL_FORM_STATE);
    setIsSlugManual(false);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category: CategoryRow) => {
    setEditingCategory(category);
    setFormState({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      is_active: category.is_active,
    });
    setIsSlugManual(true);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormState(INITIAL_FORM_STATE);
    setFormError(null);
  };

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedName = formState.name.trim();
    const normalizedSlug = slugify(formState.slug || trimmedName);
    const trimmedDescription = formState.description.trim();

    if (!trimmedName) {
      setFormError('El nombre de la categoría es obligatorio.');
      return;
    }

    if (!normalizedSlug) {
      setFormError('El slug debe contener al menos letras o números válidos.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: trimmedName,
        slug: normalizedSlug,
        description: trimmedDescription ? trimmedDescription : null,
        is_active: formState.is_active,
      };

      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, payload);
        setCategories((prev) =>
          prev
            .map((item) => (item.id === updated.id ? updated : item))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } else {
        const created = await createCategory(payload);
        setCategories((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
        );
      }

      closeForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la categoría.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (category: CategoryRow) => {
    if (togglingId) return;
    setTogglingId(category.id);
    setLoadError(null);

    try {
      const updated = await updateCategory(category.id, {
        is_active: !category.is_active,
      });
      setCategories((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudo cambiar el estado de la categoría.'
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    setLoadError(null);

    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((item) => item.id !== id));
      setConfirmDeleteId(null);
      if (editingCategory?.id === id) {
        closeForm();
      }
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar la categoría.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-champagne-dark">
            Organización del Catálogo
          </p>
          <h1 className="mt-1.5 font-serif text-2xl text-obsidian sm:text-3xl">
            Categorías
          </h1>
          <p className="mt-1 text-xs text-stone">
            Crea y administra las colecciones o familias para clasificar tus fragancias.
          </p>
        </div>

        {!isFormOpen && (
          <Button variant="primary" size="sm" onClick={openCreateForm}>
            <Plus className="h-3.5 w-3.5" />
            <span>Nueva categoría</span>
          </Button>
        )}
      </div>

      {/* Panel de creación / edición */}
      {isFormOpen && (
        <section className="border border-obsidian/20 bg-sand/35 p-6 sm:p-7">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-champagne-dark">
                {editingCategory ? 'Editando registro' : 'Nuevo registro'}
              </p>
              <h2 className="mt-1 font-serif text-xl text-obsidian">
                {editingCategory
                  ? `Editar "${editingCategory.name}"`
                  : 'Crear categoría'}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeForm}
              disabled={isSaving}
              aria-label="Cerrar formulario"
              className="p-1.5 text-stone transition-colors hover:text-obsidian cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 bg-obsidian px-4 py-3 text-xs text-ivory"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category-name"
                  className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                >
                  Nombre *
                </label>
                <input
                  id="category-name"
                  type="text"
                  required
                  disabled={isSaving}
                  value={formState.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej. Árabes, Amaderados, Unisex"
                  className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2.5 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="category-slug"
                  className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                >
                  Slug (URL) *
                </label>
                <input
                  id="category-slug"
                  type="text"
                  required
                  disabled={isSaving}
                  value={formState.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="arabes"
                  className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2.5 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="category-description"
                className="block text-[11px] uppercase tracking-[0.14em] text-stone"
              >
                Descripción breve (opcional)
              </label>
              <textarea
                id="category-description"
                rows={2}
                disabled={isSaving}
                value={formState.description}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Notas orientales intensas con oud, ámbar y especias..."
                className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2.5 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col justify-between gap-4 pt-2 sm:flex-row sm:items-center">
              <label className="inline-flex items-center gap-2.5 text-xs text-obsidian cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isSaving}
                  checked={formState.is_active}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-obsidian cursor-pointer"
                />
                <span>Categoría activa (visible para filtrar en la tienda)</span>
              </label>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={closeForm}
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
                    <span>
                      {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full border border-hairline bg-ivory py-2 pr-3 pl-9 text-xs text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'Todas' },
              { id: 'active', label: 'Activas' },
              { id: 'inactive', label: 'Inactivas' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-obsidian text-ivory'
                  : 'border border-hairline bg-ivory text-stone hover:text-obsidian'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error global */}
      {loadError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 bg-obsidian px-4 py-3 text-xs text-ivory"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-champagne" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLoadError(null)}
            className="text-stone hover:text-ivory cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Estado de carga */}
      {isLoading && (
        <div className="flex min-h-[220px] flex-col items-center justify-center border border-hairline bg-sand/25 p-8">
          <Loader2 className="h-7 w-7 animate-spin text-champagne-dark" />
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-stone">
            Cargando categorías...
          </p>
        </div>
      )}

      {/* Estado vacío */}
      {!isLoading && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center border border-hairline bg-sand/25 px-6 py-14 text-center">
          <Tags className="h-6 w-6 text-champagne-dark" />
          <h2 className="mt-3 font-serif text-lg text-obsidian">
            No hay categorías registradas
          </h2>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-stone">
            Crea categorías como &ldquo;Árabes&rdquo;, &ldquo;Diseñador&rdquo;, &ldquo;Nicho&rdquo; o &ldquo;Unisex&rdquo; para organizar tus perfumes antes de cargar el catálogo.
          </p>
          <div className="mt-5">
            <Button variant="primary" size="sm" onClick={openCreateForm}>
              <Plus className="h-3.5 w-3.5" />
              <span>Crear primera categoría</span>
            </Button>
          </div>
        </div>
      )}

      {/* Sin coincidencias en búsqueda */}
      {!isLoading && categories.length > 0 && filteredCategories.length === 0 && (
        <div className="border border-hairline bg-sand/20 p-8 text-center">
          <p className="text-xs text-stone">
            No se encontraron categorías que coincidan con tu búsqueda o filtro.
          </p>
        </div>
      )}

      {/* Tabla / Listado de categorías */}
      {!isLoading && filteredCategories.length > 0 && (
        <div className="overflow-x-auto border border-hairline bg-ivory">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline bg-sand/40 text-[10px] uppercase tracking-[0.16em] text-stone">
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Descripción
                </th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-xs">
              {filteredCategories.map((category) => {
                const isToggling = togglingId === category.id;
                const isConfirmingDelete = confirmDeleteId === category.id;
                const isDeleting = deletingId === category.id;

                return (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-sand/25"
                  >
                    <td className="px-4 py-3.5 font-medium text-obsidian">
                      {category.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-stone">
                      {category.slug}
                    </td>
                    <td className="hidden max-w-xs truncate px-4 py-3.5 text-stone md:table-cell">
                      {category.description || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleActive(category)}
                        title="Haz clic para activar o desactivar"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] transition-opacity disabled:opacity-50 cursor-pointer ${
                          category.is_active
                            ? 'bg-obsidian text-ivory'
                            : 'border border-hairline bg-sand/50 text-stone'
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check
                            className={`h-3 w-3 ${
                              category.is_active ? 'opacity-100' : 'opacity-30'
                            }`}
                          />
                        )}
                        <span>{category.is_active ? 'Activa' : 'Inactiva'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {isConfirmingDelete ? (
                        <div className="inline-flex items-center justify-end gap-2">
                          <span className="text-[11px] text-stone">
                            ¿Eliminar?
                          </span>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(category.id)}
                            className="bg-obsidian px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-ivory hover:bg-obsidian/85 disabled:opacity-50 cursor-pointer"
                          >
                            {isDeleting ? 'Borrando...' : 'Sí, borrar'}
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => setConfirmDeleteId(null)}
                            className="border border-hairline px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-stone hover:text-obsidian cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditForm(category)}
                            aria-label={`Editar ${category.name}`}
                            className="p-1.5 text-stone transition-colors hover:bg-sand hover:text-obsidian cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(category.id)}
                            aria-label={`Eliminar ${category.name}`}
                            className="p-1.5 text-stone transition-colors hover:bg-sand hover:text-obsidian cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}