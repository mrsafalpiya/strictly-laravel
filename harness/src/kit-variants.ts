import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, globSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { fixturesDir, repoRoot } from './paths.ts';
import { progress, runOrThrow } from './run.ts';

// The React starter kit asks which auth features to keep and cuts the rest out of its files (its chisel.php, which
// `laravel new` runs through `php artisan install:features`). The Base Kit fixture keeps every feature, since `laravel
// new --no-interaction` takes the defaults, and the installer offers no way to answer otherwise: deferring the hook
// needs an environment variable (LARAVEL_INSTALLER_DEFER_HOOKS) that a containerised PHP such as lerd's never sees,
// and running it after `laravel new` would run Pest's conversion of the tests before the kit's script, not after.
//
// So a variant with other features is rebuilt from the Base Kit: the files the script edits or deletes are restored
// from the kit's repository at the commit the Base Kit was generated from, the script runs with the variant's answers
// (as `install:features --answers` does, with LARAVEL_INSTALLER_NO_NODE's behaviour), the kit's `check:fix` formats
// them as the script would, and, for an app, the installer's Pest conversion runs on the tests. With every feature kept
// the result is the Base Kit itself, which `harness/tests/kit-variants.test.ts` checks (Problem P-211).

/** The starter kit's features, under the names its script and KitFeatures (the Composer package) give them. */
export const kitFeatures = ['email-verification', 'registration', '2fa', 'passkeys', 'password-confirmation'] as const;

export type KitFeature = (typeof kitFeatures)[number];

/** KitFeatures::key(): the features in kitFeatures' order joined by commas, or "none". */
export function featuresKey(features: readonly string[]): string {
    const ordered = kitFeatures.filter((feature) => features.includes(feature));

    return ordered.length === 0 ? 'none' : ordered.join(',');
}

/** A directory-safe name for a feature set: "none", or the features joined by "+". */
export function featuresSlug(features: readonly string[]): string {
    return featuresKey(features).replaceAll(',', '+');
}

/** Every subset of the features, each in kitFeatures' order. */
export function featureSubsets(features: readonly string[] = kitFeatures): KitFeature[][] {
    let subsets: KitFeature[][] = [[]];

    for (const feature of kitFeatures.filter((candidate) => features.includes(candidate))) {
        subsets = [...subsets, ...subsets.map((subset) => [...subset, feature])];
    }

    return subsets;
}

const kitSourceDir = join(fixturesDir, 'kit-source');

/** Check out laravel/react-starter-kit at $commit into .fixtures/kit-source, unless it already is. */
export async function prepareKitSource(commit: string): Promise<string> {
    const logFile = join(fixturesDir, 'kit-source.log');
    const head = existsSync(join(kitSourceDir, '.git'))
        ? execFileSync('git', ['rev-parse', 'HEAD'], { cwd: kitSourceDir, encoding: 'utf8' }).trim()
        : null;

    if (head === commit) {
        return kitSourceDir;
    }

    progress(`Checking out laravel/react-starter-kit at ${commit.slice(0, 12)} into .fixtures/kit-source`);
    rmSync(kitSourceDir, { recursive: true, force: true });
    mkdirSync(kitSourceDir, { recursive: true });
    writeFileSync(logFile, '');
    const inSource = { cwd: kitSourceDir, logFile };
    await runOrThrow('git', ['init', '--quiet'], inSource);
    await runOrThrow('git', ['fetch', '--quiet', '--depth', '1', 'https://github.com/laravel/react-starter-kit.git', commit], inSource);
    await runOrThrow('git', ['checkout', '--quiet', 'FETCH_HEAD'], inSource);

    return kitSourceDir;
}

/**
 * The app-relative files the kit's script edits or deletes, as they are in the kit's repository: every file with one
 * of its sections (`@chisel-<feature>`), every file its scripts name, and the scripts themselves.
 */
