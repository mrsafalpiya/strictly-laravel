import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, lazyPlugins } from 'vite-plus';
import { phpTypes } from './vite-plugins/php-types';

export default defineConfig({
    plugins: lazyPlugins(() => [
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
        // JSX compiles with React's runtime; tsconfig's jsxImportSource only swaps in stricter JSX *types*
        // (resources/js/types/jsx/jsx-runtime.d.ts).
        react({ jsxImportSource: 'react' }),
        babel({
            presets: [reactCompilerPreset()],
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        phpTypes(),
    ]),
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
        ignorePatterns: [
            'vendor/**',
            'node_modules/**',
            'public/**',
            'bootstrap/ssr/**',
            'tailwind.config.js',
            'resources/js/actions/**',
            'resources/js/routes/**',
            'resources/js/wayfinder/**',
            'resources/js/generated/**',
            'resources/js/__contracts__/**',
            'resources/views/**',
        ],
        options: {
            denyWarnings: true,
            typeAware: true,
        },
        // Untyped strings, requests, URLs and casts the compiler can't catch (see lint/type-safety.js).
        jsPlugins: ['./lint/type-safety.js'],
        rules: {
            'type-safety/typed-prop-names': 'error',
            'type-safety/typed-inertia-components': 'error',
            'type-safety/typed-form-fields': 'error',
            'type-safety/typed-requests': 'error',
            'type-safety/no-hardcoded-urls': 'error',
            'type-safety/no-type-assertions': 'error',
            // No `any` anywhere: a value typed `any` (JSON.parse, import.meta.env, untyped libraries) can't flow
            // into typed code, and `@ts-ignore`/`@ts-expect-error` can't switch checking off.
            'typescript/no-unsafe-assignment': 'error',
            'typescript/no-unsafe-member-access': 'error',
            'typescript/no-unsafe-call': 'error',
            'typescript/no-unsafe-return': 'error',
            'typescript/no-unsafe-argument': 'error',
            'typescript/no-explicit-any': 'error',
            'typescript/ban-ts-comment': [
                'error',
                {
                    'ts-expect-error': true,
                    'ts-ignore': true,
                    'ts-nocheck': true,
                },
            ],
        },
        overrides: [
            {
                // The lint plugin is plain JavaScript over an untyped AST.
                files: ['lint/**'],
                rules: {
                    'typescript/no-unsafe-assignment': 'off',
                    'typescript/no-unsafe-member-access': 'off',
                    'typescript/no-unsafe-call': 'off',
                    'typescript/no-unsafe-return': 'off',
                    'typescript/no-unsafe-argument': 'off',
                },
            },
        ],
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
            'resources/js/__contracts__/**',
            'resources/views/vendor/**',
        ],
        sortTailwindcss: {
            functions: ['clsx', 'cn', 'cva'],
            stylesheet: 'resources/css/app.css',
        },
    },
});
