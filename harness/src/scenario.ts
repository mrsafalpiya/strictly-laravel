import assert from 'node:assert/strict';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, normalize } from 'node:path';

import { createApp } from './fixture.ts';
import { scenariosDir } from './paths.ts';
import { type CommandResult, tail } from './run.ts';

export type Expectation = { outcome: 'pass' } | { outcome: 'fail'; errorContains: string };

/**
 * A known set of file edits to an installed app plus the `ci:check` outcome it must produce.
 * Lives in harness/scenarios/<name>/: scenario.json, and an optional files/ tree copied over the app root.
 */
export interface Scenario {
    name: string;
    /** The Problem it guards (its id in docs/problems.md), or "none" for examples. */
    problem: string;
    description: string;
    /** Run only this `ci:check` step (`composer ci:check:<step>`); the full `ci:check` when absent. */
    step?: string;
    expect: Expectation;
    /** App-relative paths to delete before the check. */
    delete: string[];
    /** Directory whose tree is copied over the app root (written or overwritten), when present. */
    filesDir?: string;
}

const allowedKeys = new Set(['problem', 'description', 'step', 'expect', 'delete']);

export function loadScenarios(): Scenario[] {
    return readdirSync(scenariosDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => loadScenario(entry.name))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export function loadScenario(name: string): Scenario {
    const dir = join(scenariosDir, name);
    const file = join(dir, 'scenario.json');

    if (!existsSync(file)) {
        throw new Error(`Unknown scenario "${name}" (no ${file})`);
    }

    const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
    const fail = (message: string): never => {
        throw new Error(`${file}: ${message}`);
    };

    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return fail('must be a JSON object');
    }

    const data = raw as Record<string, unknown>;
    const unknownKeys = Object.keys(data).filter((key) => !allowedKeys.has(key));

    if (unknownKeys.length > 0) {
        fail(`unknown keys: ${unknownKeys.join(', ')}`);
    }

    const { problem, description, step, expect, delete: deletions = [] } = data;

    if (typeof problem !== 'string' || problem === '') {
        fail('"problem" must be the guarded Problem id, or "none"');
    }

    if (typeof description !== 'string' || description === '') {
        fail('"description" is required');
    }

    if (step !== undefined && (typeof step !== 'string' || step === '')) {
        fail('"step" must be a ci:check step name');
    }

    if (!Array.isArray(deletions) || !deletions.every((path) => typeof path === 'string' && isAppRelative(path))) {
        fail('"delete" must be a list of app-relative paths');
    }

    const filesDir = join(dir, 'files');
    const scenario: Scenario = {
        name,
        problem: problem as string,
        description: description as string,
        expect: parseExpectation(expect, fail),
        delete: deletions as string[],
    };

    if (step !== undefined) {
        scenario.step = step as string;
    }

    if (existsSync(filesDir)) {
        scenario.filesDir = filesDir;
    }

    return scenario;
}

function parseExpectation(value: unknown, fail: (message: string) => never): Expectation {
    if (typeof value === 'object' && value !== null && 'outcome' in value) {
        if (value.outcome === 'pass' && Object.keys(value).length === 1) {
            return { outcome: 'pass' };
        }

        if (value.outcome === 'fail' && 'errorContains' in value && typeof value.errorContains === 'string' && value.errorContains !== '') {
            return { outcome: 'fail', errorContains: value.errorContains };
        }
    }

    return fail('"expect" must be {"outcome": "pass"} or {"outcome": "fail", "errorContains": "<substring>"}');
}

function isAppRelative(path: string): boolean {
    const normalized = normalize(path);

    return normalized !== '' && !normalized.startsWith('..') && !normalized.startsWith('/');
}

/** Apply the scenario to a fresh app (`scenario-<name>`) and run its check. `step` overrides the scenario's step. */
export async function runScenario(scenario: Scenario, options: { step?: string } = {}): Promise<CommandResult> {
    const app = await createApp(`scenario-${scenario.name}`);

    for (const path of scenario.delete) {
        rmSync(join(app.dir, path), { recursive: true, force: true });
    }

    if (scenario.filesDir !== undefined) {
        cpSync(scenario.filesDir, app.dir, { recursive: true, force: true });
    }

    return app.check(options.step ?? scenario.step);
}

/** Assert a check result matches an expectation; failures carry the tail of the check's output. */
export function assertOutcome(result: CommandResult, expected: Expectation): void {
    const output = `\n--- ${result.command} (exit ${result.exitCode}) ---\n${tail(result.output)}`;

    if (expected.outcome === 'pass') {
        assert.equal(result.exitCode, 0, `expected the check to pass${output}`);

        return;
    }

    assert.notEqual(result.exitCode, 0, `expected the check to fail, but it passed${output}`);
    assert.ok(
        result.output.includes(expected.errorContains),
        `expected the failure output to contain ${JSON.stringify(expected.errorContains)}${output}`,
    );
}
