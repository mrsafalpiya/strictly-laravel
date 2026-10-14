import { execFileSync, spawn } from 'node:child_process';
import { appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { repoRoot } from './paths.ts';

export interface CommandResult {
    command: string;
    exitCode: number;
    /** stdout and stderr interleaved, ANSI codes stripped. */
    output: string;
}

export interface RunOptions {
    cwd: string;
    /** Append the command and its output to this file. */
    logFile?: string;
    env?: Record<string, string>;
}

/** Print harness progress (stderr, so it never mixes with the test runner's stdout protocol). */
export function progress(message: string): void {
    process.stderr.write(`[harness] ${message}\n`);
}

const ansi = /\x1b\[[0-9;?]*[ -/]*[@-~]/g;

/** Make sure the monorepo's own Composer tooling (the pinned laravel/installer) is installed. */
export function ensureRootTooling(): void {
    if (!existsSync(join(repoRoot, 'vendor', 'bin', 'laravel'))) {
        progress('Installing the monorepo Composer tooling (composer install)');
        execFileSync('composer', ['install', '--no-interaction'], { cwd: repoRoot, stdio: 'inherit' });
    }
}

let scrubbedEnv: NodeJS.ProcessEnv | undefined;

/**
 * The environment every fixture command runs with: the harness's own, minus the variables Laravel uses to detect an
 * AI agent. Under an agent, laravel/pao rewrites Pest's CLI and output and the installer's Pest conversion
 * (`pest --drift`) fails, so fixtures would differ between a human and an agent run. The list comes from the
 * laravel/agent-detector package the pinned installer depends on.
 */
function fixtureEnv(): NodeJS.ProcessEnv {
    if (scrubbedEnv === undefined) {
        ensureRootTooling();
        const agentVars: unknown = JSON.parse(
            execFileSync(
                'php',
                [
                    '-r',
                    'require "vendor/autoload.php"; echo json_encode(array_keys(Laravel\\AgentDetector\\AgentDetector::AGENT_ENV_VARS));',
                ],
                { cwd: repoRoot, encoding: 'utf8' },
            ),
        );

        if (!Array.isArray(agentVars)) {
            throw new Error('Could not read the agent environment variables from laravel/agent-detector');
        }

        const env: NodeJS.ProcessEnv = { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', COMPOSER_NO_INTERACTION: '1' };

        for (const name of ['AI_AGENT', ...agentVars.map(String)]) {
            delete env[name];
        }

        scrubbedEnv = env;
    }

    return scrubbedEnv;
}

/** Run a command and capture its output; never rejects on a non-zero exit code. */
export function run(command: string, args: string[], options: RunOptions): Promise<CommandResult> {
    const display = [command, ...args].join(' ');

    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: options.cwd,
            env: { ...fixtureEnv(), ...options.env },
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const chunks: Buffer[] = [];

        child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
        child.stderr.on('data', (chunk: Buffer) => chunks.push(chunk));
        child.on('error', reject);
        child.on('close', (code) => {
            const output = Buffer.concat(chunks).toString('utf8').replace(ansi, '');

            if (options.logFile !== undefined) {
                appendFileSync(options.logFile, `\n$ (cd ${options.cwd} && ${display})\n${output}\n[exit ${code}]\n`);
            }

            resolve({ command: display, exitCode: code ?? 1, output });
        });
    });
}

/** Run a command that must succeed; throws with its output otherwise. */
export async function runOrThrow(command: string, args: string[], options: RunOptions): Promise<CommandResult> {
    const result = await run(command, args, options);

    if (result.exitCode !== 0) {
        throw new Error(`Command failed (exit ${result.exitCode}): ${result.command}\n${tail(result.output)}`);
    }

    return result;
}

export function tail(output: string, lines = 60): string {
    return output.trimEnd().split('\n').slice(-lines).join('\n');
}
