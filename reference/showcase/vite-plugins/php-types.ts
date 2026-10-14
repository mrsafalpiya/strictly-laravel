import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { Plugin } from 'vite';

const run = promisify(execFile);

type Options = {
    /** Files (relative to the project root) whose changes regenerate the types. */
    patterns?: RegExp[];
    command?: [string, ...string[]];
    debounceMs?: number;
};

/**
 * Keeps resources/js/generated/index.ts in sync with PHP: runs
 * `php artisan typescript:transform` when Vite starts (dev and build) and again whenever
 * a PHP file under app/ changes. Runs are debounced and never overlap. A failed run
 * (e.g. a half-typed PHP file) keeps the previous types and logs the error.
 */
/** What a failed `execFile` printed (its error carries `stderr`/`stdout`). */
function commandOutput(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null) {
        return undefined;
    }

    for (const stream of ['stderr', 'stdout'] as const) {
        const value: unknown =
            stream in error ? Reflect.get(error, stream) : undefined;

        if (typeof value === 'string' && value !== '') {
            return value;
        }
    }

    return undefined;
}

export function phpTypes({
    patterns = [/^app\/.*\.php$/],
    command = ['php', 'artisan', 'typescript:transform'],
    debounceMs = 150,
}: Options = {}): Plugin {
    let root = process.cwd();
    let queue: Promise<void> = Promise.resolve();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const generate = (log: {
        info(msg: string): void;
        warn(msg: string): void;
    }) => {
        queue = queue.then(async () => {
            const started = performance.now();

            try {
                await run(command[0], command.slice(1), { cwd: root });
                log.info(
                    `[php-types] generated in ${Math.round(performance.now() - started)}ms`,
                );
            } catch (error) {
                const output = commandOutput(error);
                log.warn(
                    `[php-types] generation failed, keeping previous types:\n${output ?? String(error)}`,
                );
            }
        });

        return queue;
    };

    return {
        name: 'php-types',
        enforce: 'pre',
        configResolved(config) {
            root = config.root;
        },
        buildStart() {
            return generate({
                info: (msg) => this.info(msg),
                warn: (msg) => this.warn(msg),
            });
        },
        handleHotUpdate({ file, server }) {
            const relative = file.slice(root.length + 1).replaceAll('\\', '/');

            if (!patterns.some((pattern) => pattern.test(relative))) {
                return;
            }

            clearTimeout(timer);
            timer = setTimeout(
                () => void generate(server.config.logger),
                debounceMs,
            );
        },
    };
}
