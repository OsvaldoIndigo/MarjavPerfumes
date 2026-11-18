import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { SettingsRow } from '@/types/database';
import {
  deleteStoreLogo,
  getStoreSettings,
  updateStoreSettings,
  uploadStoreLogo,
} from '@/features/admin/services/settingsService';

function sanitizeWhatsappDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

function normalizeInstagramUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const handle = trimmed.replace(/^@/, '').replace(/^instagram\.com\//i, '');
  return `https://instagram.com/${handle}`;
}

export function SettingsPage() {
  const [settingsId, setSettingsId] = useState<number>(1);
  const [storeName, setStoreName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [currentLogoPath, setCurrentLogoPath] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [shouldRemoveLogo, setShouldRemoveLogo] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const applySettingsToForm = useCallback((settings: SettingsRow) => {
    setSettingsId(settings.id);
    setStoreName(settings.store_name);
    setWhatsappNumber(settings.whatsapp_number);
    setInstagramUrl(settings.instagram_url);
    setContactInfo(settings.contact_info ?? '');
    setCurrentLogoUrl(settings.logo_url);
    setCurrentLogoPath(settings.logo_path);
    setPreviewUrl(settings.logo_url ?? '');
    setLogoFile(null);
    setShouldRemoveLogo(false);
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getStoreSettings();
      applySettingsToForm(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Error inesperado al cargar la configuración.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [applySettingsToForm]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShouldRemoveLogo(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleRemoveLogo = () => {
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setLogoFile(null);
    setPreviewUrl('');
    setShouldRemoveLogo(true);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedStoreName = storeName.trim();
    const cleanWhatsapp = sanitizeWhatsappDigits(whatsappNumber);
    const normalizedInstagram = normalizeInstagramUrl(instagramUrl);
    const trimmedContact = contactInfo.trim();

    if (!trimmedStoreName) {
      setErrorMessage('El nombre de la tienda es obligatorio.');
      return;
    }

    if (cleanWhatsapp && cleanWhatsapp.length < 10) {
      setErrorMessage(
        'Ingresa un número de WhatsApp válido con código de país (mínimo 10 dígitos).'
      );
      return;
    }

    setIsSaving(true);
    let newlyUploadedPath: string | null = null;

    try {
      let nextLogoUrl: string | null = shouldRemoveLogo ? null : currentLogoUrl;
      let nextLogoPath: string | null = shouldRemoveLogo
        ? null
        : currentLogoPath;

      if (logoFile) {
        const uploaded = await uploadStoreLogo(logoFile);
        nextLogoUrl = uploaded.logoUrl;
        nextLogoPath = uploaded.logoPath;
        newlyUploadedPath = uploaded.logoPath;
      }

      const previousPath = currentLogoPath;

      const updated = await updateStoreSettings(settingsId, {
        store_name: trimmedStoreName,
        whatsapp_number: cleanWhatsapp,
        instagram_url: normalizedInstagram,
        logo_url: nextLogoUrl,
        logo_path: nextLogoPath,
        contact_info: trimmedContact ? trimmedContact : null,
      });

      if (
        previousPath &&
        (shouldRemoveLogo ||
          (newlyUploadedPath && previousPath !== newlyUploadedPath))
      ) {
        await deleteStoreLogo(previousPath);
      }

      applySettingsToForm(updated);
      setSuccessMessage('La configuración de la tienda se guardó correctamente.');
    } catch (error) {
      if (newlyUploadedPath) {
        await deleteStoreLogo(newlyUploadedPath);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la configuración.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const cleanPreviewDigits = sanitizeWhatsappDigits(whatsappNumber);

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="border-b border-hairline pb-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-champagne-dark">
          Identidad y Canales de Venta
        </p>
        <h1 className="mt-1.5 font-serif text-2xl text-obsidian sm:text-3xl">
          Configuración de la Tienda
        </h1>
        <p className="mt-1 text-xs text-stone">
          Define el nombre comercial, logotipo, WhatsApp de pedidos y redes sociales visibles en el catálogo público.
        </p>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="flex min-h-[240px] flex-col items-center justify-center border border-hairline bg-sand/25 p-8">
          <Loader2 className="h-7 w-7 animate-spin text-champagne-dark" />
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-stone">
            Cargando configuración...
          </p>
        </div>
      )}

      {/* Formulario principal */}
      {!isLoading && (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 bg-obsidian px-4 py-3 text-xs text-ivory"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="flex items-start gap-2.5 border border-champagne-dark/40 bg-champagne/25 px-4 py-3 text-xs text-obsidian"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-champagne-dark" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Columna izquierda: Logotipo */}
            <section className="space-y-3 border border-hairline bg-sand/25 p-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-champagne-dark">
                  Identidad Visual
                </p>
                <h2 className="mt-1 font-serif text-lg text-obsidian">
                  Logotipo de marca
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-stone">
                  Opcional. Si no subes un logotipo, la tienda mostrará el nombre tipográfico de tu marca.
                </p>
              </div>

              <label className="group relative flex aspect-square w-full max-w-[220px] flex-col items-center justify-center overflow-hidden border border-dashed border-obsidian/30 bg-ivory text-center transition-colors hover:border-obsidian cursor-pointer">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Logotipo de la tienda"
                      className="h-full w-full object-contain p-4"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-obsidian/55 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 bg-ivory px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-obsidian">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Reemplazar</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-4">
                    <ImagePlus className="mx-auto h-7 w-7 text-champagne-dark" />
                    <p className="mt-2 text-xs font-medium text-obsidian">
                      Subir logotipo
                    </p>
                    <p className="mt-1 text-[11px] text-stone">
                      PNG, SVG o WEBP · Máx. 3 MB
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                  disabled={isSaving}
                  onChange={handleLogoChange}
                  className="sr-only"
                />
              </label>

              {previewUrl && (
                <div>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-stone transition-colors hover:text-obsidian disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Quitar logotipo</span>
                  </button>
                </div>
              )}
            </section>

            {/* Columna derecha: Datos de la tienda */}
            <section className="space-y-5 border border-hairline bg-ivory p-6 lg:col-span-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-champagne-dark">
                  Datos Comerciales
                </p>
                <h2 className="mt-1 font-serif text-lg text-obsidian">
                  Contacto y canales directos
                </h2>
              </div>

              <div>
                <label
                  htmlFor="settings-store-name"
                  className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                >
                  Nombre de la tienda *
                </label>
                <input
                  id="settings-store-name"
                  type="text"
                  required
                  disabled={isSaving}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="MARJAV"
                  className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2.5 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="settings-whatsapp"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Número de WhatsApp (con lada)
                  </label>
                  <input
                    id="settings-whatsapp"
                    type="tel"
                    disabled={isSaving}
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="5218112345678"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2.5 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                  {cleanPreviewDigits && (
                    <p className="mt-1 text-[11px] text-stone">
                      Enlace directo:{' '}
                      <span className="font-mono text-obsidian">
                        wa.me/{cleanPreviewDigits}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="settings-instagram"
                    className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                  >
                    Instagram (URL o @usuario)
                  </label>
                  <input
                    id="settings-instagram"
                    type="text"
                    disabled={isSaving}
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/marjav"
                    className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2.5 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="settings-contact-info"
                  className="block text-[11px] uppercase tracking-[0.14em] text-stone"
                >
                  Información adicional de contacto / entregas
                </label>
                <textarea
                  id="settings-contact-info"
                  rows={3}
                  disabled={isSaving}
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Ej. Envíos a todo México · Entregas personales en Monterrey y área metropolitana · Atención de lunes a sábado."
                  className="mt-1.5 w-full border border-hairline bg-ivory px-3.5 py-2.5 text-sm text-obsidian placeholder:text-stone/60 focus:border-obsidian focus:outline-none"
                />
              </div>

              <div className="flex justify-end border-t border-hairline pt-5">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando cambios...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Guardar configuración</span>
                    </>
                  )}
                </Button>
              </div>
            </section>
          </div>
        </form>
      )}
    </div>
  );
}