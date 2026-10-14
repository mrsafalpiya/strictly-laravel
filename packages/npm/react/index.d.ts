import type { UseHttpSubmitOptions, VisitOptions } from '@inertiajs/core';
import type { Deferred, InertiaFormProps, InfiniteScroll, WhenVisible } from '@inertiajs/react';
import type { ComponentProps, ForwardRefExoticComponent, ReactElement, ReactNode } from 'react';

import type { PropPath } from '../contracts/index.js';
import type { ErrorsOf, FormState, InputOf, ResponseOf, RouteTarget } from '../routes/index.js';

/**
 * The app's pages and shared props, which the generated types register (`@/generated`, written by
 * `php artisan strictly:generate`):
 *
 *     declare module '@mrsafalpiya/strictly-laravel/react' {
 *         interface Register { pages: InertiaPages; sharedProps: SharedPageProps }
 *     }
 *
 * Empty until the app's types are generated, so no page name type-checks.
 */
export interface Register {}

type Registered<Key extends string> = Register extends { [K in Key]: infer T } ? T : {};

/** Every page's props, by page component name (`InertiaPages` in `@/generated`). */
export type Pages = Registered<'pages'>;

/** The name of every page component that has a Page class. */
export type PageName = Extract<keyof Pages, string>;

/** The props shared with every page (Inertia's `SharedPageProps`), without an index signature. */
export type SharedProps = KnownKeys<Registered<'sharedProps'>>;

/** T without its index signatures: the keys it names. */
type KnownKeys<T> = {
    [K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K]: T[K];
};

/** The props of page K: its own (from its Page class) and the shared ones. */
export type PagePropsOf<K extends PageName> = Pages[K] & SharedProps;

/** A prop name of page K: one of its own props or a shared prop. */
export type PropName<K extends PageName> = Extract<keyof Pages[K] | keyof SharedProps, string>;

/**
 * What a partial reload of page K can ask for: a prop name, or a dotted path to a prop inside one of its own props
 * (`project.stats`), which Inertia then sends with just that prop.
 */
export type ReloadPath<K extends PageName> = PropPath<Pages[K]> | Extract<keyof SharedProps, string>;

/**
 * What `optimistic` in a visit's options takes. Inertia types the callback's props as the shared props plus an index
 * signature, so its own `router.optimistic<TProps>()` trusts any props type the caller names; build one with
 * `forPage<'component'>().optimistic()` instead, typed by the page's props.
 */
export type PageOptimisticUpdate = (props: any) => object | void;

/**
 * Typed versions of every Inertia API that names a page's props with plain strings, returned by `forPage()`. They are
 * properties, not methods, so `<page.Deferred>` and `page.only` can be used unbound.
 */
export interface PageHelpers<K extends PageName> {
    /** `only` for a reload, a visit or `<Link>`: `router.reload({ only: page.only('stats') })`. */
    only: (...props: ReloadPath<K>[]) => ReloadPath<K>[];
    /** `except` for a reload, a visit or `<Link>`. */
    except: (...props: ReloadPath<K>[]) => ReloadPath<K>[];
    /** `reset` (props replaced instead of merged) for a reload, a visit or `<Link>`. */
    reset: (...props: ReloadPath<K>[]) => ReloadPath<K>[];
    /**
     * An optimistic update of this page's props, for a visit's `optimistic` option: the callback receives the page's
     * props and returns the ones to change.
     */
    optimistic: (callback: (props: PagePropsOf<K>) => Partial<PagePropsOf<K>> | void) => PageOptimisticUpdate;
    /** Inertia's `<Deferred>`, whose `data` names deferred props of this page. */
    Deferred: (props: Omit<ComponentProps<typeof Deferred>, 'data'> & { data: PropName<K> | PropName<K>[] }) => ReactNode;
    /** Inertia's `<WhenVisible>`, whose `data` names props of this page. */
    WhenVisible: (props: Omit<ComponentProps<typeof WhenVisible>, 'data'> & { data?: PropName<K> | PropName<K>[] }) => ReactNode;
    /** Inertia's `<InfiniteScroll>`, whose `data` names a scroll prop of this page. */
    InfiniteScroll: ForwardRefExoticComponent<Omit<ComponentProps<typeof InfiniteScroll>, 'data'> & { data: PropName<K> }>;
}

