import type { AnyRouteKey } from '../routes/index.js';

/**
 * The type a recorded Contract of a value of type T is checked against: what the server can send for T as JSON. The
 * Contracts that feature tests record (resources/js/__contracts__, written by the Composer package's ContractRecorder)
 * are checked with it:
 *
 *     export const props = { … } satisfies Contract<PageProps<'members'>>;
 *
 * It is T, except that PHP has no empty map: `json_encode()` sends an empty array as `[]` whatever its keys would have
 * been (Problem P-076). So an object type with no required property (a map such as `Partial<Record<Status, number>>`
 * or `Record<string, number>`, or a Data object whose props are all optional) may arrive as `[]`, at any depth. Reading
 * such a value by key still gives `undefined`, as its type allows. Nothing else is relaxed: a non-empty list sent for a
 * map, or `[]` for an object with a required property, still fails.
 *
 * A route key (`RouteKey<'Project', number>`) is checked as its plain value: JSON can't carry the brand, which the
 * types derive from the PHP code instead. The feature tests check the value is an existing key of its model.
 */
export type Contract<T> = T extends AnyRouteKey
    ? T extends string
        ? string
        : number
    : T extends readonly unknown[]
      ? { [K in keyof T]: Contract<T[K]> }
      : T extends object
        ? {} extends T
            ? { [K in keyof T]: Contract<T[K]> } | []
            : { [K in keyof T]: Contract<T[K]> }
        : T;

/**
 * What a partial reload of a page with props T sends (Problem P-046): every prop it asked for, present even when the
 * page's type marks it optional (a deferred or lazy prop), and any other prop at most. `Keys` are the requested names,
 * as Inertia reads them from `only`; a dotted name (`project.stats`) asks for one prop inside another, which then
 * arrives with just that prop. A name that isn't a prop of the page fails the constraint. A reload with only `except`
 * asks for nothing in particular: `PartialReload<T, never>`.
 *
 *     export const props = { "stats": { … } } satisfies Contract<PartialReload<PageProps<'reports'>, 'stats'>>;
 */
export type PartialReload<T, Keys extends PropPath<T>> = Reloaded<T, Keys>;

/** Every prop name of T, and the dotted paths to the props of its objects, a few levels deep. */
export type PropPath<T, Depth extends number = 3> = [Depth] extends [never]
    ? never
    : T extends readonly unknown[]
      ? never
      : T extends object
        ? {
              [K in keyof T & string]-?: K | `${K}.${PropPath<Exclude<T[K], null | undefined>, PreviousDepth[Depth]>}`;
          }[keyof T & string]
        : never;

type PreviousDepth = [never, 0, 1, 2, 3];

/** The first segment of each path: `project` for `project.stats`. */
type HeadOf<P extends string> = P extends `${infer Head}.${string}` ? Head : P;

/** The rest of each path that starts with `Head.`: `stats` for `project.stats`. */
type TailOf<P extends string, Head extends string> = P extends `${Head}.${infer Tail}` ? Tail : never;

type Reloaded<T, P extends string> = T extends readonly unknown[]
    ? T
    : T extends object
      ? Flatten<
            {
                [K in keyof T as K extends HeadOf<P> ? K : never]-?: K extends P
                    ? Exclude<T[K], undefined>
                    : ReloadedValue<Exclude<T[K], undefined>, TailOf<P, K & string>>;
            } & { [K in keyof T as K extends HeadOf<P> ? never : K]?: T[K] }
        >
      : T;

type ReloadedValue<V, P extends string> = V extends readonly unknown[] ? V : V extends object ? Reloaded<V, P> : V;

type Flatten<T> = { [K in keyof T]: T[K] };
