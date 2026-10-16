import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { selectedKey } from '../routes/index.js';
import type { Key } from '../routes/index.js';

// selectedKey() at runtime. The harness scenarios prove it in an app: model-key-select-looked-up-passes, and
// model-key-from-select-number-fails-tsc for the Number(value) it replaces.

// The keys the server sends (`member.id`) carry their brand only in TypeScript; a test mints them.
const userKey = (id: number) => id as Key<'User', 'id', number>;
const issueKey = (number: string) => number as Key<'Issue', 'number', string>;

describe('selectedKey()', () => {
    test('returns the key whose string a select value is, with its brand', () => {
        const keys = [userKey(3), userKey(14), userKey(15)];

        const picked: Key<'User', 'id', number> | null = selectedKey(keys, '14');

        // @ts-expect-error The brand is the keys': a user's key is no issue's.
        const misread: Key<'Issue', 'id', number> | null = selectedKey(keys, '14');

        assert.equal(picked, 14);
        assert.equal(misread, 14);
    });

    test('returns null for a value that is none of the keys, such as the "none" item', () => {
        const keys = [userKey(3), userKey(14)];

        assert.equal(selectedKey(keys, 'none'), null);
        assert.equal(selectedKey(keys, ''), null);
        assert.equal(selectedKey(keys, '4'), null);
        assert.equal(selectedKey([], '3'), null);
    });

    test('matches a number key by its exact string only', () => {
        const keys = [userKey(3)];

        assert.equal(selectedKey(keys, ' 3'), null);
        assert.equal(selectedKey(keys, '3.0'), null);
        assert.equal(selectedKey(keys, '03'), null);
    });

    test('returns a string key as it is', () => {
        const keys = [issueKey('TL-1'), issueKey('TL-2')];

        const picked: Key<'Issue', 'number', string> | null = selectedKey(keys, 'TL-2');

        assert.equal(picked, 'TL-2');
        assert.equal(selectedKey(keys, 'tl-2'), null);
    });
});
