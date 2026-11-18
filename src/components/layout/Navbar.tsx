import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { usePublicSettings } from '@/features/catalog/context/PublicSettingsContext';

interface NavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export function Navbar({ cartCount = 0, onOpenCart }: NavbarProps) {
  const settings = usePublicSettings();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-xs uppercase tracking-[0.16em] transition-colors duration-200 py-1 border-b ${
      isActive
        ? 'text-obsidian border-champagne-dark font-medium'
        : 'text-stone border-transparent hover:text-obsidian'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-md border-b border-hairline">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Identidad de marca */}
        <Link
          to="/"
          className="focus-visible:outline-offset-4 flex items-center"
          aria-label={`Ir al inicio de ${settings.store_name}`}
        >
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.store_name}
              className="h-9 sm:h-11 w-auto object-contain"
            />
          ) : (
            <BrandLogo variant="light" layout="horizontal" />
          )}
        </Link>

        {/* Navegación principal + Acción de cesta */}
        <div className="flex items-center gap-5 sm:gap-8">
          <nav
            aria-label="Navegación principal"
            className="flex items-center gap-4 sm:gap-7"
          >
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
            <NavLink to="/catalogo" className={navLinkClass}>
              Catálogo
            </NavLink>
          </nav>

          {/* Botón de acceso al carrito */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Abrir cesta de compras (${cartCount} artículos)`}
            className="relative inline-flex items-center justify-center p-2 text-obsidian hover:text-champagne-dark transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-obsidian text-champagne text-[10px] font-semibold flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}