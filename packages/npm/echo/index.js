// @ts-check
// The typed Echo helpers. Plain JS (no build step), typed by index.d.ts next to it. At runtime they are Laravel's own
// `useEcho()` from `@laravel/echo-react`, called with the channel's name and visibility and the event's full name.
import { useEcho as echoReactUseEcho } from '@laravel/echo-react';

/**
 * @import { BroadcastChannel, UseEcho } from './index.js'
 */

/** Echo's default event namespace, `App.Events`, as a broadcast name prefix. */
const echoNamespace = 'App\\Events\\';

/**
 * @param {Record<string, { visibility: 'private' | 'presence', keys: Record<string, string | null> }>} definitions
 * @param {UseEcho} [useEcho]
 */
export function createBroadcasting(definitions, useEcho = /** @type {UseEcho} */ (/** @type {unknown} */ (echoReactUseEcho))) {
    return {
        /**
         * @param {string} pattern
         * @param {Record<string, unknown>} [params]
         * @returns {BroadcastChannel}
         */
        channel: (pattern, params = {}) => {
            const definition = definitions[pattern];

            if (definition === undefined) {
                throw new Error(`routes/channels.php defines no channel ${pattern}.`);
            }

            const name = pattern.replace(/\{(.*?)\}/g, (_, /** @type {string} */ param) => {
                const value = params[param];
                const field = definition.keys[param] ?? null;

                return String(field !== null && typeof value === 'object' && value !== null ? /** @type {Record<string, unknown>} */ (value)[field] : value);
            });

            return { name, visibility: definition.visibility };
        },
        /**
         * @param {string} name
         * @returns {BroadcastChannel}
         */
        publicChannel: (name) => ({ name, visibility: 'public' }),
        /**
         * @param {BroadcastChannel} channel
         * @param {string} event
         * @param {(payload: never) => void} callback
         * @param {import('react').DependencyList} [dependencies]
         */
        useChannelEvent: (channel, event, callback, dependencies = []) =>
            useEcho(channel.name, eventName(event), callback, dependencies, channel.visibility),
    };
}

/**
 * @param {string} key
 */
export function eventName(key) {
    return key.startsWith('.') ? key : `.${echoNamespace}${key.replaceAll('.', '\\')}`;
}
