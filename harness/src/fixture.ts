import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { availableParallelism, totalmem } from 'node:os';
import { join, relative } from 'node:path';

import { describeDiagnostic, failureReport } from './failure-report.ts';
import { chiselBaseKit, copyBaseKit, featuresKey, featuresSlug, kitFeatures, prepareKitSource } from './kit-variants.ts';
import { composerPackageDir, fixturesDir, npmPackageDir, repoRoot } from './paths.ts';
import { type BackgroundCommand, type CommandResult, ensureRootTooling, progress, run, runOrThrow, start } from './run.ts';

// Fixture apps are cached in layers, all directly under .fixtures/ (same depth, so the relative symlinks Composer
// and pnpm create for the local packages keep working in copies):
//
//   base-kit/   the latest Base Kit as `laravel new` generates it, with every auth feature. Regenerated on demand only.
//   base-kit-<features>/
//               the same Base Kit generated with only some auth features (src/kit-variants.ts), for the tests that
//               ask for them. Rebuilt when base-kit/ is.
//   installed/  base-kit + both Overlay packages required from local paths. Rebuilt when the Base Kit or a package
//               manifest changes. Package code is symlinked, so code edits need no rebuild.
//   installed-<features>/
//               the same for base-kit-<features>/.
//   <app>/      a throwaway copy of installed/ on which `strictly:install` has just run; one per test or scenario,
//               left in place afterwards for inspection. Its vendor/ and node_modules/ are hard links to installed/'s
//               (see createAppDir()), so an app costs about 30 MB and a second to create instead of about 1 GB and 9 s.
//   <app>.tmp/  the app's TMPDIR, so apps checked at the same time don't share caches such as PHPStan's.

const baseKitDir = join(fixturesDir, 'base-kit');
const baseKitStamp = join(fixturesDir, 'base-kit.stamp.json');

/** The starter kit's auth features a fixture keeps: every one, unless a test asks for a variant (src/kit-variants.ts). */
export type Features = readonly string[];

/** Whether $features is every feature, the Base Kit as `laravel new --no-interaction` generates it. */
function everyFeature(features: Features): boolean {
    return featuresKey(features) === featuresKey(kitFeatures);
}

/** A fixture layer's name for $features: "base-kit" or "installed", or with a "-<features>" suffix for a variant. */
function layerName(layer: 'base-kit' | 'installed', features: Features): string {
    return everyFeature(features) ? layer : `${layer}-${featuresSlug(features)}`;
}

/** The app directories every app shares with installed/ through hard links. */
const sharedDependencyDirs = ['vendor', 'node_modules'];

/**
 * Files inside the shared directories that tools rewrite in place, so each app gets its own copy. pnpm rewrites its
 * install state whenever `pnpm run` finds package.json changed, which `strictly:install` does.
 */
const appOwnedDependencyFiles = ['node_modules/.modules.yaml', 'node_modules/.pnpm-workspace-state-v1.json', 'node_modules/.pnpm/lock.yaml'];

const composerPackageName = 'mrsafalpiya/strictly-laravel';
const npmPackageName = '@mrsafalpiya/strictly-laravel';

/** The exact `laravel new` invocation: the supported Base Kit variant (React, Fortify auth, Pest) with pnpm. */
export const laravelNewArgs = [
    'new',
    'base-kit',
    '--react',
    '--pest',
    '--pnpm',
    '--no-boost',
    '--database=sqlite',
    '--git',
    '--no-interaction',
];

export interface BaseKitInfo {
    generatedAt: string;
    installer: string;
    /** The head of laravel/react-starter-kit `main` (what the installer pulls) just before generating. */
    kitMainHead: string | null;
    laravel: string | null;
}

/** Whether the next preparation should regenerate the latest Base Kit (`--fresh` or STRICTLY_FRESH_BASE_KIT=1). */
export function freshBaseKitRequested(): boolean {
    return process.env['STRICTLY_FRESH_BASE_KIT'] === '1';
}

