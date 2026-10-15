import type { DependencyList } from 'react';

/*
 * The typed Echo helpers (Problems P-052, P-053, P-054, P-143), built on Laravel's own React hooks, `@laravel/echo-react`,
 * which `php artisan install:broadcasting` installs and configures (`configureEcho()`). `php artisan strictly:generate`
 * writes `@/generated/broadcasting`, which binds them to the app's broadcast events and channels; apps import
 * `channel`, `publicChannel` and `useChannelEvent` from there:
 *
 *     useChannelEvent(channel('issues.{issue}', { issue: issue.id }), 'CommentPosted', (comment) => …);
 *
 * This file declares its own types and imports nothing from `@laravel/echo-react`, so an app type-checks whether or
 * not it has installed broadcasting.
 */

/** How a client subscribes to a channel: as Echo's `useEcho()` takes it. */
export type ChannelVisibility = 'public' | 'private' | 'presence';

/**
 * A channel the app knows: a private or presence one routes/channels.php defines, or a public one config/strictly.php
 * declares. How a client subscribes to it, and what each parameter of its name takes.
 */
export type ChannelDefinition = {
    visibility: ChannelVisibility;
    params: Record<string, unknown>;
};

/** The patterns of the channels a client subscribes to with the given visibilities. */
export type ChannelPattern<Channels extends Record<string, ChannelDefinition>, Visibility extends ChannelVisibility> = Extract<
    { [Pattern in keyof Channels]: Channels[Pattern]['visibility'] extends Visibility ? Pattern : never }[keyof Channels],
    string
>;

/** A named channel to listen on, from `channel()` or `publicChannel()`. */
export type BroadcastChannel = {
    readonly name: string;
    readonly visibility: ChannelVisibility;
};

/** Whether `Pattern` is a single pattern rather than a union of them. */
type IsOnePattern<Pattern extends PropertyKey> = { [One in Pattern]: [Exclude<Pattern, One>] extends [never] ? true : false }[Pattern];

/**
 * What `channel()` and `publicChannel()` take after the pattern: nothing for a pattern without parameters, else a value
 * for each. For a pattern the app doesn't know, `tsc` infers every pattern (or none), and the parameters may be passed
 * or not, so `tsc` reports the pattern rather than the number of arguments (a pattern typed as a union takes none).
 */
export type ChannelArgs<Channels extends Record<string, ChannelDefinition>, Pattern extends keyof Channels> = [Pattern] extends [never]
    ? []
    : false extends IsOnePattern<Pattern>
      ? [params?: never]
      : [keyof Channels[Pattern]['params']] extends [never]
        ? []
        : [params: Channels[Pattern]['params']];

/** What `useChannelEvent()` returns: Echo's controls for the listener and its channel. */
export interface ChannelEventListener {
    /** Listen again after `stopListening()`. */
    listen: () => void;
    /** Stop listening for the event, staying subscribed to the channel. */
    stopListening: () => void;
    /** Leave the channel (all of its visibilities with `leaveAll`). */
    leaveChannel: (leaveAll?: boolean) => void;
    /** Leave the channel and its private and presence variants. */
    leave: () => void;
}

/** The helpers bound to an app's broadcast events and channels, as `@/generated/broadcasting` exports them. */
export interface Broadcasting<Events extends Record<string, unknown>, Channels extends Record<string, ChannelDefinition>> {
    /**
     * A channel routes/channels.php defines, by its pattern, with its name's parameters filled: a pattern it doesn't
     * define, or a missing or misnamed parameter, fails `tsc` (Problem P-054). A parameter the channel binds to a model
     * takes that model's route key, or the Data object holding it.
     */
    channel: <Pattern extends ChannelPattern<Channels, 'private' | 'presence'>>(
        pattern: Pattern,
        ...params: ChannelArgs<Channels, Pattern>
    ) => BroadcastChannel;
    /**
     * A public channel config/strictly.php declares (`public_channels`), by its pattern, with its name's parameters
     * filled as `channel()` fills them: a name it doesn't declare fails `tsc` (Problem P-143).
     */
    publicChannel: <Pattern extends ChannelPattern<Channels, 'public'>>(
        pattern: Pattern,
        ...params: ChannelArgs<Channels, Pattern>
    ) => BroadcastChannel;
    /**
     * Listen on a channel for an event the app broadcasts, by the name Echo listens for it (`CommentPosted`, or
     * `.comment.posted` for an event broadcast as `comment.posted`): a name no event has fails `tsc` (Problem P-053),
     * and the callback's payload is the event's Data class (Problem P-052). Subscribes on mount and leaves on unmount,
     * as Echo's `useEcho()` does; `dependencies` are the callback's, as for `useCallback()`.
     */
    useChannelEvent: <Event extends Extract<keyof Events, string>>(
        channel: BroadcastChannel,
        event: Event,
        callback: (payload: Events[Event]) => void,
        dependencies?: DependencyList,
    ) => ChannelEventListener;
}

/** How `@laravel/echo-react`'s `useEcho()` is called; the helpers call it (a test may pass its own). */
export type UseEcho = (
    channelName: string,
    event: string,
    callback: (payload: never) => void,
    dependencies: DependencyList,
    visibility: ChannelVisibility,
) => ChannelEventListener;

/**
 * Bind the helpers to an app's broadcast events and channels: `definitions` holds each pattern's visibility and, for a
 * parameter bound to a model, the route key field to read from a Data object passed for it (`null` for a plain one).
 * `@/generated/broadcasting` calls it; apps import the helpers from there.
 */
export function createBroadcasting<Events extends Record<string, unknown>, Channels extends Record<string, ChannelDefinition>>(
    definitions: {
        [Pattern in keyof Channels]: {
            visibility: Channels[Pattern]['visibility'];
            keys: { [Param in keyof Channels[Pattern]['params']]: string | null };
        };
    },
    useEcho?: UseEcho,
): Broadcasting<Events, Channels>;

/**
 * The name Echo's `listen()` takes for an event key, absolute so that it doesn't depend on the namespace Echo is
 * configured with: `.App\Events\CommentPosted` for `CommentPosted`, `.comment.posted` for `.comment.posted`.
 */
export function eventName(key: string): string;
