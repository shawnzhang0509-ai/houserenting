/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NTFY_URL?: string;
  readonly VITE_ADMIN_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
