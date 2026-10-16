// @ts-check
// The typed Echo helpers. Plain JS (no build step), typed by index.d.ts next to it. At runtime they are Laravel's own
// `useEcho()` from `@laravel/echo-react`, called with the channel's name and visibility and the event's full name, and
// its `useChannel()` for a presence channel's members.
import { useChannel as echoReactUseChannel, useEcho as echoReactUseEcho } from '@laravel/echo-react';
import { useEffect, useRef } from 'react';

/**
 * @import { BroadcastChannel, EchoPresenceChannel, PresenceCallbacks, UseChannel, UseEcho } from './index.js'
 */

/** Echo's default event namespace, `App.Events`, as a broadcast name prefix. */
const echoNamespace = 'App\\Events\\';

/**
 * @param {Record<string, { visibility: 'public' | 'private' | 'presence', keys: Record<string, string | null> }>} definitions
 * @param {UseEcho} [useEcho]
 * @param {UseChannel} [useChannel]
 */
export function createBroadcasting(
    definitions,
    useEcho = /** @type {UseEcho} */ (/** @type {unknown} */ (echoReactUseEcho)),
    useChannel = /** @type {UseChannel} */ (/** @type {unknown} */ (echoReactUseChannel)),
) {
    /**
     * @param {string} pattern
     * @param {Record<string, unknown>} params
     * @param {boolean} isPublic
     * @returns {BroadcastChannel}
     */
    const name = (pattern, params, isPublic) => {
        const definition = definitions[pattern];

        if (definition === undefined || (definition.visibility === 'public') !== isPublic) {
            throw new Error(isPublic ? `config/strictly.php declares no public channel ${pattern}.` : `routes/channels.php defines no channel ${pattern}.`);
        }

        const filled = pattern.replace(/\{(.*?)\}/g, (_, /** @type {string} */ param) => {
            const value = params[param];
            const field = definition.keys[param] ?? null;

            return String(field !== null && typeof value === 'object' && value !== null ? /** @type {Record<string, unknown>} */ (value)[field] : value);
        });

        return { pattern, name: filled, visibility: definition.visibility };
    };

    return {
        /**
         * @param {string} pattern
         * @param {Record<string, unknown>} [params]
         */
        channel: (pattern, params = {}) => name(pattern, params, false),
        /**
         * @param {string} pattern
         * @param {Record<string, unknown>} [params]
         */
        publicChannel: (pattern, params = {}) => name(pattern, params, true),
        /**
         * @param {BroadcastChannel} channel
         * @param {string} event
         * @param {(payload: never) => void} callback
         * @param {import('react').DependencyList} [dependencies]
         */
        useChannelEvent: (channel, event, callback, dependencies = []) =>
            useEcho(channel.name, eventName(event), callback, dependencies, channel.visibility),
        /**
         * @param {BroadcastChannel} channel
         * @param {PresenceCallbacks<never>} callbacks
         */
        usePresence: (channel, callbacks) => {
            // The latest callbacks, so that a render's new ones are called without joining again.
            const latest = useRef(callbacks);

            useEffect(() => {
                latest.current = callbacks;
            });

            // Echo joins the channel in its own effect, which runs before the one below.
            const { channel: joined, leaveChannel, leave } = useChannel(channel.name, 'presence');

            useEffect(() => followMembers(joined(), () => latest.current), [joined]);

            return { leaveChannel, leave };
        },
    };
}

/**
 * @param {EchoPresenceChannel | null} channel
 * @param {() => PresenceCallbacks<never>} callbacks
 * @returns {() => void}
 */
export function followMembers(channel, callbacks) {
    let following = channel !== null;

    channel
        ?.here((members) => {
            if (following) {
                callbacks().here?.(members);
            }
        })
        .joining((member) => {
            if (following) {
                callbacks().joining?.(member);
            }
        })
        .leaving((member) => {
            if (following) {
                callbacks().leaving?.(member);
            }
        });

    return () => {
        following = false;
    };
}

/**
 * @param {string} key
 */
export function eventName(key) {
    return key.startsWith('.') ? key : `.${echoNamespace}${key.replaceAll('.', '\\')}`;
}
