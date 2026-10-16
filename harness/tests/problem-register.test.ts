import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { repoRoot } from '../src/paths.ts';

// The Problem register (`docs/problems.md`) keeps each Problem in two places, a row in its index and a `### P-NNN`
// entry, and its "How to read and edit it" section sets the rules both follow. This test holds the register to them:
// each Problem has exactly one row and one entry, the two carry the same status, the status is one the register
// defines, a `closed` Problem says what proves it under **Closed by**, and an `accepted gap` gives its **Reasoning**.
// It doesn't check that a **Closed by** names existing scenarios: some Problems are closed by something else.

const statuses = ['open', 'accepted gap', 'closed'];

interface IndexRow {
    id: string;
    status: string;
}

interface Entry {
    id: string;
    /** The entry's `- **Status:**` line, or `undefined` when it has none. */
    status: string | undefined;
    closedBy: boolean;
    reasoning: boolean;
}

/** The text under a `## <heading>`, up to the next `## ` heading. */
function section(markdown: string, heading: string): string {
    const start = markdown.indexOf(`\n## ${heading}\n`);
    if (start === -1) {
        return '';
    }
    const body = markdown.slice(start + heading.length + 5);
    const end = body.search(/^## /m);

    return end === -1 ? body : body.slice(0, end);
}

/** The index's rows: `| [P-001](#p-001) | <Problem> | <Type Boundary> | <status> |`. */
function indexRows(markdown: string): IndexRow[] {
    return [...section(markdown, 'Index').matchAll(/^\| *\[(P-\d+)\]\([^)]*\) *\|.*\| *([^|]*?) *\| *$/gm)].map((match) => ({
        id: match[1] ?? '',
        status: match[2] ?? '',
    }));
}

/** The `### P-NNN` entries, each up to the next heading of level 2 or 3. */
function entries(markdown: string): Entry[] {
    return [...markdown.matchAll(/^### (P-\d+) *\n([\s\S]*?)(?=^#{2,3} |(?![\s\S]))/gm)].map((match) => {
        const body = match[2] ?? '';

        return {
            id: match[1] ?? '',
            status: /^- \*\*Status:\*\* *(.*?) *$/m.exec(body)?.[1],
            closedBy: /^\*\*Closed by:\*\*/m.test(body),
            reasoning: /^\*\*Reasoning:\*\*/m.test(body),
        };
    });
}

function duplicates(ids: string[]): string[] {
    return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
}

/** Every way the register breaks its own rules, one message per Problem and rule, each naming the Problem. */
function registerErrors(markdown: string): string[] {
    const rows = indexRows(markdown);
    const all = entries(markdown);
    const entryById = new Map(all.map((entry) => [entry.id, entry]));
    const rowIds = new Set(rows.map((row) => row.id));
    const errors: string[] = [];

    for (const id of duplicates(rows.map((row) => row.id))) {
        errors.push(`${id} has more than one index row`);
    }
    for (const id of duplicates(all.map((entry) => entry.id))) {
        errors.push(`${id} has more than one ### entry`);
    }

    for (const row of rows) {
        const entry = entryById.get(row.id);
        if (!statuses.includes(row.status)) {
            errors.push(`${row.id}'s index row has status "${row.status}", not one of: ${statuses.join(', ')}`);
        }
        if (entry === undefined) {
            errors.push(`${row.id} has an index row but no ### ${row.id} entry`);
        } else if (entry.status !== undefined && entry.status !== row.status) {
            errors.push(`${row.id}'s index row says "${row.status}" but its entry's Status says "${entry.status}"`);
        }
    }

    for (const entry of entryById.values()) {
        if (!rowIds.has(entry.id)) {
            errors.push(`${entry.id} has a ### entry but no index row`);
        }
        if (entry.status === undefined) {
            errors.push(`${entry.id}'s entry has no - **Status:** line`);
        } else if (!statuses.includes(entry.status)) {
            errors.push(`${entry.id}'s entry has status "${entry.status}", not one of: ${statuses.join(', ')}`);
        }
        if (entry.status === 'closed' && !entry.closedBy) {
            errors.push(`${entry.id} is closed but its entry has no **Closed by:**`);
        }
        if (entry.status === 'accepted gap' && !entry.reasoning) {
            errors.push(`${entry.id} is an accepted gap but its entry has no **Reasoning:**`);
        }
    }

    return errors;
}

