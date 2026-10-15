// @ts-check
// React helpers of the Overlay. Plain JS (no build step), typed by index.d.ts next to it.
import { Deferred, Form, InfiniteScroll, Link, router, useForm, useHttp, WhenVisible } from '@inertiajs/react';
import { createElement, useCallback } from 'react';

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
 * A field's control name. The FieldName brand exists only in the types (index.d.ts), where `field()` mints it from the
 * route's input; at runtime the name is the field path itself.
 *
 * @param {string} name
 * @returns {string}
 */
const field = (name) => name;

/**
 * Inertia's `<Form>` with `field()` added to its render prop. The route's `.form()` (`action` and `method`) is passed
 * through as it is; its input brand exists only in the types.
 *
 * @param {{ children: import('react').ReactNode | ((slot: Record<string, unknown>) => import('react').ReactNode) } & Record<string, unknown>} props
 */
export function TypedForm({ children, ...props }) {
    const render = typeof children === 'function' ? (/** @type {Record<string, unknown>} */ slot) => children({ ...slot, field }) : children;

    return createElement(Form, /** @type {any} */ (props), /** @type {any} */ (render));
}

/**
 * Inertia's `useHttp()` sent to the route's URL with the route's method. A 422 resolves with the validation errors
 * instead of Inertia's `undefined` (Problem P-049, behaviour of https://github.com/inertiajs/inertia/pull/3142): Inertia
 * reports them through `onError` before resolving, so a request that reported none succeeded.
 *
 * @param {RouteTarget} route
 * @param {Record<string, unknown>} [init]
 */
export function useRouteHttp(route, init = {}) {
    const http = useHttp(/** @type {Record<string, any>} */ (init));
    const send = http.submit;
    const { url, method } = route;

    const submit = useCallback(
        /** @param {{ onError?: (errors: Record<string, string>) => void }} [options] */
        async (options = {}) => {
            /** @type {Record<string, string> | null} */
            let refused = null;
            const response = await send(
                { url, method },
                {
                    ...options,
                    /** @param {Record<string, string>} errors */
                    onError: (errors) => {
                        refused = errors;
                        options.onError?.(errors);
                    },
                },
            );

            return refused === null ? { ok: true, response } : { ok: false, errors: refused };
        },
        [send, url, method],
    );

    return { ...http, submit };
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
