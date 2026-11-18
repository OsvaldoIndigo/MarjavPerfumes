import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { buildWhatsAppUrl } from '@/features/catalog/services/publicCatalogService';
import { usePublicSettings } from '@/features/catalog/context/PublicSettingsContext';

export function Footer() {
  const settings = usePublicSettings();

  const instagramUrl =
    settings.instagram_url || 'https://instagram.com/marjav.2021';
  const instagramHandle = instagramUrl
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '@')
    .replace(/\/$/, '');

  const whatsappUrl = buildWhatsAppUrl(
    `Hola ${settings.store_name}, me gustaría recibir asesoría sobre sus fragancias.`,
    settings.whatsapp_number
  );

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-obsidian text-ivory/85 border-t border-obsidian mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-center text-center md:text-left">
          {/* Columna 1: Identidad de marca */}
          <div className="flex flex-col items-center md:items-start">
            <div className="md:hidden">
              <BrandLogo variant="dark" layout="horizontal" />
            </div>
            <div className="hidden md:block">
              <BrandLogo variant="dark" layout="stacked" />
            </div>
            <p className="mt-2.5 md:mt-4 text-[11px] md:text-xs text-ivory/60 max-w-xs leading-relaxed">
              {settings.contact_info ||
                'Fragancias seleccionadas con carácter y distinción. Atención personalizada y pedidos directos por WhatsApp.'}
            </p>
          </div>

          {/* Columna 2: Navegación rápida */}
          <div className="flex flex-col items-center gap-1.5 md:gap-3">
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-champagne">
              Explorar
            </span>
            <nav
              aria-label="Navegación pie de página"
              className="flex flex-row md:flex-col items-center gap-5 md:gap-2 text-[11px] md:text-xs tracking-[0.14em] uppercase"
            >
              <Link
                to="/"
                className="text-ivory/75 hover:text-champagne transition-colors"
              >
                Inicio
              </Link>
              <Link
                to="/catalogo"
                className="text-ivory/75 hover:text-champagne transition-colors"
              >
                Catálogo completo
              </Link>
            </nav>
          </div>

          {/* Columna 3: Canales de atención */}
          <div className="flex flex-col items-center md:items-end gap-2 md:gap-3">
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-champagne">
              Contacto directo
            </span>
            <div className="flex flex-wrap justify-center items-center gap-2.5 md:gap-3">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Seguir a ${settings.store_name} en Instagram`}
                  className="inline-flex items-center gap-1.5 md:gap-2 px-3.5 py-1.5 md:px-4 md:py-2 border border-ivory/20 text-[11px] md:text-xs tracking-[0.12em] uppercase text-ivory hover:border-champagne hover:text-champagne transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3.5 md:w-4 md:h-4"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>
                    {instagramHandle.startsWith('@')
                      ? instagramHandle
                      : '@marjav.2021'}
                  </span>
                </a>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Contactar a ${settings.store_name} por WhatsApp`}
                className="inline-flex items-center gap-1.5 md:gap-2 px-3.5 py-1.5 md:px-4 md:py-2 border border-champagne/50 bg-champagne/10 text-[11px] md:text-xs tracking-[0.12em] uppercase text-champagne hover:bg-champagne hover:text-obsidian transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[1.5]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Línea legal inferior */}
        <div className="mt-6 pt-4 md:mt-12 md:pt-6 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-1.5 md:gap-2 text-[10px] md:text-[11px] text-ivory/50 tracking-wider">
          <p>
            © {currentYear} {settings.store_name}. Todos los derechos reservados.
          </p>
          <p>Catálogo Digital • Pedidos vía WhatsApp</p>
        </div>
      </div>
    </footer>
  );
}