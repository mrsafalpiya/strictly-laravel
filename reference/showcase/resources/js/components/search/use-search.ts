import { useRef } from 'react';
import { search } from '@/routes';
import { useRouteHttp } from '@/lib/requests';
import type { CurrentWorkspaceData } from '@/types';

/**
 * Typed client for the JSON endpoint `GET /w/{workspace}/search?q=` (SearchController).
 *
 * - request:  `SearchQueryData` (generated from the PHP input class; useHttp sends it as the query string)
 * - response: `SearchResultsData` (generated from the controller's declared return type)
 * - URL + method: Wayfinder's `search(workspace)` route definition
 *
 * Both are derived from the route, and the JSON contract recorded by tests/Support/InertiaContracts.php
 * (`export const response = … satisfies SearchResultsData`) proves the server sends that shape.
 */
export function useSearch(workspace: CurrentWorkspaceData, debounceMs = 150) {
    // Request and response types are read off the route (Wayfinder brands it from SearchController).
    const http = useRouteHttp(search(workspace), { q: null });
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const run = (query: string) => {
        clearTimeout(timer.current);
        http.cancel();

        const q = query.trim();
        if (q === '') return;

        timer.current = setTimeout(() => {
            http.setData('q', q);
            // Rejects with HttpCancelledError when superseded by the next keystroke; a 422 resolves
            // with `undefined` despite the `Promise<SearchResultsData>` type, so read `http.response`.
            http.submit().catch(() => undefined);
        }, debounceMs);
    };

    return {
        run,
        /** Results of the last successful request (null before the first one). */
        results: http.response,
        processing: http.processing,
        error: http.errors.q,
    };
}
