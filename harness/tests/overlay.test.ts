import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';

import { createApp, prepareInstalledFixture } from '../src/fixture.ts';
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

    for (const scenario of loadScenarios()) {
        test(`scenario ${scenario.name} [Problem: ${scenario.problem}]`, async () => {
            assertOutcome(await runScenario(scenario), scenario.expect);
        });
    }
});
