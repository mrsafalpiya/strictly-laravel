import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';

import { http } from '@inertiajs/core';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { useRouteHttp } from '../react/index.js';
import type { RouteHttp } from '../react/index.js';
import type { RouteTarget, WithInput, WithResponse } from '../routes/index.js';

// useRouteHttp at runtime: Inertia's useHttp() sent to the route, resolving with the response or, on a 422, with the
// validation errors (Problem P-049). The harness scenarios prove its types in an app (json-endpoint-typed-passes and
// the json-*-fails-tsc ones).

type SearchQuery = { q: string };
type SearchResults = { query: string; hits: { id: number; title: string }[] };

// Inertia's HTTP client types aren't exported by name.
type HttpClient = ReturnType<typeof http.getClient>;
type HttpRequestConfig = Parameters<HttpClient['request']>[0];
type HttpResponse = Awaited<ReturnType<HttpClient['request']>>;

const search: RouteTarget & WithInput<SearchQuery> & WithResponse<SearchResults> = { url: '/search', method: 'post' };

const requests: HttpRequestConfig[] = [];
const originalClient = http.getClient();

/** Answers every request with the given status and JSON body. */
function answer(status: number, body: unknown): void {
    const client: HttpClient = {
        request: async (config: HttpRequestConfig): Promise<HttpResponse> => {
            requests.push(config);

            return { status, data: JSON.stringify(body), headers: {} };
        },
    };

    http.setClient(client);
}

afterEach(() => {
    requests.length = 0;
    http.setClient(originalClient);
});

/** The hook's value from one render. Effects don't run on the server, which is all submit() needs. */
function renderSearch(init: SearchQuery): RouteHttp<SearchQuery, SearchResults> {
    let value: RouteHttp<SearchQuery, SearchResults> | undefined;

    renderToStaticMarkup(
        createElement(() => {
            value = useRouteHttp(search, init);

            return null;
        }),
    );

    assert.ok(value);

    return value;
}

describe('npm package: useRouteHttp', () => {
    test('sends the data to the route with its method and resolves with the response', async () => {
        answer(201, { query: 'Launch', hits: [{ id: 1, title: 'Launch plan' }] });

        const result = await renderSearch({ q: 'Launch' }).submit();

        assert.deepEqual(result, { ok: true, response: { query: 'Launch', hits: [{ id: 1, title: 'Launch plan' }] } });
        assert.equal(requests.length, 1);
        assert.equal(requests[0]?.url, '/search');
        assert.equal(requests[0]?.method, 'post');
        assert.equal(requests[0]?.data, JSON.stringify({ q: 'Launch' }));
    });

    test('resolves a 422 with the validation errors, one message per field, and still calls onError', async () => {
        answer(422, { message: 'The q field is required.', errors: { q: ['The q field is required.', 'Too short.'] } });

        const reported: unknown[] = [];
        const result = await renderSearch({ q: '' }).submit({ onError: (errors) => reported.push(errors) });

        assert.deepEqual(result, { ok: false, errors: { q: 'The q field is required.' } });
        assert.deepEqual(reported, [{ q: 'The q field is required.' }]);
    });

    test('rejects on any other failed response, as Inertia does', async () => {
        answer(500, { message: 'Server Error' });

        await assert.rejects(renderSearch({ q: 'Launch' }).submit(), { name: 'HttpResponseError' });
    });
});
