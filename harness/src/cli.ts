import { parseArgs } from 'node:util';

import { createApp, prepareInstalledFixture } from './fixture.ts';
import type { CommandResult } from './run.ts';
import { assertOutcome, type Expectation, loadScenario, loadScenarios, runScenario } from './scenario.ts';

const usage = `Usage: pnpm harness [<scenario>...] [--step <step>] [--fresh] [--list]

  (no scenario)    Fresh install: the latest Base Kit + the Overlay from local paths, then ci:check must pass.
  <scenario>...    Apply each named scenario (harness/scenarios/<name>) and assert its expected outcome.
  --step <step>    Run only this ci:check step (composer ci:check:<step>); overrides the scenario's own step.
  --fresh          Regenerate the latest Base Kit first (same as STRICTLY_FRESH_BASE_KIT=1).
  --list           List the scenarios and exit.`;

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        step: { type: 'string' },
        fresh: { type: 'boolean', default: false },
        list: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
    },
});

if (values.help) {
    console.log(usage);
    process.exit(0);
}

if (values.list) {
    for (const scenario of loadScenarios()) {
        console.log(`${scenario.name}  [Problem: ${scenario.problem}] [step: ${scenario.step ?? 'ci:check'}]  ${scenario.description}`);
    }
    process.exit(0);
}

const scenarios = positionals.map(loadScenario);
const stepOption = values.step === undefined ? {} : { step: values.step };

await prepareInstalledFixture({ fresh: values.fresh || process.env['STRICTLY_FRESH_BASE_KIT'] === '1' });

let failures = 0;

async function report(label: string, expected: Expectation, check: () => Promise<CommandResult>): Promise<void> {
    const started = Date.now();
    const result = await check();
    const seconds = ((Date.now() - started) / 1000).toFixed(1);

    try {
        assertOutcome(result, expected);
        console.log(`✔ ${label}: ${expected.outcome} as expected (${result.command}, ${seconds}s)`);
    } catch (error) {
        failures++;
        console.log(`✖ ${label}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

if (scenarios.length === 0) {
    await report('fresh install', { outcome: 'pass' }, async () => (await createApp('fresh-install')).check(values.step));
}

for (const scenario of scenarios) {
    await report(`scenario ${scenario.name} [Problem: ${scenario.problem}]`, scenario.expect, () => runScenario(scenario, stepOption));
}

process.exitCode = failures === 0 ? 0 : 1;
