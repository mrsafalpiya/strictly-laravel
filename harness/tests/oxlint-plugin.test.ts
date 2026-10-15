import { describe, test } from 'node:test';

import { RuleTester } from 'oxlint/plugins-dev';

import plugin from '../../packages/npm/oxlint/index.js';

// The oxlint plugin's rules, through oxlint's own rule tester. The harness scenarios prove the plugin is wired into an
// app's `vp check`; these cases cover each rule's syntax in detail.
RuleTester.describe = (text, fn) => void describe(text, fn);
RuleTester.it = (text, fn) => void test(text, fn);

const tester = new RuleTester({ languageOptions: { sourceType: 'module', parserOptions: { lang: 'tsx' } } });

function rule(name: string) {
    const found = plugin.rules[name];

    if (found === undefined) {
        throw new Error(`The oxlint plugin has no rule "${name}"`);
    }

    return found;
}

describe('oxlint plugin: strictly/no-hardcoded-urls', () => {
    tester.run('no-hardcoded-urls', rule('no-hardcoded-urls'), {
        valid: [
            "import { dashboard } from '@/routes'; <Link href={dashboard()}>Home</Link>;",
            "<a href=\"https://laravel.com/docs\">Docs</a>;",
            "<a href=\"//cdn.example.com/x.js\">CDN</a>;",
            "<a href=\"#main\">Skip</a>;",
            "router.visit(response.redirect ?? dashboard());",
            "const path = '/not/a/request';",
            "fetch(show.url(project));",
            "<img src=\"/logo.svg\" />;",
            "const slug = path.replace('/', '-');",
            "form.submit('post', store.url());",
            "let location = ''; location = name;",
        ],
        invalid: [
            { code: '<Link href="/dashboard">Home</Link>;', errors: [{ message: /Hard-coded URL "\/dashboard"/ }] },
            { code: "<Link href={'/dashboard'}>Home</Link>;", errors: 1 },
            { code: '<form action="/login" />;', errors: 1 },
            { code: "router.visit('/projects/' + id);", errors: [{ message: /Hard-coded URL "\/projects\/"/ }] },
            { code: 'router.visit(`/projects/${id}`);', errors: [{ message: /Hard-coded URL "\/projects\/"/ }] },
            { code: "router.visit(response.redirect ?? '/dashboard');", errors: 1 },
            { code: "router.get(cond ? '/a' : dashboard());", errors: 1 },
            { code: "visit('/dashboard');", errors: 1 },
            { code: "submit('post', '/login');", errors: 1 },
            { code: "form.submit('post', '/login');", errors: 1 },
            { code: "fetch('/api/projects');", errors: 1 },
            { code: "window.location.assign('/login');", errors: 1 },
            { code: "location.replace('/login');", errors: 1 },
            { code: "window.location.href = '/login';", errors: 1 },
            { code: "window.location = '/login';", errors: 1 },
            { code: "location = '/login';", errors: 1 },
        ],
    });
});

describe('oxlint plugin: strictly/require-suppression-reason', () => {
    tester.run('require-suppression-reason', rule('require-suppression-reason'), {
        valid: [
            '// oxlint-disable-next-line no-console -- printed for the CLI user\nconsole.log(1);',
            '/* oxlint-disable strictly/no-hardcoded-urls -- the passkey endpoint redirects here */',
            '// eslint-disable-line no-console -- printed for the CLI user',
            '// oxlint-enable no-console',
            '// @ts-expect-error: the vendor type misses `foo` (upstream #12)\nconst a: number = "x";',
            '// @ts-expect-error -- the vendor type misses `foo`\nconst a: number = "x";',
            '// a comment that mentions oxlint-disable in passing',
            '// TODO: tidy up',
        ],
        invalid: [
            {
                code: '// oxlint-disable-next-line no-console\nconsole.log(1);',
                errors: [{ message: /`oxlint-disable-next-line` needs a written reason/ }],
            },
            { code: '// oxlint-disable-next-line no-console --\nconsole.log(1);', errors: 1 },
            { code: '// oxlint-disable-next-line no-console --   \nconsole.log(1);', errors: 1 },
            { code: '/* oxlint-disable */', errors: [{ message: /`oxlint-disable` must name the rules it suppresses/ }] },
            { code: '// oxlint-disable-next-line -- no rule named\nconsole.log(1);', errors: [{ message: /must name the rules/ }] },
            { code: '// eslint-disable-next-line no-console\nconsole.log(1);', errors: 1 },
            { code: 'console.log(1); // eslint-disable-line no-console', errors: 1 },
            { code: '/* eslint-disable no-console */', errors: 1 },
            {
                code: '// @ts-expect-error\nconst a: number = "x";',
                errors: [{ message: /`@ts-expect-error` needs a written reason/ }],
            },
            { code: '// @ts-ignore\nconst a: number = "x";', errors: 1 },
            { code: '// @ts-ignore:\nconst a: number = "x";', errors: 1 },
            { code: '// @ts-nocheck\nconst a = 1;', errors: 1 },
        ],
    });
});

