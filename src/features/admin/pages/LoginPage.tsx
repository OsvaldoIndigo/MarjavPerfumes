import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth';

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const { isAuthenticated, isLoading: isCheckingSession, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const state = location.state as LoginLocationState | null;
  const redirectTo =
    state?.from &&
    state.from.startsWith('/admin') &&
    state.from !== '/admin/login'
      ? state.from
      : '/admin/dashboard';

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 text-obsidian">
        <Loader2 className="h-7 w-7 animate-spin text-champagne-dark" />
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-stone">
          Cargando acceso...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Ingresa tu correo electrónico y contraseña.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión. Intenta nuevamente.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-ivory px-4 py-8 text-obsidian sm:px-6">
      {/* Retorno a la tienda pública */}
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-stone transition-colors hover:text-obsidian"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver a la tienda</span>
        </Link>
      </div>

      {/* Formulario de acceso */}
      <main className="mx-auto my-auto w-full max-w-md py-10">
        <div className="border border-hairline bg-sand/35 p-7 sm:p-10">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-hairline bg-ivory">
              <Lock className="h-4 w-4 stroke-[1.6] text-champagne-dark" />
            </div>
            <p className="font-brand text-[11px] uppercase tracking-[0.24em] text-champagne-dark">
              MARJAV · Administración
            </p>
            <h1 className="mt-2 font-serif text-2xl text-obsidian sm:text-3xl">
              Acceso al Panel
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-stone">
              Ingresa tus credenciales de administrador para gestionar el catálogo y la tienda.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 border border-obsidian/20 bg-obsidian px-4 py-3 text-xs text-ivory"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[11px] uppercase tracking-[0.14em] text-stone"
              >
                Correo electrónico
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@marjav.com"
                className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2.5 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-[11px] uppercase tracking-[0.14em] text-stone"
              >
                Contraseña
              </label>
              <div className="relative mt-1.5">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-hairline bg-ivory px-3.5 py-2.5 pr-10 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-stone transition-colors hover:text-obsidian cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Iniciar sesión</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Pie discreto */}
      <footer className="text-center text-[11px] tracking-[0.12em] text-stone">
        Área restringida · Acceso exclusivo para personal autorizado
      </footer>
    </div>
  );
}