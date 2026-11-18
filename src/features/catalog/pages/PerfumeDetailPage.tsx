import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/features/cart/context/CartContext';
import { getPublishedPerfumeBySlug } from '@/features/catalog/services/publicCatalogService';
import type { Perfume } from '@/types/perfume';
import { formatCurrency } from '@/utils/formatCurrency';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function PerfumeDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { addItem } = useCart();

  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setQuantity(1);

    getPublishedPerfumeBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setPerfume(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPerfume(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-champagne-dark" />
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-stone">
          Cargando fragancia...
        </p>
      </section>
    );
  }

  if (!perfume) {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <span className="text-[11px] uppercase tracking-[0.2em] text-stone">
          Error 404
        </span>
        <h1 className="mt-2 font-serif text-3xl text-obsidian">
          Fragancia no encontrada
        </h1>
        <p className="mt-3 text-sm text-stone">
          El perfume que buscas no está disponible o el enlace ha cambiado.
        </p>
        <div className="mt-8">
          <Link to="/catalogo">
            <Button variant="primary">Volver al catálogo</Button>
          </Link>
        </div>
      </section>
    );
  }

  const hasNotes =
    perfume.notes.top.length > 0 ||
    perfume.notes.heart.length > 0 ||
    perfume.notes.base.length > 0;

  const presentationLabel =
    perfume.presentation || `${perfume.concentration} · ${perfume.volumeMl} ml`;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-stone hover:text-obsidian transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
        <span>Volver al catálogo</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        <div className="lg:col-span-6 bg-sand border border-hairline aspect-[4/5] overflow-hidden">
          <img
            src={perfume.imageUrl}
            alt={`${perfume.name} - ${perfume.brand}`}
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="lg:col-span-6 flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {(perfume.categories ?? []).map((cat) => (
              <Badge key={cat.id} variant="neutral">
                {cat.name}
              </Badge>
            ))}
            <Badge variant="muted">{presentationLabel}</Badge>
            {!perfume.inStock && <Badge variant="dark">Agotado</Badge>}
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-stone">
            {perfume.brand}
            {perfume.fragranceFamily ? ` · ${perfume.fragranceFamily}` : ''}
          </p>

          <h1 className="mt-1 font-serif text-3xl sm:text-5xl text-obsidian leading-tight">
            {perfume.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-xl sm:text-2xl font-medium text-obsidian">
              {formatCurrency(perfume.price, perfume.currency)}
            </p>
            {perfume.previousPrice != null &&
              perfume.previousPrice > perfume.price && (
                <span className="text-sm text-stone line-through">
                  {formatCurrency(perfume.previousPrice, perfume.currency)}
                </span>
              )}
          </div>

          {perfume.description && (
            <p className="mt-6 text-sm sm:text-base text-obsidian/80 leading-relaxed border-t border-hairline pt-6">
              {perfume.description}
            </p>
          )}

          {(perfume.intensity || perfume.longevity) && (
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-hairline pt-6">
              {perfume.intensity && (
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-stone">
                    Intensidad
                  </span>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-obsidian">
                    {perfume.intensity}
                  </p>
                </div>
              )}
              {perfume.longevity && (
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-stone">
                    Duración estimada
                  </span>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-obsidian">
                    {perfume.longevity}
                  </p>
                </div>
              )}
            </div>
          )}

          {hasNotes && (
            <div className="mt-8 border-t border-hairline pt-6 space-y-4">
              <h2 className="text-xs uppercase tracking-[0.18em] text-champagne-dark font-semibold">
                Pirámide Olfativa
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-sand/50 border border-hairline">
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-stone">
                    Salida
                  </span>
                  <p className="mt-1 text-xs font-medium text-obsidian leading-relaxed">
                    {perfume.notes.top.length > 0
                      ? perfume.notes.top.join(', ')
                      : '—'}
                  </p>
                </div>

                <div className="p-3.5 bg-sand/50 border border-hairline">
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-stone">
                    Corazón
                  </span>
                  <p className="mt-1 text-xs font-medium text-obsidian leading-relaxed">
                    {perfume.notes.heart.length > 0
                      ? perfume.notes.heart.join(', ')
                      : '—'}
                  </p>
                </div>

                <div className="p-3.5 bg-sand/50 border border-hairline">
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-stone">
                    Fondo
                  </span>
                  <p className="mt-1 text-xs font-medium text-obsidian leading-relaxed">
                    {perfume.notes.base.length > 0
                      ? perfume.notes.base.join(', ')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-hairline flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="inline-flex items-center justify-between border border-obsidian/25 px-3 py-2 sm:w-32">
              <button
                type="button"
                disabled={!perfume.inStock || quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Disminuir cantidad"
                className="p-1 text-obsidian disabled:opacity-35 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-medium text-obsidian">
                {quantity}
              </span>
              <button
                type="button"
                disabled={!perfume.inStock}
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar cantidad"
                className="p-1 text-obsidian disabled:opacity-35 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!perfume.inStock}
              onClick={() => addItem(perfume, quantity)}
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span>
                {perfume.inStock
                  ? `Agregar a la cesta · ${formatCurrency(
                      perfume.price * quantity,
                      perfume.currency
                    )}`
                  : 'Agotado temporalmente'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}