import type { FormDataKeys } from '@inertiajs/core';

/*
 * Types referenced by the generated Wayfinder route functions (see App\Support\Wayfinder\RouteTypes).
 */

/**
 * `options` of a route whose controller action type-hints a QueryData class:
 * `index(workspace, { query: { statuses: ['todo'], sort: 'priority' } })`.
 */
export type QueryOptions<TQuery> = {
    query?: Partial<TQuery>;
    mergeQuery?: Partial<TQuery>;
};

/**
 * Phantom brand on route definitions whose controller action type-hints an InputData class: the
 * request payload type. Never present at runtime; read it with `InputOf<typeof route>`.
 */
export type WithInput<TInput> = { readonly __input?: TInput };

/** The input Data type of a branded route definition, `never` when the action has none. */
export type InputOf<TRoute> = TRoute extends (
    ...args: never[]
) => infer TDefinition
    ? InputOf<TDefinition>
    : TRoute extends WithInput<infer TInput>
      ? unknown extends TInput
          ? never
          : TInput
      : never;

/**
 * Phantom brand on JSON endpoints (controller actions returning a Data object): the response type.
 * `useRouteHttp(search(workspace), …)` (`@/lib/requests`) derives both from the route.
 */
export type WithResponse<TResponse> = { readonly __response?: TResponse };

/** The response Data type of a branded JSON route, `never` when the action returns none. */
export type ResponseOf<TRoute> = TRoute extends (
    ...args: never[]
) => infer TDefinition
    ? ResponseOf<TDefinition>
    : TRoute extends WithResponse<infer TResponse>
      ? unknown extends TResponse
          ? never
          : TResponse
      : never;

/**
 * A field name of an input Data type, including nested and array paths (`settings.notifications.onAssign`,
 * `labelIds.0`). The contract recorder proves every field the server validates or reports an error for is one.
 */
export type InputKey<TInput> = FormDataKeys<DeepRequired<TInput>>;

/**
 * Inertia's FormDataKeys skips the paths inside *optional* properties (`labelIds?: number[]` has no
 * `labelIds.0`), but the server can still report errors there: count them as fields.
 */
type DeepRequired<T> = T extends (infer TItem)[]
    ? DeepRequired<TItem>[]
    : T extends object
      ? { [K in keyof T]-?: DeepRequired<NonNullable<T[K]>> }
      : T;

declare const fieldName: unique symbol;

/**
 * A form field name produced by `field('…')` (TypedForm). Form controls (`Input`, `Checkbox`, …) only
 * accept this for `name`, so a plain string — literal or in a variable — can't name a field.
 */
export type FieldName = string & { readonly [fieldName]: true };

declare const routeKeyOf: unique symbol;

/**
 * A model's route key (`ProjectData.key`, `WorkspaceData.slug`): generated for route parameters bound to the
 * model and for the matching property of Data classes built `fromModel()` it (App\Support\Wayfinder\RouteKeys).
 * `show({ workspace, project })` accepts a ProjectData or its `key`, but not an issue's key or a plain string.
 */
export type RouteKey<TModel extends string, TValue> = TValue extends
    | string
    | number
    ? TValue & { readonly [routeKeyOf]: TModel }
    : TValue;

/**
 * `T` with its RouteKey brands removed: what the server's JSON can be checked against (the recorded
 * contracts). The brands themselves are derived from the PHP code, not from the JSON.
 */
export type Unbranded<T> = T extends { readonly [routeKeyOf]: string }
    ? T extends string
        ? string
        : number
    : T extends readonly (infer TItem)[]
      ? Unbranded<TItem>[]
      : T extends object
        ? { [K in keyof T]: Unbranded<T[K]> }
        : T;
