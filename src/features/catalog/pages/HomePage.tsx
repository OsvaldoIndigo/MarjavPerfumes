import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Loader2,
  MessageCircle,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { PerfumeCard } from '../components/PerfumeCard';
import { useCart } from '@/features/cart/context/CartContext';
import { getPublishedPerfumes } from '@/features/catalog/services/publicCatalogService';
import type { Perfume } from '@/types/perfume';

export function HomePage() {
  const [featuredPerfumes, setFeaturedPerfumes] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let isMounted = true;

    getPublishedPerfumes()
      .then((published) => {
        if (!isMounted) return;
        const featured = published.filter((item) => item.featured);
        setFeaturedPerfumes(
          featured.length > 0 ? featured : published.slice(0, 6)
        );
      })
      .catch(() => {
        if (isMounted) {
          setFeaturedPerfumes([]);
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
  }, []);

  return (
    <div>
      {/* Hero editorial */}
      <section className="border-b border-hairline bg-sand/35">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center text-center">
          <BrandLogo variant="light" layout="stacked" className="mb-8" />

          <span className="text-[11px] uppercase tracking-[0.24em] text-champagne-dark font-medium">
            Alta Perfumería & Selección Privada
          </span>

          <h1 className="mt-3 font-serif text-3xl sm:text-5xl lg:text-6xl text-obsidian max-w-3xl leading-[1.15]">
            Esencias que dejan huella antes de pronunciar palabra
          </h1>

          <p className="mt-5 text-sm sm:text-base text-stone max-w-xl leading-relaxed">
            Descubre nuestra colección curada de fragancias originales. Elige tus favoritas y coordina tu entrega de forma rápida y directa por WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/catalogo">
              <Button variant="primary" size="lg">
                <span>Explorar catálogo</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Selección destacada */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-champagne-dark font-medium">
              Curaduría MARJAV
            </span>
            <h2 className="mt-1.5 font-serif text-2xl sm:text-4xl text-obsidian">
              Fragancias Destacadas
            </h2>
          </div>

          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-obsidian hover:text-champagne-dark transition-colors"
          >
            <span>Ver toda la colección</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center border border-hairline bg-sand/25 p-8">
            <Loader2 className="h-7 w-7 animate-spin text-champagne-dark" />
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-stone">
              Cargando selección...
            </p>
          </div>
        ) : featuredPerfumes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredPerfumes.map((perfume) => (
              <PerfumeCard
                key={perfume.id}
                perfume={perfume}
                onAddToCart={addItem}
              />
            ))}
          </div>
        ) : (
          <div className="border border-hairline bg-sand/30 p-10 text-center">
            <p className="font-serif text-xl text-obsidian">
              Próximamente nuevas fragancias
            </p>
            <p className="mt-2 text-xs text-stone">
              Estamos preparando nuestra selección exclusiva para ti.
            </p>
          </div>
        )}
      </section>

      {/* Cómo comprar */}
      <section className="border-t border-hairline bg-sand/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] uppercase tracking-[0.22em] text-champagne-dark font-medium">
              Experiencia directa
            </span>
            <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl text-obsidian">
              Tu pedido en tres pasos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-ivory border border-hairline">
              <Sparkles className="w-5 h-5 text-champagne-dark stroke-[1.5]" />
              <h3 className="mt-4 font-serif text-xl text-obsidian">
                1. Explora el catálogo
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone leading-relaxed">
                Filtra por categoría o busca tus notas olfativas preferidas con total claridad de precios y concentraciones.
              </p>
            </div>

            <div className="p-6 bg-ivory border border-hairline">
              <ShoppingBag className="w-5 h-5 text-champagne-dark stroke-[1.5]" />
              <h3 className="mt-4 font-serif text-xl text-obsidian">
                2. Arma tu selección
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone leading-relaxed">
                Agrega una o varias fragancias a tu cesta y ajusta las cantidades antes de confirmar.
              </p>
            </div>

            <div className="p-6 bg-ivory border border-hairline">
              <MessageCircle className="w-5 h-5 text-champagne-dark stroke-[1.5]" />
              <h3 className="mt-4 font-serif text-xl text-obsidian">
                3. Envía por WhatsApp
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone leading-relaxed">
                Con un toque generamos el resumen detallado de tu pedido listo para enviarse a nuestro WhatsApp oficial.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}