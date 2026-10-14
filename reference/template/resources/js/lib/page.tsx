import {
    Deferred as InertiaDeferred,
    InfiniteScroll as InertiaInfiniteScroll,
    WhenVisible as InertiaWhenVisible,
} from '@inertiajs/react';
import type { OptimisticCallback } from '@inertiajs/core';
import type { ComponentProps } from 'react';
import type { PageComponent, PageProps, SharedProps } from '@/types';
import type { PageContract } from '@/types/contracts';

/** A prop name of page K (its own props, the shared props and `errors`). */
export type PropName<K extends PageComponent> = Extract<
    keyof PageContract<K>,
    string
>;

/**
 * Typed versions of every Inertia API that names props with plain strings. Call once per page module:
 *
 *     const page = forPage<'issues/show'>();
 *
 *     router.reload({ only: page.only('comments') });
 *     <page.Deferred data="activity" fallback={…}>…</page.Deferred>
 *
 * The lint rule `type-safety/typed-prop-names` rejects raw `only: ['…']` lists and direct imports of
 * Deferred / WhenVisible / InfiniteScroll, so a renamed prop can't silently stop reloading.
 */
export function forPage<K extends PageComponent>() {
    type Name = PropName<K>;

    const names = (...props: Name[]): Name[] => props;

    return {
        /** `only` for router visits, reloads and `<Link>`. */
        only: names,
        /** `except` for router visits, reloads and `<Link>`. */
        except: names,
        /** `reset` (props to replace instead of merge) for router visits and `<Link>`. */
        reset: names,
        /**
         * An optimistic update of this page's props, for `submit(route, data, { optimistic })`. Inertia's own
         * `router.optimistic<TProps>()` takes any props type the caller names; this one is the page's.
         */
        optimistic: (
            callback: (
                props: PageProps<K> & SharedProps,
            ) => Partial<PageProps<K>> | void,
        ): OptimisticCallback =>
            // Inertia calls it with the current page's props, which the contracts prove are PageProps<K>.
            callback as unknown as OptimisticCallback,
        Deferred: (
            props: Omit<ComponentProps<typeof InertiaDeferred>, 'data'> & {
                data: Name | Name[];
            },
        ) => <InertiaDeferred {...props} />,
        WhenVisible: (
            props: Omit<ComponentProps<typeof InertiaWhenVisible>, 'data'> & {
                data?: Name | Name[];
            },
        ) => <InertiaWhenVisible {...props} />,
        InfiniteScroll: (
            props: Omit<
                ComponentProps<typeof InertiaInfiniteScroll>,
                'data'
            > & { data: Name },
        ) => <InertiaInfiniteScroll {...props} />,
    };
}