/** Generate the latest Base Kit into .fixtures/base-kit unless a complete one is cached. */
export async function prepareBaseKit(options: { fresh?: boolean } = {}): Promise<BaseKitInfo> {
    const fresh = options.fresh ?? freshBaseKitRequested();

    if (!fresh && existsSync(baseKitStamp) && existsSync(baseKitDir)) {
        return readJson(baseKitStamp) as unknown as BaseKitInfo; // written by this module
    }

    ensureRootTooling();
    await ensureFixturesDir();
    rmSync(baseKitStamp, { force: true });
    rmSync(baseKitDir, { recursive: true, force: true });

    const logFile = join(fixturesDir, 'base-kit.log');
    writeFileSync(logFile, '');
    progress(`Generating the latest Base Kit into ${relative(repoRoot, baseKitDir)} (a few minutes; log: ${relative(repoRoot, logFile)})`);

    const laravel = join(repoRoot, 'vendor', 'bin', 'laravel');
    const mainHead = await run('git', ['ls-remote', 'https://github.com/laravel/react-starter-kit.git', 'refs/heads/main'], {
        cwd: fixturesDir,
    });
    // `-v`: at normal verbosity the installer shows only a spinner per step, so a failed step (exit 100 from a
    // network blip, say) would leave nothing in the log to say which step or why.
    await runOrThrow(laravel, [...laravelNewArgs, '-v'], { cwd: fixturesDir, logFile });

    const installer = (await runOrThrow(laravel, ['--version'], { cwd: fixturesDir })).output.trim();
    const info: BaseKitInfo = {
        generatedAt: new Date().toISOString(),
        installer,
        kitMainHead: mainHead.exitCode === 0 ? (/^[0-9a-f]{40}/.exec(mainHead.output)?.[0] ?? null) : null,
        laravel: lockedVersion(baseKitDir, 'laravel/framework'),
    };

    writeFileSync(baseKitStamp, `${JSON.stringify(info, null, 4)}\n`);

    return info;
}

/**
 * Ensure .fixtures/base-kit-<features> holds the cached Base Kit generated with only $features (src/kit-variants.ts),
 * and return its directory; for every feature, that is base-kit/ itself.
 */
export async function prepareBaseKitVariant(features: Features, options: { fresh?: boolean } = {}): Promise<{ dir: string; info: BaseKitInfo }> {
    const info = await prepareBaseKit(options);

    if (everyFeature(features)) {
        return { dir: baseKitDir, info };
    }

    const name = layerName('base-kit', features);
    const dir = join(fixturesDir, name);
    const stamp = join(fixturesDir, `${name}.stamp.json`);
    const key = createHash('sha256').update(JSON.stringify(info)).update(featuresKey(features)).digest('hex');

    if (existsSync(stamp) && existsSync(dir) && readJson(stamp).key === key) {
        return { dir, info };
    }

    if (info.kitMainHead === null) {
        throw new Error('The Base Kit stamp names no starter kit commit, so its feature variants cannot be rebuilt; regenerate it (--fresh)');
    }

    rmSync(stamp, { force: true });
    const logFile = join(fixturesDir, `${name}.log`);
    writeFileSync(logFile, '');
    progress(`Generating the Base Kit with only these auth features into ${relative(repoRoot, dir)}: ${featuresKey(features)} (log: ${relative(repoRoot, logFile)})`);
    const source = await prepareKitSource(info.kitMainHead);
    await copyBaseKit(baseKitDir, dir, { ownDependencies: true });
    await chiselBaseKit(dir, source, features, { logFile, pest: true });
    await runOrThrow('git', ['add', '--all'], { cwd: dir, logFile });
    await runOrThrow('git', ['commit', '--quiet', '--allow-empty', '--message', `Keep only these auth features: ${featuresKey(features)}`], { cwd: dir, logFile });
    writeFileSync(stamp, `${JSON.stringify({ key }, null, 4)}\n`);

    return { dir, info };
}

/**
 * Ensure .fixtures/installed holds the cached Base Kit with both Overlay packages required from local paths, or, for a
 * feature variant, .fixtures/installed-<features> the variant's.
 */