function scriptedFiles(source: string): string[] {
    const files = new Set<string>(['chisel.php', 'chisel-paths.php']);

    for (const script of ['chisel.php', 'chisel-paths.php']) {
        for (const [, path] of readFileSync(join(source, script), 'utf8').matchAll(/'([\w./-]+\.(?:php|tsx?))'/g)) {
            if (path !== undefined && existsSync(join(source, path))) {
                files.add(path);
            }
        }
    }

    for (const path of globSync('{app,config,database,resources,routes,tests}/**/*', { cwd: source })) {
        if (!path.includes('node_modules') && existsSync(join(source, path)) && /\.(php|tsx?)$/.test(path)) {
            if (readFileSync(join(source, path), 'utf8').includes('@chisel-')) {
                files.add(path);
            }
        }
    }

    return [...files].sort();
}

/**
 * Turn $dir, a copy of the Base Kit with its own vendor/ and node_modules/, into the kit generated with $features.
 * With `pest`, the tests get the installer's Pest conversion too (it installs Pest's drift plugin for the length of
 * the conversion, as the installer does); without it the tests the script edits stay PHPUnit classes, which is enough
 * to read every other file.
 */
export async function chiselBaseKit(dir: string, source: string, features: readonly string[], options: { logFile: string; pest: boolean }): Promise<void> {
    const inDir = { cwd: dir, logFile: options.logFile };
    const composerJson = readFileSync(join(dir, 'composer.json'), 'utf8');

    for (const path of scriptedFiles(source)) {
        mkdirSync(dirname(join(dir, path)), { recursive: true });
        writeFileSync(join(dir, path), readFileSync(join(source, path)));
    }

    const runner = join(dir, 'chisel-variant.php');
    writeFileSync(
        runner,
        `<?php

// Written by the Strictly Laravel harness: runs the kit's chisel.php with the answers in argv[1], as
// \`php artisan install:features --answers\` does with LARAVEL_INSTALLER_NO_NODE set (the harness runs check:fix itself).
require __DIR__.'/vendor/autoload.php';

$_ENV['LARAVEL_INSTALLER_NO_NODE'] = '1';
$script = require __DIR__.'/chisel.php';
$script->chisel($script->collectAnswers()->interactive(false)->withAnswers(['auth_features' => json_decode($argv[1], true)]));
`,
    );

    try {
        await runOrThrow('php', ['chisel-variant.php', JSON.stringify(features)], inDir);
    } finally {
        rmSync(runner, { force: true });
    }

    // The script's last step, which LARAVEL_INSTALLER_NO_NODE skips. Its edit to composer.json removes a script line
    // the Base Kit no longer has, and drops the file's final newline.
    await runOrThrow('pnpm', ['run', 'check:fix'], inDir);
    writeFileSync(join(dir, 'composer.json'), composerJson);

    if (options.pest) {
        await pestConversion(dir, inDir);
        writeFileSync(join(dir, 'composer.json'), composerJson);
    }
}

/** The installer's Pest conversion (NewCommand::installPest(), which `laravel new --pest` runs after the kit's script). */
async function pestConversion(dir: string, inDir: { cwd: string; logFile: string }): Promise<void> {
    const lock = readFileSync(join(dir, 'composer.lock'));

    await runOrThrow('composer', ['require', 'pestphp/pest-plugin-drift', '--dev', '--no-interaction'], inDir);
    await runOrThrow('php', ['vendor/bin/pest', '--drift'], inDir);
    await runOrThrow('composer', ['remove', 'pestphp/pest-plugin-drift', '--dev', '--no-interaction'], inDir);
    writeFileSync(join(dir, 'composer.lock'), lock);

    for (const file of globSync('tests/**/*.php', { cwd: dir })) {
        const content = readFileSync(join(dir, file), 'utf8');
        const converted = content.replace('\n\nuses(\\Illuminate\\Foundation\\Testing\\RefreshDatabase::class);', '');

        if (converted !== content) {
            writeFileSync(join(dir, file), converted);
        }
    }

    await runOrThrow('php', ['vendor/bin/pint', 'tests'], inDir);
}

