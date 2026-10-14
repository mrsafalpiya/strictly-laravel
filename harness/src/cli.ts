import { randomUUID } from 'node:crypto';
import { relative } from 'node:path';
import { parseArgs } from 'node:util';

import { describeDiagnostic, failureReport, githubAnnotations } from './failure-report.ts';
import { type App, appConcurrency, createApp, prepareInstalledFixture } from './fixture.ts';
import { fixturesDir, repoRoot } from './paths.ts';
import { CommandFailed, type CommandResult, tail } from './run.ts';
import { assertOutcome, type Expectation, loadScenario, loadScenarios, runScenario } from './scenario.ts';

const usage = `Usage: pnpm harness [<scenario>...] [--step <step>] [--fresh] [--list]

  (no scenario)    Fresh install: the latest Base Kit + the Overlay from local paths; strictly:install and every
                   ci:check step must pass. A failure names the stage and the files that broke.
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

/**
 * Fresh install, one stage at a time (`strictly:install`, then each `ci:check` step on its own so every broken step
 * shows up, not just the first), each failure reported with the files it names. Under GitHub Actions the failures are
 * also emitted as `::error` annotations, so a red nightly run says what broke on its summary page.
 */
async function freshInstall(step: string | undefined): Promise<void> {
    const app = await createApp('fresh-install', { install: false });
    let install: CommandResult;

    try {
        install = await app.install();
    } catch (error) {
        if (!(error instanceof CommandFailed)) {
            throw error;
        }

        reportStageFailure('strictly:install', error.result);

        return;
    }

    // An installer row such as a Kit Conversion skip fails the install even when the installer itself exits 0.
    if (failureReport('strictly:install', install.output).diagnostics.length > 0) {
        reportStageFailure('strictly:install', install);
    }

    const steps = step === undefined ? app.steps() : [step];

    if (steps.length === 0) {
        failures++;
        console.log(`✖ fresh install: strictly:install defined no ci:check steps in ${relative(repoRoot, app.dir)}/composer.json`);
    }

    for (const name of steps) {
        const started = Date.now();
        const result = await app.check(name);
        const seconds = ((Date.now() - started) / 1000).toFixed(1);

        if (result.exitCode === 0) {
            console.log(`✔ fresh install: ci:check:${name} passed (${seconds}s)`);
        } else {
            reportStageFailure(`ci:check:${name}`, result);
        }
    }
}

function reportStageFailure(stage: string, result: CommandResult): void {
    failures++;
    const report = failureReport(stage, result.output);
    const details = report.diagnostics.length > 0 ? report.diagnostics.map(describeDiagnostic) : tail(result.output).split('\n');
    const github = process.env['GITHUB_ACTIONS'] === 'true';
    // Tool output is printed verbatim; under GitHub Actions a line of it starting with `::` would run as a command.
    const stopToken = randomUUID();

    console.log(`✖ fresh install: ${stage} failed (exit ${result.exitCode}: ${result.command}; logs: ${relative(repoRoot, fixturesDir)}/*.log)`);

    if (github) {
        console.log(`::stop-commands::${stopToken}`);
    }

    for (const line of details) {
        console.log(`    ${line}`);
    }

    if (github) {
        console.log(`::${stopToken}::`);

        for (const annotation of githubAnnotations(report, result.output)) {
            console.log(annotation);
        }
    }
}

try {
    await prepareInstalledFixture({ fresh: values.fresh || process.env['STRICTLY_FRESH_BASE_KIT'] === '1' });
} catch (error) {
    if (!(error instanceof CommandFailed)) {
        throw error;
    }

    // Generating the Base Kit or requiring the Overlay packages failed: name the command, since no app exists yet.
    reportStageFailure(error.result.command, error.result);
    process.exit(1);
}

if (scenarios.length === 0) {
    await freshInstall(values.step);
}

// Each scenario has its own app, so they run concurrently; results print as they finish.
const queue = [...scenarios];
await Promise.all(
    Array.from({ length: Math.min(appConcurrency(), queue.length) }, async () => {
        for (let scenario = queue.shift(); scenario !== undefined; scenario = queue.shift()) {
            const { name, problem, expect } = scenario;
            await report(`scenario ${name} [Problem: ${problem}]`, expect, () => runScenario(scenario, stepOption));
        }
    }),
);

process.exitCode = failures === 0 ? 0 : 1;
