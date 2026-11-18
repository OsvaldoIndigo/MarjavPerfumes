import { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Tags,
  X,
} from 'lucide-react';
import { useAdminContext } from '@/features/admin/components/ProtectedAdminRoute';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Perfumes',
    to: '/admin/perfumes',
    icon: Package,
  },
  {
    label: 'Categorías',
    to: '/admin/categories',
    icon: Tags,
  },
  {
    label: 'Configuración',
    to: '/admin/settings',
    icon: Settings,
  },
];

export function AdminLayout() {
  const adminContext = useAdminContext();
  const { admin, logout } = adminContext;
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-obsidian lg:flex">
      {/* Cabecera móvil */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-ivory/95 px-4 py-3.5 backdrop-blur-xs lg:hidden">
        <Link to="/admin/dashboard" className="flex flex-col">
          <span className="font-brand text-xs tracking-[0.22em] uppercase text-obsidian">
            MARJAV
          </span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-champagne-dark">
            Panel Admin
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMobileMenuOpen}
          className="p-2 text-obsidian transition-colors hover:bg-sand/60 cursor-pointer"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* Backdrop móvil */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-obsidian/45 backdrop-blur-xs lg:hidden cursor-pointer"
        />
      )}

      {/* Sidebar de navegación */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-hairline bg-sand/40 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 bg-ivory' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Marca */}
          <div className="border-b border-hairline px-6 py-6">
            <Link to="/admin/dashboard" className="block">
              <span className="block font-brand text-sm tracking-[0.24em] uppercase text-obsidian">
                MARJAV
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-champagne-dark">
                Administración
              </span>
            </Link>
          </div>

          {/* Enlaces principales */}
          <nav aria-label="Navegación administrativa" className="space-y-1 p-4">
            {ADMIN_NAV_ITEMS.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                    isActive
                      ? 'bg-obsidian text-ivory font-medium'
                      : 'text-stone hover:bg-sand/80 hover:text-obsidian'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0 stroke-[1.7]" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bloque inferior: enlace a tienda, perfil y cerrar sesión */}
        <div className="space-y-3 border-t border-hairline p-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-hairline bg-ivory px-3.5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-obsidian transition-colors hover:border-obsidian"
          >
            <span>Ver tienda pública</span>
            <ExternalLink className="h-3.5 w-3.5 text-champagne-dark" />
          </a>

          <div className="px-1 pt-1">
            <p className="truncate text-xs font-medium text-obsidian">
              {admin.full_name}
            </p>
            <p className="truncate text-[11px] text-stone">{admin.email}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs uppercase tracking-[0.14em] text-stone transition-colors hover:bg-obsidian hover:text-ivory disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0 stroke-[1.7]" />
            <span>{isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </aside>

      {/* Área principal de contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 lg:py-10">
          <Outlet context={adminContext} />
        </main>
      </div>
    </div>
  );
}