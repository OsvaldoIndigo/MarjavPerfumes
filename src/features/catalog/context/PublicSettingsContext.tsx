import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { SettingsRow } from '@/types/database';
import {
  DEFAULT_WHATSAPP_NUMBER,
  getPublicSettings,
} from '@/features/catalog/services/publicCatalogService';

const FALLBACK_SETTINGS: SettingsRow = {
  id: 1,
  store_name: 'MARJAV',
  whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
  instagram_url: 'https://instagram.com/marjav.2021',
  logo_url: null,
  logo_path: null,
  contact_info: null,
  updated_at: new Date().toISOString(),
};

const PublicSettingsContext = createContext<SettingsRow>(FALLBACK_SETTINGS);

export function PublicSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsRow>(FALLBACK_SETTINGS);

  useEffect(() => {
    let isMounted = true;

    getPublicSettings()
      .then((data) => {
        if (isMounted) {
          setSettings(data);
        }
      })
      .catch(() => {
        // Mantiene valores por defecto si aún no hay conexión o registro
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PublicSettingsContext.Provider value={settings}>
      {children}
    </PublicSettingsContext.Provider>
  );
}

export function usePublicSettings(): SettingsRow {
  return useContext(PublicSettingsContext);
}