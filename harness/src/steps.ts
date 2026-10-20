import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { type CommandResult, run, type RunOptions } from './run.ts';

// The harness runs an app's checks itself, from the Composer scripts `strictly:install` writes, rather than through
// `composer`. It runs exactly the commands Composer would and stops at the first that fails, as Composer does, and
// adds two things Composer can't:
//
// - Finer steps than the app's `ci:check:<step>`s. A breaking scenario only has to reach its diagnostic, so one whose
//   diagnostic comes from PHPStan runs `phpstan` instead of the whole `test` step (Pint, PHPStan, Pest), and one whose
//   diagnostic is a Contract Coverage gap runs `pest+coverage` instead of the full `ci:check`.
// - Commands that work wherever PHP runs. Composer runs every script with the PHP it runs on, so a containerised PHP
//   (lerd's) runs `pnpm run check` inside its container, which has no pnpm. Here every script runs on the host and
//   only PHP goes through the `php` on PATH (phpArgs()).

/**
 * A step a scenario or test can run: one of the app's `ci:check` steps (`install`, `generate`, `lint`, `test`,
 * `coverage`, `tsc`), a part of its `test` step (`pint`, `phpstan`, `pest`), or several joined with `+`, run in order
 * (`pest+coverage`). No step is the full `ci:check`.
 */
export type Step = string;

/** The part of the `test` step each finer step names: a Composer script, or `pest`, the rest of `test`. */
const testParts: Record<string, string> = { pint: 'lint:check', phpstan: 'types:check' };

/**
 * The app's `ci:check` step a scenario's diagnostic comes from: the step that runs last (`pest+coverage` fails at
 * `coverage`), with a part of `test` counted as `test`. Undefined for the full `ci:check`.
 */
export function ciCheckStepOf(step: Step | undefined): string | undefined {
    const last = step?.split('+').at(-1);

    return last !== undefined && (last in testParts || last === 'pest') ? 'test' : last;
}

/** Whether $step names steps this app has. */
export function stepError(step: Step, ciCheckSteps: readonly string[]): string | null {
    const unknown = step.split('+').filter((part) => !ciCheckSteps.includes(part) && !(part in testParts) && part !== 'pest');

    return unknown.length === 0 ? null : `Unknown step "${unknown.join('", "')}"; this app defines: ${[...ciCheckSteps, 'pint', 'phpstan', 'pest'].join(', ')}`;
}

/** Run $step (the full `ci:check` when undefined) in the app at $dir, as `composer` would. */
export async function runStep(dir: string, step: Step | undefined, options: RunOptions): Promise<CommandResult> {
    const scripts = composerScripts(dir);
    const scriptsToRun = step === undefined ? ['ci:check'] : step.split('+').map((part) => testParts[part] ?? (part === 'pest' ? 'pest' : `ci:check:${part}`));
    const outputs: string[] = [];
    const display = step === undefined ? 'ci:check' : step;

    for (const script of scriptsToRun) {
        const commands = script === 'pest'
            ? (scripts['test'] ?? []).filter((command) => !['@lint:check', '@types:check'].includes(command))
            : [`@${script}`];

        for (const { command, event } of expand(commands, scripts, script)) {
            const result = await runCommand(dir, command, options);
            outputs.push(result.output);

            if (result.exitCode !== 0) {
                // The line Composer prints, which harness/src/failure-report.ts reads.
                outputs.push(`Script ${command} handling the ${event} event returned with error code ${result.exitCode}\n`);

                return { command: display, exitCode: result.exitCode, output: outputs.join('') };
            }
        }
    }

    return { command: display, exitCode: 0, output: outputs.join('') };
}

/** The app's Composer scripts, each a list of commands. */
function composerScripts(dir: string): Record<string, string[]> {
    const manifest = JSON.parse(readFileSync(join(dir, 'composer.json'), 'utf8')) as { scripts?: Record<string, string | string[]> };

    return Object.fromEntries(Object.entries(manifest.scripts ?? {}).map(([name, commands]) => [name, Array.isArray(commands) ? commands : [commands]]));
}

