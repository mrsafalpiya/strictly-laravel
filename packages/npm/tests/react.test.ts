import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Pagination } from '../react/index.js';
import type { PagePaginator, PaginatorLink } from '../react/index.js';

// Lives next to the npm package so react and react-dom resolve to the package's own copies, the ones its helpers use.
// The harness scenarios prove the helpers type-check in an app; these render them.

const links: PaginatorLink[] = [
    { url: null, label: '&laquo; Previous', page: null, active: false },
    { url: '/projects?page=1', label: '1', page: 1, active: true },
    { url: '/projects?page=2', label: '2', page: 2, active: false },
    { url: '/projects?page=2', label: 'Next &raquo;', page: 2, active: false },
];

function paginator(lastPage: number): PagePaginator {
    return { links, meta: { current_page: 1, last_page: lastPage, from: 1, to: 15, total: 20 } };
}

describe('npm package: Pagination', () => {
    test('renders a link per page, a disabled span for a link without a URL and marks the active page', () => {
        const html = renderToStaticMarkup(
            createElement(Pagination, {
                paginator: paginator(2),
                className: 'pages',
                linkClassName: (link) => (link.active ? 'active' : 'idle'),
            }),
        );

        assert.equal(
            html,
            '<nav aria-label="Pagination" class="pages">' +
                '<span aria-disabled="true" class="idle">&laquo; Previous</span>' +
                '<a aria-current="page" class="active" href="/projects?page=1">1</a>' +
                '<a class="idle" href="/projects?page=2">2</a>' +
                '<a class="idle" href="/projects?page=2">Next &raquo;</a>' +
                '</nav>',
        );
    });

    test('takes a fixed link class', () => {
        const html = renderToStaticMarkup(createElement(Pagination, { paginator: paginator(2), linkClassName: 'link' }));

        assert.match(html, /<a aria-current="page" class="link" href="\/projects\?page=1">1<\/a>/);
    });

    test('renders nothing for a single page', () => {
        assert.equal(renderToStaticMarkup(createElement(Pagination, { paginator: paginator(1) })), '');
    });
});