/**
 * The prop names of one page, type-checked against its props (Problem P-045). Call it once per page module:
 *
 *     const page = forPage<'projects/show'>();
 *
 *     router.reload({ only: page.only('stats') });
 *     <page.Deferred data="stats" fallback={<Spinner />}>…</page.Deferred>
 *
 * A renamed prop then fails `tsc` everywhere it is named. The `strictly/typed-prop-names`,
 * `strictly/typed-inertia-components` and `strictly/typed-optimistic-updates` lint rules reject the untyped forms.
 */
export declare function forPage<K extends PageName>(): PageHelpers<K>;

/*
 * Requests typed by the route they go to. Wayfinder's route functions are branded with their controller action's input
 * Data class (the Composer package's Wayfinder template overrides), so the payload, the validation errors and the
 * target all come from the route, never from a type argument or a URL picked by hand. The oxlint rule
 * `strictly/typed-requests` rejects Inertia's untyped `useForm()`, `router.get/post/put/patch/delete()` and
 * `<Link data>`.
 *
 *     const form = useRouteForm(store(), defaults);   // form.data and form.errors: StoreProjectData's fields
 *     submit(update(project), { name });               // payload: UpdateProjectData
 *     visit(destroy(project));                          // an action that takes no input
 */

/** The options of a request: Inertia's visit options, with the validation errors keyed by the route's input. */
export type RequestOptions<TInput> = Omit<VisitOptions, 'method' | 'data' | 'onError'> & {
    onError?: (errors: ErrorsOf<TInput>) => void;
};

/** A route whose action takes an input Data class; any other route is refused with the reason in its type. */
type TakesInput<TRoute> = [InputOf<TRoute>] extends [never]
    ? { __strictly: "this route's action takes no input Data class: use visit(route)" }
    : unknown;

/** A route whose action takes no input Data class; any other route is refused with the reason in its type. */
type TakesNoInput<TRoute> = [InputOf<TRoute>] extends [never]
    ? unknown
    : { __strictly: "this route's action takes an input Data class: use submit(route, data)" };

/** An Inertia visit sending the route's input: `submit(update(project), { name })`. */
export declare function submit<TRoute extends RouteTarget>(
    route: TRoute & TakesInput<TRoute>,
    data: InputOf<TRoute>,
    options?: RequestOptions<InputOf<TRoute>>,
): void;

/**
 * An Inertia visit without a payload: a GET (`visit(index())`), or an action that takes no input
 * (`visit(destroy(project))`). A route whose action takes an input Data class needs `submit(route, data)`.
 */
export declare function visit<TRoute extends RouteTarget>(
    route: TRoute & TakesNoInput<TRoute>,
    options?: Omit<VisitOptions, 'method' | 'data'>,
): void;

/**
 * Inertia's form for one route: its data and errors are the route's input, and `submit()` sends them there. Errors are
 * keyed by every field path of the input, including nested and array ones (`settings.notifyOnAssign`, `tasks.0.title`).
 */
export type RouteForm<TInput> = Omit<
    InertiaFormProps<FormState<TInput> extends Record<string, any> ? FormState<TInput> : never>,
    'errors' | 'submit' | 'get' | 'post' | 'put' | 'patch' | 'delete' | 'withPrecognition'
> & {
    errors: ErrorsOf<TInput>;
    /** Submits the form's data to the route the form was made for. */
    submit: (options?: RequestOptions<TInput>) => void;
};

/**
 * `useForm()` for one route: `useRouteForm(store(), defaults)`. The defaults are the route's input, with a file field
 * `null` until a file is picked; send them from the page, typed as the input class, when they aren't constants.
 */
export declare function useRouteForm<TRoute extends RouteTarget>(
    route: TRoute & TakesInput<TRoute>,
    defaults: FormState<InputOf<TRoute>>,
): RouteForm<InputOf<TRoute>>;

/*
 * JSON endpoints: a controller action returning a Data class brands its route with that response type, so
 * `useRouteHttp(route, init)` types the request from the route's input and the result from its response, with no type
 * argument. The `strictly/typed-requests` lint rule rejects Inertia's untyped `useHttp()`.
 *
 *     const http = useRouteHttp(search(), { q: '' });
 *     const result = await http.submit();
 *     if (result.ok) result.response.hits;   // SearchResultsData
 *     else result.errors.q;                  // a 422: the input's validation errors
 */

