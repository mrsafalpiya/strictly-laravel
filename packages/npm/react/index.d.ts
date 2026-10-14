import type { ReactElement } from 'react';

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
