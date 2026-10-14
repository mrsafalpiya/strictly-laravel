import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { before, describe, test } from 'node:test';

import { failureReport } from '../src/failure-report.ts';
import { createApp, prepareInstalledFixture } from '../src/fixture.ts';
import { fixturesDir } from '../src/paths.ts';
import { assertOutcome, loadScenarios, runScenario } from '../src/scenario.ts';

// Every test here works on its own copy of one cached app (latest Base Kit + Overlay installed from local paths),
// so they run one after another inside this single file.
describe('Overlay on the latest Base Kit', () => {
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
        writeFileSync(viteConfig, readFileSync(viteConfig, 'utf8').replace(/^( {4}lint: \{\n)/m, "$1        rules: {\n            'no-debugger': 'error',\n        },\n"));

        await app.install();
        await app.commitAll('after strictly:install');
        await app.install();

        assert.deepEqual(app.changedFiles(), [], 'a second strictly:install changed files');
        assertOutcome(await app.check('lint'), { outcome: 'pass' });

        mkdirSync(join(app.dir, 'resources', 'js', 'lib'), { recursive: true });
        writeFileSync(join(app.dir, 'resources', 'js', 'lib', 'first-word.ts'), "export const firstWord = (text: string) => text.split(' ')[0].length;\n");
        writeFileSync(join(app.dir, 'resources', 'js', 'lib', 'home.ts'), "export const home = '/dashboard';\nexport const go = () => fetch('/dashboard');\n");

        assertOutcome(await app.check('tsc'), { outcome: 'fail', errorContains: "error TS2532: Object is possibly 'undefined'." });
        assertOutcome(await app.check('lint'), { outcome: 'fail', errorContains: 'strictly(no-hardcoded-urls): Hard-coded URL "/dashboard"' });
    });

    for (const scenario of loadScenarios()) {
        test(`scenario ${scenario.name} [Problem: ${scenario.problem}]`, async () => {
            assertOutcome(await runScenario(scenario), scenario.expect);
        });
    }
});
