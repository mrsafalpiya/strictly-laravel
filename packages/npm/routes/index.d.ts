/*
 * Types the generated Wayfinder routes are branded with, and what the request helpers (`@mrsafalpiya/strictly-laravel/react`)
 * read from them. The Composer package's Wayfinder template overrides (StrictlyLaravel\Routes\WayfinderTemplates)
 * intersect each route function's return type with its controller action's brands:
 *
 *     public function store(StoreProjectData $data)   →   store(): RouteDefinition<'post'> & WithInput<StoreProjectData>
 *
 * Types only: nothing here exists at runtime.
 */

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
