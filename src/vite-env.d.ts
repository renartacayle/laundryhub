/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_COMMERCIAL_MODE: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_MERCHANT_QRIS_NMID?: string;
  readonly VITE_MERCHANT_NAME?: string;
  readonly VITE_MERCHANT_CITY?: string;
  readonly VITE_DEFAULT_PRINTER_WIDTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
