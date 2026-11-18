import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CategoryRow, PerfumeWithCategories } from '@/types/database';
import { PerfumeFormModal } from '@/features/admin/components/PerfumeFormModal';
import { getAdminCategories } from '@/features/admin/services/categoryService';
import {
  deletePerfume,
  getAdminPerfumes,
  updatePerfume,
} from '@/features/admin/services/perfumeService';

type PerfumeStatusFilter =
  | 'all'
  | 'published'
  | 'draft'
  | 'out_of_stock'
  | 'featured';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function PerfumesPage() {
  const [perfumes, setPerfumes] = useState<PerfumeWithCategories[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PerfumeStatusFilter>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerfume, setEditingPerfume] =
    useState<PerfumeWithCategories | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [perfumesData, categoriesData] = await Promise.all([
        getAdminPerfumes(),
        getAdminCategories(),
      ]);
      setPerfumes(perfumesData);
      setCategories(categoriesData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los perfumes.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPerfumes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return perfumes.filter((perfume) => {
      if (statusFilter === 'published' && !perfume.is_published) return false;
      if (statusFilter === 'draft' && perfume.is_published) return false;
      if (statusFilter === 'out_of_stock' && perfume.is_available) return false;
      if (statusFilter === 'featured' && !perfume.is_featured) return false;

      if (
        selectedCategoryFilter !== 'all' &&
        !perfume.categories.some((cat) => cat.id === selectedCategoryFilter)
      ) {
        return false;
      }

      if (!query) return true;

      return (
        perfume.name.toLowerCase().includes(query) ||
        perfume.brand.toLowerCase().includes(query) ||
        perfume.fragrance_family.toLowerCase().includes(query) ||
        perfume.slug.toLowerCase().includes(query)
      );
    });
  }, [perfumes, searchQuery, statusFilter, selectedCategoryFilter]);

  const openCreateModal = () => {
    setEditingPerfume(null);
    setIsModalOpen(true);
  };

  const openEditModal = (perfume: PerfumeWithCategories) => {
    setEditingPerfume(perfume);
    setIsModalOpen(true);
  };

  const handleSavedPerfume = (
    saved: PerfumeWithCategories,
    isNew: boolean
  ) => {
    setPerfumes((prev) =>
      isNew
        ? [saved, ...prev]
        : prev.map((item) => (item.id === saved.id ? saved : item))
    );
    setIsModalOpen(false);
    setEditingPerfume(null);
  };

  const handleQuickToggle = async (
    perfume: PerfumeWithCategories,
    field: 'is_published' | 'is_available' | 'is_featured'
  ) => {
    if (updatingId) return;
    setUpdatingId(perfume.id);
    setErrorMessage(null);

    try {
      const updated = await updatePerfume(perfume.id, {
        [field]: !perfume[field],
      });

      setPerfumes((prev) =>
        prev.map((item) =>
          item.id === perfume.id
            ? { ...updated, categories: item.categories }
            : item
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el estado del perfume.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (perfume: PerfumeWithCategories) => {
    if (deletingId) return;
    setDeletingId(perfume.id);
    setErrorMessage(null);

    try {
      await deletePerfume(perfume.id, perfume.image_path);
      setPerfumes((prev) => prev.filter((item) => item.id !== perfume.id));
      setConfirmDeleteId(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el perfume.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-champagne-dark">
            Inventario y Catálogo
          </p>
          <h1 className="mt-1.5 font-serif text-2xl text-obsidian sm:text-3xl">
            Perfumes ({perfumes.length})
          </h1>
          <p className="mt-1 text-xs text-stone">
            Administra fragancias, precios, fotografías, pirámide olfativa y visibilidad en tienda.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="h-3.5 w-3.5" />
          <span>Nuevo perfume</span>
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar nombre, marca o familia..."
              className="w-full border border-hairline bg-ivory py-2 pr-3 pl-9 text-xs text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
            />
          </div>

          <select
            aria-label="Filtrar por categoría"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="border border-hairline bg-ivory px-3 py-2 text-xs text-obsidian focus:border-obsidian focus:outline-none cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'published', label: 'Publicados' },
              { id: 'draft', label: 'Borradores' },
              { id: 'out_of_stock', label: 'Agotados' },
              { id: 'featured', label: 'Destacados' },
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

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 bg-obsidian px-4 py-3 text-xs text-ivory"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-champagne" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-stone hover:text-ivory cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex min-h-[240px] flex-col items-center justify-center border border-hairline bg-sand/25 p-8">
          <Loader2 className="h-7 w-7 animate-spin text-champagne-dark" />
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-stone">
            Cargando inventario de fragancias...
          </p>
        </div>
      )}

      {!isLoading && perfumes.length === 0 && (
        <div className="flex flex-col items-center justify-center border border-hairline bg-sand/25 px-6 py-16 text-center">
          <Package className="h-7 w-7 text-champagne-dark" />
          <h2 className="mt-3 font-serif text-xl text-obsidian">
            Tu catálogo está listo para recibir fragancias
          </h2>
          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-stone">
            Agrega tu primer perfume con fotografía, notas olfativas, precio y categorías asignadas.
          </p>
          <div className="mt-6">
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus className="h-3.5 w-3.5" />
              <span>Agregar primer perfume</span>
            </Button>
          </div>
        </div>
      )}

      {!isLoading && perfumes.length > 0 && filteredPerfumes.length === 0 && (
        <div className="border border-hairline bg-sand/20 p-8 text-center">
          <p className="text-xs text-stone">
            No se encontraron perfumes con los filtros seleccionados.
          </p>
        </div>
      )}

      {!isLoading && filteredPerfumes.length > 0 && (
        <div className="overflow-x-auto border border-hairline bg-ivory">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline bg-sand/40 text-[10px] uppercase tracking-[0.16em] text-stone">
                <th className="px-4 py-3 font-medium">Fragancia</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Categorías
                </th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Estado en tienda</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-xs">
              {filteredPerfumes.map((perfume) => {
                const isUpdating = updatingId === perfume.id;
                const isConfirmingDelete = confirmDeleteId === perfume.id;
                const isDeleting = deletingId === perfume.id;

                return (
                  <tr
                    key={perfume.id}
                    className="transition-colors hover:bg-sand/25"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={perfume.image_url}
                          alt={perfume.name}
                          className="h-14 w-12 shrink-0 border border-hairline object-cover"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-obsidian">
                              {perfume.name}
                            </p>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleQuickToggle(perfume, 'is_featured')
                              }
                              title={
                                perfume.is_featured
                                  ? 'Quitar de destacados'
                                  : 'Marcar como destacado'
                              }
                              className="shrink-0 text-champagne-dark transition-transform hover:scale-110 disabled:opacity-50 cursor-pointer"
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${
                                  perfume.is_featured
                                    ? 'fill-champagne-dark text-champagne-dark'
                                    : 'text-stone/40'
                                }`}
                              />
                            </button>
                          </div>
                          <p className="truncate text-[11px] text-stone">
                            {perfume.brand} · {perfume.presentation}
                          </p>
                          <p className="mt-0.5 text-[10px] text-stone/80">
                            {perfume.fragrance_family}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-4 py-3.5 md:table-cell">
                      {perfume.categories.length === 0 ? (
                        <span className="text-[11px] text-stone">Sin categoría</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {perfume.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="border border-hairline bg-sand/40 px-2 py-0.5 text-[10px] text-obsidian"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-obsidian">
                        {formatCurrency(perfume.price)}
                      </p>
                      {perfume.previous_price !== null &&
                        perfume.previous_price > perfume.price && (
                          <p className="text-[11px] text-stone line-through">
                            {formatCurrency(perfume.previous_price)}
                          </p>
                        )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleQuickToggle(perfume, 'is_published')
                          }
                          title="Alternar visibilidad en tienda"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] transition-opacity disabled:opacity-50 cursor-pointer ${
                            perfume.is_published
                              ? 'bg-obsidian text-ivory'
                              : 'border border-hairline bg-sand/50 text-stone'
                          }`}
                        >
                          {perfume.is_published ? (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>Publicado</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span>Borrador</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleQuickToggle(perfume, 'is_available')
                          }
                          title="Alternar disponibilidad en stock"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] transition-opacity disabled:opacity-50 cursor-pointer ${
                            perfume.is_available
                              ? 'bg-champagne/45 text-obsidian'
                              : 'border border-hairline text-stone'
                          }`}
                        >
                          <Check
                            className={`h-3 w-3 ${
                              perfume.is_available ? 'opacity-100' : 'opacity-25'
                            }`}
                          />
                          <span>
                            {perfume.is_available ? 'Disponible' : 'Agotado'}
                          </span>
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {isConfirmingDelete ? (
                        <div className="inline-flex items-center justify-end gap-2">
                          <span className="text-[11px] text-stone">
                            ¿Eliminar?
                          </span>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(perfume)}
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
                            onClick={() => openEditModal(perfume)}
                            aria-label={`Editar ${perfume.name}`}
                            className="p-1.5 text-stone transition-colors hover:bg-sand hover:text-obsidian cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(perfume.id)}
                            aria-label={`Eliminar ${perfume.name}`}
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

      {isModalOpen && (
        <PerfumeFormModal
          perfume={editingPerfume}
          categories={categories}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPerfume(null);
          }}
          onSaved={handleSavedPerfume}
        />
      )}
    </div>
  );
}