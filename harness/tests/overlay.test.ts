import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { before, describe, test } from 'node:test';

import { failureReport } from '../src/failure-report.ts';
import { createApp, prepareInstalledFixture } from '../src/fixture.ts';
import { run } from '../src/run.ts';
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
        // A page, so the build bundles it and fails if `@/generated` doesn't resolve.
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
        const inApp = { cwd: app.dir, logFile: join(app.dir, '..', `${app.name}.log`) };

        freshClone();
        assertOutcome(await app.check(), { outcome: 'pass' });
        assert.deepEqual(app.changedFiles(), [], 'generated files are not gitignored');

        freshClone();
        assertOutcome(await run('pnpm', ['run', 'types:check'], inApp), { outcome: 'pass' });

        freshClone();
        assertOutcome(await run('pnpm', ['run', 'build'], inApp), { outcome: 'pass' });
    });

    for (const scenario of loadScenarios()) {
        test(`scenario ${scenario.name} [Problem: ${scenario.problem}]`, async () => {
            assertOutcome(await runScenario(scenario), scenario.expect);
        });
    }
});