/** The request data of a route: its input's form state, nothing when its action takes no input. */
type HttpData<TInput> = [TInput] extends [never] ? {} : FormState<TInput>;

/**
 * What a JSON request resolves to: the response, or the validation errors of a 422, keyed by the route's input.
 * Inertia's own `useHttp().submit()` resolves `undefined` on a 422 while typed as the response (Problem P-049).
 */
export type HttpResult<TInput, TResponse> =
    | { ok: true; response: TResponse }
    | { ok: false; errors: ErrorsOf<TInput> };

/** The options of a JSON request: Inertia's, with the validation errors keyed by the route's input. */
export type HttpRequestOptions<TInput, TResponse> = Omit<UseHttpSubmitOptions<TResponse, HttpData<TInput>>, 'onError'> & {
    onError?: (errors: ErrorsOf<TInput>) => void;
};

/**
 * Inertia's `useHttp()` for one route: its data and errors are the route's input, `response` and the result of
 * `submit()` its response (`unknown` when the action declares none).
 */
export type RouteHttp<TInput, TResponse> = Pick<
    // The state useHttp() shares with useForm(); InertiaFormProps is the one Inertia exports.
    InertiaFormProps<HttpData<TInput> extends Record<string, any> ? HttpData<TInput> : never>,
    | 'data'
    | 'isDirty'
    | 'hasErrors'
    | 'processing'
    | 'progress'
    | 'wasSuccessful'
    | 'recentlySuccessful'
    | 'setData'
    | 'transform'
    | 'setDefaults'
    | 'reset'
    | 'clearErrors'
    | 'resetAndClearErrors'
    | 'cancel'
> & {
    errors: ErrorsOf<TInput>;
    /** The response of the last successful request, `null` before one. */
    response: TResponse | null;
    /**
     * Sends the data to the route the request was made for. Resolves with the response, or with the validation errors
     * of a 422; rejects as Inertia's `useHttp()` does on any other failure (`HttpResponseError`, `HttpCancelledError`).
     */
    submit: (options?: HttpRequestOptions<TInput, TResponse>) => Promise<HttpResult<TInput, TResponse>>;
};

/**
 * `useHttp()` for one JSON endpoint: `useRouteHttp(search(), { q: '' })`, or `useRouteHttp(stats())` for an action
 * that takes no input. The initial data is the route's input, with a file field `null` until a file is picked.
 */
export declare function useRouteHttp<TRoute extends RouteTarget>(
    route: TRoute,
    ...init: [InputOf<TRoute>] extends [never] ? [] : [init: FormState<InputOf<TRoute>>]
): RouteHttp<InputOf<TRoute>, ResponseOf<TRoute>>;

/** One link of a page paginator, as Laravel sends it (`page` since Laravel 11). */
export type PaginatorLink = {
    url: string | null;
    /** HTML: Laravel's default labels contain entities such as `&laquo;`. */
    label: string;
    page: number | null;
    active: boolean;
};

/**
 * What the Pagination component reads from a page paginator: the generated `PaginatedDataCollection<…>` (and
 * `LengthAwarePaginator<…>`) types fit it. A cursor paginator has no page numbers, so it doesn't.
 */
export type PagePaginator = {
    links: readonly PaginatorLink[];
    meta: {
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
};

export type PaginationProps = {
    /** A page-paginated prop, e.g. `PaginatedDataCollection<number, ProjectData>`. */
    paginator: PagePaginator;
    /** Class of the `<nav>`. */
    className?: string;
    /** Class of each link, or a function of the link (to style the active or a disabled one). */
    linkClassName?: string | ((link: PaginatorLink) => string);
};

/**
 * The links of a page paginator: an Inertia `<Link>` per page (scroll position kept), a disabled `<span>` for a link
 * without a URL, and `aria-current="page"` on the active one. Renders nothing when there is a single page. Unstyled:
 * pass classes from the app, where Tailwind sees them.
 */
export declare function Pagination(props: PaginationProps): ReactElement | null;
