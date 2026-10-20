# Strictly Laravel

Strictly Laravel adds end-to-end type safety to a Laravel + Inertia + React app built on the official React starter kit. You write PHP, and the TypeScript types are generated from it. The app's `composer ci:check` then fails when React reads a prop, form field, route, query key, translation or broadcast payload that the server doesn't send.

It ships as two packages released under one version, applied on top of a freshly generated starter kit:

- `mrsafalpiya/strictly-laravel` (Composer) has the Data class base types, the generator, the PHPStan rules, Contract recording and the `strictly:*` artisan commands.
- `@mrsafalpiya/strictly-laravel` (npm) has the route-typed React helpers, the Vite plugin, the oxlint rules, and the typed Echo and translation helpers.

Both are on [Packagist](https://packagist.org/packages/mrsafalpiya/strictly-laravel) and [npm](https://www.npmjs.com/package/@mrsafalpiya/strictly-laravel).

## How it works

PHP is the Source of Truth for every value that crosses between PHP and TypeScript. A page's props are the constructor of its Page class:

```php
final class IndexPage extends Page
{
    /**
     * @param  array<int, ProjectData>  $projects
     */
    public function __construct(
        public array $projects,
    ) {}
}
```

A controller action renders the page by returning that class, and the component takes the generated type:

```tsx
import type { PageProps } from '@/generated';

export default function Index({ projects }: PageProps<'projects/index'>) {
    // projects is ProjectData[], and project.description is string | null
}
```

Form payloads work the same way. An action that type-hints an input class (a Data class extending `InputData`) validates the request with rules inferred from its types, and the form's field names and error keys come from that class.

Generated types alone can drift from what the server really sends. So every feature test records each payload the server produced as a Contract, and `tsc` checks each Contract against its generated type. Contract Coverage then fails the build until the tests have sent every shape a type allows: each nullable value both `null` and set, each list non-empty, each union variant.

## What `ci:check` runs

An installed app's `composer ci:check` runs these steps in order. `composer ci:check:<step>` runs one alone.

| Step | Tool | Fails on |
|---|---|---|
| `install` | `strictly:install --check` | A hook the app lost or hasn't picked up, or a Strictly Laravel rule switched off in config |
| `generate` | `strictly:generate` | PHP that has no TypeScript type, or two classes that generate the same type name |
| `lint` | oxlint with the `strictly/*` rules | Type assertions, untyped Inertia APIs, hard-coded URLs, unsafe `any`, suppressions without a reason |
| `test` | Pint, PHPStan at max with the `strictly.*` rules, Pest | `Inertia::render()`, FormRequests, input read from the request, model keys without `#[KeyOf]`, failing tests |
| `coverage` | `strictly:coverage --strict` | A page, endpoint or broadcast no test exercises, or a shape no test sent |
| `tsc` | `tsc --noEmit` | React using something the server doesn't send, and every recorded Contract checked against its type |

The full list, and how an app works within these rules, is in the [Boost core guideline](packages/laravel/resources/boost/guidelines/core.md). Laravel Boost installs it, with one skill per workflow, for the AI coding agents in an app.

There are no switches to turn a check off ([ADR-0007](docs/adr/0007-all-or-nothing-overlay.md)). A single line can be suppressed if the suppression names its rule and gives a reason.

## Using it in an app

You need PHP 8.4, Laravel 13, Node 26 and pnpm.

1. Generate the starter kit with `laravel new my-app --react --pest --pnpm`. Keep whichever of its auth features you want; the conversion follows them.
2. Require both packages with `composer require mrsafalpiya/strictly-laravel` and `pnpm add @mrsafalpiya/strictly-laravel`.
3. Require Laravel Boost as a dev dependency with `composer require laravel/boost --dev`.
4. Run `php artisan strictly:install`. It edits the app's tooling (tsconfig, Vite config, oxlint, PHPStan, Composer scripts) and converts the starter kit's own pages, controllers and types. It prints one row per change and never overwrites a file it doesn't recognise. Running it again changes nothing.
5. Run `composer ci:check`.

`php artisan make:page projects/index` creates a Page class and its component. `composer dev` regenerates the types when you save a file they come from.

To update, follow [`packages/laravel/UPGRADE.md`](packages/laravel/UPGRADE.md). In short, you update both packages to the same version, run `php artisan strictly:install` again, and make any changes listed for the releases in between.

## This repository

| Path | Contents |
|---|---|
| `packages/laravel` | The Composer package, including Kit Conversion's files under `kit/` and the Boost guidance under `resources/boost/` |
| `packages/npm` | The npm package |
| `harness/` | The fixture-app harness and its scenarios |
| `testbed/` | The Testbed App, an issue tracker (Tracklane) built on the starter kit and both packages, linked from `packages/` |
| `docs/problems.md` | The Problem register: every known way a type can be wrong or hand-maintained, and its status |
| `docs/adr/` | Architecture decisions |
| `GLOSSARY.md` | The project's terms (Overlay, Base Kit, Type Boundary, Contract, …) |

The harness is the main test. It generates the latest starter kit, installs both packages from this checkout, runs `strictly:install` and the app's `ci:check`, and checks the outcome. Each scenario applies one edit. A passing scenario expects `ci:check` to pass, and a breaking scenario expects it to fail with a named diagnostic.

```bash
composer install && pnpm install

pnpm test                          # the full suite, several minutes
pnpm test <pattern>                # only matching tests
pnpm harness                       # fresh install on the latest starter kit
pnpm harness <scenario>            # one scenario
pnpm harness --list                # every scenario
pnpm typecheck && pnpm lint:php --test && pnpm test:php && pnpm analyse:php
```

[`docs/agents/harness.md`](docs/agents/harness.md) describes the harness, and [`docs/agents/developing-the-overlay.md`](docs/agents/developing-the-overlay.md) describes how to make a change. Every change starts from a Problem in the register and closes it with a passing and a breaking scenario. Run the Testbed App's checks from `testbed/` with `composer ci:check` and `composer test:smoke`.

## License

MIT. See [LICENSE](LICENSE).
