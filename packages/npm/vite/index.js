// @ts-check
/**
 * The Strictly Laravel Vite plugin. `strictly:install` registers it in the app's vite.config.ts. While the dev server
 * runs (`composer dev`), it regenerates the TypeScript types (`@/generated`) whenever a PHP file under app/ is saved,
 * so the editor sees a changed Data class or enum without a command (Problem P-064):
 *
 * - saves are debounced, runs never overlap, and saves during a run queue at most one more run;
 * - a run that fails (a half-written PHP file) leaves the last good types in place, because `strictly:generate`
 *   writes nothing then, and the failure is logged without stopping the dev server.
 *
 * Builds, typecheck and `ci:check` don't need it: their scripts run `php artisan strictly:generate` first. Wayfinder's
 * own Vite plugin regenerates the routes, so this one generates only the types.
 *
 * @import { Logger, Plugin } from 'vite'
 */
import { execFile } from 'node:child_process';
import { relative, sep } from 'node:path';

/** How long to wait after a save for more saves before regenerating. */
const debounceMs = 150;

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
        apply: 'serve',
        configureServer(server) {
            const root = server.config.root;
            const regenerate = serialised(() => generate(command, root, server.config.logger));

            /** @param {string} file */
            const onFileEvent = (file) => {
                if (!isAppPhpFile(root, file)) {
                    return;
                }

                clearTimeout(timer);
                timer = setTimeout(regenerate, debounceMs);
            };

            server.watcher.on('add', onFileEvent);
            server.watcher.on('change', onFileEvent);
            server.watcher.on('unlink', onFileEvent);

            regenerate();
        },
        buildEnd() {
            clearTimeout(timer);
        },
    };
}

/**
 * @param {string} root
 * @param {string} file
 */
function isAppPhpFile(root, file) {
    const path = relative(root, file).split(sep).join('/');

    return path.startsWith('app/') && path.endsWith('.php');
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
