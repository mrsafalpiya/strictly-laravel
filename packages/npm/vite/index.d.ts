import type { Plugin } from 'vite';

export interface StrictlyLaravelOptions {
    /**
     * The command that regenerates the types, run in the project root. Defaults to
     * `php artisan strictly:generate --skip-routes`; override it to run PHP elsewhere (e.g. Sail).
     */
    command?: readonly [string, ...string[]];
}

/**
 * Regenerates the TypeScript types (`@/generated`) whenever a PHP file under app/ is saved, or a page component file
 * is created or deleted under resources/js/pages, while the dev server runs.
 * Saves are debounced, runs never overlap, and a failed run keeps the previous types and is logged.
 * In dev and in builds, warns when the installed Composer package's version differs from this npm package's.
 */
export declare function strictlyLaravel(options?: StrictlyLaravelOptions): Plugin;
