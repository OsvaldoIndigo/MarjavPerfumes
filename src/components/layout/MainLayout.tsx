import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { useCart } from '@/features/cart/context/CartContext';
import { PublicSettingsProvider } from '@/features/catalog/context/PublicSettingsContext';

export function MainLayout() {
  const { pathname } = useLocation();
  const { totalItems, openCart } = useCart();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <PublicSettingsProvider>
      <div className="min-h-screen flex flex-col bg-ivory text-obsidian">
        <Navbar cartCount={totalItems} onOpenCart={openCart} />
        <main className="flex-1 w-full">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </PublicSettingsProvider>
  );
}