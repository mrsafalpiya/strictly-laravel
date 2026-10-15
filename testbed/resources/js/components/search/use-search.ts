import { useEffect, useState } from 'react';
import { search } from '@/routes';
import type { CurrentWorkspaceData } from '@/generated';
import { useRouteHttp } from '@mrsafalpiya/strictly-laravel/react';

/**
 * Typed client for the JSON endpoint `GET /w/{workspace}/search?q=` (SearchController).
 *
 * - query string: `SearchQueryData`, the route's query class, so `query: { q }` is typed by the route
 * - response: `SearchResultsData`, the action's declared return type, read off the route by `useRouteHttp`
 *
 * The JSON Contracts the feature tests record prove the server sends that shape.
 */
export function useSearch(workspace: CurrentWorkspaceData, debounceMs = 150) {
    const [query, setQuery] = useState('');
    // The route carries the query string, so the request has no body of its own.
    const http = useRouteHttp(search(workspace, { query: { q: query } }));
    const { submit, cancel } = http;

    useEffect(() => {
        if (query === '') {
            return;
        }

        const timer = setTimeout(() => {
            // Rejects with HttpCancelledError when superseded by the next keystroke.
            submit().catch(() => undefined);
        }, debounceMs);

        return () => {
            clearTimeout(timer);
            cancel();
        };
    }, [query, submit, cancel, debounceMs]);

    return {
        run: (value: string) => setQuery(value.trim()),
        /** Results of the last successful request (null before the first one). */
        results: http.response,
        processing: http.processing,
    };
}