export async function prepareInstalledFixture(options: { fresh?: boolean; features?: Features } = {}): Promise<void> {
    const features = options.features ?? kitFeatures;
    const baseKit = await prepareBaseKitVariant(features, options);
    const name = layerName('installed', features);
    const installedDir = join(fixturesDir, name);
    const installedStamp = join(fixturesDir, `${name}.stamp.json`);
    const key = createHash('sha256')
        .update(JSON.stringify(baseKit.info))
        .update(featuresKey(features))
        .update(readFileSync(join(composerPackageDir, 'composer.json')))
        .update(readFileSync(join(npmPackageDir, 'package.json')))
        .digest('hex');

    if (existsSync(installedStamp) && existsSync(installedDir) && readJson(installedStamp).key === key) {
        await sealDependencies(installedDir);

        return;
    }

    rmSync(installedStamp, { force: true });
    await copyApp(baseKit.dir, installedDir);

    const logFile = join(fixturesDir, `${name}.log`);
    writeFileSync(logFile, '');
    progress(`Requiring the Overlay packages from local paths into ${relative(repoRoot, installedDir)}`);

    const inInstalled = { cwd: installedDir, logFile };
    const repository = { type: 'path', url: relative(installedDir, composerPackageDir), options: { symlink: true } };
    await runOrThrow('composer', ['config', 'repositories.strictly-laravel', JSON.stringify(repository)], inInstalled);
    await runOrThrow('composer', ['require', `${composerPackageName}:*`, '--no-interaction'], inInstalled);
    // Laravel Boost, which installs the package's guidance for AI coding agents, is the app's dev dependency (P-204).
    await runOrThrow('composer', ['require', 'laravel/boost', '--dev', '--no-interaction'], inInstalled);
    // A full pnpm install too. The Base Kit arrives with Chisel's npm-installed node_modules and no pnpm-lock.yaml: the
    // installer's own `pnpm install --ansi` is rejected by pnpm 11 ("Unknown option: 'ansi'") yet reported as done.
    // Copied out of pnpm's store, not hard-linked to it: every app hard-links installed/'s files (createAppDir()), and a
    // store file is already linked into every pnpm project on the machine. A licence file many packages share reaches
    // the filesystem's link limit (65000 on ext4) once a few worktrees each run the full suite, and `cp -al` then fails
    // with "Too many links".
    await runOrThrow('pnpm', ['add', `${npmPackageName}@link:${relative(installedDir, npmPackageDir)}`, '--package-import-method=copy'], inInstalled);
    await runOrThrow('git', ['add', '--all'], inInstalled);
    await runOrThrow('git', ['commit', '--quiet', '--message', 'Require the Overlay packages from local paths'], inInstalled);
    await sealDependencies(installedDir);

    writeFileSync(installedStamp, `${JSON.stringify({ key }, null, 4)}\n`);
}

/**
 * How many apps the test suite checks at once: STRICTLY_HARNESS_CONCURRENCY, or by default one per two CPUs and
 * per 2 GiB of memory (each check runs multi-threaded tools: PHPStan, oxlint, tsc, Pest).
 */
export function appConcurrency(): number {
    const configured = process.env['STRICTLY_HARNESS_CONCURRENCY'];

    if (configured !== undefined && configured !== '') {
        const value = Number(configured);

        if (!Number.isInteger(value) || value < 1) {
            throw new Error(`STRICTLY_HARNESS_CONCURRENCY must be a positive integer, got "${configured}"`);
        }

        return value;
    }

    return Math.max(1, Math.min(Math.floor(availableParallelism() / 2), Math.floor(totalmem() / 2 ** 31)));
}

export interface App {
    readonly name: string;
    readonly dir: string;
    /** Run `php artisan strictly:install --no-interaction`; throws if it exits non-zero, not on a reported row. */
    install(): Promise<CommandResult>;
    /** Run `composer ci:check`, or only its named step (`composer ci:check:<step>`). */
    check(step?: string): Promise<CommandResult>;
    /** The `ci:check` step names the installed app defines. */
    steps(): string[];
    commitAll(message: string): Promise<void>;
    /** Files changed since the last commit (`git status --porcelain`), excluding gitignored ones. */
    changedFiles(): string[];
    /** Run any command in the app, with the app's environment; never rejects on a non-zero exit code. */
    run(command: string, args: string[]): Promise<CommandResult>;
    /** Start a long-running command in the app, such as its dev server; stop() it when done. */
    start(command: string, args: string[]): BackgroundCommand;
}

/**
 * A fresh app: a copy of the installed fixture (call prepareInstalledFixture() first, with the same `features`) on which
 * `strictly:install` has run, unless `install: false`. Any previous app of the same name is replaced.
 * Throws when the install reports a row that isn't applied or unchanged, such as a Kit Conversion skip.
 */
