// @ts-check
// React helpers of the Overlay. Plain JS (no build step), typed by index.d.ts next to it.
import { Deferred, InfiniteScroll, Link, WhenVisible } from '@inertiajs/react';
import { createElement } from 'react';

/**
 * @import { PageHelpers, PageName, PaginationProps, PaginatorLink } from './index.js'
 */

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
