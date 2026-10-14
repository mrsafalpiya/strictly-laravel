# Laravel React starter kit + type-safety ecosystem: fact sheet (as of 2026-10-14)

Conventions: every claim has a source. `[local]` = read from the shallow clone at
`research/react-starter-kit` (commit `717b8f5`, 2026-09-21, "Make the email-verification feature implement
MustVerifyEmail on the User model"). `[UNVERIFIED]` = could not confirm from a primary source.

---

## Part A: the official React starter kit, inspected locally

### A.0 Repo, branches, variants

- `git ls-remote --heads https://github.com/laravel/react-starter-kit`:
  `main`, `workos`, `teams`, `workos-teams`, plus housekeeping branches `pin-github-actions`, `test-features-prompt`.
  Tags: `v1.0.0`, `v1.0.1` only (the kit is not versioned by tags; the installer pulls branches). [local]
- `teams` last commit 2026-09-24 ("Update from Maestro"); `workos` last commit 2026-09-21. (GitHub API)
- README: "All contributions to the Starter Kits from now on should be made through
  [Maestro](https://github.com/laravel/maestro)", i.e. the kits are generated from a shared monorepo. [local `README.md`]
- `workos` branch: no Fortify/Chisel; requires `laravel/workos ^0.6.0`; same Inertia/Wayfinder/Vite+ stack.
  `teams` branch: same deps as `main`.
  (https://raw.githubusercontent.com/laravel/react-starter-kit/workos/composer.json, .../teams/composer.json)

### A.1 Versions and constraints (`composer.json`, `package.json`) [local]

| Thing | Constraint in kit | Latest published (2026-10-14) |
|---|---|---|
| php | `^8.3` (CI uses 8.3) | — |
| laravel/framework | `^13.17` | v13.36.0 (2026-10-13) |
| inertiajs/inertia-laravel | `^3.0` | v3.5.1 (2026-10-01) |
| @inertiajs/react | `^3.0.0` | 3.9.1 (2026-10-09) |
| @inertiajs/vite | `^3.0.0` (new in v3, used in vite.config) | 3.9.1 |
| react / react-dom | `^19.2.0` | 19.3.0 |
| typescript | `^5.7.2` | see Part B (oxc/TS section) |
| vite | `^8.0.0` | 8.3.4 |
| vite-plus (VoidZero `vp` CLI) | `0.3.0` exact, devDependency | see Part B |
| laravel/wayfinder | `^0.1.14` | v0.1.21 (2026-08-04) |
| @laravel/vite-plugin-wayfinder | `^0.1.3` (devDep) | 0.1.10 (2026-09-01) |
| laravel/fortify | `^1.37.2` | v1.41.0 (2026-09-28) |
| laravel/chisel | `^0.1.0` (require, removed after install) | v0.1.1 (2026-05-13) |
| laravel-vite-plugin | `^3.0.0` | 3.2.0 |
| larastan/larastan | `^3.9` (require-dev) | v3.13.0 (2026-10-07) |
| phpstan/phpstan | (transitive via Larastan) | 2.3.1 (2026-10-08) |
| phpunit/phpunit | `^12.5.23` | — |
| pest | **not present**; installer swaps PHPUnit→Pest if user picks Pest (see A.5) | — |
| laravel/pint | `^1.27` | — |
| laravel/pao | `^1.0.6` ("Agent-optimized output for PHP testing tools") | v1.1.5 |
| laravel/boost | **not present** in composer.json; installed by the installer when chosen (see A.5) | v2.10.3 (2026-10-07) |
| eslint / prettier / biome | **not present** | — |
| oxlint / oxfmt | not direct deps; used through `vite-plus` (`vp check`, `lint`/`fmt` blocks in `vite.config.ts`) | — |
| babel-plugin-react-compiler | `^1.0.0` via `@rolldown/plugin-babel` (React Compiler on) | — |
| @laravel/multiplex | optionalDependency `^0.4.1` (used by `php artisan dev`) | — |

Versions-latest sources: Packagist p2 API (`https://repo.packagist.org/p2/<vendor>/<pkg>.json`) and npm registry
(`https://registry.npmjs.org/<pkg>`), queried 2026-10-14.

Other config facts [local]:
- `.npmrc`: `ignore-scripts=true`. `pnpm-workspace.yaml`: `publicHoistPattern: ['@inertiajs/core']`
  (needed so `declare module '@inertiajs/core'` augmentation resolves under pnpm).
- `phpstan.neon`: includes Larastan + Carbon extensions, **level 7**, paths `app/ bootstrap/app.php config/ database/ routes/`
  (tests not analysed). No `phpstan-strict-rules`, no baseline.
- `pint.json`: `{"preset": "laravel"}`.
- `config/inertia.php`: `ssr.enabled => true`; `pages.paths => [resource_path('js/pages')]`;
  `testing.ensure_pages_exist => true` (so `assertInertia` fails if the page file does not exist).

`tsconfig.json` (comments stripped) [local]:
```jsonc
"target": "ESNext", "module": "ESNext", "moduleResolution": "bundler",
"allowJs": true, "noEmit": true, "isolatedModules": true, "esModuleInterop": true,
"forceConsistentCasingInFileNames": true,
"strict": true, "noImplicitAny": true, "skipLibCheck": true,
"paths": { "@/*": ["./resources/js/*"] }, "jsx": "react-jsx"
"include": ["resources/js/**/*.ts", "resources/js/**/*.d.ts", "resources/js/**/*.tsx"]
```
Not enabled: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
`noFallthroughCasesInSwitch`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax`, `noPropertyAccessFromIndexSignature`.

`vite.config.ts` (imports `defineConfig, lazyPlugins` from `'vite-plus'`) [local]:
```ts
plugins: lazyPlugins(() => [ laravel({...}), inertia(), react(), babel({ presets: [reactCompilerPreset()] }),
  tailwindcss(), wayfinder({ formVariants: true }) ]),
lint: { ignorePatterns: [... 'resources/js/actions/**', 'resources/js/components/ui/*',
          'resources/js/routes/**', 'resources/js/wayfinder/**'],
        options: { denyWarnings: true, typeAware: true } },
fmt:  { printWidth: 80, tabWidth: 4, singleQuote: true, semi: true, ...,
        sortTailwindcss: { functions: ['clsx','cn','cva'], stylesheet: 'resources/css/app.css' } },
```
So linting = oxlint with type-aware mode on and warnings-as-errors; formatting = oxfmt with Tailwind sorting.
No custom lint rules / jsPlugins configured.

### A.2 Scripts, CI, AI files [local]

package.json scripts:
```
build: vp build | build:ssr: vp build && vp build --ssr | dev: vp dev
check: vp check | check:fix: vp check --fix | types:check: tsc --noEmit
```
composer.json scripts:
```
setup: composer install, copy .env, key:generate, migrate --force, npm install, npm run build
dev: php artisan dev            (Laravel 13 DevCommand: runs processes via @laravel/multiplex or concurrently)
lint: pint --parallel           lint:check: pint --parallel --test
types:check: phpstan analyse
test: config:clear, @lint:check, @types:check, php artisan test
ci:check: npm run check, npm run types:check, @test
post-update-cmd: php artisan install:features --ansi; vendor:publish --tag=laravel-assets
extra.laravel.installer.post-create-project: ["@php artisan install:features --ansi"]
```
- There is no separate `format` script; formatting is part of `vp check` / `vp check --fix`.
- Docs mention `composer dev:ssr` but the kit's composer.json on `main` has **no** `dev:ssr` script
  (https://laravel.com/docs/13.x/starter-kits#inertia-ssr vs local composer.json). Discrepancy.
- `php artisan dev` lives in the framework: `src/Illuminate/Foundation/Console/DevCommand.php`
  ("Run the dev processes", uses `@laravel/multiplex` or `concurrently`) (GitHub API, laravel/framework).
- CI: `.github/workflows/tests.yml`, a single job: PHP 8.3, Node 22, `composer setup`, then `composer ci:check`
  (oxlint+oxfmt check, tsc, pint --test, phpstan, phpunit). `dependabot.yml` covers GitHub Actions only.
  The installer rewrites the workflow PHP version to the local PHP version (`configureWorkflowPhpVersion`).
- AI files: **none committed** (no AGENTS.md, CLAUDE.md, `.ai/`, `boost.json`). `.gitignore` explicitly ignores
  `/AGENTS.md /CLAUDE.md /boost.json /.mcp.json /.agents /.claude /.cursor /.junie /.kiro /opencode.json ...`,
  and `vite.config.ts` excludes `.agents/.claude/.cursor/.junie` from the watcher. In other words, the kit expects Boost to
  generate these files per machine. (Boost docs also suggest gitignoring them: https://laravel.com/docs/13.x/boost#installation)

### A.3 How things are typed today [local]

**Shared props: hand-written, global module augmentation.**
`app/Http/Middleware/HandleInertiaRequests.php::share()` returns
`name`, `auth.user` (`$request->user()`, the full Eloquent model serialized), `sidebarOpen`.
The TS side is hand-maintained in `resources/js/types/global.d.ts`:
```ts
declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: { name: string; auth: Auth; sidebarOpen: boolean; [key: string]: unknown; };
    }
}
```
That is why `usePage().props.auth` / `.name` / `.sidebarOpen` are typed without generics
(e.g. `resources/js/components/app-shell.tsx`: `usePage().props.sidebarOpen`). The index signature
`[key: string]: unknown` means unknown keys are not compile errors.

**Model types: hand-written `User`.** `resources/js/types/auth.ts`:
```ts
export type User = { id: number; name: string; email: string; avatar?: string;
  email_verified_at: string | null; two_factor_enabled?: boolean; created_at: string; updated_at: string;
  [key: string]: unknown; };
```
Drift exists already: nothing on the server produces `avatar` or `two_factor_enabled` (no accessor/append in
`app/`; grep), while `two_factor_confirmed_at` *is* serialized (not in `#[Hidden]`) but is missing from the TS type.
PHP side: `app/Models/User.php` has `@property` docblocks + `#[Fillable]`/`#[Hidden]` attributes (Laravel 13 attributes).
`Passkey`, `TwoFactorSetupData` etc. are also hand-written mirrors of controller arrays.

**Page props: hand-written per page, as component-parameter types.** Examples:
- `resources/js/pages/auth/login.tsx`: `type Props = { status?: string; canResetPassword: boolean };`
  mirrors `Fortify::loginView(fn ... Inertia::render('auth/login', ['canResetPassword' => ..., 'status' => ...]))`
  in `app/Providers/FortifyServiceProvider.php`.
- `resources/js/pages/settings/profile.tsx`: inline `{ mustVerifyEmail: boolean; status?: string }`, plus a
  redundant local `type PageProps = { auth: Auth }` passed to `usePage<PageProps>()`.
- `resources/js/pages/settings/security.tsx`: `Props` composed from component prop types with Chisel markers.
Nothing checks that the PHP `Inertia::render('x', [...])` array matches the TS props, or that component names
exist (other than `ensure_pages_exist` in tests).

**Forms: Inertia `<Form>` + Wayfinder `.form()` spreads; no `useForm` anywhere.**
```tsx
<Form {...ProfileController.update.form()} options={{ preserveScroll: true }}>
  {({ processing, errors }) => ( ... <InputError message={errors.name} /> ... )}
</Form>
```
(`resources/js/pages/settings/profile.tsx`; also login, register, reset-password, etc.)
Field names are plain `name="email"` strings on inputs; `errors` keys are not tied to the FormRequest
(`app/Http/Requests/Settings/ProfileUpdateRequest.php` rules come from trait `app/Concerns/ProfileValidationRules.php`).
`useHttp` (new Inertia v3 hook) is used for JSON calls in `resources/js/hooks/use-two-factor-auth.ts`.
`grep useForm` → 0 hits.

**Routes: Wayfinder (stable 0.1.x), generated, gitignored.** Imports like
`@/routes/profile` (named routes) and `@/actions/App/Http/Controllers/Settings/ProfileController` (controller actions),
also vendor controllers `@/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController`.
`.gitignore` contains `/resources/js/actions`, `/resources/js/routes`, `/resources/js/wayfinder`.
Generated by the Vite plugin (`wayfinder({ formVariants: true })`) on dev/build, and by Chisel at install
(`php artisan wayfinder:generate --with-form`). Lint ignores these dirs.
Consequence noted in docs: "If you reference routes that no longer exist, your application will fail to build."
(https://laravel.com/docs/13.x/starter-kits#enabling-and-disabling-features)

**Enums:** none in the kit (no `app/Enums`, no TS enums). Unions are hand-written in TS, e.g.
`FlashToast.type: 'success' | 'info' | 'warning' | 'error'` (`resources/js/types/ui.ts`).

**Validation errors:** from `<Form>` render-prop `errors` (string per field), displayed via
`resources/js/components/input-error.tsx` (`message?: string`). No global `errorValueType` augmentation.

**Flash:** server: `Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')])`
(`ProfileController::update`, `SecurityController::update`). Client: `resources/js/hooks/use-flash-toast.ts`:
```ts
router.on('flash', (event) => { const flash = (event as CustomEvent).detail?.flash;
  const data = flash?.toast as FlashToast | undefined; ... })
```
i.e. untyped event + cast; no `InertiaConfig` flash typing used.

**Layouts:** `resources/js/app.tsx` uses v3 `createInertiaApp({ layout: (name) => ... , strictMode: true, withApp })`;
pages set `Page.layout = { breadcrumbs: [...] }` / `{ title, description }` objects (layout props).

**Tests:** PHPUnit feature tests (`tests/Feature/...`), e.g. `DashboardTest` uses `route('dashboard')` + `assertOk()`;
no `assertInertia` prop-shape tests.

### A.4 Chisel (feature pruning at install) [local]

`chisel.php` + `chisel-paths.php` + `app/Console/Commands/InstallFeaturesCommand.php` (`install:features`)
ask a multiselect: email-verification, registration, 2fa, passkeys, password-confirmation. Code is carved via
`/* @chisel-<feature> */ ... /* @end-chisel-<feature> */` markers in PHP and TS. Final `apply()`:
removes the hook line from composer.json, runs `composer lint`, `php artisan wayfinder:generate --with-form`,
`npm run check:fix`, then deletes the chisel files and the command. Non-interactive: `--answers=<json>`.
Env flags: `LARAVEL_INSTALLER_DEFER_HOOKS`, `LARAVEL_INSTALLER_NO_NODE`.

### A.5 How the kit is installed today; hook points

Source: `laravel/installer` `src/NewCommand.php` (cloned 2026-10-14, HEAD 2026-10-12; latest tag v5.32.0, 2026-08-25).

- `laravel new my-app` prompts; flags: `--react | --vue | --svelte | --livewire [--livewire-class-components]`,
  `--workos`, `--teams`, `--no-authentication` (→ `laravel/blank-react-starter-kit`), `--pest | --phpunit`,
  `--npm | --pnpm | --bun | --yarn | --no-node`, `--boost | --no-boost`, `--using=<vendor/package or URL>`,
  `--database`, `--git`, `--github`, `--dev`, `--force`.
- Under the hood: `composer create-project laravel/react-starter-kit "<dir>" --stability=dev`, with branch suffix
  `:dev-workos`, `:dev-teams`, `:dev-workos-teams` as chosen. Run with env `LARAVEL_INSTALLER_DEFER_HOOKS=1`,
  then the installer runs **`extra.laravel.installer.post-create-project`** commands from the *created project's*
  composer.json (`runInstallerHooks()` / `installerHooks()`; `@php`/`@composer` prefixes normalised).
  The React kit uses this to run `php artisan install:features`.
- Pest: installer removes phpunit, requires `pestphp/pest pestphp/pest-plugin-laravel`, runs `pest --init` and
  `pest --drift` to convert tests, and edits `.github/workflows/tests.yml`.
- Boost: installer runs `composer require "laravel/boost:^2.2" --dev -W` then `php artisan boost:install`.
- `--using=vendor/pkg`: `composer create-project vendor/pkg`; if the value contains `://`, it runs
  `npx tiged@latest <url> "<dir>" && composer install`. Docs: community kits must be on Packagist and put
  post-install steps in `post-create-project-cmd` (https://laravel.com/docs/13.x/starter-kits#community-maintained-starter-kits).
- Without the installer: `composer create-project laravel/react-starter-kit my-app --stability=dev` works the same way,
  but the `extra.laravel.installer` hook does not run. Composer's own `post-update-cmd` still runs
  `install:features`, which is a no-op once `chisel.php` is deleted.

**Can a third-party package hook in after creation?** Facts:
1. The installer has no plugin/extension API for adding steps to an official kit. The only hook it reads is
   `extra.laravel.installer.post-create-project` of the project being created, which a third party cannot inject
   into the official kit.
2. Paths that exist: (a) publish a community kit (a fork or overlay of the React kit) and use `--using=vendor/kit`,
   which gets both `post-create-project-cmd` and `extra.laravel.installer.post-create-project`; (b) after creation,
   `composer require vendor/pkg` and run an artisan install command (Laravel package auto-discovery registers
   commands and providers); (c) Composer plugins (`type: composer-plugin`) can react to events, but must be
   allowed in `config.allow-plugins` (the kit allow-lists only `pestphp/pest-plugin` and `php-http/discovery`).
3. Boost discovers third-party guidelines/skills automatically if the package is a **direct** dependency (see B.7).

---

## Part B: ecosystem survey

### B.1 laravel/wayfinder: stable 0.1.x vs `next` beta

**Stable (what the kit uses).** Latest v0.1.21 (2026-08-04); Packagist downloads: 17.0M total, 3.07M monthly
(https://packagist.org/packages/laravel/wayfinder.json). GitHub: 1,854 stars, 49 open issues (GitHub API).
README: "Wayfinder is currently in Beta, the API is subject to change prior to the v1.0.0 release" and points to
the `next` branch (https://github.com/laravel/wayfinder). What it generates: **routes and controller actions only**
(`resources/js/{actions,routes,wayfinder}`), with `.url()`, per-verb variants, `.form()` variants (`--with-form`),
query params, and `--skip-actions/--skip-routes`. "You can safely `.gitignore` the `wayfinder`, `actions`, and
`routes` directories as they are completely re-generated on every build." Deploy caveat: stale `route:cache`
gives missing routes, so run `php artisan route:clear` before `npm run build`. Vite plugin
`@laravel/vite-plugin-wayfinder` options: `path, command, routes, actions, formVariants, patterns`
(https://github.com/laravel/vite-plugin-wayfinder).

**`next` branch (public beta, not tagged; install `composer require laravel/wayfinder:dev-next`).**
Announced 2026-01-15 at https://laravel.com/blog/laravel-wayfinder-end-to-end-type-safety-for-php-and-typescript
("uppercase B beta"; known work items: Arrayable/Jsonable and laravel-data support, performance/memory on large
apps, Eloquent collection inference, maybe translations). Last commit on `next`: 2026-09-10; recent commits include
"Fix out-of-memory error during wayfinder:generate on a cold cache (#287)" and "Type check the generated TS (#315)"
(GitHub API). Depends on `laravel/surveyor ^0.3.0` (static analysis, v0.3.0 2026-08-22) and `laravel/ranger ^0.5.1`
(introspection to DTOs, v0.5.1 2026-09-02), plus `phpstan/phpdoc-parser ^2.3`; Laravel 12 or 13
(`next/composer.json`). Per the README and source (`src/Converters/*.php`), it generates:

| Boundary | `next` output | Config key (default) |
|---|---|---|
| Routes/actions | `resources/js/wayfinder/<PHP namespace>/...` (no more `actions/`), named routes in `wayfinder/routes/` | `generate.route.actions/named/form_variant` (true) |
| Form Requests | `types.d.ts` → e.g. `App.Http.Controllers.PostController.Store.Request` from `rules()` | (always with routes) |
| Eloquent models | `App.Models.User` incl. casts, relations, accessors; respects `$hidden`/`#[Hidden]` | `generate.models` (true) |
| PHP enums | type union in `types.d.ts` + runtime consts `App/Enums/X.ts`; optional `XMeta` from enum methods | `generate.enums` (true), `generate.enum_methods` (false) |
| Inertia page props | `Inertia.Pages.<Component> = Inertia.SharedData & {...}` inferred from `Inertia::render()` arrays | always |
| Inertia shared data | `Inertia.SharedData` + **`inertia-config.d.ts` augmenting `InertiaConfig.sharedPageProps`** (and `errorValueType: string[]` if `withAllErrors`) | `generate.inertia.shared_data` (true) |
| Inertia component on routes | `route.withComponent(...)` helpers (undocumented in README) | `generate.inertia.component` (false) |
| Broadcast channels/events | `BroadcastChannels` builders; event payload types; `@laravel/echo-react`/`echo-vue` module augmentation | `generate.broadcast.*` (true) |
| Env vars | `vite-env.d.ts` with `ImportMetaEnv` for `VITE_*` | `generate.environment_variables` (true) |
| Resources / JSON responses | converters `ResourceData`, `JsonData`, `JsonApiData` exist in `src/Converters` | not documented in README |

Other `next` facts: command `php artisan wayfinder:generate [--path] [--base-path] [--app-path] [--fresh]`;
flags `--skip-actions/--skip-routes/--with-form` removed and moved to `config/wayfinder.php`; Vite plugin args
`routes/actions/withForm` to be removed; `types.ts` renamed to `types.d.ts`; `#[WayfinderIgnore(when:|unless:)]`
attribute and `// @wayfinder-ignore` comment tag to drop members; analysis cache in `storage/wayfinder-cache`;
raises `memory_limit` to 1536M; optional Biome formatting of output (`format.enabled`). README example uses
`useForm<App.Http.Controllers.PostController.Store.Request>()`. The kit does **not** use `next`.
The Inertia v3 TypeScript docs reference it: "The next version of Laravel Wayfinder may automatically generate these
types for you ... currently in beta." (https://inertiajs.com/docs/v3/advanced/typescript)

Wayfinder ships its own Boost resources: `resources/boost/guidelines` and `resources/boost/skills` on `main`
(GitHub API contents). Boost's built-in guideline says: "Use Wayfinder to generate TypeScript functions for Laravel
routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes)." (`laravel/boost/.ai/wayfinder/core.blade.php`)

### B.2 Inertia.js v3: TypeScript surface

Versions: inertiajs/inertia-laravel v3.5.1 (2026-10-01); @inertiajs/react, /core, /vite 3.9.1 (2026-10-09);
v3.0.0 released 2026-03-24/25; npm `legacy` tag = 2.3.29. inertia-laravel v3.5.1 requires PHP ^8.2, Laravel ^11.35|^12|^13.
(Packagist/npm; https://raw.githubusercontent.com/inertiajs/inertia-laravel/v3.5.1/composer.json)

- **Global config via module augmentation** of `InertiaConfig` in `@inertiajs/core`
  (https://inertiajs.com/docs/v3/advanced/typescript). All keys, from `@inertiajs/core@3.9.1/types/types.d.ts`:
  `errorValueType` (default `string`), `flashDataType` (default `{[key: string]: unknown}`), `sharedPageProps`,
  `layoutProps`, `namedLayoutProps`. Needs the `.d.ts` to be a module and in `tsconfig` include; pnpm needs
  `@inertiajs/core` hoisted (the kit does this in `pnpm-workspace.yaml`).
- **Page props**: `usePage<TPageProps>()` returns `Page<TPageProps & SharedPageProps>`
  (https://unpkg.com/@inertiajs/react@3.9.1/types/usePage.d.ts). Page component props are typed by hand.
- **`useForm<T>`**: typed data; typed error keys incl. dot-notation for nested data (`FormDataErrors<T>`).
- **`<Form>`**: React `<Form<UserForm> action=... method=...>`. The generic types `errors`, `setError`, `clearErrors`
  and other slot props. Without the generic (as in the kit), errors are loosely typed. `useFormContext<T>()`.
  Typing is not derived from input `name` attributes. (https://inertiajs.com/docs/v3/the-basics/forms)
- **`useHttp<TForm, TResponse>`** for non-Inertia JSON requests.
- **Flash**: server `Inertia::flash()`; client `page.flash`, global `flash` event, `onFlash` callback;
  type globally via `flashDataType` or per call `router.flash<T>()`. (https://inertiajs.com/docs/v3/data-props/flash-data)
- **Deferred/optional/merge/once props**: no typing guidance in docs. React `<Deferred data: string | string[]>`
  is not keyed to prop names (https://unpkg.com/@inertiajs/react@3.9.1/types/Deferred.d.ts). [Inference: you have to
  mark these optional yourself.]
- **Server side**: no generics on render. `render(BackedEnum|UnitEnum|string $component, array|Arrayable|ProvidesInertiaProperties $props = [])`.
  Interfaces `ProvidesInertiaProperty::toInertiaProperty(PropertyContext)` and
  `ProvidesInertiaProperties::toInertiaProperties(RenderContext)`. No PHPStan stubs or extension ship with the
  package. Config `pages.ensure_pages_exist` (default false, throws `ComponentNotFoundException`) and
  `testing.ensure_pages_exist` (default true). (https://github.com/inertiajs/inertia-laravel/blob/v3.5.1/src/Inertia.php,
  https://inertiajs.com/docs/v3/the-basics/responses, https://inertiajs.com/docs/v3/the-basics/pages)
- inertia-laravel 3.x ships Boost guidelines at `resources/boost/guidelines/core.blade.php` (GitHub tree, branch `3.x`).

### B.3 PHP static analysis

| Package | Latest | Date | Notes |
|---|---|---|---|
| phpstan/phpstan | 2.3.1 | 2026-10-08 | 2.x current; no 3.x tag/branch |
| phpstan/phpstan-strict-rules | 2.1.0 | 2026-10-01 | not in kit |
| larastan/larastan | v3.13.0 | 2026-10-07 | requires phpstan ^2.3; kit pins `^3.9` at level 7 |

Sources: https://repo.packagist.org/p2/phpstan/phpstan.json, .../phpstan-strict-rules.json,
https://github.com/larastan/larastan/tree/v3.13.0/docs.

Larastan features relevant here: model properties inferred from migrations (`databaseMigrationsPath`,
`squashedMigrationsPath`, `disableMigrationScan`, `enableMigrationCache`); `checkModelProperties` (default false,
"beta"; checks `model-property` typed args such as `User::create([...])` keys); `checkModelAppends`;
`parseModelCastsMethod`; `Attribute<TGet,TSet>` generics; `toArray()` inferred as an array shape;
`noEnvCallsOutsideOfConfig`; `checkConfigTypes`; `checkUnusedViews`; Octane/job rules.

Inertia-specific PHPStan: only **adrum/inertia-phpstan v1.0.0** (2025-07-28, 8 stars, ~4.1k downloads) found. It checks
that the page file for `Inertia::render()` / `inertia()` exists. **No rule found that checks prop shapes**
(searched Packagist and GitHub). (https://github.com/adrum/inertia-phpstan)
inertia-laravel's own `phpstan.neon` runs Larastan level 6 with ignores for the `assertInertia`/`inertiaProps` macros.

### B.4 Spatie: laravel-data, laravel-typescript-transformer, typescript-transformer

| Package | Latest stable | Pre-release / branch | Requires | Source |
|---|---|---|---|---|
| spatie/laravel-data | **4.23.0** (2026-05-08) | **v5 unreleased**: `v5.x-dev` branch, last commit 2026-09-01; no 5.x tag | php ^8.1, illuminate ^10–^13 | https://repo.packagist.org/p2/spatie/laravel-data.json, https://github.com/spatie/laravel-data/tree/v5 |
| spatie/laravel-typescript-transformer | **3.3.0** (2026-06-19); 3.0.0 on 2026-03-13 | 3.0.0-beta.1 (2026-01-16, superseded); v2 line ends at 2.6.0 (2026-02-25) | v3: php ^8.2, illuminate ^11–^13 | https://repo.packagist.org/p2/spatie/laravel-typescript-transformer.json, https://github.com/spatie/laravel-typescript-transformer/releases/tag/3.0.0 |
| spatie/typescript-transformer (core) | **3.3.1** (2026-08-28); 3.0.0 on 2026-03-13 | v2 last tag 2.5.0 (2025-04-25) | php ^8.2 | https://repo.packagist.org/p2/spatie/typescript-transformer.json |

- **laravel-data v4 + LTT v2**: `#[TypeScript]` or `/** @typescript */` on Data classes, `php artisan typescript:transform`; `Lazy`/`Optional`
  become `prop?:`. The docs page recommends moving to typescript-transformer v3 (v2 support "will be deprecated soon";
  this is the fetch tool's paraphrase, not verbatim). https://spatie.be/docs/laravel-data/v4/advanced-usage/typescript
- **LTT v3** (core rewrite, builds a TS AST): config moved to a service provider (`php artisan typescript:install` creates
  `app/Providers/TypeScriptTransformerServiceProvider` extending `TypeScriptTransformerApplicationServiceProvider`);
  default output `resources/js/generated`, `GlobalNamespaceWriter('generated.d.ts')` or `ModuleWriter`;
  `typescript:transform --watch` (watch mode **beta**, no Vite plugin documented). It generates: `#[TypeScript]` classes;
  enums (union or native enum); laravel-data classes via `LaravelDataTypeScriptTransformerExtension` (Lazy, InertiaLazy and Optional become optional;
  `#[Hidden]` excluded; MapName respected); **routes** (`helpers/route.ts`, a typed `route()`); **controllers (beta)**
  as `PostsController.show({post:1})` with `.Request` (from the first laravel-data param; FormRequest "planned") and
  `.Response`. **Inertia props are not typed**: the docs say it is "unable to detect what kind of Inertia response will be returned".
  https://spatie.be/docs/typescript-transformer/v3/laravel/controllers, .../laravel/laravel-data, .../laravel/routes,
  .../laravel/watch-mode, https://github.com/spatie/typescript-transformer/releases/tag/3.0.0
- Repos: laravel-data 1,803 stars (last push 2026-09-01); LTT 399 stars (push 2026-08-18); core 404 stars (push 2026-08-28).

### B.5 Other generators and route/type tools

| Tool | Latest (date) | Status | Generates | Source |
|---|---|---|---|---|
| tighten/ziggy (`tightenco/ziggy`, `ziggy-js`) | v2.6.5 (2026-10-10); `3.x-dev` branch, no tag | Active; 4,319 stars | Route helper `route()`; TS via `php artisan ziggy:generate --types/--types-only`; branded `RouteUrl` (v2.6.3). **Not in current starter kits** (replaced by Wayfinder; date of switch UNVERIFIED) | https://github.com/tighten/ziggy |
| based/laravel-typescript | v0.0.4 (2023-07-06) | **Inactive**; Laravel ≤10 only | Model interfaces | https://github.com/lepikhinb/laravel-typescript |
| fumeapp/modeltyper | v3.14.0 (2026-09-25) | Active; 199 stars; Laravel 11–13 | Model interfaces, enum casts, api-resources; `php artisan model:typer` | https://github.com/fumeapp/modeltyper |
| abetwothree/laravel-ts-publish | v2.7.0 (2026-10-03) | Active but tiny (6 stars, ~900 dl/mo); php ^8.4 | Models, resources, enums, routes, form requests, broadcast, **Inertia shared props** (augments `InertiaConfig.sharedPageProps`), env; `@tolki/ts` Vite plugin | https://github.com/abetwothree/laravel-ts-publish |
| hybridly/laravel | v0.10.0-beta.37 (2026-09-27); stable v0.9.1 (2026-01-12) | Active, pre-1.0; php ^8.4 | Own Inertia-like framework; types via laravel-data + LTT (docs reference v2-style config; v3 move UNVERIFIED) | https://hybridly.dev/guide/typescript |
| based/momentum-trail | v0.4.0 (2025-03-16) | Dormant | Typed Ziggy routes | Packagist |
| kiwilan/typescriptable-laravel | 3.1.06 (2025-03-22) | Low activity | Models, routes, settings | Packagist |
| scrumble-nl/laravel-model-ts-type | 10.7.0 (2026-07-02) | Active, small | Model types | Packagist |
| romegasoftware/laravel-schema-generator | v1.0.13 (2026-07-11) | Small (~3.7k dl/mo) | **Zod schemas from validation rules** | Packagist |
| adrum/inertia-phpstan | v1.0.0 (2025-07-28) | Tiny | PHPStan: Inertia page existence | https://github.com/adrum/inertia-phpstan |
| aniftyco/vite-plugin-ferry, isaiasg3/laravel-inertia-type-sync, robtesch/inertia-form-generator, mjoc1985/laravel-inertia-helpers | — | Single-digit stars or downloads | Various Inertia typing attempts; **not evaluated** (UNVERIFIED features) | GitHub/Packagist search |

No Packagist results for "laravel-inertia-types", "inertia-typescript", or a Spatie Inertia-props package.

**Adoption (Packagist `package.downloads`, 2026-10-14):**

| Package | Total | Monthly |
|---|---|---|
| tightenco/ziggy | 58.2M | 3.49M |
| spatie/laravel-data | 45.3M | 3.54M |
| laravel/wayfinder | 17.0M | 3.07M |
| spatie/typescript-transformer | 10.3M | 0.90M |
| spatie/laravel-typescript-transformer | 9.7M | 0.88M |
| fumeapp/modeltyper | 0.38M | 21k |
| based/laravel-typescript | 0.16M | 1.3k |
| hybridly/laravel | 69k | 7.6k |

laravel/ranger and laravel/surveyor (Wayfinder `next` deps) each get ~138k/month.
Wayfinder's monthly downloads are inflated by being in every starter kit.

### B.6 Lint, format and type-check toolchain: oxlint, tsgolint, oxfmt, Vite+, TypeScript 7

Versions from the npm registry, 2026-10-14.

- **oxlint 1.88.0** (2026-10-13; 1.0.0 was 2025-06-10). https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.88.0
- **JS plugins (custom rules): alpha** ("JS plugins are currently in alpha"; promoted 2026-03-11).
  https://oxc.rs/docs/guide/usage/linter/js-plugins, https://oxc.rs/blog/2026-03-11-oxlint-js-plugins-alpha
  - Config: `jsPlugins: [...]` in `.oxlintrc.json` / `oxlint.config.ts`; entries are relative paths **or npm package
    names**; enable rules as `"<plugin>/<rule>"`.
  - API: ESLint v9-compatible `create(context)`; Oxlint-specific `createOnce` with `before/after`. `@oxlint/plugins`
    exports `definePlugin`, `defineRule`, `eslintCompatPlugin` (so one plugin runs under both ESLint and oxlint);
    `RuleTester` from `oxlint/plugins-dev`. Supports fixes, suggestions, selectors, options, scope and code-path analysis.
    https://oxc.rs/docs/guide/usage/linter/writing-js-plugins
  - **Limitation: no type information in JS plugins.** `@oxlint/plugins` 1.88.0 `index.d.ts` on `parserServices`:
    "Oxlint does not offer any parser services." No custom parsers.
  - "Not subject to semver" for JS plugins. [UNVERIFIED, seen only in a search snippet of https://oxc.rs/docs/guide/usage/linter/config]
- **Type-aware linting (tsgolint): stable** since 2026-07-22 (tsgolint v7; `oxlint-tsgolint` 7.0.2004, 2026-10-10).
  `oxlint --type-aware` or `options.typeAware: true`; `--type-check` / `options.typeCheck: true` also reports TS
  compiler errors (docs suggest it can replace `tsc --noEmit`). Docs: "TypeScript 7.0+ is required" and
  "Type-aware linting is powered by `typescript-go`"; "Some legacy `tsconfig` options are not supported (like `baseUrl`)";
  options "deprecated in TypeScript 6.0 or removed in TypeScript 7.0" must be migrated first.
  **Clarification (added after the first draft):** the `oxlint-tsgolint@7.0.2004` package.json has **no `dependencies`
  or `peerDependencies` on `typescript`**, only per-platform native binaries (`@oxlint-tsgolint/<os>-<arch>`), checked
  via `npm pack`. So "TS 7.0+ required" means the TS 7 compiler is embedded and the tsconfig must be TS 7-compatible,
  not that the project's `typescript` npm package must be 7.x. The docs do not say this explicitly; this is my inference
  from the manifest. Supporting evidence: the kit has `typescript ^5.7.2` (resolves to 5.9.3) and still sets
  `lint.options.typeAware: true` under vite-plus 0.3.0 (bundles tsgolint 7.0.2001), and its CI runs it via `npm run check`.
  Whether that CI run passes was not executed here [UNVERIFIED]. The kit's tsconfig uses `paths` without `baseUrl`,
  which is TS 7-compatible. 59 of 61 typescript-eslint type-aware rules, incl.
  no-floating-promises, no-misused-promises, all 8 `no-unsafe-*`, strict-boolean-expressions,
  switch-exhaustiveness-check, no-unnecessary-condition. [Which 2 are missing: UNVERIFIED]
  https://oxc.rs/blog/2026-07-22-type-aware-linting-stable, https://oxc.rs/docs/guide/usage/linter/type-aware,
  https://github.com/oxc-project/tsgolint
- **oxfmt 0.73.0** (2026-10-13), **beta** since 2026-02-24 ("passes 100% of Prettier's JavaScript and TypeScript
  conformance tests"); `oxfmt --migrate prettier`; built-in `sortTailwindcss` (based on prettier-plugin-tailwindcss,
  no regex patterns) and `sortImports`. No stable/1.0 yet. https://oxc.rs/blog/2026-02-24-oxfmt-beta,
  https://oxc.rs/docs/guide/usage/formatter/sorting.html
- **Vite+ (`vite-plus`, `vp`)**: latest **1.1.0** (2026-10-07); **1.0.0 stable 2026-09-28; MIT**
  (https://voidzero.dev/posts/announcing-vite-plus-1-0). **The kit pins `vite-plus` `0.3.0` exactly** (published
  2026-08-24; bundles `oxlint =1.79.0`, `oxfmt =0.64.0`, `oxlint-tsgolint =7.0.2001`, `@oxlint/plugins =1.79.0`).
  1.1.0 bundles oxlint 1.87.0, oxfmt 0.72.0, tsgolint 7.0.2003.
  - `vp check` = oxfmt + oxlint + type checks via the tsgolint path (type checking requires `lint.options.typeCheck: true`;
    `vp create`/`vp migrate` enable `typeAware` + `typeCheck`). https://viteplus.dev/guide/check
  - The `lint` block in `vite.config.ts` is Oxlint config; Vite+ advises against separate `.oxlintrc.json`.
    **`lint.jsPlugins` supported**; plugins authored with `definePlugin/defineRule` from `vite-plus/lint/plugins`,
    tested with `RuleTester` from `vite-plus/lint/plugins-dev`. Docs advise **against** adding `oxlint`/`@oxlint/plugins`
    as direct deps (version drift). https://viteplus.dev/guide/lint
  - The `fmt` block is Oxfmt config. https://viteplus.dev/guide/fmt
  - Kit: `typeAware: true`, `denyWarnings: true`, **no `typeCheck`**, so type errors come from the separate
    `npm run types:check` (`tsc --noEmit`, `typescript ^5.7.2`, which resolves to 5.9.3 (latest 5.x) and cannot float to 6/7).
- **TypeScript**: `typescript@latest` = **7.0.2** (2026-07-08; native Go `tsc`). **7.0 ships no programmatic API**
  (new API expected in 7.1); `@typescript/typescript6` provides `tsc6` + the 6.0 API for tools that need it.
  TS 6.0 released 2026-03-23 (last JS-based release; 6.0.3 latest). `@typescript/native-preview` frozen at
  7.0.0-dev.20260707.2; nightlies now `typescript@next`.
  https://devblogs.microsoft.com/typescript/?p=5246, https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
- Comparators: ESLint 10.12.0 (v10.0.0 2026-02-06; v9 EOL 2026-08-06 [UNVERIFIED, search snippet]);
  typescript-eslint 8.71.2 with peer `typescript >=4.8.4 <6.1.0` (cannot use TS 7 directly); Biome 2.5.15
  (plugins in GritQL only; own type inference, only 4 non-nursery type-aware rules).
  https://biomejs.dev/linter/plugins/, https://biomejs.dev/linter/domains/

### B.7 Laravel Boost: shipping AI guidelines and skills from a package

- Latest **laravel/boost v2.10.3** (2026-10-07) (Packagist). The installer adds `laravel/boost:^2.2` (dev) and runs
  `php artisan boost:install` when Boost is chosen (laravel/installer `installBoost()`).
- Commands: `boost:install [--guidelines] [--skills] [--mcp]`, `boost:update [--no-discover]` (can go in
  `post-update-cmd`), `boost:mcp`. Guideline files (`CLAUDE.md`, `AGENTS.md`, ...) are rewritten only inside a
  `<laravel-boost-guidelines>` block. Docs suggest gitignoring generated files (`.mcp.json`, `CLAUDE.md`, `AGENTS.md`,
  `boost.json`). (https://laravel.com/docs/13.x/boost)
- **Third-party package guidelines**: `resources/boost/guidelines/core.blade.php` in the package.
  **Third-party skills**: `resources/boost/skills/{skill-name}/SKILL.md` (Agent Skills format: YAML frontmatter with
  `name`, `description`; may include scripts and templates). Loaded on `boost:install` / `boost:update`.
  (https://laravel.com/docs/13.x/boost#third-party-package-ai-guidelines, #third-party-package-skills)
- Source details (`laravel/boost` `src/Install/ThirdPartyPackage.php`, `src/Support/PackageRegistry.php`):
  discovery scans **both Composer and npm packages** (`$project->php()->packages()->concat($project->js()->packages())`)
  at `<package path>/resources/boost/{guidelines|skills}`. Only **direct** dependencies count ("Transitive dependencies
  are excluded so an indirect package cannot inject guidelines"), and first-party packages are handled separately.
  Built-in first-party files can be `.blade.php` (e.g. `SKILL.blade.php`) and use `@scoped([...globs])` (seen in
  `.ai/wayfinder/core.blade.php`).
- First-party packages now ship their own Boost resources: `laravel/wayfinder` (guidelines + skills),
  `inertiajs/inertia-laravel` 3.x (`resources/boost/guidelines/core.blade.php`), and the **npm** package
  `@inertiajs/react@3.9.1` (`resources/boost/guidelines/core.blade.php`,
  `resources/boost/skills/inertia-react-development/SKILL.blade.php`; verified via `npm pack`). That skill covers
  `<Form>`, `useForm`, `useHttp` etc. and contains **no TypeScript typing guidance** (grep for typescript,
  InertiaConfig, generics: 0 hits).
- App-level customisation: `.ai/guidelines/*.{blade.php,md}` (adds or overrides by matching path, e.g.
  `.ai/guidelines/inertia-react/2/forms.blade.php`), `.ai/skills/{name}/SKILL.md` (adds or overrides by name), and
  **project rules** in `.ai/rules/*.md` with `paths:` glob frontmatter plus a generated `.ai/rules/index.md`, recorded via the
  `record-rule` MCP tool. Rules are meant to be committed. Disable with `BOOST_RULES_ENABLED=false`.
  (https://laravel.com/docs/13.x/boost#project-rules)
- Built-in skills: fluxui-development, folio-routing, infer-conventions, inertia-{react,svelte,vue}-development,
  livewire-development, mcp-development, pennant-development, pest-testing, tailwindcss-development,
  volt-development, wayfinder-development. Custom agents via `Boost::registerAgent()`.

---

## Part C: boundary-by-boundary summary (facts only, drawn from A and B)

| Boundary | Kit today | Manual? | Most-adopted / official tooling (2026-10) |
|---|---|---|---|
| Routes / URLs / form actions | Wayfinder 0.1.x (generated, gitignored, Vite plugin, `.form()` variants) | No | Wayfinder (official, in all kits); Ziggy still maintained, more total downloads, not in kits |
| Shared props | Hand-written `InertiaConfig.sharedPageProps` in `types/global.d.ts` with `[key: string]: unknown` | **Yes** | Inertia v3 augmentation (official mechanism); Wayfinder `next` generates `inertia-config.d.ts` (beta) |
| Page props | Hand-written per page (`type Props`) | **Yes** | Only Wayfinder `next` infers from `Inertia::render()` (beta); Spatie LTT v3 explicitly cannot |
| Models | Hand-written `User` type, already drifted (`avatar`, `two_factor_enabled` not served; `two_factor_confirmed_at` served but untyped) | **Yes** | Wayfinder `next` (beta); fumeapp/modeltyper (stable, small); Spatie via Data objects instead of models |
| Form payloads / errors | `<Form>` without generic; inputs `name="..."` strings; `errors.x` loosely typed | **Yes** | Inertia `<Form<T>>` / `useForm<T>` generics (official); T from Wayfinder `next` FormRequest types (beta) or laravel-data + LTT |
| Enums | None in kit | n/a | Wayfinder `next` (beta); Spatie LTT v3 (stable); modeltyper (casts) |
| Flash | `Inertia::flash('toast', ...)` + untyped `router.on('flash')` cast | **Yes** | Inertia `flashDataType` augmentation (official, unused by kit) |
| Validation error shape | default `string` | — | `errorValueType` augmentation; Wayfinder `next` sets `string[]` when `withAllErrors` |
| Broadcast / env | `vite-env.d.ts` only references `vite/client` | — | Wayfinder `next` (beta) |
| PHP static analysis | Larastan 3.x level 7 on app/config/database/routes | — | Larastan 3.13 + PHPStan 2.3 (de facto); strict-rules not used; no prop-shape rule exists |
| TS lint | oxlint via Vite+ 0.3.0, `typeAware: true`, `denyWarnings: true`, no custom rules | — | oxlint/tsgolint (stable); JS plugins alpha, can ship via npm, **no type info** |
| Format | oxfmt via Vite+ (Tailwind sort) | — | oxfmt beta; Pint for PHP |
| Type check | `tsc --noEmit` on TS ^5.7.2 (resolves 5.9.3) | — | TS 7.0.2 is `latest` (no programmatic API until 7.1); Vite+ `typeCheck` option uses tsgolint |
| AI guidance | None committed; Boost installed optionally by installer; generated files gitignored | — | Boost 2.10: package `resources/boost/{guidelines,skills}` (composer **or npm**, direct deps only); `.ai/rules` committed |

### Things I could not verify
- Wayfinder `next` release date / v1 timeline (none announced).
- Which 2 typescript-eslint type-aware rules tsgolint lacks.
- Whether oxlint JS plugins are formally "not subject to semver" (search snippet only).
- When the starter kits switched from Ziggy to Wayfinder.
- Hybridly 0.10's typing pipeline (LTT v2 vs v3).
- Features of small Inertia-typing packages (vite-plugin-ferry, inertia-type-sync, inertia-form-generator).
- ESLint v9 EOL date (search snippet only).
