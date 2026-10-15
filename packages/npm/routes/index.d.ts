/*
 * Types the generated Wayfinder routes are branded with, and what the request helpers (`@mrsafalpiya/strictly-laravel/react`)
 * read from them. The Composer package's Wayfinder template overrides (StrictlyLaravel\Routes\WayfinderTemplates)
 * intersect each route function's return type with its controller action's brands:
 *
 *     public function store(StoreProjectData $data)   →   store(): RouteDefinition<'post'> & WithInput<StoreProjectData>
 *     public function stats(): SearchStatsData         →   stats(): RouteDefinition<'get'> & WithResponse<SearchStatsData>
 *
 * Types only: nothing here exists at runtime.
 */

declare const routeKeyOf: unique symbol;

/**
 * A model's route key (Problem P-003): what a route parameter bound to the model takes, and how the matching property
 * of a Data class built from the model, or declared `#[RouteKeyOf(Project::class)]`, is generated:
 *
 *     public function show(Project $project)   →   show(project), show(project.id), show(issue.project_id)
 *
 * all take `RouteKey<'Project', number>`, so an issue, its `id` or a plain number don't fit. Branded by the model's
 * class basename. Feature tests check that every branded value the server sends is an existing key of its model.
 */
export type RouteKey<TModel extends string, TValue> = TValue extends string | number
    ? TValue & { readonly [routeKeyOf]: TModel }
    : TValue;

/** Any model's route key (`RouteKey<'Project', number>`): what Contracts strip, since JSON can't carry the brand. */
export type AnyRouteKey = { readonly [routeKeyOf]: string };

/** An HTTP method an Inertia visit can use. */
export type VisitMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** A route a request can go to: what a Wayfinder route function returns (`store()`, `update(project)`). */
export type RouteTarget = { url: string; method: VisitMethod };

/**
 * Phantom brand on the route functions of a controller action that takes an input Data class (an InputData
 * subclass): the request payload type. Never present at runtime; read it with `InputOf<typeof route>`.
 */
export type WithInput<TInput> = { readonly __input?: TInput };

/** The input Data type a route (or route function) is branded with, `never` when its action takes none. */
export type InputOf<TRoute> = TRoute extends (...args: never[]) => infer TDefinition
    ? InputOf<TDefinition>
    : TRoute extends WithInput<infer TInput>
      ? unknown extends TInput
          ? never
          : TInput
      : never;

/**
 * Phantom brand on the route functions of a JSON endpoint, a controller action that returns a Data class: the response
 * type. Never present at runtime; read it with `ResponseOf<typeof route>`.
 */
export type WithResponse<TResponse> = { readonly __response?: TResponse };

/**
 * The response Data type a route (or route function) is branded with, `unknown` when its action declares none: such a
 * response can't be used before it is checked.
 */
export type ResponseOf<TRoute> = TRoute extends (...args: never[]) => infer TDefinition
    ? ResponseOf<TDefinition>
    : TRoute extends WithResponse<infer TResponse>
      ? TResponse
      : unknown;

/**
 * The `options` of a route function whose GET action takes a query Data class (a QueryData subclass), in place of
 * Wayfinder's `RouteQueryOptions`: `index({ query: { statuses: ['active'], sort: 'name' } })`. Every key is optional,
 * since every query property has a default; a misspelled key or a value of the wrong type fails `tsc`. `mergeQuery`
 * keeps the current URL's other keys.
 */
export type QueryOptions<TQuery> = {
    query?: Partial<TQuery>;
    mergeQuery?: Partial<TQuery>;
};

declare const actionTakesNoQueryClass: unique symbol;

/**
 * The `query` of a route whose action takes no query class (Problem P-106): no value fits, so
 * `dashboard({ query: { tab: 'stats' } })` fails `tsc` with "'tab' does not exist in type 'NoQueryClass'". To send a
 * query string, take a query class (a QueryData subclass) on the action; its route function then takes
 * `QueryOptions<TQuery>`.
 */
export type NoQueryClass = { readonly [actionTakesNoQueryClass]: never };

/**
 * The `options` of a route function whose action takes no query class: a controller action without one, a closure
 * route, or a vendor action config/strictly.php declares no query class for. It still fits Wayfinder's
 * `RouteQueryOptions`, which the generated function passes it on as.
 */
export type NoQueryOptions = {
    query?: NoQueryClass;
    mergeQuery?: NoQueryClass;
};

/**
 * Every field name of an input type, including nested and array paths (`settings.notifyOnAssign`, `tags.0`,
 * `tasks.0.title`): the keys the server can report a validation error under. The validation-error Contracts prove
 * that every error key the server returns is one.
 */
export type InputKey<TInput> = FieldPaths<DeepRequired<TInput>>;

/** The validation errors of a request with the given input, one message per field. */
export type ErrorsOf<TInput> = Partial<Record<InputKey<TInput>, string>>;

declare const fieldName: unique symbol;

/**
 * The name of a form control (`<input name>`, and a component's `name` it forwards to one): a field path of a form's
 * input, minted only by `field()` in `<TypedForm>`'s render prop (`@mrsafalpiya/strictly-laravel/react`). The app's
 * JSX types (`@mrsafalpiya/strictly-laravel/jsx`, ADR-0004) accept nothing else as the `name` of `<input>`, `<select>`,
 * `<textarea>` and `<button>`, so a plain string, or a misspelled field, fails `tsc`. It proves the name is a field of
 * some form's input, not of the enclosing form's (P-027).
 */
export type FieldName = string & { readonly [fieldName]: true };

/** The form state of an input: a file field is empty (`null`) until a file is picked; the server still requires it. */
export type FormState<TInput> = {
    [K in keyof TInput]: TInput[K] extends File ? TInput[K] | null : TInput[K];
};

/**
 * Paths inside optional or nullable properties are fields too (`labelIds?: number[]` has `labelIds.0`): the server
 * reports errors there when they are sent.
 */
type DeepRequired<T> = T extends Blob | Date
    ? T
    : T extends readonly (infer TItem)[]
      ? DeepRequired<NonNullable<TItem>>[]
      : T extends object
        ? { [K in keyof T]-?: DeepRequired<NonNullable<T[K]>> }
        : T;

type Leaf = Blob | Date | string | number | bigint | boolean | null | undefined;

type FieldPaths<T> = T extends Leaf
    ? never
    : T extends readonly (infer TItem)[]
      ? `${number}` | (TItem extends Leaf ? never : `${number}.${FieldPaths<TItem>}`)
      : T extends object
        ? string extends keyof T
            ? string
            : {
                  [K in keyof T & string]: K | (T[K] extends Leaf ? never : `${K}.${FieldPaths<T[K]>}`);
              }[keyof T & string]
        : never;
