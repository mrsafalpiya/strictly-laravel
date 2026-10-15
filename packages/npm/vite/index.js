// @ts-check
/**
 * The Strictly Laravel Vite plugin. `strictly:install` registers it in the app's vite.config.ts. While the dev server
 * runs (`composer dev`), it regenerates the TypeScript types (`@/generated`) whenever a PHP file under app/ is saved,
 * so the editor sees a changed Data class or enum without a command (Problem P-064), whenever a lang file changes, so
 * `t()` takes the new keys and params (Problems P-055, P-056), and whenever a page component
 * file is created or deleted under resources/js/pages, so the generated checks that tie each one to its Page class
 * list the files there are (Problem P-010):
 *
 * - saves are debounced, runs never overlap, and saves during a run queue at most one more run;
 * - a run that fails (a half-written PHP file) leaves the last good types in place, because `strictly:generate`
 *   writes nothing then, and the failure is logged without stopping the dev server.
 *
 * Builds, typecheck and `ci:check` don't need it: their scripts run `php artisan strictly:generate` first. Wayfinder's
 * own Vite plugin regenerates the routes, so this one generates only the types.
 *
 * In dev and in builds it also warns when the installed Composer package's version differs from this npm package's
 * (Problem P-081).
 *
 * @import { Logger, Plugin } from 'vite'
 */
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** How long to wait after a save for more saves before regenerating. */
const debounceMs = 150;

const composerPackage = 'mrsafalpiya/strictly-laravel';
const npmPackage = '@mrsafalpiya/strictly-laravel';

/**
 * @typedef {object} StrictlyLaravelOptions
 * @property {readonly [string, ...string[]]} [command] The command that regenerates the types, run in the project
 *   root. Defaults to `php artisan strictly:generate --skip-routes`; override it to run PHP elsewhere (e.g. Sail).
 */

/**
 * @param {StrictlyLaravelOptions} [options]
 * @returns {Plugin}
 */
export function strictlyLaravel({ command = ['php', 'artisan', 'strictly:generate', '--skip-routes'] } = {}) {
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let timer;

    return {
        name: '@mrsafalpiya/strictly-laravel',
        configResolved(config) {
            const mismatch = versionMismatch(config.root);

            if (mismatch !== null) {
                config.logger.warn(`[strictly] ${mismatch}`, { timestamp: config.command === 'serve' });
            }
        },
        configureServer(server) {
            const root = server.config.root;
            const regenerate = serialised(() => generate(command, root, server.config.logger));

            /**
             * @param {'add' | 'change' | 'unlink'} event
             * @returns {(file: string) => void}
             */
            const on = (event) => (file) => {
                if (!regeneratesTypes(event, relative(root, file).split(sep).join('/'))) {
                    return;
                }

                clearTimeout(timer);
                timer = setTimeout(regenerate, debounceMs);
            };

            server.watcher.on('add', on('add'));
            server.watcher.on('change', on('change'));
            server.watcher.on('unlink', on('unlink'));

            regenerate();
        },
        buildEnd() {
            clearTimeout(timer);
        },
    };
}

/**
 * Problem P-081: the Composer and npm packages are released together under one version, and a project where only one
 * was updated generates types with one release and checks them with the other's helpers, rules and JSX types. Returns
 * the warning when the Composer package installed in the project (vendor/composer/installed.json) has a different
 * version than this npm package, or null when they match or either is unknown (no vendor/ yet, or a Composer dev
 * version such as `dev-main`, which carries no release number).
 *
 * @param {string} root the project root
 * @returns {string | null}
 */
function versionMismatch(root) {
    const npmVersion = /** @type {{ version: string }} */ (readJson(new URL('../package.json', import.meta.url))).version;
    const installed = readJson(join(root, 'vendor', 'composer', 'installed.json'));
    // Composer 2 writes { packages: [...] }; Composer 1 wrote the list itself.
    const packages = Array.isArray(installed) ? installed : installed?.packages;
    const entry = Array.isArray(packages) ? packages.find((candidate) => candidate?.name === composerPackage) : undefined;
    const composerVersion = typeof entry?.version === 'string' ? entry.version.replace(/^v/, '') : null;

    if (composerVersion === null || composerVersion.startsWith('dev-') || composerVersion.endsWith('-dev') || composerVersion === npmVersion) {
        return null;
    }

    return (
        `the Composer package ${composerPackage} is ${composerVersion} but the npm package ${npmPackage} is ${npmVersion}. ` +
        'They are released together: update both to the same version, then run `php artisan strictly:install` ' +
        `(vendor/${composerPackage}/UPGRADE.md lists what each release needs).`
    );
}

/**
 * @param {string | URL} file
 * @returns {any} the parsed JSON, or undefined when the file doesn't exist or isn't JSON
 */
function readJson(file) {
    try {
        return JSON.parse(readFileSync(file, 'utf8'));
    } catch {
        return undefined;
    }
}

/**
 * Whether a file event changes the types: any PHP file under app/, any lang file (the app's own, not lang/vendor/'s),
 * and a page component file created or deleted (its contents aren't generated from, so saving one changes nothing).
 *
 * @param {'add' | 'change' | 'unlink'} event
 * @param {string} path relative to the project root, with forward slashes
 */
function regeneratesTypes(event, path) {
    if (path.startsWith('app/')) {
        return path.endsWith('.php');
    }

    if (path.startsWith('lang/')) {
        return !path.startsWith('lang/vendor/') && (path.endsWith('.php') || path.endsWith('.json'));
    }

    return event !== 'change' && path.startsWith('resources/js/pages/');
}

/**
 * Wrap `run` so calls never overlap: a call during a run queues one more run after it, and any further calls during
 * that run fold into the queued one.
 *
 * @param {() => Promise<void>} run
 * @returns {() => void}
 */
function serialised(run) {
    let running = false;
    let queued = false;

    const loop = async () => {
        running = true;

        do {
            queued = false;
            await run();
        } while (queued);

        running = false;
    };

    return () => {
        if (running) {
            queued = true;

            return;
        }

        void loop();
    };
}

/**
 * Run the generator once; report the outcome and never reject.
 *
 * @param {readonly [string, ...string[]]} command
 * @param {string} root
 * @param {Logger} logger
 * @returns {Promise<void>}
 */
function generate([file, ...args], root, logger) {
    const started = performance.now();

    return new Promise((resolve) => {
        execFile(file, args, { cwd: root, maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error === null) {
                logger.info(`[strictly] types generated in ${Math.round(performance.now() - started)}ms`, { timestamp: true });
            } else {
                const output = `${stdout}${stderr}`.trim() || error.message;
                logger.error(`[strictly] types not regenerated, the previous ones are kept:\n${output}`, { timestamp: true });
            }

            resolve();
        });
    });
}
