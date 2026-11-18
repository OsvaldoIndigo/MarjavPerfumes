import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { Perfume } from '@/types/perfume';
import { formatCurrency } from '@/utils/formatCurrency';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface PerfumeCardProps {
  perfume: Perfume;
  onAddToCart?: (perfume: Perfume) => void;
}

export function PerfumeCard({ perfume, onAddToCart }: PerfumeCardProps) {
  const detailPath = `/catalogo/${perfume.slug}`;

  const highlightNotes = [
    ...perfume.notes.top.slice(0, 1),
    ...perfume.notes.heart.slice(0, 1),
    ...perfume.notes.base.slice(0, 1),
  ];

  const primaryCategory =
    perfume.categories?.[0]?.name || perfume.fragranceFamily || perfume.category;

  const presentationLabel =
    perfume.presentation || `${perfume.concentration} · ${perfume.volumeMl} ml`;

  return (
    <article className="group flex flex-col bg-ivory border border-hairline hover:border-champagne/70 transition-colors duration-300">
      <Link
        to={detailPath}
        className="relative aspect-[4/5] w-full overflow-hidden bg-sand block"
        aria-label={`Ver detalles de ${perfume.name}`}
      >
        <img
          src={perfume.imageUrl}
          alt={`${perfume.name} - ${perfume.brand}`}
          loading="lazy"
          className={`h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
            !perfume.inStock ? 'opacity-65 grayscale-[30%]' : ''
          }`}
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {primaryCategory && (
            <Badge variant="neutral" className="bg-ivory/90 backdrop-blur-xs">
              {primaryCategory}
            </Badge>
          )}
          {!perfume.inStock && <Badge variant="dark">Agotado</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em] text-stone">
          <span className="truncate">{perfume.brand}</span>
          <span className="shrink-0">{presentationLabel}</span>
        </div>

        <Link
          to={detailPath}
          className="mt-1.5 group-hover:text-champagne-dark transition-colors"
        >
          <h3 className="font-serif text-xl sm:text-2xl text-obsidian leading-snug">
            {perfume.name}
          </h3>
        </Link>

        {highlightNotes.length > 0 && (
          <p className="mt-2 text-xs text-stone line-clamp-1">
            {highlightNotes.join(' · ')}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-hairline/70 flex items-center justify-between gap-3">
          <div>
            <span className="text-sm sm:text-base font-medium text-obsidian tracking-wide">
              {formatCurrency(perfume.price, perfume.currency)}
            </span>
            {perfume.previousPrice != null &&
              perfume.previousPrice > perfume.price && (
                <span className="ml-2 text-xs text-stone line-through">
                  {formatCurrency(perfume.previousPrice, perfume.currency)}
                </span>
              )}
          </div>

          <Button
            variant={perfume.inStock ? 'secondary' : 'ghost'}
            size="sm"
            disabled={!perfume.inStock}
            onClick={() => onAddToCart?.(perfume)}
            aria-label={`Agregar ${perfume.name} a la cesta`}
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[1.6]" />
            <span>{perfume.inStock ? 'Agregar' : 'Agotado'}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}