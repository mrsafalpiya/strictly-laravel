import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, lazyPlugins } from 'vite-plus';

const plugins = () => [
    laravel({
        input: ['resources/css/app.css', 'resources/js/app.tsx'],
        refresh: true,
        fonts: [
            bunny('Instrument Sans', {
                weights: [400, 500, 600],
            }),
        ],
    }),
    inertia(),
    react({ jsxImportSource: 'react' }),
    babel({
        presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
    wayfinder({
        formVariants: true,
    }),
];

export default defineConfig({
    plugins: lazyPlugins(plugins),
    server: {
        watch: {
            ignored: [
                '**/.agents/**',
                '**/.claude/**',
                '**/.cursor/**',
                '**/.junie/**',
                '**/vendor/**',
            ],
        },
    },
    lint: {
        jsPlugins: ['@mrsafalpiya/strictly-laravel/oxlint'],
        rules: {
            'typescript/consistent-type-assertions': [
                'error',
                { assertionStyle: 'never' },
            ],
            'typescript/no-non-null-assertion': 'error',
            'typescript/no-unsafe-argument': 'error',
            'typescript/no-unsafe-assignment': 'error',
            'typescript/no-unsafe-call': 'error',
            'typescript/no-unsafe-member-access': 'error',
            'typescript/no-unsafe-return': 'error',
            'strictly/no-hardcoded-urls': 'error',
            'strictly/require-suppression-reason': 'error',
            'strictly/typed-broadcasts': 'error',
            'strictly/typed-form-fields': 'error',
            'strictly/typed-forms': 'error',
            'strictly/typed-inertia-components': 'error',
            'strictly/typed-optimistic-updates': 'error',
            'strictly/typed-page-props': 'error',
            'strictly/typed-prop-names': 'error',
            'strictly/typed-requests': 'error',
        },
        ignorePatterns: [
            'vendor/**',
            'node_modules/**',
            'public/**',
            'bootstrap/ssr/**',
            'tailwind.config.js',
            'resources/js/actions/**',
            'resources/js/components/ui/*',
            'resources/js/routes/**',
            'resources/js/wayfinder/**',
        ],
        options: {
            denyWarnings: true,
            typeAware: true,
        },
    },
    fmt: {
        printWidth: 80,
        tabWidth: 4,
        singleQuote: true,
        semi: true,
        singleAttributePerLine: false,
        htmlWhitespaceSensitivity: 'css',
        ignorePatterns: [
            '.github/**',
            'composer.json',
            'resources/js/components/ui/*',
            'resources/views/mail/*',
        ],
        sortTailwindcss: {
            functions: ['clsx', 'cn', 'cva'],
            stylesheet: 'resources/css/app.css',
        },
    },
});