describe('oxlint plugin: strictly/typed-prop-names', () => {
    tester.run('typed-prop-names', rule('typed-prop-names'), {
        valid: [
            "router.reload({ only: page.only('stats') });",
            "router.reload({ except: page.except('stats', 'members') });",
            "router.visit(show(project), { reset: page.reset('comments') });",
            "<Link href={show(project)} only={page.only('stats')}>Stats</Link>;",
            "<page.WhenVisible data=\"stats\" params={{ only: reports.only('stats') }} fallback={null}>x</page.WhenVisible>;",
            "form.reset('password');",
            "const options = { onlyNext: true, resetOnSuccess: ['password'] };",
        ],
        invalid: [
            {
                code: "router.reload({ only: ['stats'] });",
                errors: [{ message: /`only` must be `page\.only\(…\)` with `const page = forPage<'component'>\(\)`/ }],
            },
            { code: "router.reload({ except: ['stats'] });", errors: [{ message: /`except` must be `page\.except\(…\)`/ }] },
            { code: "router.visit(show(project), { reset: ['comments'] });", errors: [{ message: /`reset` must be `page\.reset\(…\)`/ }] },
            { code: "const names = ['stats']; router.reload({ only: names });", errors: 1 },
            { code: "const only = ['stats']; router.reload({ only });", errors: 1 },
            { code: "router.reload({ only: ['stats'] satisfies string[] });", errors: 1 },
            { code: "router.reload({ only: page.except('stats') });", errors: 1 },
            { code: "router.reload({ 'only': ['stats'] });", errors: 1 },
            { code: "<Link href={show(project)} only={['stats']}>Stats</Link>;", errors: 1 },
            { code: '<Link href={show(project)} except="stats">Stats</Link>;', errors: 1 },
        ],
    });
});

describe('oxlint plugin: strictly/typed-inertia-components', () => {
    tester.run('typed-inertia-components', rule('typed-inertia-components'), {
        valid: [
            "import { Head, Link, router } from '@inertiajs/react';",
            "import { forPage } from '@mrsafalpiya/strictly-laravel/react';",
            "import { Deferred } from './deferred';",
        ],
        invalid: [
            {
                code: "import { Deferred } from '@inertiajs/react';",
                errors: [
                    {
                        message:
                            /Use `page\.Deferred` from `const page = forPage<'component'>\(\)` \('@mrsafalpiya\/strictly-laravel\/react'\) instead of Inertia's untyped `Deferred`/,
                    },
                ],
            },
            { code: "import { Head, WhenVisible } from '@inertiajs/react';", errors: [{ message: /`page\.WhenVisible`/ }] },
            { code: "import { InfiniteScroll as Scroll } from '@inertiajs/react';", errors: [{ message: /`page\.InfiniteScroll`/ }] },
            { code: "import { Deferred, WhenVisible } from '@inertiajs/react';", errors: 2 },
            { code: "export { Deferred } from '@inertiajs/react';", errors: 1 },
        ],
    });
});

describe('oxlint plugin: strictly/typed-page-props', () => {
    tester.run('typed-page-props', rule('typed-page-props'), {
        valid: [
            "import { usePage } from '@inertiajs/react'; const { features } = usePage().props;",
            "import { usePage } from '@inertiajs/react'; import type { PageProps } from '@/generated'; const { project } = usePage<PageProps<'projects/show'>>().props;",
            "import { usePage } from './use-page'; usePage<{ features: { boards: boolean } }>();",
        ],
        invalid: [
            {
                code: "import { usePage } from '@inertiajs/react'; const { features } = usePage<{ features: { boards: boolean } }>().props;",
                errors: [
                    {
                        message:
                            /`usePage\(\)` takes its props' type from the generated shared props and Page classes: drop the type argument\. A server setting or feature flag every page needs is a property of the shared props Data class/,
                    },
                ],
            },
            { code: "import { usePage as page } from '@inertiajs/react'; page<SharedData>();", errors: 1 },
            { code: "import * as Inertia from '@inertiajs/react'; Inertia.usePage<SharedData>();", errors: 1 },
            { code: "import { usePage } from '@inertiajs/react'; usePage<PageProps>();", errors: 1 },
            { code: "import { usePage } from '@inertiajs/react'; usePage<PageProps<'x'> & { flags: string[] }>();", errors: 1 },
        ],
    });
});

