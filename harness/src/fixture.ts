import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describeDiagnostic, failureReport } from './failure-report.ts';
import { composerPackageDir, fixturesDir, npmPackageDir, repoRoot } from './paths.ts';
import { type CommandResult, ensureRootTooling, progress, run, runOrThrow } from './run.ts';

// Fixture apps are cached in layers, all directly under .fixtures/ (same depth, so the relative symlinks Composer
// and pnpm create for the local packages keep working in copies):
//
//   base-kit/   the latest Base Kit as `laravel new` generates it. Regenerated on demand only.
//   installed/  base-kit + both Overlay packages required from local paths. Rebuilt when the Base Kit or a package
//               manifest changes. Package code is symlinked, so code edits need no rebuild.
//   <app>/      a throwaway copy of installed/ on which `strictly:install` has just run; one per test or scenario,
//               left in place afterwards for inspection.

const baseKitDir = join(fixturesDir, 'base-kit');
const baseKitStamp = join(fixturesDir, 'base-kit.stamp.json');
const installedDir = join(fixturesDir, 'installed');
const installedStamp = join(fixturesDir, 'installed.stamp.json');

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
    await runOrThrow(laravel, laravelNewArgs, { cwd: fixturesDir, logFile });

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

/** Ensure .fixtures/installed holds the cached Base Kit with both Overlay packages required from local paths. */
export async function prepareInstalledFixture(options: { fresh?: boolean } = {}): Promise<void> {
    const baseKit = await prepareBaseKit(options);
    const key = createHash('sha256')
        .update(JSON.stringify(baseKit))
        .update(readFileSync(join(composerPackageDir, 'composer.json')))
        .update(readFileSync(join(npmPackageDir, 'package.json')))
        .digest('hex');

    if (existsSync(installedStamp) && existsSync(installedDir) && readJson(installedStamp).key === key) {
        return;
    }

    rmSync(installedStamp, { force: true });
    await copyApp(baseKitDir, installedDir);

    const logFile = join(fixturesDir, 'installed.log');
    writeFileSync(logFile, '');
    progress(`Requiring the Overlay packages from local paths into ${relative(repoRoot, installedDir)}`);

    const inInstalled = { cwd: installedDir, logFile };
    const repository = { type: 'path', url: relative(installedDir, composerPackageDir), options: { symlink: true } };
    await runOrThrow('composer', ['config', 'repositories.strictly-laravel', JSON.stringify(repository)], inInstalled);
    await runOrThrow('composer', ['require', `${composerPackageName}:*`, '--no-interaction'], inInstalled);
    // A full pnpm install too. The Base Kit arrives with Chisel's npm-installed node_modules and no pnpm-lock.yaml: the
    // installer's own `pnpm install --ansi` is rejected by pnpm 11 ("Unknown option: 'ansi'") yet reported as done.
    await runOrThrow('pnpm', ['add', `${npmPackageName}@link:${relative(installedDir, npmPackageDir)}`], inInstalled);
    await runOrThrow('git', ['add', '--all'], inInstalled);
    await runOrThrow('git', ['commit', '--quiet', '--message', 'Require the Overlay packages from local paths'], inInstalled);

    writeFileSync(installedStamp, `${JSON.stringify({ key }, null, 4)}\n`);
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
}

/**
 * A fresh app: a copy of the installed fixture (call prepareInstalledFixture() first) on which
 * `strictly:install` has run, unless `install: false`. Any previous app of the same name is replaced.
 * Throws when the install reports a row that isn't applied or unchanged, such as a Kit Conversion skip.
 */
export async function createApp(name: string, options: { install?: boolean } = {}): Promise<App> {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name) || ['base-kit', 'installed'].includes(name)) {
        throw new Error(`Invalid app name "${name}"`);
    }

    if (!existsSync(installedStamp)) {
        throw new Error('No installed fixture; call prepareInstalledFixture() first');
    }

    const dir = join(fixturesDir, name);
    const logFile = join(fixturesDir, `${name}.log`);
    await copyApp(installedDir, dir);
    writeFileSync(logFile, '');

    const steps = (): string[] => {
        const scripts = (readJson(join(dir, 'composer.json')).scripts ?? {}) as Record<string, unknown>;

        return Object.keys(scripts)
            .filter((script) => script.startsWith('ci:check:'))
            .map((script) => script.slice('ci:check:'.length));
    };

    const app: App = {
        name,
        dir,
        install: () => runOrThrow('php', ['artisan', 'strictly:install', '--no-interaction'], { cwd: dir, logFile }),
        check: async (step) => {
            if (step !== undefined && !steps().includes(step)) {
                throw new Error(`Unknown ci:check step "${step}"; this app defines: ${steps().join(', ') || '(none)'}`);
            }

            return run('composer', ['--no-ansi', step === undefined ? 'ci:check' : `ci:check:${step}`], { cwd: dir, logFile });
        },
        steps,
        commitAll: async (message) => {
            await runOrThrow('git', ['add', '--all'], { cwd: dir, logFile });
            await runOrThrow('git', ['commit', '--quiet', '--allow-empty', '--message', message], { cwd: dir, logFile });
        },
        changedFiles: () => {
            const status = execFileSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' });

            return status.split('\n').filter((line) => line.trim() !== '');
        },
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
