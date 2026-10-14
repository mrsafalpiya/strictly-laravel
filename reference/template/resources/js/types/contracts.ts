import type { ErrorBag, Errors } from '@inertiajs/core';
import type { PageComponent, PageProps, SharedProps } from '@/generated';
import type { Unbranded } from '@/lib/routes';

/**
 * Everything the server sends as `page.props` for page K. Used by the contract files that
 * feature tests record into resources/js/__contracts__ (see tests/Support/InertiaContracts.php).
 */
export type PageContract<K extends PageComponent> = Unbranded<
    PageProps<K> & SharedProps
> & { errors: Errors & ErrorBag };

/**
 * A partial reload (`router.reload({ only: ['comments'] })`): the requested props must be present
 * (even deferred/optional ones); anything else must still be a known prop.
 */
export type PartialPageContract<
    K extends PageComponent,
    Keys extends keyof PageContract<K>,
> = Required<Pick<PageContract<K>, Keys>> & Partial<PageContract<K>>;
