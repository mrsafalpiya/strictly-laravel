import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createBroadcasting, eventName } from '../echo/index.js';
import type { ChannelEventListener, UseEcho } from '../echo/index.js';
import type { RouteKey } from '../routes/index.js';

// The Echo helpers at runtime, bound the way @/generated/broadcasting binds them: channel() names a channel from its
// pattern (which the handle carries, for useChannelEvent()'s types), and useChannelEvent() calls Echo's useEcho() with
// the channel and the event's full name. The harness
// scenarios prove their types in an app (broadcast-*-fails-tsc).

type IssueKey = RouteKey<'Issue', number>;

type Events = {
    CommentPosted: { id: number; body: string };
    'Issues.Closed': { id: number };
    '.issue.renamed': { title: string };
};

type Channels = {
    'issues.{issue}': { visibility: 'private'; params: { issue: IssueKey | { id: IssueKey } } };
    'App.Models.User.{id}': { visibility: 'private'; params: { id: string | number } };
    'issues.{issue}.viewers': { visibility: 'presence'; params: { issue: IssueKey | { id: IssueKey } } };
    announcements: { visibility: 'private'; params: {} };
    status: { visibility: 'public'; params: {} };
    'issues.{issue}.public': { visibility: 'public'; params: { issue: IssueKey | { id: IssueKey } } };
};

type ChannelEvents = {
    'issues.{issue}': 'CommentPosted' | 'Issues.Closed';
    'App.Models.User.{id}': never;
    'issues.{issue}.viewers': '.issue.renamed';
    announcements: never;
    status: never;
    'issues.{issue}.public': 'Issues.Closed';
};

const definitions = {
    'issues.{issue}': { visibility: 'private', keys: { issue: 'id' } },
    'App.Models.User.{id}': { visibility: 'private', keys: { id: null } },
    'issues.{issue}.viewers': { visibility: 'presence', keys: { issue: 'id' } },
    announcements: { visibility: 'private', keys: {} },
    status: { visibility: 'public', keys: {} },
    'issues.{issue}.public': { visibility: 'public', keys: { issue: 'id' } },
} as const;

const issue = { id: 4000001 as IssueKey, title: 'Kick-off' };

describe('channel()', () => {
    const { channel, publicChannel } = createBroadcasting<Events, Channels, ChannelEvents>(definitions);

    test('fills the pattern with a route key, or the key of the Data object passed for it', () => {
        assert.deepEqual(channel('issues.{issue}', { issue: issue.id }), { pattern: 'issues.{issue}', name: 'issues.4000001', visibility: 'private' });
        assert.deepEqual(channel('issues.{issue}', { issue }), { pattern: 'issues.{issue}', name: 'issues.4000001', visibility: 'private' });
    });

    test('fills a plain parameter with its value', () => {
        assert.deepEqual(channel('App.Models.User.{id}', { id: 7 }), { pattern: 'App.Models.User.{id}', name: 'App.Models.User.7', visibility: 'private' });
    });

    test('names a presence channel, and a channel without parameters', () => {
        assert.deepEqual(channel('issues.{issue}.viewers', { issue }), { pattern: 'issues.{issue}.viewers', name: 'issues.4000001.viewers', visibility: 'presence' });
        assert.deepEqual(channel('announcements'), { pattern: 'announcements', name: 'announcements', visibility: 'private' });
    });

    test('names a public channel config/strictly.php declares, filling its parameters as channel() does', () => {
        assert.deepEqual(publicChannel('status'), { pattern: 'status', name: 'status', visibility: 'public' });
        assert.deepEqual(publicChannel('issues.{issue}.public', { issue }), { pattern: 'issues.{issue}.public', name: 'issues.4000001.public', visibility: 'public' });
        assert.deepEqual(publicChannel('issues.{issue}.public', { issue: issue.id }), { pattern: 'issues.{issue}.public', name: 'issues.4000001.public', visibility: 'public' });
    });

    test('throws on a pattern of the other kind, which only an untyped call can pass', () => {
        assert.throws(() => (publicChannel as (pattern: string) => unknown)('announcements'), /config\/strictly\.php declares no public channel announcements\./);
        assert.throws(() => (channel as (pattern: string) => unknown)('status'), /routes\/channels\.php defines no channel status\./);
    });
});

describe('useChannelEvent()', () => {
    test("calls Echo's useEcho() with the channel, the event's full name and the callback", () => {
        const calls: Parameters<UseEcho>[] = [];
        const listener: ChannelEventListener = { listen: () => {}, stopListening: () => {}, leaveChannel: () => {}, leave: () => {} };
        const useEcho: UseEcho = (...args) => {
            calls.push(args);

            return listener;
        };
        const { channel, useChannelEvent } = createBroadcasting<Events, Channels, ChannelEvents>(definitions, useEcho);
        const received: string[] = [];
        const callback = (comment: Events['CommentPosted']): void => {
            received.push(comment.body);
        };

        assert.equal(useChannelEvent(channel('issues.{issue}', { issue }), 'CommentPosted', callback, [issue.id]), listener);
        assert.deepEqual(calls, [['issues.4000001', '.App\\Events\\CommentPosted', callback, [issue.id], 'private']]);

        useChannelEvent(channel('issues.{issue}.viewers', { issue }), '.issue.renamed', () => {});
        assert.deepEqual(calls[1]?.slice(0, 2), ['issues.4000001.viewers', '.issue.renamed']);
        assert.deepEqual(calls[1]?.slice(3), [[], 'presence']);
    });
});

describe('eventName()', () => {
    test("is Echo's name for the event under its default namespace, made absolute", () => {
        assert.equal(eventName('CommentPosted'), '.App\\Events\\CommentPosted');
        assert.equal(eventName('Issues.Closed'), '.App\\Events\\Issues\\Closed');
        assert.equal(eventName('.issue.renamed'), '.issue.renamed');
    });
});
