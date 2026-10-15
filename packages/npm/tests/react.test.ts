import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Deferred, InfiniteScroll, WhenVisible } from '@inertiajs/react';

import { forPage, Pagination, TypedForm } from '../react/index.js';
import type { PagePaginator, PaginatorLink, RouteFormTarget } from '../react/index.js';
import type { WithInput } from '../routes/index.js';

// Lives next to the npm package so react and react-dom resolve to the package's own copies, the ones its helpers use.
// The harness scenarios prove the helpers type-check in an app; these render them.

// What an app's generated types register (InertiaPagesProvider).
declare module '../react/index.js' {
    interface Register {
        pages: { reports: { title: string; stats?: { open: number } } };
        sharedProps: { name: string; [key: string]: unknown };
    }
}

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

describe('npm package: forPage', () => {
    const page = forPage<'reports'>();

    test('returns the prop names it is given, for only, except and reset', () => {
        assert.deepEqual(page.only('stats', 'name'), ['stats', 'name']);
        assert.deepEqual(page.except('title'), ['title']);
        assert.deepEqual(page.reset('stats'), ['stats']);
    });

    test("returns Inertia's own components, typed by the page", () => {
        assert.equal(page.Deferred, Deferred);
        assert.equal(page.WhenVisible, WhenVisible);
        assert.equal(page.InfiniteScroll, InfiniteScroll);
    });

    test('returns the optimistic update it is given', () => {
        const update = (props: { title: string }) => ({ title: `${props.title}!` });

        assert.equal(page.optimistic(update), update);
    });
});

type ProjectInput = { title: string; tasks: { title: string }[] };

describe('npm package: TypedForm', () => {
    const store: RouteFormTarget & WithInput<ProjectInput> = { action: '/projects', method: 'post' };

    test("renders Inertia's form for the route, and field() names its controls by their field paths", () => {
        const html = renderToStaticMarkup(
            createElement(TypedForm<ProjectInput>, {
                ...store,
                className: 'project',
                children: ({ field, processing }) => createElement('input', { name: field('tasks.0.title'), disabled: processing }),
            }),
        );

        assert.equal(html, '<form class="project" action="/projects" method="post"><input name="tasks.0.title"/></form>');
    });

    test('renders plain children as they are', () => {
        const html = renderToStaticMarkup(createElement(TypedForm, { action: '/logout', method: 'post', children: 'Log out' }));

        assert.equal(html, '<form action="/logout" method="post">Log out</form>');
    });
});