/** Copy the Base Kit at $from into $to; vendor/ and node_modules/ are hard links unless `ownDependencies`. */
export async function copyBaseKit(from: string, to: string, options: { ownDependencies: boolean }): Promise<void> {
    rmSync(to, { recursive: true, force: true });
    mkdirSync(to, { recursive: true });
    const entries = readdirSync(from);
    const shared: string[] = options.ownDependencies ? [] : entries.filter((entry) => entry === 'vendor' || entry === 'node_modules');
    const own = entries.filter((entry) => !shared.includes(entry));

    await runOrThrow('cp', ['-a', ...own.map((entry) => join(from, entry)), to], { cwd: fixturesDir });

    if (shared.length > 0) {
        await runOrThrow('cp', ['-al', ...shared.map((entry) => join(from, entry)), to], { cwd: fixturesDir });
    }
}

/**
 * What the Base Kit at $baseKitDir holds at each of $paths in each of the 32 combinations of features (keyed by
 * featuresKey()): the file's Kit Conversion hash, `"exists"` for a test (the rebuilt variants' tests are the kit's
 * PHPUnit classes, not yet converted to Pest), or null when the variant has no such file. Rebuilding every variant
 * takes minutes, and the answer changes only with the Base Kit, so it is kept in .fixtures/kit-variants.json, keyed by
 * the Base Kit's stamp, $paths and this module.
 */
export async function variantFiles(
    baseKit: { dir: string; info: { kitMainHead: string | null } },
    paths: readonly string[],
    concurrency: number,
): Promise<Record<string, Record<string, string | null>>> {
    const cacheFile = join(fixturesDir, 'kit-variants.json');
    const key = variantsKey(baseKit.info, ...[...paths].sort());

    if (existsSync(cacheFile)) {
        const cached = JSON.parse(readFileSync(cacheFile, 'utf8')) as { key?: string; variants?: Record<string, Record<string, string | null>> };

        if (cached.key === key && cached.variants !== undefined) {
            return cached.variants;
        }
    }

    if (baseKit.info.kitMainHead === null) {
        throw new Error('The Base Kit stamp names no starter kit commit, so its feature variants cannot be rebuilt; regenerate it (--fresh)');
    }

    const source = await prepareKitSource(baseKit.info.kitMainHead);
    const variantsDir = join(fixturesDir, 'kit-variants');
    const variants: Record<string, Record<string, string | null>> = {};
    const pending = featureSubsets();
    mkdirSync(variantsDir, { recursive: true });
    progress(`Rebuilding the Base Kit with each of the ${pending.length} combinations of auth features (logs: .fixtures/kit-variants/*.log)`);

    // A few variants at a time: each runs the kit's script, Pint and Vite+ over a hard-linked copy of the Base Kit.
    await Promise.all(Array.from({ length: concurrency }, async () => {
        for (let features = pending.shift(); features !== undefined; features = pending.shift()) {
            const dir = join(variantsDir, featuresSlug(features));
            await copyBaseKit(baseKit.dir, dir, { ownDependencies: false });
            await chiselBaseKit(dir, source, features, { logFile: `${dir}.log`, pest: false });
            variants[featuresKey(features)] = Object.fromEntries(paths.map((path) => {
                const file = join(dir, path);

                return [path, !existsSync(file) ? null : path.startsWith('tests/') ? 'exists' : kitHash(readFileSync(file))];
            }));
            rmSync(dir, { recursive: true, force: true });
        }
    }));

    writeFileSync(cacheFile, `${JSON.stringify({ key, variants }, null, 4)}\n`);

    return variants;
}

/** The hash Kit Conversion compares (KitConversion::hash()): SHA-256 with "\r\n" line endings normalised to "\n". */
export function kitHash(content: string | Buffer): string {
    return createHash('sha256').update(content.toString().replaceAll('\r\n', '\n')).digest('hex');
}

/**
 * A key for what the Base Kit's variants hold: it changes with the Base Kit, with this module (how they are rebuilt),
 * and with $more.
 */
export function variantsKey(info: object, ...more: string[]): string {
    return createHash('sha256')
        .update(JSON.stringify(info))
        .update(readFileSync(join(repoRoot, 'harness', 'src', 'kit-variants.ts')))
        .update(JSON.stringify(more))
        .digest('hex');
}
