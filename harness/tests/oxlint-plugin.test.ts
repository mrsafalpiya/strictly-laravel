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
            { code: "fetch('/api/projects');", errors: 1 },
            { code: "window.location.assign('/login');", errors: 1 },
            { code: "location.replace('/login');", errors: 1 },
            { code: "window.location.href = '/login';", errors: 1 },
            { code: "window.location = '/login';", errors: 1 },
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
