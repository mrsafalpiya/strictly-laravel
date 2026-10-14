/// <reference types="vite/client" />

/** The `VITE_*` variables the app reads (Vite types the rest of `import.meta.env` as `any`). */
interface ImportMetaEnv {
    readonly VITE_APP_NAME?: string;
}