describe('oxlint plugin: strictly/typed-optimistic-updates', () => {
    tester.run('typed-optimistic-updates', rule('typed-optimistic-updates'), {
        valid: [
            'router.reload({ optimistic: page.optimistic((props) => ({ count: props.count + 1 })) });',
            '<Form optimistic={page.optimistic((props) => ({ count: props.count + 1 }))}>x</Form>;',
            'const update = page.optimistic(() => ({}));',
        ],
        invalid: [
            {
                code: 'router.optimistic((props) => ({ count: 1 })).reload();',
                errors: [{ message: /`router\.optimistic\(\)` trusts any props type/ }],
            },
            {
                code: 'router.reload({ optimistic: (props) => ({ count: 1 }) });',
                errors: [{ message: /`optimistic` must be `page\.optimistic\(…\)`/ }],
            },
            { code: '<Form optimistic={(props) => ({ count: 1 })}>x</Form>;', errors: 1 },
        ],
    });
});

describe('oxlint plugin: strictly/typed-broadcasts', () => {
    tester.run('typed-broadcasts', rule('typed-broadcasts'), {
        valid: [
            "import { channel, useChannelEvent } from '@/generated/broadcasting'; useChannelEvent(channel('issues.{issue}', { issue }), 'CommentPosted', cb);",
            "import { configureEcho, useConnectionStatus, useEchoNotification } from '@laravel/echo-react'; configureEcho({ broadcaster: 'reverb' }); useConnectionStatus(); useEchoNotification(name, cb);",
            "import { useEcho } from './hooks/use-echo'; useEcho();",
            "import * as Echo from '@laravel/echo-react'; Echo.usePresenceChannel(name);",
        ],
        invalid: [
            {
                code: "import { useEcho } from '@laravel/echo-react'; useEcho(`issues.${issue.id}`, 'CommentPostd', (e: { id: number }) => {});",
                errors: [{ message: /Echo's `useEcho\(\)` takes any event name and a hand-typed payload: use `useChannelEvent\(channel, event, callback\)`/ }],
            },
            { code: "import { useEchoPresence as usePresence } from '@laravel/echo-react'; usePresence(name, 'Joined', cb);", errors: 1 },
            { code: "import { useEchoPublic } from '@laravel/echo-react'; useEchoPublic('status', 'Updated', cb);", errors: 1 },
            { code: "import * as Echo from '@laravel/echo-react'; Echo.useEcho(name, 'CommentPosted', cb);", errors: 1 },
        ],
    });
});

describe('oxlint plugin: strictly/typed-requests', () => {
    tester.run('typed-requests', rule('typed-requests'), {
        valid: [
            "import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react'; useRouteForm(store(), defaults);",
            "import { submit, visit } from '@mrsafalpiya/strictly-laravel/react'; submit(store(), data); visit(destroy(id));",
            "import { router } from '@inertiajs/react'; router.reload(); router.flushAll(); router.on('flash', cb);",
            "import { router } from '@inertiajs/react'; router.visit(dashboard());",
            "import { router } from '@inertiajs/react'; router.visit(dashboard(), { preserveScroll: true });",
            "import { Link } from '@inertiajs/react'; <Link href={dashboard()}>Home</Link>;",
            "import { useForm } from 'react-hook-form'; useForm();",
            "import { useRouteHttp } from '@mrsafalpiya/strictly-laravel/react'; useRouteHttp(search(), { q: '' });",
            "import { useHttp } from './hooks/use-http'; useHttp();",
            "const router = makeRouter(); router.post('/x', {});",
            "import Link from 'next/link'; <Link data={x} />;",
        ],
        invalid: [
            {
                code: "import { useForm } from '@inertiajs/react'; const form = useForm({ name: '' });",
                errors: [{ message: /`useForm\(\)` is untyped: use `useRouteForm\(route, defaults\)`/ }],
            },
            { code: "import { useForm as useInertiaForm } from '@inertiajs/react'; useInertiaForm();", errors: 1 },
            { code: "import * as Inertia from '@inertiajs/react'; Inertia.useForm();", errors: 1 },
            {
                code: "import { useHttp } from '@inertiajs/react'; const http = useHttp<{ q: string }, SearchResults>({ q: '' });",
                errors: [{ message: /`useHttp\(\)` is untyped: use `useRouteHttp\(route, init\)`/ }],
            },
            { code: "import { useHttp as useJson } from '@inertiajs/react'; useJson();", errors: 1 },
            { code: "import * as Inertia from '@inertiajs/react'; Inertia.useHttp();", errors: 1 },
            {
                code: "import { router } from '@inertiajs/react'; router.post(store.url(), { name });",
                errors: [{ message: /`router.post\(\)` is untyped: use `submit\(route, data\)`/ }],
            },
            {
                code: "import { router } from '@inertiajs/react'; router.get(index.url());",
                errors: [{ message: /`router.get\(\)` is untyped: use `visit\(route\)`/ }],
            },
            { code: "import { router } from '@inertiajs/react'; router.delete(destroy.url(id), { onError });", errors: 1 },
            { code: "import { router } from '@inertiajs/core'; router.put(url, data);", errors: 1 },
            { code: "import { router } from '@inertiajs/react'; router.patch(url, data);", errors: 1 },
            { code: "import * as Inertia from '@inertiajs/react'; Inertia.router.post(url, data);", errors: 1 },
            {
                code: "import { router } from '@inertiajs/react'; router.visit(url, { method: 'post', data });",
                errors: [{ message: /`router.visit\(\)` with `data` or `method` is untyped/ }],
            },
            {
                code: "import { Link } from '@inertiajs/react'; <Link href={store()} method=\"post\" data={{ name }}>Save</Link>;",
                errors: [{ message: /`<Link data>` is untyped/ }],
            },
        ],
    });
});

describe('oxlint plugin: strictly/typed-forms', () => {
    tester.run('typed-forms', rule('typed-forms'), {
        valid: [
            "import { TypedForm } from '@mrsafalpiya/strictly-laravel/react'; <TypedForm {...store.form()}>x</TypedForm>;",
            "import { Head, Link } from '@inertiajs/react'; <Head title=\"x\" />;",
            "import * as Inertia from '@inertiajs/react'; <Inertia.Link href={dashboard()} />;",
            "import { Form } from 'react-final-form'; <Form />;",
            '<form action={store.url()} />;',
        ],
        invalid: [
            {
                code: "import { Form, Head } from '@inertiajs/react'; <Form {...store.form()}>x</Form>;",
                errors: [{ message: /Inertia's `<Form>` is untyped: use `<TypedForm \{\.\.\.route\.form\(\)\}>`/ }],
            },
            { code: "import { Form as InertiaForm } from '@inertiajs/react'; <InertiaForm />;", errors: 1 },
            { code: "export { Form } from '@inertiajs/react';", errors: 1 },
            { code: "import * as Inertia from '@inertiajs/react'; <Inertia.Form {...store.form()} />;", errors: 1 },
            {
                code: "import { TypedForm } from '@mrsafalpiya/strictly-laravel/react'; <TypedForm<LoginData> {...store.form()}>x</TypedForm>;",
                errors: [{ message: /`<TypedForm>`'s payload comes from the route it submits to: drop the type argument\./ }],
            },
            {
                code: "import { TypedForm as Form } from '@mrsafalpiya/strictly-laravel/react'; <Form<LoginData> {...store.form()} />;",
                errors: 1,
            },
        ],
    });
});

describe('oxlint plugin: strictly/typed-form-fields', () => {
    tester.run('typed-form-fields', rule('typed-form-fields'), {
        valid: [
            "<TypedForm {...store.form()}>{({ field }) => <Select name={field('status')} />}</TypedForm>;",
            '<TypedForm {...store.form()} name="project">{() => <button type="submit">Save</button>}</TypedForm>;',
            '<Select name="status" />;',
            '<form><input name={name} /></form>;',
        ],
        invalid: [
            {
                code: '<TypedForm {...store.form()}>{() => <Select name="status" />}</TypedForm>;',
                errors: [{ message: /Untyped field name "status": use `name=\{field\('…'\)\}` from `<TypedForm>`'s render prop/ }],
            },
            { code: "<TypedForm {...store.form()}><div><Select name={'status'} /></div></TypedForm>;", errors: 1 },
            { code: '<TypedForm {...store.form()}>{() => <Select name={`tasks.${i}.title`} />}</TypedForm>;', errors: 1 },
            {
                code: "import { TypedForm as Form } from '@mrsafalpiya/strictly-laravel/react'; <Form {...store.form()}>{() => <input name=\"title\" />}</Form>;",
                errors: 1,
            },
        ],
    });
});
