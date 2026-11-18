import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Sparkles,
  Tags,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAdminContext } from '@/features/admin/components/ProtectedAdminRoute';
import {
  getDashboardMetrics,
  type DashboardMetrics,
} from '@/features/admin/services/dashboardService';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function DashboardPage() {
  const { admin } = useAdminContext();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al consultar las métricas.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-champagne-dark">
            Resumen General
          </p>
          <h1 className="mt-1.5 font-serif text-2xl text-obsidian sm:text-3xl">
            Bienvenido, {admin.full_name}
          </h1>
          <p className="mt-1 text-xs text-stone">
            Estado actual del catálogo y disponibilidad en tienda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/perfumes">
            <Button variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" />
              <span>Gestionar perfumes</span>
            </Button>
          </Link>
          <Link to="/admin/categories">
            <Button variant="secondary" size="sm">
              <span>Categorías</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="flex min-h-[260px] flex-col items-center justify-center border border-hairline bg-sand/25 p-8">
          <Loader2 className="h-7 w-7 animate-spin text-champagne-dark" />
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-stone">
            Cargando métricas del catálogo...
          </p>
        </div>
      )}

      {/* Estado de error */}
      {!isLoading && errorMessage && (
        <div
          role="alert"
          className="flex flex-col items-start justify-between gap-4 border border-obsidian/20 bg-obsidian p-5 text-ivory sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
            <p className="text-xs leading-relaxed">{errorMessage}</p>
          </div>
          <Button variant="champagne" size="sm" onClick={loadMetrics}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </Button>
        </div>
      )}

      {/* Tarjetas de métricas */}
      {!isLoading && metrics && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="border border-hairline bg-sand/35 p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.15em] text-stone">
                  Total Perfumes
                </span>
                <Package className="h-4 w-4 text-champagne-dark" />
              </div>
              <p className="mt-3 font-serif text-3xl text-obsidian">
                {metrics.totalPerfumes}
              </p>
              <p className="mt-1.5 text-xs text-stone">
                {metrics.featuredPerfumes} destacados en portada
              </p>
            </div>

            <div className="border border-hairline bg-sand/35 p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.15em] text-stone">
                  Publicados
                </span>
                <Eye className="h-4 w-4 text-champagne-dark" />
              </div>
              <p className="mt-3 font-serif text-3xl text-obsidian">
                {metrics.publishedPerfumes}
              </p>
              <p className="mt-1.5 text-xs text-stone">
                {metrics.draftPerfumes} ocultos / borrador
              </p>
            </div>

            <div className="border border-hairline bg-sand/35 p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.15em] text-stone">
                  Disponibles
                </span>
                <CheckCircle2 className="h-4 w-4 text-champagne-dark" />
              </div>
              <p className="mt-3 font-serif text-3xl text-obsidian">
                {metrics.availablePerfumes}
              </p>
              <p className="mt-1.5 text-xs text-stone">
                {metrics.outOfStockPerfumes} marcados como agotados
              </p>
            </div>

            <div className="border border-hairline bg-sand/35 p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.15em] text-stone">
                  Categorías Activas
                </span>
                <Tags className="h-4 w-4 text-champagne-dark" />
              </div>
              <p className="mt-3 font-serif text-3xl text-obsidian">
                {metrics.activeCategories}
              </p>
              <p className="mt-1.5 text-xs text-stone">
                de {metrics.totalCategories} categorías registradas
              </p>
            </div>
          </div>

          {/* Listado reciente */}
          <section className="border border-hairline bg-ivory">
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <div>
                <h2 className="font-serif text-lg text-obsidian">
                  Últimos perfumes agregados
                </h2>
                <p className="text-xs text-stone">
                  Vista rápida de los registros más recientes en PostgreSQL.
                </p>
              </div>
              <Link
                to="/admin/perfumes"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-obsidian transition-colors hover:text-champagne-dark"
              >
                <span>Ver todos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {metrics.recentPerfumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <Sparkles className="h-6 w-6 text-champagne-dark" />
                <h3 className="mt-3 font-serif text-lg text-obsidian">
                  Aún no hay perfumes en la base de datos
                </h3>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-stone">
                  Tu conexión con Supabase está activa. Comienza creando categorías y agregando tus primeras fragancias al catálogo.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link to="/admin/categories">
                    <Button variant="secondary" size="sm">
                      Crear categorías
                    </Button>
                  </Link>
                  <Link to="/admin/perfumes">
                    <Button variant="primary" size="sm">
                      Agregar primer perfume
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-hairline">
                {metrics.recentPerfumes.map((perfume) => (
                  <div
                    key={perfume.id}
                    className="flex flex-col justify-between gap-3 px-5 py-3.5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={perfume.image_url}
                        alt={perfume.name}
                        className="h-12 w-12 border border-hairline object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-obsidian">
                          {perfume.name}
                        </p>
                        <p className="text-xs text-stone">
                          {perfume.brand} · {formatCurrency(perfume.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em]">
                      <span
                        className={`px-2.5 py-1 ${
                          perfume.is_published
                            ? 'bg-obsidian text-ivory'
                            : 'border border-hairline bg-sand/50 text-stone'
                        }`}
                      >
                        {perfume.is_published ? 'Publicado' : 'Borrador'}
                      </span>
                      <span
                        className={`px-2.5 py-1 ${
                          perfume.is_available
                            ? 'bg-champagne/40 text-obsidian'
                            : 'border border-hairline text-stone'
                        }`}
                      >
                        {perfume.is_available ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}