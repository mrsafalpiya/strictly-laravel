import assert from 'node:assert/strict';
import { existsSync, globSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import plugin from '../../packages/npm/oxlint/index.js';
import { composerPackageDir } from '../src/paths.ts';
import { loadScenarios } from '../src/scenario.ts';

// The Boost guidance the Composer package ships (Problem P-146) can't rot: every skill's worked example is a harness
// scenario that passes the full ci:check, each code block a skill attributes to a file (```php title="app/…"```) is in
// that scenario's file, each diagnostic a skill or the guideline quotes is the one a breaking scenario produces, and the
// lint rules and PHPStan identifiers the guidance names exist.

const boostDir = join(composerPackageDir, 'resources', 'boost');
const skillsDir = join(boostDir, 'skills');
const guideline = join(boostDir, 'guidelines', 'core.md');

/** One skill per workflow of the spec (user story 66). */
const workflows = [
    'strictly-add-page',
    'strictly-add-form',
    'strictly-add-query-filters',
    'strictly-add-json-endpoint',
    'strictly-add-deferred-props',
    'strictly-add-broadcast-event',
    'strictly-add-translation',
    'strictly-close-coverage-gap',
];

const scenarios = loadScenarios();

/** The scenario that proves a skill's worked example: `strictly-add-page` → `skill-add-page-example-passes`. */
function exampleScenario(skill: string): string {
    return `skill-${skill.replace(/^strictly-/, '')}-example-passes`;
}

function skillFile(skill: string): string {
    return readFileSync(join(skillsDir, skill, 'SKILL.md'), 'utf8');
}

interface CodeBlock {
    path: string;
    code: string;
}

/** The fenced code blocks attributed to a file: ```php title="app/Data/ProjectData.php"```. */
function codeBlocks(markdown: string): CodeBlock[] {
    return [...markdown.matchAll(/^```\w+ title="([^"]+)"\n([\s\S]*?)^```$/gm)].map((match) => ({
        path: match[1] ?? '',
        code: match[2] ?? '',
    }));
}

/** Whether the code's lines appear in the file as consecutive lines, ignoring each line's indentation. */
function containsLines(file: string, code: string): boolean {
    const lines = (text: string) => text.split('\n').map((line) => line.trim());
    const needle = lines(code.trimEnd());
    const haystack = lines(file);

    return haystack.some((_, start) => needle.every((line, offset) => haystack[start + offset] === line));
}

interface Diagnostic {
    step: string;
    message: string;
}

/** The diagnostics quoted as "- `ci:check:<step>` fails with `<message>`" (or with ``a message with `code` in it``). */
function diagnostics(markdown: string): Diagnostic[] {
    return [...markdown.matchAll(/^- `ci:check:(\w+)` fails with (`+) ?(.+?) ?\2(?!`)/gm)].map((match) => ({
        step: match[1] ?? '',
        message: match[3] ?? '',
    }));
}

describe('Boost guidance', () => {
    test('the package ships the core guideline and one skill per workflow, each named after its directory', () => {
        assert.ok(existsSync(guideline), 'resources/boost/guidelines/core.md is missing');
        assert.deepEqual(
            readdirSync(skillsDir).sort(),
            [...workflows].sort(),
            'resources/boost/skills/ must hold exactly one skill per workflow',
        );

        for (const skill of workflows) {
            const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(skillFile(skill))?.[1] ?? '';

            assert.match(frontmatter, new RegExp(`^name: ${skill}$`, 'm'), `${skill}: the frontmatter must name the skill as its directory`);
            assert.match(frontmatter, /^description: ".{40,}"$/m, `${skill}: the frontmatter needs a description saying when to use it`);
        }
    });

    test('the guideline points to every skill', () => {
        const text = readFileSync(guideline, 'utf8');

        for (const skill of workflows) {
            assert.ok(text.includes(`\`${skill}\``), `the core guideline doesn't mention ${skill}`);
        }
    });

    for (const skill of workflows) {
        test(`${skill}: its worked example is a scenario that passes the full ci:check, holding every code block it shows`, () => {
            const name = exampleScenario(skill);
            const scenario = scenarios.find((candidate) => candidate.name === name);

            assert.ok(scenario !== undefined, `no scenario ${name} proves ${skill}'s worked example`);
            assert.deepEqual(scenario.expect, { outcome: 'pass' }, `${name} must expect ci:check to pass`);
            assert.equal(scenario.step, undefined, `${name} must run the full ci:check`);
            assert.ok(scenario.filesDir !== undefined, `${name} has no files`);

            const blocks = codeBlocks(skillFile(skill));
            assert.ok(blocks.length > 0, `${skill} attributes no code block to a file`);

            for (const block of blocks) {
                const file = join(scenario.filesDir, block.path);

                assert.ok(existsSync(file), `${skill} shows ${block.path}, which ${name} doesn't have`);
                assert.ok(
                    containsLines(readFileSync(file, 'utf8'), block.code),
                    `${skill}'s ${block.path} block isn't in ${name}'s ${block.path}: change both together`,
                );
            }
        });
    }

    test('every diagnostic the guidance quotes is the one a breaking scenario produces at that step', () => {
        const documents = [guideline, ...workflows.map((skill) => join(skillsDir, skill, 'SKILL.md'))];
        const breaking = scenarios.flatMap((scenario) =>
            scenario.expect.outcome === 'fail' ? [{ name: scenario.name, step: scenario.step, message: scenario.expect.errorContains }] : [],
        );
        let quoted = 0;

        for (const document of documents) {
            const text = readFileSync(document, 'utf8');
            const lines = text.split('\n').filter((line) => line.startsWith('- `ci:check'));

            assert.equal(diagnostics(text).length, lines.length, `${document}: write each diagnostic as "- \`ci:check:<step>\` fails with \`<message>\`: …"`);

            for (const { step, message } of diagnostics(text)) {
                quoted++;
                // A scenario that runs the full ci:check fails at whichever step catches it.
                const match = breaking.find((scenario) => scenario.message === message && (scenario.step === undefined || scenario.step === step));

                assert.ok(match !== undefined, `${document}: no breaking scenario fails ci:check:${step} with "${message}"`);
            }
        }

        assert.ok(quoted >= workflows.length, 'the skills quote too few diagnostics');
    });

    test('every lint rule and PHPStan identifier the guidance names exists', () => {
        const text = [guideline, ...globSync('*/SKILL.md', { cwd: skillsDir }).map((file) => join(skillsDir, file))]
            .map((file) => readFileSync(file, 'utf8'))
            .join('\n');
        const phpstanIdentifiers = new Set(
            globSync('src/PHPStan/*.php', { cwd: composerPackageDir }).flatMap((file) =>
                [...readFileSync(join(composerPackageDir, file), 'utf8').matchAll(/'(strictly\.\w+)'/g)].map((match) => match[1]),
            ),
        );

        for (const [, rule] of text.matchAll(/strictly\/([a-z-]+)/g)) {
            assert.ok(rule !== undefined && rule in plugin.rules, `the guidance names the lint rule strictly/${rule}, which doesn't exist`);
        }

        for (const [identifier] of text.matchAll(/\bstrictly\.(?!php\b)[a-z]\w*/g)) {
            assert.ok(phpstanIdentifiers.has(identifier), `the guidance names the PHPStan identifier ${identifier}, which doesn't exist`);
        }
    });
});
