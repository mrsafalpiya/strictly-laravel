/*
 * Types the generated Wayfinder routes are branded with, and what the request helpers (`@mrsafalpiya/strictly-laravel/react`)
 * read from them. The Composer package's Wayfinder template overrides (StrictlyLaravel\Routes\WayfinderTemplates)
 * intersect each route function's return type with its controller action's brands:
 *
 *     public function store(StoreProjectData $data)   →   store(): RouteDefinition<'post'> & WithInput<StoreProjectData>
 *     public function stats(): SearchStatsData         →   stats(): RouteDefinition<'get'> & WithResponse<SearchStatsData>
 *
 * The brands are types only: nothing of them exists at runtime. The one runtime helper is `selectedKey()`.
 */

declare const keyOf: unique symbol;

/**
 * A model's key by one of its fields (Problem P-128): `Key<'Issue', 'id', number>` is an issue's primary key,
 * `Key<'Issue', 'number', number>` its per-project number. Another model's key, another field of the same model, or a
 * plain number doesn't fit, although each is a number. Branded by the model's class basename and the field:
 *
 *  - a route parameter bound to a model takes the key of the field the route binds by: `show(Issue $issue)` on
 *    `issues/{issue}` takes `Key<'Issue', 'number', number>` when Issue's route key name is `number` (Problem P-003);
 *  - a Data class built from a model (a static `from…(Issue $issue)` method) has its primary key, and each property
 *    named after a field a route binds the model by, generated as that field's key;
 *  - any property declared `#[KeyOf(User::class)]` (input, query and output classes alike) is generated as the
 *    model's primary key, or the key of the field it names: `#[KeyOf(Issue::class, 'number')]`. A list of keys is
 *    branded per item.
 *
 * So keys flow from what the server sent (`issue.id`, `member.id`) to the inputs and routes that take them, without a
 * cast. Contracts check a key as its plain value (`Contract<T>`), and feature tests check that every key the server
 * sends is an existing key of its model (Problem P-116). `TValue` is the key's value type.
 */
export type Key<TModel extends string, TField extends string, TValue = string | number> = TValue extends string | number
    ? TValue & { readonly [keyOf]: `${TModel}.${TField}` }
    : TValue;

/**
 * The field the routes bind each model by when a route names none (`{issue}`): the model's route key name. Filled in
 * by `strictly:generate` (`@/generated/route-keys`), for every model a route or broadcast channel binds.
 */
export interface RouteKeyFields {}

/**
 * A model's route key (Problem P-003): the key of the field a route binds the model by when it names none, its route
 * key name. `RouteKey<'Issue', number>` is `Key<'Issue', 'number', number>` when Issue's route key name is `number`,
 * and `Key<'Project', 'id', number>` for a Project bound by its id. For a model no route or channel binds, it is any
 * key of the model.
 */
export type RouteKey<TModel extends string, TValue> = Key<
    TModel,
    TModel extends keyof RouteKeyFields ? Extract<RouteKeyFields[TModel], string> : string,
    TValue
>;

/**
 * The key a `<Select>` value names: the one of `keys` whose `String()` it is, or null for any other value (the "none"
 * item). A select's value is a string, and `Number(value)` would be a plain number, which an input's model key
 * (`Key<'User', 'id', number>`, `#[KeyOf(User::class)]`) doesn't take: looking it up among the options the server sent
 * keeps the brand, so only one of their keys can be chosen (Problem P-128).
 *
 *     onValueChange={(value) => setData({ leadId: selectedKey(members.map((member) => member.id), value) })}
 */
export declare function selectedKey<TKey extends string | number>(keys: readonly TKey[], value: string): TKey | null;

/** Any model's key (`Key<'Project', 'id', number>`): what Contracts strip, since JSON can't carry the brand. */
export type AnyKey = { readonly [keyOf]: string };

/** @deprecated Use `AnyKey`: every model key, a route key included, has the same brand. */
export type AnyRouteKey = AnyKey;

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
