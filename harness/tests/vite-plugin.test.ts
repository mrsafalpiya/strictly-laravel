import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { afterEach, describe, test } from 'node:test';

import { createLogger, createServer, type ViteDevServer } from 'vite';

import { strictlyLaravel } from '../../packages/npm/vite/index.js';

// The Vite plugin through a real Vite dev server. The fixture-app harness proves the plugin regenerates real types in
// an installed app (overlay.test.ts); its timing (debounce, one run at a time, at most one queued) is too fine for
// that, so here the generator is a stand-in command that records each run and takes as long, or fails, as told.

/** Records `start` and `end` lines for each run in run.log, sleeps `ms`, then fails with `fail` as its stderr if set. */
const fakeGenerator = `
const { appendFileSync, readFileSync } = require('node:fs');
const [log, behaviour] = process.argv.slice(1);
const { ms, fail } = JSON.parse(readFileSync(behaviour, 'utf8'));
appendFileSync(log, 'start\\n');
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
appendFileSync(log, 'end\\n');
if (fail) {
    process.stderr.write(fail);
    process.exit(1);
}
`;

interface Harness {
    /** Every message the dev server logged, by level. */
    logged: { info: string[]; warn: string[]; error: string[] };
    /** The lines the stand-in generator recorded, in order (`start`, `end`, …). */
    runs(): string[];
    /** How long each later run takes, and whether it fails (with this output). */
    behave(behaviour: { ms: number; fail?: string }): void;
    /** Tell the dev server a file changed, as its file watcher does when a file is saved. */
    save(path: string): void;
    /** Tell the dev server a file was created. */
    create(path: string): void;
    /** Tell the dev server a file was deleted. */
    remove(path: string): void;
}

let server: ViteDevServer | undefined;
let scratch: string | undefined;

afterEach(async () => {
    await server?.close();
    server = undefined;

    if (scratch !== undefined) {
        rmSync(scratch, { recursive: true, force: true });
        scratch = undefined;
    }
});

async function startDevServer(behaviour: { ms: number; fail?: string } = { ms: 0 }): Promise<Harness> {
    scratch = mkdtempSync(join(tmpdir(), 'strictly-vite-plugin-'));
    const root = join(scratch, 'app-root');
    const log = join(scratch, 'run.log');
    const behaviourFile = join(scratch, 'behaviour.json');
    writeFileSync(log, '');
    writeFileSync(behaviourFile, JSON.stringify(behaviour));

    const logged: Harness['logged'] = { info: [], warn: [], error: [] };
    const logger = createLogger('info');
    logger.info = (message) => void logged.info.push(message);
    logger.warn = (message) => void logged.warn.push(message);
    logger.error = (message) => void logged.error.push(message);

    mkdirSync(root);

    server = await createServer({
        root,
        configFile: false,
        customLogger: logger,
        server: { middlewareMode: true, ws: false },
        plugins: [strictlyLaravel({ command: [process.execPath, '-e', fakeGenerator, log, behaviourFile] })],
    });
    const watcher = server.watcher;

    return {
        logged,
        runs: () => readFileSync(log, 'utf8').split('\n').filter((line) => line !== ''),
        behave: (next) => writeFileSync(behaviourFile, JSON.stringify(next)),
        save: (path) => void watcher.emit('change', join(root, path)),
        create: (path) => void watcher.emit('add', join(root, path)),
        remove: (path) => void watcher.emit('unlink', join(root, path)),
    };
}

/** Wait until `condition` holds, polling; fail after `timeoutMs`. */
async function until(what: string, condition: () => boolean, timeoutMs = 5000): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    while (!condition()) {
        if (Date.now() > deadline) {
            assert.fail(`timed out waiting until ${what}`);
        }

        await sleep(10);
    }
}

const finishedRuns = (dev: Harness) => dev.runs().filter((line) => line === 'end').length;

describe('Vite plugin: live regeneration', () => {
    test('generates when the dev server starts and again when a PHP file under app/ is saved', async () => {
        const dev = await startDevServer();
        await until('the first run finished', () => finishedRuns(dev) === 1);

        dev.save('app/Data/ProjectData.php');

        await until('a second run finished', () => finishedRuns(dev) === 2);
    });

    test('a PHP file created or deleted under app/ regenerates too', async () => {
        const dev = await startDevServer();
        await until('the first run finished', () => finishedRuns(dev) === 1);

        dev.create('app/Enums/ProjectStatus.php');
        await until('a run after the new file finished', () => finishedRuns(dev) === 2);

        dev.remove('app/Enums/ProjectStatus.php');
        await until('a run after the deleted file finished', () => finishedRuns(dev) === 3);
    });

    test('a page component file created or deleted under resources/js/pages regenerates too', async () => {
        const dev = await startDevServer();
        await until('the first run finished', () => finishedRuns(dev) === 1);

        dev.create('resources/js/pages/projects/index.tsx');
        await until('a run after the new page file finished', () => finishedRuns(dev) === 2);

        dev.remove('resources/js/pages/projects/index.tsx');
        await until('a run after the deleted page file finished', () => finishedRuns(dev) === 3);
    });

    test('files that are not PHP under app/ are ignored, and so are saves to page component files', async () => {
        const dev = await startDevServer();
        await until('the first run finished', () => finishedRuns(dev) === 1);

        dev.save('routes/web.php');
        dev.save('resources/js/pages/dashboard.tsx');
        dev.save('app/Data/README.md');
        dev.save('vendor/acme/app/Thing.php');
        dev.save('application/Thing.php');
        await sleep(500);

        assert.equal(finishedRuns(dev), 1);
    });

    test('a burst of saves regenerates once', async () => {
        const dev = await startDevServer();
        await until('the first run finished', () => finishedRuns(dev) === 1);

        for (let save = 0; save < 5; save++) {
            dev.save('app/Data/ProjectData.php');
            await sleep(20);
        }
        await until('a run after the burst finished', () => finishedRuns(dev) === 2);
        await sleep(500);

        assert.equal(finishedRuns(dev), 2);
    });

    test('saves during a run queue at most one more run, and runs never overlap', async () => {
        const dev = await startDevServer();
        await until('the first run finished', () => finishedRuns(dev) === 1);
        dev.behave({ ms: 800 });

        dev.save('app/Data/ProjectData.php');
        await until('the second run started', () => dev.runs().length === 3);
        // Three saves, each after the debounce, while the second run is still going.
        for (let save = 0; save < 3; save++) {
            dev.save('app/Data/ProjectData.php');
            await sleep(200);
        }
        await until('the queued run finished', () => finishedRuns(dev) === 3);
        await sleep(1000);

        assert.deepEqual(dev.runs(), ['start', 'end', 'start', 'end', 'start', 'end']);
    });

    test('a failed run is reported with its output, and the next save regenerates again', async () => {
        const dev = await startDevServer();
        await until('the first run finished', () => finishedRuns(dev) === 1);
        const parseError = 'app/Data/ProjectData.php:12: syntax error, unexpected token "public", expecting ")"';
        dev.behave({ ms: 0, fail: parseError });

        dev.save('app/Data/ProjectData.php');
        await until('the failure was reported', () => dev.logged.error.some((message) => message.includes(parseError)));

        assert.match(dev.logged.error.join('\n'), /types not regenerated, the previous ones are kept/);

        dev.behave({ ms: 0 });
        const generatedBefore = dev.logged.info.length;
        dev.save('app/Data/ProjectData.php');
        await until('a run after the fix finished', () => finishedRuns(dev) === 3);
        await until('the success was reported', () => dev.logged.info.slice(generatedBefore).some((message) => message.includes('types generated')));
    });
});
