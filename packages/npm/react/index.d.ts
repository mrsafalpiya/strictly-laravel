import type { VisitOptions } from '@inertiajs/core';
import type { InertiaFormProps } from '@inertiajs/react';
import type { ReactElement } from 'react';

import type { ErrorsOf, FormState, InputOf, RouteTarget } from '../routes/index.js';

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
