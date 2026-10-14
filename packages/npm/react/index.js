// @ts-check
// React helpers of the Overlay. Plain JS (no build step), typed by index.d.ts next to it.
import { Deferred, InfiniteScroll, Link, router, useForm, WhenVisible } from '@inertiajs/react';
import { createElement } from 'react';

/**
 * @import { PageHelpers, PageName, PaginationProps, PaginatorLink } from './index.js'
 * @import { RouteTarget } from '../routes/index.js'
 */

// The request helpers. Their types (index.d.ts) take the payload and error keys from the route's brand; at runtime
// they are Inertia's own requests, sent to the route's URL with the route's method.

/**
 * @param {RouteTarget} route
 * @param {Record<string, unknown>} data
 * @param {Record<string, unknown>} [options]
 */
export function submit(route, data, options = {}) {
    router.visit(route.url, { ...options, method: route.method, data });
}

/**
 * @param {RouteTarget} route
 * @param {Record<string, unknown>} [options]
 */
export function visit(route, options = {}) {
    router.visit(route.url, { ...options, method: route.method });
}

/**
 * @param {RouteTarget} route
 * @param {Record<string, unknown>} defaults
 */
export function useRouteForm(route, defaults) {
    const form = useForm(/** @type {Record<string, any>} */ (defaults));

    return {
        ...form,
        /** @param {Record<string, unknown>} [options] */
        submit: (options) => form.submit({ url: route.url, method: route.method }, options),
    };
}

/**
 * @param {string[]} props
 * @returns {string[]}
 */
const names = (...props) => props;

/**
 * The helpers are the same for every page: only their types differ, by page (index.d.ts).
 */
const helpers = Object.freeze({
    only: names,
    except: names,
    reset: names,
    /** @param {(props: any) => object | void} callback */
    optimistic: (callback) => callback,
    Deferred,
    WhenVisible,
    InfiniteScroll,
});

/**
 * @template {PageName} K
 * @returns {PageHelpers<K>}
 */
export function forPage() {
    // @ts-expect-error: the runtime helpers are Inertia's own; index.d.ts narrows their prop names to page K's.
    return helpers;
}

/**
 * @param {PaginationProps} props
 */
export function Pagination({ paginator, className, linkClassName }) {
    if (paginator.meta.last_page <= 1) {
        return null;
    }

    /** @param {PaginatorLink} link */
    const classOf = (link) => (typeof linkClassName === 'function' ? linkClassName(link) : linkClassName);

    return createElement(
        'nav',
        { 'aria-label': 'Pagination', className },
        paginator.links.map((link, index) =>
            link.url === null
                ? createElement('span', {
                      key: index,
                      'aria-disabled': true,
                      className: classOf(link),
                      dangerouslySetInnerHTML: { __html: link.label },
                  })
                : createElement(Link, {
                      key: index,
                      href: link.url,
                      preserveScroll: true,
                      'aria-current': link.active ? 'page' : undefined,
                      className: classOf(link),
                      dangerouslySetInnerHTML: { __html: link.label },
                  }),
        ),
    );
}
