import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { createBroadcasting, eventName, followMembers } from '../echo/index.js';
import type { ChannelEventListener, EchoPresenceChannel, PresenceCallbacks, PresenceListener, UseChannel, UseEcho } from '../echo/index.js';
import type { Key } from '../routes/index.js';

// The Echo helpers at runtime, bound the way @/generated/broadcasting binds them: channel() names a channel from its
// pattern (which the handle carries, for useChannelEvent()'s types), and useChannelEvent() calls Echo's useEcho() with
// the channel and the event's full name, and usePresence() joins a presence channel through Echo's useChannel() and
// follows its members. The harness scenarios prove their types in an app (broadcast-*-fails-tsc, presence-*-fails-tsc).

type IssueKey = Key<'Issue', 'id', number>;

type Events = {
    CommentPosted: { id: number; body: string };
    'Issues.Closed': { id: number };
    '.issue.renamed': { title: string };
};

type Channels = {
    'issues.{issue}': { visibility: 'private'; params: { issue: IssueKey | { id: IssueKey } } };
    'App.Models.User.{id}': { visibility: 'private'; params: { id: string | number } };
    'issues.{issue}.viewers': { visibility: 'presence'; params: { issue: IssueKey | { id: IssueKey } }; member: Viewer };
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

type Viewer = { id: number; name: string };

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

describe('usePresence()', () => {
    test("joins the presence channel through Echo's useChannel() and hands back its controls", () => {
        const joined: Parameters<UseChannel>[] = [];
        const controls: PresenceListener = { leaveChannel: () => {}, leave: () => {} };
        const useChannel: UseChannel = (...args) => {
            joined.push(args);

            return { ...controls, channel: () => null };
        };
        const { channel, usePresence } = createBroadcasting<Events, Channels, ChannelEvents>(definitions, undefined, useChannel);
        let listener: PresenceListener | undefined;

        function Viewers() {
            listener = usePresence(channel('issues.{issue}.viewers', { issue }), { here: (viewers) => viewers.map((viewer) => viewer.name) });

            return null;
        }

        renderToStaticMarkup(createElement(Viewers));

        assert.deepEqual(joined, [['issues.4000001.viewers', 'presence']]);
        assert.deepEqual(listener, controls);
    });
});

describe('followMembers()', () => {
    /** A presence channel that reports its members when the test says so, as Echo's do. */
    function presenceChannel() {
        const callbacks: { here: ((members: never[]) => void)[]; joining: ((member: never) => void)[]; leaving: ((member: never) => void)[] } = {
            here: [],
            joining: [],
            leaving: [],
        };
        const channel: EchoPresenceChannel = {
            here: (callback) => (callbacks.here.push(callback), channel),
            joining: (callback) => (callbacks.joining.push(callback), channel),
            leaving: (callback) => (callbacks.leaving.push(callback), channel),
        };
        const report = (event: 'here' | 'joining' | 'leaving', data: unknown) =>
            callbacks[event].forEach((callback) => (callback as (data: unknown) => void)(data));

        return { channel, report };
    }

    const ada: Viewer = { id: 1, name: 'Ada' };
    const grace: Viewer = { id: 2, name: 'Grace' };

    test('calls the latest here, joining and leaving as the channel reports its members', () => {
        const { channel, report } = presenceChannel();
        const seen: string[] = [];
        let callbacks: PresenceCallbacks<Viewer> = { here: (viewers) => seen.push(`here ${viewers.map((viewer) => viewer.name).join(',')}`) };

        followMembers(channel, () => callbacks as PresenceCallbacks<never>);
        report('here', [ada]);
        report('joining', grace);
        callbacks = { joining: (viewer) => seen.push(`joining ${viewer.name}`), leaving: (viewer) => seen.push(`leaving ${viewer.name}`) };
        report('joining', grace);
        report('leaving', ada);

        assert.deepEqual(seen, ['here Ada', 'joining Grace', 'leaving Ada']);
    });

    test('calls nothing once stopped, and does nothing for a channel not joined yet', () => {
        const { channel, report } = presenceChannel();
        const seen: Viewer[] = [];
        const stop = followMembers(channel, () => ({ joining: (viewer: never) => seen.push(viewer) }));

        report('joining', ada);
        stop();
        report('joining', grace);

        assert.deepEqual(seen, [ada]);
        assert.doesNotThrow(() => followMembers(null, () => ({}))());
    });
});

describe('eventName()', () => {
    test("is Echo's name for the event under its default namespace, made absolute", () => {
        assert.equal(eventName('CommentPosted'), '.App\\Events\\CommentPosted');
        assert.equal(eventName('Issues.Closed'), '.App\\Events\\Issues\\Closed');
        assert.equal(eventName('.issue.renamed'), '.issue.renamed');
    });
});
