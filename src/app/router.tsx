import { createBrowserRouter, Link, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { HomePage } from '@/features/catalog/pages/HomePage';
import { CatalogPage } from '@/features/catalog/pages/CatalogPage';
import { PerfumeDetailPage } from '@/features/catalog/pages/PerfumeDetailPage';
import { ProtectedAdminRoute } from '@/features/admin/components/ProtectedAdminRoute';
import { AdminLayout } from '@/features/admin/layouts/AdminLayout';
import { LoginPage } from '@/features/admin/pages/LoginPage';
import { DashboardPage } from '@/features/admin/pages/DashboardPage';
import { CategoriesPage } from '@/features/admin/categories/CategoriesPage';
import { PerfumesPage } from '@/features/admin/pages/PerfumesPage';
import { SettingsPage } from '@/features/admin/pages/SettingsPage';

function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-champagne-dark">
        Error 404
      </p>
      <h1 className="mt-3 font-serif text-3xl text-obsidian sm:text-4xl">
        Fragancia o página no encontrada
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-stone">
        El enlace que visitaste no existe o el producto fue retirado del catálogo.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/catalogo">
          <Button variant="primary">Explorar catálogo</Button>
        </Link>
        <Link to="/">
          <Button variant="secondary">Volver al inicio</Button>
        </Link>
      </div>
    </section>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'catalogo',
        element: <CatalogPage />,
      },
      {
        path: 'catalogo/:slug',
        element: <PerfumeDetailPage />,
      },
      {
        path: 'cesta',
        element: <Navigate to="/catalogo" replace />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <ProtectedAdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'perfumes',
            element: <PerfumesPage />,
          },
          {
            path: 'categories',
            element: <CategoriesPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);