export async function createApp(name: string, options: { install?: boolean; features?: Features } = {}): Promise<App> {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name) || /^(base-kit|installed|kit-source)(-|$)/.test(name)) {
        throw new Error(`Invalid app name "${name}"`);
    }

    const installedDir = join(fixturesDir, layerName('installed', options.features ?? kitFeatures));

    if (!existsSync(`${installedDir}.stamp.json`)) {
        throw new Error(`No installed fixture at ${relative(repoRoot, installedDir)}; call prepareInstalledFixture() first`);
    }

    const dir = join(fixturesDir, name);
    const logFile = join(fixturesDir, `${name}.log`);
    const tmpDir = join(fixturesDir, `${name}.tmp`);
    await createAppDir(installedDir, dir);
    rmSync(tmpDir, { recursive: true, force: true });
    mkdirSync(tmpDir);
    writeFileSync(logFile, '');
    const inApp = { cwd: dir, logFile, env: { TMPDIR: tmpDir } };

    const steps = (): string[] => {
        const scripts = (readJson(join(dir, 'composer.json')).scripts ?? {}) as Record<string, unknown>;

        return Object.keys(scripts)
            .filter((script) => script.startsWith('ci:check:'))
            .map((script) => script.slice('ci:check:'.length));
    };

    const app: App = {
        name,
        dir,
        install: () => runOrThrow('php', ['artisan', 'strictly:install', '--no-interaction'], inApp),
        check: async (step) => {
            if (step !== undefined && !steps().includes(step)) {
                throw new Error(`Unknown ci:check step "${step}"; this app defines: ${steps().join(', ') || '(none)'}`);
            }

            return run('composer', ['--no-ansi', step === undefined ? 'ci:check' : `ci:check:${step}`], inApp);
        },
        steps,
        commitAll: async (message) => {
            await runOrThrow('git', ['add', '--all'], inApp);
            await runOrThrow('git', ['commit', '--quiet', '--allow-empty', '--message', message], inApp);
        },
        changedFiles: () => {
            const status = execFileSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' });

            return status.split('\n').filter((line) => line.trim() !== '');
        },
        run: (command, args) => run(command, args, inApp),
        start: (command, args) => start(command, args, inApp),
    };

    if (options.install ?? true) {
        const { diagnostics } = failureReport('strictly:install', (await app.install()).output);

        if (diagnostics.length > 0) {
            throw new Error(`strictly:install reported (log: ${relative(repoRoot, logFile)}):\n${diagnostics.map(describeDiagnostic).join('\n')}`);
        }
    }

    return app;
}

/**
 * Create .fixtures/ as an empty git repository of its own. oxlint and oxfmt (Vite+) honour .gitignore files up to the
 * enclosing repository root; without this boundary the monorepo's `/.fixtures/` rule hides every file of a fixture
 * app (Chisel's `vp check --fix` fails while `laravel new` runs, before the app has its own repository).
 */
async function ensureFixturesDir(): Promise<void> {
    mkdirSync(fixturesDir, { recursive: true });

    if (!existsSync(join(fixturesDir, '.git'))) {
        await runOrThrow('git', ['init', '--quiet'], { cwd: fixturesDir });
    }
}

/**
 * Create an app directory from installed/: its own files are copied, and vendor/ and node_modules/ are hard links to
 * installed/'s files, which are about 97% of its size. The files they share are read-only (sealDependencies()), so a
 * tool that writes into a dependency in place fails with "Permission denied" instead of changing it for every later
 * app; such a file belongs in appOwnedDependencyFiles.
 */
async function createAppDir(installedDir: string, dir: string): Promise<void> {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir);
    const entries = readdirSync(installedDir);
    const own = entries.filter((entry) => !sharedDependencyDirs.includes(entry)).map((entry) => join(installedDir, entry));
    const shared = entries.filter((entry) => sharedDependencyDirs.includes(entry)).map((entry) => join(installedDir, entry));

    await runOrThrow('cp', ['-a', ...own, dir], { cwd: fixturesDir });
    await runOrThrow('cp', ['-al', ...shared, dir], { cwd: fixturesDir });

    for (const file of appOwnedDependencyFiles) {
        const target = join(dir, file);

        if (existsSync(target)) {
            rmSync(target);
            copyFileSync(join(installedDir, file), target);
            chmodSync(target, 0o644);
        }
    }
}

/** Make every file in an installed fixture's shared directories read-only; apps hard-link them (createAppDir()). */
async function sealDependencies(installedDir: string): Promise<void> {
    const dirs = sharedDependencyDirs.map((entry) => join(installedDir, entry)).filter((dir) => existsSync(dir));

    // Symlinks (the Overlay packages, pnpm's layout) are skipped: chmod would follow them into the monorepo.
    await runOrThrow('find', [...dirs, '-type', 'f', '-perm', '/222', '-exec', 'chmod', 'a-w', '{}', '+'], { cwd: fixturesDir });
}

async function copyApp(from: string, to: string): Promise<void> {
    rmSync(to, { recursive: true, force: true });
    // `cp -a` keeps symlinks as they are (vendor/ and node_modules/ rely on relative ones) and is much faster than fs.cp.
    await runOrThrow('cp', ['-a', from, to], { cwd: fixturesDir });
}

function lockedVersion(appDir: string, packageName: string): string | null {
    const lock = readJson(join(appDir, 'composer.lock'));
    const packages = Array.isArray(lock.packages) ? (lock.packages as { name?: unknown; version?: unknown }[]) : [];
    const version = packages.find((entry) => entry.name === packageName)?.version;

    return typeof version === 'string' ? version : null;
}

function readJson(file: string): Record<string, unknown> {
    const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'));

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error(`${file} is not a JSON object`);
    }

    return parsed as Record<string, unknown>;
}