/** Expand `@script` references into the commands they run, each with the script (Composer's "event") it belongs to. */
function expand(commands: readonly string[], scripts: Record<string, string[]>, event: string, seen: readonly string[] = []): { command: string; event: string }[] {
    return commands.flatMap((command) => {
        const reference = /^@([\w:-]+)$/.exec(command)?.[1];

        if (reference !== undefined && reference !== 'php' && reference !== 'composer') {
            if (seen.includes(reference)) {
                throw new Error(`Composer script ${reference} references itself`);
            }

            const referenced = scripts[reference];

            if (referenced === undefined) {
                throw new Error(`Composer script @${reference} doesn't exist`);
            }

            return expand(referenced, scripts, reference, [...seen, reference]);
        }

        // A PHP callback. Composer's own timeout switch is the only one ci:check runs.
        if (/^[\w\\]+::\w+$/.test(command)) {
            if (command !== 'Composer\\Config::disableProcessTimeout') {
                throw new Error(`The harness can't run the Composer callback ${command}`);
            }

            return [];
        }

        return [{ command, event }];
    });
}

/** Run one script command as Composer does: `@php` with PHP, anything else through the shell with vendor/bin on PATH. */
function runCommand(dir: string, command: string, options: RunOptions): Promise<CommandResult> {
    const words = command.split(' ');
    const env = { ...options.env, PATH: `${join(dir, 'vendor', 'bin')}:${options.env?.['PATH'] ?? process.env['PATH'] ?? ''}` };

    // Plain commands are split on spaces; one with shell syntax goes to the shell.
    if (/["'`$|&;<>()\\]/.test(command.replace(/^@php /, ''))) {
        return run('sh', ['-c', command.replace(/^@php /, 'php ')], { ...options, env });
    }

    if (words[0] === '@php') {
        return run('php', [...phpArgs(options), ...words.slice(1)], { ...options, env });
    }

    // A Composer package's binary is a PHP script: run it with the same PHP and settings.
    const binary = join(dir, 'vendor', 'bin', words[0] ?? '');

    if (existsSync(binary) && readFileSync(binary, 'utf8').startsWith('#!/usr/bin/env php')) {
        return run('php', [...phpArgs(options), `vendor/bin/${words[0]}`, ...words.slice(1)], { ...options, env });
    }

    return run(words[0] ?? '', words.slice(1), { ...options, env });
}

/**
 * PHP's settings for every script: no memory limit, as on CI's runners (setup-php). PHP keeps its temporary files, and
 * PHPStan its result cache, in the app's TMPDIR, so apps checked at once don't share them. A containerised PHP (lerd's)
 * never sees TMPDIR, so there the harness sets PHP's temporary directory itself, and keeps PHPStan from re-executing
 * PHP, which would drop that setting: it restarts to turn OPcache on (its "turbo" mode, which `phpstan.restarted`
 * marks as done) or to turn Xdebug off. Without it, the apps share one result cache and one Larastan lock in the
 * container's /tmp, and their OPcache restarts crash each other's workers (SIGBUS).
 */
function phpArgs(options: RunOptions): string[] {
    const tmpDir = options.env?.['TMPDIR'];
    const isolated = tmpDir === undefined || phpSeesEnvironment()
        ? []
        : ['-d', `sys_temp_dir=${tmpDir}`, '-d', 'xdebug.mode=off', '-d', 'phpstan.restarted=1'];

    return ['-d', 'memory_limit=-1', ...isolated];
}

let seesEnvironment: boolean | undefined;

/** Whether the `php` on PATH gets the environment it's run with; a containerised one may not. */
function phpSeesEnvironment(): boolean {
    seesEnvironment ??= spawnSync('php', ['-r', 'echo getenv("STRICTLY_HARNESS_PROBE");'], {
        encoding: 'utf8',
        env: { ...process.env, STRICTLY_HARNESS_PROBE: 'seen' },
    }).stdout === 'seen';

    return seesEnvironment;
}
