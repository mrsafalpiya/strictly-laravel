import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';

import { router } from '@inertiajs/react';

import { submit, visit } from '../react/index.js';
import type { RouteTarget, WithInput } from '../routes/index.js';

// The request helpers at runtime: Inertia visits to the route's URL with the route's method. The harness scenarios
// prove their types in an app (route-typed-requests-pass and the *-fails-tsc ones).

type Visit = { url: unknown; options: Record<string, unknown> };

const originalVisit = router.visit.bind(router);
const visits: Visit[] = [];

router.visit = ((url: unknown, options: Record<string, unknown> = {}) => {
    visits.push({ url, options });
}) as typeof router.visit;

afterEach(() => {
    visits.length = 0;
});

process.on('exit', () => {
    router.visit = originalVisit;
});

const store: RouteTarget & WithInput<{ name: string }> = { url: '/projects', method: 'post' };
const destroy: RouteTarget = { url: '/projects/7', method: 'delete' };

describe('npm package: submit and visit', () => {
    test('submit sends the payload to the route with its method, keeping the other options', () => {
        const onSuccess = () => undefined;

        submit(store, { name: 'Launch' }, { preserveScroll: true, onSuccess });

        assert.deepEqual(visits, [
            { url: '/projects', options: { preserveScroll: true, onSuccess, method: 'post', data: { name: 'Launch' } } },
        ]);
    });

    test('visit goes to the route with its method and no payload', () => {
        visit(destroy, { preserveScroll: true });

        assert.deepEqual(visits, [{ url: '/projects/7', options: { preserveScroll: true, method: 'delete' } }]);
    });
});
