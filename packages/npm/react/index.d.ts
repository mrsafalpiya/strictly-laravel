import type { Deferred, InfiniteScroll, WhenVisible } from '@inertiajs/react';
import type { ComponentProps, ForwardRefExoticComponent, ReactElement, ReactNode } from 'react';

import type { PropPath } from '../contracts/index.js';

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
