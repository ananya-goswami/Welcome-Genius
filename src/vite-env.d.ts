/// <reference types="vite/client" />

interface ImportMetaEnv {
  // §10.5, both optional: the app must run fine without them (Phase 8 note).
  readonly VITE_LOG_ENDPOINT?: string;
  readonly VITE_LOG_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