/** A register with one index row and one entry per Problem, shaped like `docs/problems.md`. */
function register(rows: string[], entryTexts: string[]): string {
    return [
        '# Problem register',
        '',
        '## How to read and edit it',
        '',
        '## Index',
        '',
        '| ID | Problem | Type Boundary | Status |',
        '|---|---|---|---|',
        ...rows,
        '',
        '## Routes',
        '',
        ...entryTexts,
        '## Findings not registered',
        '',
    ].join('\n');
}

function row(id: string, status: string): string {
    return `| [${id}](#${id.toLowerCase()}) | A Problem with \`a | b\` in its name | routes | ${status} |`;
}

function entry(id: string, status: string | undefined, fields: string[] = []): string {
    return [
        `### ${id}`,
        '',
        '**A Problem**',
        '',
        '- **Type Boundary:** routes',
        ...(status === undefined ? [] : [`- **Status:** ${status}`]),
        '',
        '**Reproduction:** something.',
        '',
        '**Manual workaround:** something else.',
        '',
        ...fields.flatMap((field) => [field, '']),
    ].join('\n');
}

const closedBy = '**Closed by:** a scenario.';
const reasoning = '**Reasoning:** a reason.';

describe('Problem register', () => {
    test('docs/problems.md keeps its index and entries in step, with the statuses and fields its rules ask for', () => {
        const markdown = readFileSync(join(repoRoot, 'docs', 'problems.md'), 'utf8');

        assert.ok(indexRows(markdown).length > 0, 'found no index rows in docs/problems.md');
        assert.ok(entries(markdown).length > 0, 'found no ### P-NNN entries in docs/problems.md');
        assert.deepEqual(registerErrors(markdown), []);
    });

    test('a register that follows every rule passes', () => {
        const markdown = register(
            [row('P-001', 'open'), row('P-002', 'accepted gap'), row('P-003', 'closed')],
            [entry('P-001', 'open'), entry('P-002', 'accepted gap', [reasoning]), entry('P-003', 'closed', [closedBy])],
        );

        assert.deepEqual(registerErrors(markdown), []);
    });

    test('an index row without an entry, or an entry without an index row, fails naming the Problem', () => {
        const markdown = register([row('P-001', 'open'), row('P-002', 'open')], [entry('P-001', 'open'), entry('P-003', 'open')]);

        assert.deepEqual(registerErrors(markdown), [
            'P-002 has an index row but no ### P-002 entry',
            'P-003 has a ### entry but no index row',
        ]);
    });

    test('an ID that appears twice in the index or among the entries fails naming the Problem', () => {
        const markdown = register(
            [row('P-001', 'open'), row('P-001', 'open'), row('P-002', 'open')],
            [entry('P-001', 'open'), entry('P-002', 'open'), entry('P-002', 'open')],
        );

        assert.deepEqual(registerErrors(markdown), ['P-001 has more than one index row', 'P-002 has more than one ### entry']);
    });

    test("an index row whose status differs from its entry's fails naming the Problem", () => {
        const markdown = register([row('P-001', 'closed')], [entry('P-001', 'open', [closedBy])]);

        assert.deepEqual(registerErrors(markdown), ['P-001\'s index row says "closed" but its entry\'s Status says "open"']);
    });

    test('a status other than open, accepted gap or closed fails naming the Problem', () => {
        const markdown = register(
            [row('P-001', 'fixed'), row('P-002', 'open')],
            [entry('P-001', 'fixed'), entry('P-002', undefined)],
        );

        assert.deepEqual(registerErrors(markdown), [
            'P-001\'s index row has status "fixed", not one of: open, accepted gap, closed',
            'P-001\'s entry has status "fixed", not one of: open, accepted gap, closed',
            "P-002's entry has no - **Status:** line",
        ]);
    });

    test('a closed Problem without Closed by, or an accepted gap without Reasoning, fails naming the Problem', () => {
        const markdown = register(
            [row('P-001', 'closed'), row('P-002', 'accepted gap')],
            [entry('P-001', 'closed', [reasoning]), entry('P-002', 'accepted gap', [closedBy])],
        );

        assert.deepEqual(registerErrors(markdown), [
            'P-001 is closed but its entry has no **Closed by:**',
            'P-002 is an accepted gap but its entry has no **Reasoning:**',
        ]);
    });
});
