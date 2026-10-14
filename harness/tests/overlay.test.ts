import assert from 'node:assert/strict';
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { before, describe, test } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';

import plugin from '../../packages/npm/oxlint/index.js';
import { failureReport } from '../src/failure-report.ts';
import { appConcurrency, createApp, prepareInstalledFixture } from '../src/fixture.ts';
import { fixturesDir, scenariosDir } from '../src/paths.ts';
import { type BackgroundCommand, type CommandResult, tail } from '../src/run.ts';
import { assertOutcome, loadScenarios, runScenario } from '../src/scenario.ts';

// Every test here works on its own copy of one cached app (latest Base Kit + Overlay installed from local paths), in its
// own directory with its own TMPDIR, so they run concurrently (appConcurrency(), STRICTLY_HARNESS_CONCURRENCY).
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

    test('strictly:install is idempotent', async () => {
        const app = await createApp('idempotent-install');
        await app.commitAll('after the first strictly:install');

        await app.install();

        assert.deepEqual(app.changedFiles(), [], 'a second strictly:install changed files');
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
        // A page and its Page class, so the build bundles it and fails if `@/generated` doesn't resolve.
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
            join(app.dir, 'resources', 'js', 'pages', 'project-statuses.tsx'),
            `import { enumValues } from '@/generated';

export default function ProjectStatuses() {
    return (
        <ul>
            {enumValues.ProjectStatus.map((status) => (
                <li key={status}>{status}</li>
            ))}
        </ul>
    );
}
`,
        );
        await app.commitAll('an enum and a page that imports its generated values');

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

    for (const scenario of loadScenarios()) {
        test(`scenario ${scenario.name} [Problem: ${scenario.problem}]`, async () => {
            assertOutcome(await runScenario(scenario), scenario.expect);
        });
    }
});

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
