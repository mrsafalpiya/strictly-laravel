import assert from 'node:assert/strict';
import { appendFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { before, describe, test as nodeTest } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';

import plugin from '../../packages/npm/oxlint/index.js';
import { failureReport } from '../src/failure-report.ts';
import { appConcurrency, createApp, prepareInstalledFixture } from '../src/fixture.ts';
import { fixturesDir, scenariosDir } from '../src/paths.ts';
import { type BackgroundCommand, type CommandResult, tail } from '../src/run.ts';
import { assertOutcome, loadScenarios, runScenario, type Scenario } from '../src/scenario.ts';
import { harnessShard, type ShardedTest, testsInShard } from '../src/shard.ts';

const collected: ShardedTest[] = [];

/**
 * Collect a test for the shard to register. `cost` is roughly how many seconds it takes on one CPU: an app test runs one
 * or more checks in a fresh app, from a few seconds to about 30 for a dev server or a fresh clone.
 */
function test(name: string, fn: () => Promise<void>, cost = 15): void {
    collected.push({ name, cost, fn });
}

// Every test here works on its own copy of one cached app (latest Base Kit + Overlay installed from local paths), in its
// own directory with its own TMPDIR, so they run concurrently (appConcurrency(), STRICTLY_HARNESS_CONCURRENCY). They
// are collected by test() above and registered at the end, so a CI shard (STRICTLY_HARNESS_SHARD, src/shard.ts) runs
// only its share.
describe('Overlay on the latest Base Kit', { concurrency: appConcurrency() }, () => {
    before(async () => {
        await prepareInstalledFixture();
    });

    test('a fresh install passes ci:check', async () => {
        const app = await createApp('fresh-install');

        assertOutcome(await app.check(), { outcome: 'pass' });
    });

    test("the Overlay leaves the Base Kit's TypeScript and Vite+ versions alone", async () => {
        const app = await createApp('toolchain-versions');
        const toolchain = (dir: string) =>
            ['typescript', 'vite-plus'].map((name) => {
                const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as Record<string, Record<string, string> | undefined>;
                const installed = JSON.parse(readFileSync(join(dir, 'node_modules', name, 'package.json'), 'utf8')) as { version: string };

                return { name, required: manifest['dependencies']?.[name] ?? manifest['devDependencies']?.[name], installed: installed.version };
            });

        assert.deepEqual(toolchain(app.dir), toolchain(join(fixturesDir, 'base-kit')));
    });

    test('strictly:install is idempotent: running it again on a fully installed app is a no-op', async () => {
        const app = await createApp('idempotent-install');
        await app.commitAll('after the first strictly:install');

        const again = await app.install();

        assert.deepEqual(app.changedFiles(), [], 'a second strictly:install changed files');
        const changedRows = installerRows(again.output).filter(({ status }) => status !== 'unchanged');
        assert.deepEqual(changedRows, [], 'a second strictly:install reported rows other than unchanged');
        assertOutcome(await app.check('install'), { outcome: 'pass' });
    });

    test("re-running strictly:install restores a missing hook and reports one it can't apply, leaving that file alone", async () => {
        const app = await createApp('reinstall-unpatchable-hook');
        const viteConfig = join(app.dir, 'vite.config.ts');
        const gitignore = join(app.dir, '.gitignore');
        // The Vite plugin removed, and a comment where the installer expects the plugin list to start a line.
        writeFileSync(
            viteConfig,
            readFileSync(viteConfig, 'utf8')
                .replace(/^import \{ strictlyLaravel \}.*\n/m, '')
                .replace(/^ {8}strictlyLaravel\(\),\n/m, '')
                .replace('plugins: lazyPlugins(() => [\n', "plugins: lazyPlugins(() => [ // the app's plugins\n"),
        );
        const edited = readFileSync(viteConfig, 'utf8');
        writeFileSync(gitignore, readFileSync(gitignore, 'utf8').replace(/^\/resources\/js\/generated\n/m, ''));

        const reinstall = await app.run('php', ['artisan', 'strictly:install', '--no-interaction']);

        assert.notEqual(reinstall.exitCode, 0, 'strictly:install succeeded although it could not apply a hook');
        assert.equal(readFileSync(viteConfig, 'utf8'), edited, 'strictly:install changed the vite.config.ts it could not patch');
        assert.deepEqual(
            installerRows(reinstall.output).filter(({ status }) => status !== 'unchanged'),
            [
                { label: 'vite.config.ts: Strictly Laravel Vite plugin', status: 'not applied' },
                { label: 'Generated TypeScript gitignored', status: 'applied' },
            ],
        );
        assert.match(reinstall.output, /ERROR\s+vite\.config\.ts has no `plugins: \[` array written over several lines; add `import \{ strictlyLaravel \}/);
        assert.match(readFileSync(gitignore, 'utf8'), /^\/resources\/js\/generated$/m, 'the missing .gitignore entry was not restored');
        const check = await app.check('install');
        assertOutcome(check, {
            outcome: 'fail',
            errorContains: 'Strictly Laravel is not fully applied to this app: vite.config.ts: Strictly Laravel Vite plugin (not applied).',
        });
        const guide = /(vendor\/mrsafalpiya\/strictly-laravel\/UPGRADE\.md) lists what each release needs/.exec(check.output)?.[1];
        assert.ok(guide !== undefined && existsSync(join(app.dir, guide)), 'the check does not point to an upgrade guide the app has');
    });

    test('Kit Conversion leaves a Base Kit file with unknown content untouched and reports it', async () => {
        const app = await createApp('kit-conversion-unknown-content', { install: false });
        const routes = join(app.dir, 'routes', 'web.php');
        appendFileSync(routes, "\n// The app's own edit\n");
        const edited = readFileSync(routes, 'utf8');

        const install = await app.install();

        assert.equal(readFileSync(routes, 'utf8'), edited, 'Kit Conversion overwrote a file with unknown content');
        assert.deepEqual(failureReport('strictly:install', install.output).diagnostics, [
            { file: 'routes/web.php', message: 'skipped (unknown content)' },
        ]);
    });

    test('an unconverted phpstan.neon still includes the PHPStan extension', async () => {
        const app = await createApp('phpstan-include-unconverted', { install: false });
        const phpstanNeon = join(app.dir, 'phpstan.neon');
        writeFileSync(phpstanNeon, `# The app's own note\n${readFileSync(phpstanNeon, 'utf8')}`);

        await app.install();
        await app.commitAll('after strictly:install');
        await app.install();

        assert.deepEqual(app.changedFiles(), [], 'a second strictly:install changed files');
        assert.match(readFileSync(phpstanNeon, 'utf8'), /^# The app's own note\n/, 'the app\'s edit to phpstan.neon was lost');

        mkdirSync(join(app.dir, 'app', 'Support'), { recursive: true });
        writeFileSync(
            join(app.dir, 'app', 'Support', 'AppName.php'),
            `<?php

namespace App\\Support;

final class AppName
{
    public static function shouted(): string
    {
        // @phpstan-ignore argument.type
        return strtoupper(config('app.name'));
    }
}
`,
        );

        assertOutcome(await app.check('test'), { outcome: 'fail', errorContains: 'Ignore with identifier argument.type has no comment.' });
    });

    test('feature tests record Contracts when Kit Conversion skipped an edited tests/Pest.php', async () => {
        const app = await createApp('pest-contracts-unconverted', { install: false });
        const pestFile = join(app.dir, 'tests', 'Pest.php');
        // The app's own edit, which also gives the Base Kit's example helper the return type PHPStan max asks for.
        writeFileSync(
            pestFile,
            readFileSync(pestFile, 'utf8')
                .replace('<?php\n', "<?php\n\n// The app's own note\n")
                .replace('function something()\n', 'function something(): void\n'),
        );

        await app.install();
        await app.commitAll('after strictly:install');
        await app.install();

        assert.deepEqual(app.changedFiles(), [], 'a second strictly:install changed files');
        assert.match(readFileSync(pestFile, 'utf8'), /^<\?php\n\n\/\/ The app's own note\n/, "the app's edit to tests/Pest.php was lost");

        cpSync(join(scenariosDir, 'hand-built-page-prop-fails-contract', 'files'), app.dir, { recursive: true });

        assertOutcome(await app.check('test'), { outcome: 'pass' });
        assertOutcome(await app.check('tsc'), {
            outcome: 'fail',
            errorContains: "error TS2353: Object literal may only specify known properties, and '\"id\"' does not exist in type",
        });
    });

    test('the strictness flags and the oxlint plugin reach a tsconfig.json and lint config the app edited', async () => {
        const app = await createApp('ts-strictness-edited-config', { install: false });
        const tsconfig = join(app.dir, 'tsconfig.json');
        const viteConfig = join(app.dir, 'vite.config.ts');
        writeFileSync(
            tsconfig,
            readFileSync(tsconfig, 'utf8')
                .replace(/^\s*\/\/ "noUncheckedIndexedAccess".*\n/m, '')
                .replace(/^(\s*)\/\/ ("noImplicitOverride": )true,.*$/m, '$1$2false,'),
        );
        writeFileSync(
            viteConfig,
            readFileSync(viteConfig, 'utf8').replace(/^( {4}lint: \{\n)/m, "$1        jsPlugins: [],\n        rules: {\n            'no-debugger': 'error',\n        },\n"),
        );

        await app.install();
        await app.commitAll('after strictly:install');
        await app.install();

        assert.deepEqual(app.changedFiles(), [], 'a second strictly:install changed files');
        const lintConfig = readFileSync(viteConfig, 'utf8');
        assert.match(lintConfig, /jsPlugins: \['@mrsafalpiya\/strictly-laravel\/oxlint'\],/);
        for (const rule of Object.keys(plugin.rules)) {
            assert.ok(lintConfig.includes(`'strictly/${rule}': 'error',`), `the oxlint rule strictly/${rule} is not turned on`);
        }
        assertOutcome(await app.check('lint'), { outcome: 'pass' });

        mkdirSync(join(app.dir, 'resources', 'js', 'lib'), { recursive: true });
        writeFileSync(join(app.dir, 'resources', 'js', 'lib', 'first-word.ts'), "export const firstWord = (text: string) => text.split(' ')[0].length;\n");
        writeFileSync(join(app.dir, 'resources', 'js', 'lib', 'home.ts'), "export const home = '/dashboard';\nexport const go = () => fetch('/dashboard');\n");

        assertOutcome(await app.check('tsc'), { outcome: 'fail', errorContains: "error TS2532: Object is possibly 'undefined'." });
        assertOutcome(await app.check('lint'), { outcome: 'fail', errorContains: 'strictly(no-hardcoded-urls): Hard-coded URL "/dashboard"' });
    });

    test('make:page creates a Page class and its page component, already in sync', async () => {
        const app = await createApp('make-page');

        assertOutcome(await app.run('php', ['artisan', 'make:page', 'projects/show-issue']), { outcome: 'pass' });

        assert.ok(existsSync(join(app.dir, 'app', 'Pages', 'Projects', 'ShowIssuePage.php')), 'no Page class');
        assert.ok(existsSync(join(app.dir, 'resources', 'js', 'pages', 'projects', 'show-issue.tsx')), 'no page component');
        // In sync, but no test renders it yet, so tsc never checked its props against a Contract.
        assertOutcome(await app.check(), {
            outcome: 'fail',
            errorContains: '✗ projects/show-issue: no feature test renders this page: add a feature test that requests a route returning App\\Pages\\Projects\\ShowIssuePage.',
        });

        writeFileSync(
            join(app.dir, 'tests', 'Feature', 'ShowIssuePageTest.php'),
            `<?php

use App\\Pages\\Projects\\ShowIssuePage;
use Illuminate\\Support\\Facades\\Route;

test('an issue page shows its title', function () {
    Route::get('issues/1', fn (): ShowIssuePage => new ShowIssuePage(title: 'Set up the repository'));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('issues/1')->assertOk();
});
`,
        );
        assertOutcome(await app.check(), { outcome: 'pass' });
    });

    test('generated TypeScript is gitignored, and ci:check, typecheck and build regenerate it in a fresh clone', async () => {
        const app = await createApp('generated-in-fresh-clone');
        mkdirSync(join(app.dir, 'app', 'Enums'), { recursive: true });
        writeFileSync(
            join(app.dir, 'app', 'Enums', 'ProjectStatus.php'),
            `<?php

namespace App\\Enums;

enum ProjectStatus: string
{
    case Active = 'active';
    case Archived = 'archived';
}
`,
        );
        // A page and its Page class, so the build bundles it and fails if `@/generated` or `@/generated/translations`
        // doesn't resolve.
        mkdirSync(join(app.dir, 'app', 'Pages'), { recursive: true });
        writeFileSync(
            join(app.dir, 'app', 'Pages', 'ProjectStatusesPage.php'),
            `<?php

namespace App\\Pages;

use StrictlyLaravel\\Inertia\\Page;

final class ProjectStatusesPage extends Page {}
`,
        );
        writeFileSync(
            join(app.dir, 'tests', 'Feature', 'ProjectStatusesPageTest.php'),
            `<?php

use App\\Pages\\ProjectStatusesPage;
use Illuminate\\Support\\Facades\\Route;

test('the project statuses page renders', function () {
    Route::get('project-statuses', fn (): ProjectStatusesPage => new ProjectStatusesPage);

    // The page isn't in the app's Vite build when the test runs.
    $this->withoutVite();

    $this->get('project-statuses')->assertOk();
});
`,
        );
        writeFileSync(
            join(app.dir, 'resources', 'js', 'pages', 'project-statuses.tsx'),
            `import { enumValues } from '@/generated';
import { t } from '@/generated/translations';

export default function ProjectStatuses() {
    return (
        <ul>
            {enumValues.ProjectStatus.map((status) => (
                <li key={status}>{t(\`statuses.\${status}\`)}</li>
            ))}
        </ul>
    );
}
`,
        );
        // Its labels, translated by the generated t() and bundled by the build as generated JSON.
        mkdirSync(join(app.dir, 'lang', 'en'), { recursive: true });
        writeFileSync(join(app.dir, 'lang', 'en', 'statuses.php'), "<?php\n\nreturn [\n    'active' => 'Active',\n    'archived' => 'Archived',\n];\n");
        await app.commitAll('an enum, its labels and a page that imports its generated values and translations');

        // What a fresh clone lacks: every generated directory, ours and Wayfinder's.
        const generated = ['generated', 'wayfinder', 'routes', 'actions'].map((dir) => join(app.dir, 'resources', 'js', dir));
        const freshClone = (): void => generated.forEach((dir) => rmSync(dir, { recursive: true, force: true }));

        freshClone();
        assertOutcome(await app.check(), { outcome: 'pass' });
        assert.deepEqual(app.changedFiles(), [], 'generated files are not gitignored');

        freshClone();
        assertOutcome(await app.run('pnpm', ['run', 'types:check']), { outcome: 'pass' });

        freshClone();
        assertOutcome(await app.run('pnpm', ['run', 'build']), { outcome: 'pass' });
        const assets = join(app.dir, 'public', 'build', 'assets');
        assert.ok(
            readdirSync(assets).some((file) => file.endsWith('.js') && readFileSync(join(assets, file), 'utf8').includes('Archived')),
            'the build does not bundle the translations',
        );
    });

    test('while the dev server runs, tsc sees a saved Data class and a new or deleted page file, and a half-written Data class keeps the last good types', async () => {
        const app = await createApp('live-regeneration');
        const dataClass = join(app.dir, 'app', 'Data', 'ProjectData.php');
        const projectData = (properties: string) =>
            `<?php\n\nnamespace App\\Data;\n\nuse Spatie\\LaravelData\\Data;\n\nfinal class ProjectData extends Data\n{\n    public function __construct(\n${properties}\n}\n`;
        const usage = join(app.dir, 'resources', 'js', 'lib', 'project.ts');
        const useProject = (fields: string) =>
            `import type { ProjectData } from '@/generated';\n\nexport const project = { ${fields} } satisfies ProjectData;\n`;
        const pageFile = join(app.dir, 'resources', 'js', 'pages', 'projects', 'index.tsx');
        // What the editor sees: `tsc` on the types as they are, without generating them first as `types:check` does.
        const tsc = () => app.run('pnpm', ['exec', 'tsc', '--noEmit']);
        if (app.dir.split(sep).includes('.claude')) {
            // The Base Kit's dev server ignores `**/.claude/**` (agent folders). When the monorepo itself sits in a
            // .claude/ directory (an agent's worktree), that matches every file of the app, so nothing is watched.
            const viteConfig = join(app.dir, 'vite.config.ts');
            writeFileSync(viteConfig, readFileSync(viteConfig, 'utf8').replace(/^\s*'\*\*\/\.claude\/\*\*',\n/m, ''));
        }
        const dev = app.start('pnpm', ['run', 'dev']);

        try {
            await until('the dev server generated the types on start', () => dev.output().includes('[strictly] types generated'), dev);

            mkdirSync(dirname(dataClass), { recursive: true });
            writeFileSync(dataClass, projectData('        public string $name,\n        public int $openIssues,\n    ) {}'));
            writeFileSync(usage, useProject("name: 'Strictly', openIssues: 3"));
            await untilTsc('tsc passes with the new ProjectData', tsc, 'pass', dev);

            writeFileSync(dataClass, projectData('        public string $name,\n        public int $openIssues\n        public stri'));
            await until('the parse error was reported', () => dev.output().includes('app/Data/ProjectData.php:12: syntax error'), dev);
            assertOutcome(await tsc(), { outcome: 'pass' });
            assert.equal(dev.exited(), false, 'the dev server stopped');

            writeFileSync(dataClass, projectData('        public string $name,\n        public int $openIssues,\n        public string $lead,\n    ) {}'));
            writeFileSync(usage, useProject("name: 'Strictly', openIssues: 3, lead: 'Ada'"));
            await untilTsc('tsc passes with the finished edit', tsc, 'pass', dev);

            mkdirSync(dirname(pageFile), { recursive: true });
            writeFileSync(pageFile, 'export default function Index() {\n    return <h1>Projects</h1>;\n}\n');
            await untilTsc('tsc fails on the page file without a Page class', tsc, 'fail', dev, `error TS2344: Type '"projects/index"' does not satisfy the constraint 'keyof InertiaPages'.`);

            rmSync(pageFile);
            await untilTsc('tsc passes once the page file is deleted', tsc, 'pass', dev);
        } finally {
            await dev.stop();
        }
    });

    test('the dev server and the build warn when the Composer and npm package versions differ', async () => {
        const app = await createApp('package-versions-differ');
        const warning = 'the Composer package mrsafalpiya/strictly-laravel is 0.0.1 but the npm package @mrsafalpiya/strictly-laravel is';
        const build = async () => {
            const result = await app.run('pnpm', ['exec', 'vite', 'build']);
            assertOutcome(result, { outcome: 'pass' });

            return result.output;
        };

        assert.ok(!(await build()).includes('[strictly] '), 'the build warned although both packages have the same version');

        // A half-updated app: `composer update` ran, the npm package wasn't updated (or the other way round).
        const installedJson = join(app.dir, 'vendor', 'composer', 'installed.json');
        const installed = JSON.parse(readFileSync(installedJson, 'utf8')) as { packages: { name: string; version: string }[] };
        for (const entry of installed.packages) {
            if (entry.name === 'mrsafalpiya/strictly-laravel') {
                entry.version = '0.0.1';
            }
        }
        rmSync(installedJson); // a hard link shared with every app; replace it rather than writing through it
        writeFileSync(installedJson, JSON.stringify(installed));

        assert.ok((await build()).includes(warning), 'the build did not warn about the differing versions');

        const dev = app.start('pnpm', ['run', 'dev']);
        try {
            await until('the dev server warned about the differing versions', () => dev.output().includes(warning), dev);
        } finally {
            await dev.stop();
        }
    });

    test("the build compiles JSX with React's runtime: the narrowed JSX types change only the types (P-016)", async () => {
        const app = await createApp('jsx-runtime-pinned');
        const viteConfig = join(app.dir, 'vite.config.ts');

        assertOutcome(await app.run('pnpm', ['exec', 'vite', 'build']), { outcome: 'pass' });

        // Without the pin, the Vite React plugin follows tsconfig.json's jsxImportSource to a module with types only.
        writeFileSync(viteConfig, readFileSync(viteConfig, 'utf8').replace("react({ jsxImportSource: 'react' })", 'react()'));
        assertOutcome(await app.run('pnpm', ['exec', 'vite', 'build']), {
            outcome: 'fail',
            errorContains: '"./jsx/jsx-runtime" is not exported',
        });
    });

    test('the build fails when the environment lacks a VITE_* variable .env.example lists, which import.meta.env types as a string (P-140)', async () => {
        const app = await createApp('vite-env-variable-unset');
        const env = join(app.dir, '.env');
        // A deployment whose .env was written before the variable was added to .env.example.
        writeFileSync(env, readFileSync(env, 'utf8').replace(/^VITE_APP_NAME=.*\n/m, ''));

        assertOutcome(await app.run('pnpm', ['exec', 'vite', 'build']), {
            outcome: 'fail',
            errorContains: "[strictly] .env.example lists VITE_APP_NAME, but the environment Vite runs with doesn't set it",
        });
    });

    for (const scenario of loadScenarios()) {
        test(`scenario ${scenario.name} [Problem: ${scenario.problem}]`, async () => {
            assertOutcome(await runScenario(scenario), scenario.expect);
        }, scenarioCost(scenario));
    }

    for (const { name, fn } of testsInShard(collected, harnessShard(process.env['STRICTLY_HARNESS_SHARD']))) {
        nodeTest(name, fn);
    }
});

/** Roughly how many seconds a scenario takes on one CPU (CI's averages per step); the full ci:check when no step. */
function scenarioCost(scenario: Scenario): number {
    const stepCosts: Record<string, number> = { test: 10, tsc: 7, lint: 5 };

    return scenario.step === undefined ? 18 : (stepCosts[scenario.step] ?? 2);
}

/** The `<label> .... <status>` rows strictly:install printed, one per hook and per Kit Conversion file. */
function installerRows(output: string): { label: string; status: string }[] {
    return [...output.matchAll(/^\s*(.+?) \.{2,} (.+?)\s*$/gm)].map((match) => ({ label: match[1] ?? '', status: match[2] ?? '' }));
}

/** Wait until `condition` holds while a background command runs; fail with its output after `timeoutMs`. */
async function until(what: string, condition: () => boolean, command: BackgroundCommand, timeoutMs = 30_000): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    while (!condition()) {
        if (Date.now() > deadline || command.exited()) {
            assert.fail(`${command.exited() ? 'exited' : 'timed out'} before ${what}\n--- output ---\n${tail(command.output())}`);
        }

        await sleep(50);
    }
}

/** Run `tsc` until it ends as expected (it changes once the dev server regenerates the types); fail with its last output. */
async function untilTsc(
    what: string,
    tsc: () => Promise<CommandResult>,
    outcome: 'pass' | 'fail',
    command: BackgroundCommand,
    errorContains?: string,
    timeoutMs = 60_000,
): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    for (;;) {
        const result = await tsc();
        const ended = outcome === 'pass' ? result.exitCode === 0 : result.exitCode !== 0 && result.output.includes(errorContains ?? '');

        if (ended) {
            return;
        }

        if (Date.now() > deadline || command.exited()) {
            assert.fail(`${command.exited() ? 'exited' : 'timed out'} before ${what}\n--- tsc ---\n${tail(result.output)}\n--- dev server ---\n${tail(command.output())}`);
        }

        await sleep(500);
    }
}
