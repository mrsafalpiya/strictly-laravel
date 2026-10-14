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
