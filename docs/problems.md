# Problem register

Every known way a type can be wrong, or has to be maintained by hand, at a Type Boundary. The Overlay's work is organised by this register: each Problem is eventually closed by the Overlay or accepted as a documented gap. How to work a Problem is in [`agents/developing-the-overlay.md`](agents/developing-the-overlay.md).

The register was seeded from the Reference Implementation (its overview, evaluation findings, upstream bug list and remaining gaps) and from the three Type Boundaries it never exercised: broadcasting, translations and exposed config.

## How to read and edit it

**IDs.** `P-NNN`, numbered in the order Problems were recorded. An ID is never reused or renumbered, so tickets, harness scenarios and code comments can cite it. A new Problem takes the next free number and goes into its Type Boundary's section, so numbers within a section need not be contiguous.

**Status.**

| Status | Meaning |
|---|---|
| `open` | Not yet closed by the Overlay. The manual workaround is what an app does today, or what the Reference Implementation did by hand. |
| `accepted gap` | Deliberately left open. The entry carries the **Reasoning**, and the gap is documented for app developers. |
| `closed` | The Overlay closes it. The entry names the harness scenarios that prove it (a passing one for the typed way, a breaking one for the Problem) under **Closed by**. |

**Fields.** Each entry has: Type Boundary (one of the glossary's, or "every Type Boundary" for Problems in generation or verification as a whole), Source, Upstream, Status, Reproduction and Manual workaround. Accepted gaps add Reasoning; closed Problems add Closed by.

**Upstream.** For a Problem caused by a third-party tool: a link to the upstream issue or PR that matches it, "by design" with the link that shows it, or "no upstream issue filed". When one is filed, link it here and in the code comment of the isolated workaround. Problems that aren't a tool's defect say "none".

**Reference Implementation names.** Manual workarounds use the Reference Implementation's names: `config/types.php`, the `type-safety/*` lint rules, the `@/lib/*` modules. In the Overlay the config is `config/strictly.php` and suppressible rules are `strictly/<rule>` (oxlint) and `strictly.<rule>` (PHPStan), per ADR-0007.

**Adding a Problem.** Copy an entry, take the next free ID, add a row to the index, and give a reproduction concrete enough to become a breaking scenario.

**Sources** cited by the entries:

- **overview**: [`research/reference-overview.md`][overview]
- **eval-01**, **eval-02**, **eval-03**: [`research/evaluations/01-wayfinder-next.md`][eval-01], [`02-laravel-data-ts.md`][eval-02], [`03-other-tools.md`][eval-03]
- **ecosystem**: [`research/ecosystem.md`][ecosystem]
- **type-safety**: the Reference Implementation's standard, [`reference/template/docs/type-safety.md`][type-safety]
- **spec**: the parent spec, [issue #1][spec]

## Index

| ID | Problem | Type Boundary | Status |
|---|---|---|---|
| [P-001](#p-001) | Wayfinder output fails `tsc` on Laravel 13.35+ (`QUERY` verb) | routes | open |
| [P-002](#p-002) | Wayfinder reads binding keys only from controller type-hints | routes | open |
| [P-003](#p-003) | Route parameters are structural, so any model's key fits | routes | open |
| [P-004](#p-004) | Wayfinder's output formatter collapses function arguments | routes | open |
| [P-005](#p-005) | `withoutScopedBindings()` inside `scopeBindings()` has no effect | routes | open |
| [P-006](#p-006) | Query strings are untyped | routes | open |
| [P-007](#p-007) | Hard-coded URLs bypass the route types | routes | closed |
| [P-008](#p-008) | Route keys are checked for existence, not identity | routes | accepted gap |
| [P-009](#p-009) | Page props are hand-written per page | page props | closed |
| [P-010](#p-010) | Nothing ties a page name to a page component file | page props | closed |
| [P-011](#p-011) | Pages rendered by vendor view closures have no props source | page props | closed |
| [P-071](#p-071) | laravel-data's `#[Hidden]` is ignored by the type generator | page props | open |
| [P-012](#p-012) | `auth.user` is typed non-null but is `null` for guests | shared props | open |
| [P-013](#p-013) | Shared props type has an index signature that hides typos | shared props | open |
| [P-014](#p-014) | Inertia's request APIs accept any payload | form payloads | open |
| [P-015](#p-015) | Form control names are plain strings | form payloads | open |
| [P-016](#p-016) | `jsxImportSource` also changes the JSX runtime import | form payloads | open |
| [P-017](#p-017) | laravel-data `rules()` replaces the inferred rules | form payloads | open |
| [P-018](#p-018) | Inferred `required` rejects empty arrays | form payloads | open |
| [P-019](#p-019) | `int` is validated as `numeric` | form payloads | open |
| [P-020](#p-020) | PHPDoc literal unions are not validated | form payloads | open |
| [P-021](#p-021) | Typed iterables are not cast by default | form payloads | open |
| [P-022](#p-022) | An invalid item in a typed list is a 500 | form payloads | open |
| [P-023](#p-023) | Calendar dates and datetimes are indistinguishable | form payloads | open |
| [P-024](#p-024) | Actions can read request keys their input type doesn't declare | form payloads | open |
| [P-025](#p-025) | Vendor controllers' payloads have no Source of Truth | form payloads | open |
| [P-026](#p-026) | Input reads are seen per key | form payloads | accepted gap |
| [P-027](#p-027) | `FieldName` proves a name came from some `field()`, not this form's | form payloads | accepted gap |
| [P-028](#p-028) | Client-side error keys are not tied to the input type | validation errors | open |
| [P-029](#p-029) | The server can return error keys that aren't fields | validation errors | open |
| [P-030](#p-030) | Validation runs before authorization | validation errors | open |
| [P-031](#p-031) | Enum values are hand-mirrored in TypeScript | enums | closed |
| [P-032](#p-032) | Literal and enum-case PHPDoc types become `unknown` | enums | open |
| [P-033](#p-033) | Enum-keyed maps claim every key is present | enums | open |
| [P-034](#p-034) | Iterating an enum's values needs a cast | enums | closed |
| [P-035](#p-035) | A new enum case can go unhandled in label maps | enums | open |
| [P-036](#p-036) | The Base Kit's hand-written `User` type has drifted | models | open |
| [P-037](#p-037) | Larastan ignores `casts()` without config | models | closed |
| [P-038](#p-038) | Larastan types every `BelongsTo` as nullable | models | open |
| [P-039](#p-039) | Lazy loading and unloaded attributes silently change a prop's shape | models | closed |
| [P-040](#p-040) | Shipped paginator types are wrong | pagination and deferred props | open |
| [P-041](#p-041) | A generic `replaceType` target crashes generation | pagination and deferred props | open |
| [P-042](#p-042) | `Inertia::scroll()` sends a flat paginator | pagination and deferred props | open |
| [P-043](#p-043) | Raw `Inertia::defer()` props are typed as required keys | pagination and deferred props | open |
| [P-044](#p-044) | `Lazy::closure()` and default-included props are typed optional | pagination and deferred props | open |
| [P-045](#p-045) | Prop names in reloads and Inertia components are plain strings | pagination and deferred props | open |
| [P-046](#p-046) | A nested partial reload returns only the subtree | pagination and deferred props | open |
| [P-047](#p-047) | Flash data is untyped and read through a cast | flash messages | open |
| [P-048](#p-048) | `useHttp` request and response types are hand-picked | JSON endpoints | open |
| [P-049](#p-049) | `useHttp` resolves `undefined` on a 422 despite `Promise<T>` | JSON endpoints | open |
| [P-050](#p-050) | Vendor JSON endpoints have no Source of Truth | JSON endpoints | open |
| [P-051](#p-051) | Vendor JSON declared as a TypeScript type gets no shape coverage | JSON endpoints | accepted gap |
| [P-052](#p-052) | Broadcast payloads are hand-typed and unverified | broadcasting | open |
| [P-053](#p-053) | Broadcast event names are plain strings | broadcasting | open |
| [P-054](#p-054) | Channel names and parameters are hand-written | broadcasting | open |
| [P-055](#p-055) | Translation keys are unchecked strings | translations | open |
| [P-056](#p-056) | Translation `:param` names are unchecked | translations | open |
| [P-057](#p-057) | Other locales can miss keys or params | translations | open |
| [P-058](#p-058) | `VITE_*` variables are untyped | exposed config | open |
| [P-059](#p-059) | Server settings and feature flags reach React ad hoc | exposed config | open |
| [P-060](#p-060) | `config()` values are `mixed` in PHP | exposed config | open |
| [P-061](#p-061) | Unmapped PHP classes become `undefined` | every Type Boundary | open |
| [P-062](#p-062) | `mixed` becomes `any` | every Type Boundary | open |
| [P-063](#p-063) | Same-named Data classes produce duplicate types | every Type Boundary | open |
| [P-064](#p-064) | Generated types go stale or missing | every Type Boundary | open |
| [P-065](#p-065) | Generated types are never checked against real payloads | every Type Boundary | open |
| [P-066](#p-066) | Shapes no test produced are never checked | every Type Boundary | open |
| [P-067](#p-067) | Combinations are proven per shape, not per combination | every Type Boundary | accepted gap |
| [P-068](#p-068) | Type assertions override generated types | every Type Boundary | open |
| [P-069](#p-069) | Casts remain in three boundary modules | every Type Boundary | accepted gap |
| [P-070](#p-070) | Lint rules are syntactic | every Type Boundary | accepted gap |
| [P-072](#p-072) | Data shapes are hand-written or registered one by one | every Type Boundary | closed |

## Routes

### P-001

**Wayfinder output fails `tsc` on Laravel 13.35+ (`QUERY` verb)**

- **Type Boundary:** routes
- **Source:** overview §1 and §4; eval-02 §2; eval-03 §0; eval-01 B1
- **Upstream:** [laravel/wayfinder#326](https://github.com/laravel/wayfinder/issues/326); fix proposed in [laravel/wayfinder#324](https://github.com/laravel/wayfinder/pull/324) (and [#325](https://github.com/laravel/wayfinder/pull/325) for `next`)
- **Status:** open

**Reproduction:** a fresh Base Kit, untouched. `Route::redirect('settings', '/settings/profile')` in `routes/settings.php` registers every verb, which since Laravel 13.35 includes `QUERY`; Wayfinder 0.1.21's `type Method` lacks `"query"`. `tsc --noEmit` fails: `RedirectController.ts: Type '"query"' is not assignable to type 'Method'`.

**Manual workaround:** replace `Route::redirect()` with `Route::get('settings', fn () => to_route('profile.edit'))` (the Reference Implementation's `routes/settings.php`), and avoid `Route::redirect()`/`Route::any()` until the upstream fix ships.

### P-002

**Wayfinder reads binding keys only from controller type-hints**

- **Type Boundary:** routes
- **Source:** overview §4; type-safety rule 15
- **Upstream:** no upstream issue filed
- **Status:** open

**Reproduction:** route `/w/{workspace:slug}` to `public function show(string $workspace)` (bound model not type-hinted). Wayfinder doesn't know the parameter is bound to `Workspace` by `slug`, so the generated function has no `{ slug }` object form and `show({ workspace })` can't take a `WorkspaceData`.

**Manual workaround:** always type-hint bound models in the controller action (`show(Workspace $workspace)`); a rule in type-safety.md, unenforced.

### P-003

**Route parameters are structural, so any model's key fits**

- **Type Boundary:** routes
- **Source:** overview §2 and §4; type-safety rule 15
- **Upstream:** no upstream issue filed
- **Status:** open

**Reproduction:** Wayfinder types a bound parameter as `string | { key: string }`. With `show({ workspace, project })` expecting a project, `show({ workspace, project: issue })` or `show({ workspace, project: member.user })` type-checks because both have a `key`.

**Manual workaround:** nominal route keys. A Wayfinder template override types parameters bound to `Project` as `RouteKey<'Project', string>` (`App\Support\Wayfinder\RouteKeys`, `RouteTypes::arguments`); the route-key property of a Data class built by `fromModel(Project $project)` is generated with the same brand (`RouteKeysDataClassTransformer`), and a property holding another model's key declares `#[RouteKeyOf(Project::class)]`. Tests check every branded value sent is an existing key of its model (`tests/Support/RouteKeyChecks.php`), with a disjoint id range per table.

### P-004

**Wayfinder's output formatter collapses function arguments**

- **Type Boundary:** routes
- **Source:** overview §4; `reference/showcase/app/Support/Wayfinder/RouteTypes.php`
- **Upstream:** no upstream issue filed
- **Status:** open

**Reproduction:** a Wayfinder template override that writes a parameter type containing `import('@/lib/routes').RouteKey<'Project', string>` across several lines. The formatter collapses the argument list up to the first `)`, which here is inside `import(…)`, and the generated signature comes out mangled.

**Manual workaround:** render the whole parameters argument on one line (`RouteTypes::arguments`).

### P-005

**`withoutScopedBindings()` inside `scopeBindings()` has no effect**

- **Type Boundary:** routes
- **Source:** overview §4; `reference/showcase/app/Http/Controllers/NotificationController.php`
- **Upstream:** no upstream issue filed (Laravel)
- **Status:** open

**Reproduction:** a route in a `withoutScopedBindings()` group nested in a workspace's `scopeBindings()` group, whose action type-hints `DatabaseNotification $notification`. Laravel merges the two flags with `array_merge_recursive` (`[true, false]`, truthy), so implicit binding still scopes and calls `Workspace::notifications()`.

**Manual workaround:** don't type-hint the parameter (`string $notification`) and resolve it through the user (`$user->notifications()->findOrFail($notification)`). The parameter is then a plain string to Wayfinder (see [P-002](#p-002)).

### P-006

**Query strings are untyped**

- **Type Boundary:** routes
- **Source:** overview §2; type-safety rule 12; the Tracklane spec, [`research/showcase-spec.md`](research/showcase-spec.md) (issue list filters)
- **Upstream:** none (missing feature: Wayfinder's `query` option is `RouteQueryOptions`)
- **Status:** open

**Reproduction:** `index(workspace, { query: { statuse: ['todo'] } })` compiles, and the server reads `$request->query('status')` with nothing tying the two together. An invalid value from an old bookmark is a 422 or a 500.

**Manual workaround:** a `QueryData` class type-hinted on the GET action (`index(IssueFiltersData $filters)`), parsed leniently (invalid items fall back to defaults); a Wayfinder template override types the route function's `query` option as `QueryOptions<IssueFiltersData>` (`RouteTypes::queryOptions`). The same object is sent back as a prop so the filter UI is typed by it.

### P-007

**Hard-coded URLs bypass the route types**

- **Type Boundary:** routes
- **Source:** overview §2; type-safety rule 14
- **Upstream:** none
- **Status:** closed

**Reproduction:** `<Link href="/dashboard">` or `router.visit('/projects/' + id)` compiles and keeps compiling after the route is renamed or removed.

**Manual workaround:** the `type-safety/no-hardcoded-urls` lint rule (`lint/type-safety.js`); URLs come from Wayfinder.

**Closed by:** the `strictly/no-hardcoded-urls` rule of the npm package's oxlint plugin ([`packages/npm/oxlint/index.js`](../packages/npm/oxlint/index.js)), which the installer registers in the app's Vite+ lint config. It rejects a string starting with a single `/` in `href` and `action` attributes, as the URL argument of `visit`, `submit`, `fetch`, `router.*` and `location.assign`/`replace`, and assigned to `location` or `.href`, including either branch of `??`, `||`, `? :` and the start of a `+` concatenation; Kit Conversion moves the Base Kit's one hard-coded URL (`passkey-verify.tsx`) to Wayfinder. A URL held in a variable first escapes the rule ([P-070](#p-070)). Scenarios: `wayfinder-route-url-passes`, `hardcoded-url-fails`.

### P-008

**Route keys are checked for existence, not identity**

- **Type Boundary:** routes
- **Source:** overview §5; type-safety "Remaining gaps"; spec "Accepted gaps"
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** a `ProjectData` whose `key` is filled with another project's key passes the route-key check: it is still a project key. Also: keys scoped to a parent (an issue `number` within a project) are checked against all rows; brands are per model (class basename), not per binding field; parameters bound by `Route::bind()` closures or to non-Eloquent `UrlRoutable`s stay plain `string | number`; disjoint id ranges are applied on SQLite test databases only.

**Manual workaround:** build route-key properties only through `fromModel()`, so a key always comes from its own model.

**Reasoning:** the types can prove which model a key belongs to, and the tests can prove the key exists. Proving it is the *right* row is a question about program logic, not about the type at the Type Boundary; no type can express it.

## Page props

### P-009

**Page props are hand-written per page**

- **Type Boundary:** page props
- **Source:** overview §1; ecosystem A.3 and C; eval-03 §5
- **Upstream:** none
- **Status:** closed

**Reproduction:** the Base Kit's `resources/js/pages/auth/login.tsx` declares `type Props = { status?: string; canResetPassword: boolean }` for `Inertia::render('auth/login', [...])` in `FortifyServiceProvider`; `status` is actually sent as `null`. Renaming a key in the PHP array compiles.

**Manual workaround:** one `Page` class per page (`App\Pages\Auth\LoginPage`) whose constructor defines the props; `PageProps<'auth/login'>` is generated (`InertiaPagesProvider`). An arch test forbids `Inertia::render()` with an array.

**Closed by:** Page classes: a page's props are the constructor of a final class extending `StrictlyLaravel\Inertia\Page` ([`packages/laravel/src/Inertia/Page.php`](../packages/laravel/src/Inertia/Page.php)), which a controller returns, and `strictly:generate` turns each one into `PageProps<'component'>` in `@/generated` ([`InertiaPagesProvider`](../packages/laravel/src/TypeScript/InertiaPagesProvider.php), with types named after the page component by [`PageTransformer`](../packages/laravel/src/TypeScript/PageTransformer.php)). The PHPStan rule `strictly.inertiaRender` ([`InertiaRenderRule`](../packages/laravel/src/PHPStan/InertiaRenderRule.php)) rejects `Inertia::render()`, `inertia('…')`, `ResponseFactory::render()` and `Route::inertia()`, so no page is rendered from an untyped array. Kit Conversion turns the Base Kit's pages, controllers and routes into Page classes and removes the hand-written props types from its page components. Scenarios: `page-class-props-typed-passes`, `page-prop-renamed-fails-tsc`, `inertia-render-with-array-fails-phpstan`.

### P-010

**Nothing ties a page name to a page component file**

- **Type Boundary:** page props
- **Source:** eval-01 §4; eval-02 §8; overview §2
- **Upstream:** none
- **Status:** closed

**Reproduction:** `Inertia::render('project/show', …)` when the file is `pages/projects/show.tsx` compiles; the Base Kit only catches it at test time (`testing.ensure_pages_exist`), and nothing checks that the component's props match. A page file with no PHP counterpart is not reported.

**Manual workaround:** the page component name derives from the `Page` class; the generated `__PageComponentCheck` (`CheckPage<'projects/show', typeof import('@/pages/projects/show').default>`) fails `tsc` when the file is missing or asks for a prop the class doesn't send. An arch test fails a page file without a class. `php artisan make:page` creates both.

**Closed by:** the page component's name derives from the Page class's (`App\Pages\Projects\ShowPage` is `projects/show`), and `@/generated` carries two checks ([`InertiaPagesProvider`](../packages/laravel/src/TypeScript/InertiaPagesProvider.php)): `__PageComponentCheck` fails `tsc` when a Page class's component file is missing or asks for a prop the class doesn't send, and `__PageFileCheck` fails it when a file under `resources/js/pages` has no Page class. `php artisan make:page projects/show` ([`MakePageCommand`](../packages/laravel/src/Console/MakePageCommand.php)) creates both, already in sync (harness test `make:page creates a Page class and its page component, already in sync`). The file check lists the page files found when the types were last generated: the Vite plugin regenerates on PHP changes only, so a new page file is checked once anything regenerates (`ci:check`, `types:check` and `build` always do). Scenarios: `page-component-accepting-page-props-passes`, `page-component-missing-fails-tsc`, `page-component-unsent-prop-fails-tsc`, `page-file-without-class-fails-tsc`.

### P-011

**Pages rendered by vendor view closures have no props source**

- **Type Boundary:** page props
- **Source:** eval-01 §2 (PG) and §4; ecosystem A.3
- **Upstream:** none
- **Status:** closed

**Reproduction:** Fortify's views (`Fortify::loginView(fn () => Inertia::render('auth/login', [...]))`) and `Route::inertia('dashboard', 'dashboard')` pages have no controller action, so no generator sees a props type for them.

**Manual workaround:** Kit Conversion by hand: each view closure returns a `Page` (`Fortify::loginView(fn (Request $request) => new LoginPage(...))`), and `Route::inertia()` pages become `DashboardPage`/`WelcomePage`.

**Closed by:** a vendor view closure or a route closure returns a Page class like a controller does (Fortify renders any `Responsable` its view closure returns). Kit Conversion converts the Base Kit's Fortify views and its `Route::inertia()` pages (welcome, dashboard, settings/appearance) to Page classes, and the PHPStan rule `strictly.inertiaRender` rejects `Route::inertia()` and `Inertia::render()` in a closure as anywhere else. Scenarios: `vendor-view-page-props-typed-passes`, `route-inertia-without-page-class-fails-phpstan`.

### P-071

**laravel-data's `#[Hidden]` is ignored by the type generator**

- **Type Boundary:** page props (every Data class)
- **Source:** overview §2 and §4; eval-02 §3 and §9
- **Upstream:** no upstream issue filed (laravel-typescript-transformer 3.3: `DataClassPropertyProcessor` combines its checks with `&&`)
- **Status:** open

**Reproduction:** a Data property marked with laravel-data's `#[Hidden]` is never sent, but stays a required key in the generated type; `tsc` trusts a value that is always missing.

**Manual workaround:** mark the property with both attributes, `#[DataHidden, TsHidden]` (laravel-data's and typescript-transformer's `Hidden`).

## Shared props

### P-012

**`auth.user` is typed non-null but is `null` for guests**

- **Type Boundary:** shared props
- **Source:** overview §1; eval-02 §1; eval-03 §5; ecosystem A.3
- **Upstream:** none
- **Status:** open

**Reproduction:** the Base Kit's `types/global.d.ts` declares `sharedPageProps: { auth: Auth; … }` with `Auth = { user: User }`; `HandleInertiaRequests::share()` sends `$request->user()`, which is `null` for guests. `usePage().props.auth.user.name` compiles on a guest page.

**Manual workaround:** `App\Data\SharedProps` built in `share()`, generated into `InertiaConfig['sharedPageProps']`, with `auth.user: UserData | null`; `useUser()` for authenticated pages.

### P-013

**Shared props type has an index signature that hides typos**

- **Type Boundary:** shared props
- **Source:** ecosystem A.3; eval-03 §5
- **Upstream:** none
- **Status:** open

**Reproduction:** the Base Kit's `sharedPageProps` ends with `[key: string]: unknown`, so `usePage().props.sidebarOpne` compiles.

**Manual workaround:** the hand-written declaration is deleted and replaced by the generated `SharedProps`, which has no index signature.

## Form payloads

### P-014

**Inertia's request APIs accept any payload**

- **Type Boundary:** form payloads
- **Source:** overview §2; ecosystem A.3 and B.2; type-safety rules 11 and 13
- **Upstream:** none
- **Status:** open

**Reproduction:** the Base Kit's `<Form {...ProfileController.update.form()}>` has no generic, so its payload and `errors` are untied to the request's rules. `useForm<T>()` takes whatever `T` is named; `router.post(url, data)` and `<Link data>` accept any object.

**Manual workaround:** input Data classes extending `InputData`, type-hinted on the action; Wayfinder's `.form()` is branded with the action's input class (template override, `RouteTypes::brands`), so `useRouteForm(route, defaults)`, `<TypedForm>`, `submit(route, data)` and `visit(route)` (`@/lib/requests`) take payload, error keys and target from the route. The `type-safety/typed-requests` lint rule rejects `useForm`, `useHttp`, `router.get/post/put/patch/delete`, `<Link data>` and untyped `<Form>`.

### P-015

**Form control names are plain strings**

- **Type Boundary:** form payloads
- **Source:** overview §2; eval-02 §5; ecosystem B.2; ADR-0004
- **Upstream:** none
- **Status:** open

**Reproduction:** `<Input name="emial" />` inside a typed form compiles; so does `<input name={someString}>`, and a wrapper component forwarding `name`.

**Manual workaround:** `field('email')` from `<TypedForm>`'s render prop returns a branded `FieldName`; the app's JSX types (`jsxImportSource: "@/types/jsx"`, `resources/js/types/jsx/jsx-runtime.d.ts`) narrow `name` on `<input>`/`<select>`/`<textarea>`/`<button>` to `FieldName`, and the Base Kit's UI components that forward `name` declare `name?: FieldName`. The `type-safety/typed-form-fields` lint rule covers third-party components inside `<TypedForm>`.

### P-016

**`jsxImportSource` also changes the JSX runtime import**

- **Type Boundary:** form payloads
- **Source:** overview §4; ADR-0004
- **Upstream:** by design since [vitejs/vite-plugin-react#726](https://github.com/vitejs/vite-plugin-react/pull/726) (the plugin respects tsconfig's `jsxImportSource`)
- **Status:** open

**Reproduction:** set `"jsxImportSource": "@/types/jsx"` in `tsconfig.json` to narrow the JSX types ([P-015](#p-015)); the Vite React plugin then imports the JSX runtime from `@/types/jsx/jsx-runtime`, which has types only, and the app fails to build or render.

**Manual workaround:** pin the runtime in `vite.config.ts`: `react({ jsxImportSource: 'react' })`.

### P-017

**laravel-data `rules()` replaces the inferred rules**

- **Type Boundary:** form payloads
- **Source:** overview §2 and §4; type-safety rule 11
- **Upstream:** by design; laravel-data offers the opt-in `#[MergeValidationRules]`. No upstream issue filed.
- **Status:** open

**Reproduction:** a Data class with `public string $slug` and `rules()` returning `['slug' => ['unique:projects']]`: the inferred `required|string` for `slug` is dropped, so a missing or non-string slug passes validation while the TypeScript type says `slug: string`.

**Manual workaround:** the `InputData` base class carries `#[MergeValidationRules]`.

### P-018

**Inferred `required` rejects empty arrays**

- **Type Boundary:** form payloads
- **Source:** overview §4; eval-02 §1, §5 and §9; type-safety rule 11
- **Upstream:** discussed and declined in the comments of [spatie/laravel-data#681](https://github.com/spatie/laravel-data/issues/681) (Laravel's `required` treats `[]` as missing)
- **Status:** open

**Reproduction:** `public array $tags` (non-nullable) is inferred `required|array`; the TypeScript type `string[]` allows `[]`, which the server rejects with a 422.

**Manual workaround:** `StrictTypesRuleInferrer` replaces `required` with `present` for arrays, lists and Data collections; `#[Min(1)]` where a list must not be empty.

### P-019

**`int` is validated as `numeric`**

- **Type Boundary:** form payloads
- **Source:** overview §4; eval-02 §1 and §5
- **Upstream:** [spatie/laravel-data#814](https://github.com/spatie/laravel-data/pull/814) (PR adding an `integer` option, declined; its comments note the docs claim `integer`)
- **Status:** open

**Reproduction:** `public int $estimate` is inferred `numeric`; `1.5` passes validation and is silently truncated to `1`, while the TypeScript type is `number` either way.

**Manual workaround:** `StrictTypesRuleInferrer` replaces `numeric` with `integer` for `int` properties.

### P-020

**PHPDoc literal unions are not validated**

- **Type Boundary:** form payloads
- **Source:** overview §2; type-safety rule 8; `reference/template/app/Support/Data/LiteralTypesRuleInferrer.php`
- **Upstream:** no upstream issue filed
- **Status:** open

**Reproduction:** `/** @var 'monday'|'sunday' */ public string $weekStartsOn` generates `'monday' | 'sunday'` (once [P-032](#p-032) is worked around), but the server accepts any string.

**Manual workaround:** `LiteralTypesRuleInferrer` adds `in:monday,sunday` from the PHPDoc literal union.

### P-021

**Typed iterables are not cast by default**

- **Type Boundary:** form payloads
- **Source:** overview §4; `reference/showcase/config/data.php`; `reference/showcase/tests/Feature/Collaboration/SavedViewTest.php`
- **Upstream:** by design in laravel-data 4 (the `cast_and_transform_iterables` feature is off by default and announced as default in the next major). No upstream issue filed.
- **Status:** open

**Reproduction:** `/** @var list<IssueStatus> */ public array $statuses` holds raw strings (`['todo']`) after `from()`, while PHPStan and TypeScript believe it holds enums.

**Manual workaround:** `'features' => ['cast_and_transform_iterables' => true]` in `config/data.php`.

### P-022

**An invalid item in a typed list is a 500**

- **Type Boundary:** form payloads
- **Source:** overview §2 and §4; `reference/template/app/Support/Data/ListItemsRule.php`
- **Upstream:** no upstream issue filed
- **Status:** open

**Reproduction:** posting `statuses: ['bogus']` to an action taking `/** @var list<IssueStatus> */ public array $statuses` passes validation (no per-item rule is inferred) and fails while casting: a 500 instead of a 422.

**Manual workaround:** `StrictTypesRuleInferrer` adds `ListItemsRule` to lists of scalars and backed enums, validating every item.

### P-023

**Calendar dates and datetimes are indistinguishable**

- **Type Boundary:** form payloads (also page props)
- **Source:** eval-02 §4, §5 and §9; type-safety rule 5; eval-01 M5
- **Upstream:** no upstream issue filed
- **Status:** open

**Reproduction:** every date is generated as `string`, so a due date and a timestamp look the same to React. `#[Date]` on a Carbon property validates `2026-05-01`, then the default cast throws `CannotCastDate`: a 500.

**Manual workaround:** a `#[DateOnly]` attribute with `DateOnlyCast`: `"2026-10-14"` both ways; other dates are ISO-8601 strings.

### P-024

**Actions can read request keys their input type doesn't declare**

- **Type Boundary:** form payloads
- **Source:** overview §2; type-safety rule 13
- **Upstream:** none
- **Status:** open

**Reproduction:** an action taking `StoreProjectData $data` also reads `$request->boolean('notify')`. The form's type has no `notify`, so the client never sends it and the server silently uses the default.

**Manual workaround:** the test request records every key read (`input()`, `boolean()`, `only()`, `has()`, magic properties; `tests/Support/InputReads.php`) and the Contract `read satisfies InputKey<StoreProjectData>[]` fails on an undeclared key.

### P-025

**Vendor controllers' payloads have no Source of Truth**

- **Type Boundary:** form payloads
- **Source:** overview §2; type-safety rule 13
- **Upstream:** none
- **Status:** open

**Reproduction:** Fortify's login, register and 2FA controllers take no input Data class, so their payloads are hand-written. The Reference Implementation's declarations missed `remember` on register and `force` on enabling 2FA until the input Contracts caught them.

**Manual workaround:** declare the payload per vendor action in `config/types.php` (`route_inputs`: `Controller@method => Data class`, or a `QueryData` class for a GET). Tests submit the forms; every key the vendor validates, reports an error for or reads must be a field of the declaration, and Contract Coverage fails on a declared field never validated or read.

### P-026

**Input reads are seen per key**

- **Type Boundary:** form payloads
- **Source:** overview §5; type-safety "Remaining gaps"; spec "Accepted gaps"
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** a vendor reading the whole input (`$request->all()['x']`, `except()`) names no field, so a key read that way and missing from the declaration isn't detected. Reads in code paths no test reaches aren't seen; a `final` vendor FormRequest can't be tracked (its fields then fail as never read). Framework plumbing (`_token`-style keys, the paginator's `page`/`cursor`, laravel-data's `include`/`exclude`) is ignored.

**Manual workaround:** a field read that way must also be validated, or Contract Coverage reports it as never used; it can't pass silently.

**Reasoning:** reads are recorded through the request's accessors, so a read that names no key can't be attributed to a field. The remaining risk is small: such a field must still be validated or Contract Coverage fails, and it only arises in vendor code the app doesn't own.

### P-027

**`FieldName` proves a name came from some `field()`, not this form's**

- **Type Boundary:** form payloads
- **Source:** overview §5; type-safety "Remaining gaps"; spec "Accepted gaps"
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** a name taken from one `<TypedForm>`'s `field()` and used inside another type-checks. Names reaching the DOM without JSX (`createElement`, `FormData.append`) aren't covered, and third-party components typing `name` as `string` are covered only by the lint rule inside `<TypedForm>`.

**Manual workaround:** none.

**Reasoning:** the narrowed JSX types (ADR-0004) can only say "this came from `field()`"; JSX types are global, so they can't know which form encloses a control. The input Contracts still catch a wrong field when a test submits the form.

## Validation errors

### P-028

**Client-side error keys are not tied to the input type**

- **Type Boundary:** validation errors
- **Source:** ecosystem A.3 and C; eval-02 §5
- **Upstream:** none
- **Status:** open

**Reproduction:** the Base Kit reads `errors.name` from an untyped `<Form>` render prop (`string` per any key), so `errors.nmae` and `errors['tasks.0.titel']` compile.

**Manual workaround:** errors keyed by the input type's fields, including nested and array keys (`errors['settings.notifications.onAssign']`, `tasks.0.title`), through `useRouteForm`/`<TypedForm>`/`submit()` ([P-014](#p-014)).

### P-029

**The server can return error keys that aren't fields**

- **Type Boundary:** validation errors
- **Source:** overview §2 and §5; type-safety rule 13
- **Upstream:** none
- **Status:** open

**Reproduction:** `throw ValidationException::withMessages(['project' => 'still has issues'])` from an action whose input has no `project` field: the client's typed `errors` never shows it.

**Manual workaround:** the validation Contract `errors satisfies InputKey<StoreIssueData>[]` fails on any key that isn't a field; refusals that aren't about a field are error toasts (`Flash::error('…'); return back();`).

### P-030

**Validation runs before authorization**

- **Type Boundary:** validation errors
- **Source:** overview §2 and §4; eval-02 §5; type-safety rule 11
- **Upstream:** no upstream issue filed (laravel-data's `authorize()` hook is opt-in)
- **Status:** open

**Reproduction:** an action type-hinting an input Data class and calling `Gate::authorize()` in its body: a user without the ability submits invalid data and gets a 422 listing the fields instead of a 403.

**Manual workaround:** `public static function authorize(): bool` on the input class, which laravel-data runs before validation (`AuthorizedDataPipe`).

## Enums

### P-031

**Enum values are hand-mirrored in TypeScript**

- **Type Boundary:** enums
- **Source:** ecosystem A.3 and C
- **Upstream:** none
- **Status:** closed

**Reproduction:** the Base Kit's `FlashToast.type: 'success' | 'info' | 'warning' | 'error'` (`resources/js/types/ui.ts`) is written by hand; a PHP-side change doesn't reach it.

**Manual workaround:** every backed enum in `app/` is generated as a union of its values, with no registration.

**Closed by:** `strictly:generate` ([`packages/laravel/src/TypeScript/TypeGeneration.php`](../packages/laravel/src/TypeScript/TypeGeneration.php)) turns every backed enum anywhere in `app/` into a union of its values in `@/generated`, with no registration. Scenarios: `enum-value-in-php-passes`, `enum-value-not-in-php-fails-tsc`.

### P-032

**Literal and enum-case PHPDoc types become `unknown`**

- **Type Boundary:** enums (also every discriminated union)
- **Source:** overview §2 and §4; type-safety rule 8
- **Upstream:** no upstream issue filed (typescript-transformer)
- **Status:** open

**Reproduction:** `/** @var ActivityType::Commented */ public ActivityType $type` and `/** @var 'monday'|'sunday' */ public string $weekStartsOn` both generate `unknown`, so discriminated unions and exhaustive `switch` statements are impossible.

**Manual workaround:** `LiteralTypesTranspiler` turns PHPDoc string, int, float, bool and enum-case constants into TypeScript literals (`type: 'commented'`).

### P-033

**Enum-keyed maps claim every key is present**

- **Type Boundary:** enums
- **Source:** eval-02 §3 and §9; overview §2; type-safety rule 7
- **Upstream:** no upstream issue filed (typescript-transformer)
- **Status:** open

**Reproduction:** `/** @var array<ProjectStatus, int> */` generates `Record<ProjectStatus, number>`, claiming every status is a key, while the server sends only the statuses it counted. An empty PHP map also serialises as `[]`, not `{}`.

**Manual workaround:** `/** @var array<value-of<Status>, int> */` generates `Partial<Record<Status, number>>` (`LiteralTypesTranspiler`); prefer a list of objects with a `status` field.

### P-034

**Iterating an enum's values needs a cast**

- **Type Boundary:** enums
- **Source:** overview §2; type-safety rule 6
- **Upstream:** none
- **Status:** closed

**Reproduction:** a picker lists statuses with `Object.keys(labels) as IssueStatus[]`: a cast, and wrong for int-backed enums (keys are strings).

**Manual workaround:** `enumValues.IssueStatus` generated from PHP in case order (`EnumValuesProvider`); for a literal union, `allOf<WeekStart>()('monday', 'sunday')`.

**Closed by:** `enumValues` in `@/generated`, every backed enum's values in case order, string- and int-backed, typed as the enum ([`packages/laravel/src/TypeScript/EnumValuesProvider.php`](../packages/laravel/src/TypeScript/EnumValuesProvider.php)). `tsc` rejects the cast for an int-backed enum; for a string-backed one it still compiles, and rejecting type assertions is [P-068](#p-068). Scenarios: `enum-values-in-case-order-pass`, `enum-keys-cast-fails-tsc`.

### P-035

**A new enum case can go unhandled in label maps**

- **Type Boundary:** enums
- **Source:** type-safety rule 6; overview §2
- **Upstream:** none
- **Status:** open

**Reproduction:** add `case Blocked = 'blocked'` to `IssueStatus`; a label map typed `Record<string, string>` or built with a cast still compiles and shows nothing for the new case.

**Manual workaround:** labels, colours and icons live in `resources/js/lib/domain.ts` as `satisfies Record<IssueStatus, …>`, so `tsc` fails until the case is handled; unions end with `x satisfies never`.

## Models

### P-036

**The Base Kit's hand-written `User` type has drifted**

- **Type Boundary:** models
- **Source:** overview §1; ecosystem A.3; eval-02 §1; spec "Problem Statement"
- **Upstream:** none
- **Status:** open

**Reproduction:** `resources/js/types/auth.ts` types `avatar` and `two_factor_enabled`, which nothing on the server sends, omits `two_factor_confirmed_at`, which is sent, and ends with `[key: string]: unknown`. The full Eloquent model is serialised as `auth.user`, so any column not `#[Hidden]` reaches the browser.

**Manual workaround:** a `UserData` class is the whitelist of what is sent; models are never sent directly (type-safety rule 3).

### P-037

**Larastan ignores `casts()` without config**

- **Type Boundary:** models
- **Source:** overview §4; eval-01 §7
- **Upstream:** [larastan/larastan#2512](https://github.com/larastan/larastan/issues/2512)
- **Status:** closed

**Reproduction:** a model declaring `protected function casts(): array { return ['status' => ProjectStatus::class, 'budget' => 'decimal:2']; }`. Larastan infers `status: string` and `budget: float|null`, so PHPStan doesn't catch a Data class built with the wrong type, and reports false errors such as `->label()` "on string".

**Manual workaround:** `parseModelCastsMethod: true` in `phpstan.neon`.

**Closed by:** `parseModelCastsMethod: true` in the Composer package's PHPStan extension ([`packages/laravel/extension.neon`](../packages/laravel/extension.neon)), which the installer includes from the app's `phpstan.neon` (by converting it, or by adding the include to one the app edited). Scenarios: `model-cast-enum-used-passes`, `model-cast-enum-misused-fails`.

### P-038

**Larastan types every `BelongsTo` as nullable**

- **Type Boundary:** models
- **Source:** overview §4; type-safety rule 17; eval-01 §7
- **Upstream:** by design since [larastan/larastan#369](https://github.com/larastan/larastan/pull/369) (confirmed in [larastan/larastan#2495](https://github.com/larastan/larastan/issues/2495))
- **Status:** open

**Reproduction:** `$issue->project` for a non-nullable foreign key is `Project|null` to PHPStan, so `ProjectData::fromModel($issue->project)` is an error at level max, pushing code towards `?->` and nullable Data properties that don't match the data.

**Manual workaround:** declare non-nullable relations on the model: `@property-read Project $project`.

### P-039

**Lazy loading and unloaded attributes silently change a prop's shape**

- **Type Boundary:** models
- **Source:** overview §2; type-safety rule 17
- **Upstream:** none
- **Status:** closed

**Reproduction:** a `fromModel()` reads `$project->lead` without the relation loaded, or an attribute not selected by the query; Eloquent lazy-loads or returns `null`, so a prop the type says is set arrives as `null` (or costs a query per row).

**Manual workaround:** `Model::shouldBeStrict()` in `AppServiceProvider`, so both throw in tests; factories set every column the app reads.

**Closed by:** `Model::shouldBeStrict()` in the Composer package's service provider ([`packages/laravel/src/StrictlyServiceProvider.php`](../packages/laravel/src/StrictlyServiceProvider.php)), on everywhere except production, so it throws in tests and local development. Scenarios: `eager-loading-in-a-test-passes`, `lazy-loading-in-a-test-fails`, `unloaded-attribute-in-a-test-fails`.

## Pagination and deferred props

### P-040

**Shipped paginator types are wrong**

- **Type Boundary:** pagination and deferred props
- **Source:** overview §2 and §4; eval-02 §3 and §9
- **Upstream:** no upstream issue filed (laravel-typescript-transformer); [spatie/typescript-transformer#116](https://github.com/spatie/typescript-transformer/issues/116) reported a different cursor paginator mismatch against v2
- **Status:** open

**Reproduction:** a `PaginatedDataCollection` prop: the shipped `LengthAwarePaginator` type lacks `links[].page` (sent as `number | null` since Laravel 11). A `CursorPaginatedDataCollection` from `X::collect($cursorPaginator, …)` is keyed `array-key`, so `data` becomes a `Record` instead of `X[]`.

**Manual workaround:** `PaginatorTypesProvider` replaces both types (`data: TValue[]`, `links` with `page`), registered after the laravel-data extension; a typed `<Pagination>` component.

### P-041

**A generic `replaceType` target crashes generation**

- **Type Boundary:** pagination and deferred props
- **Source:** overview §2 and §4; `reference/template/app/Support/TypeScript/UnwrapInertiaPropsVisitor.php`
- **Upstream:** no upstream issue filed (typescript-transformer)
- **Status:** open

**Reproduction:** `->replaceType(ScrollProp::class, 'never')` for `/** @var ScrollProp<CursorPaginatedDataCollection<array-key, ActivityData>> */` emits the invalid `never<…>` and generation crashes.

**Manual workaround:** `UnwrapInertiaPropsVisitor`, a visitor hook that replaces `ScrollProp<T>`, `MergeProp<T>`, `DeferProp<T>`, `OptionalProp<T>` and `OnceProp<T>` with `T`.

### P-042

**`Inertia::scroll()` sends a flat paginator**

- **Type Boundary:** pagination and deferred props
- **Source:** eval-02 §3, §4 and §9
- **Upstream:** no upstream issue filed
- **Status:** open

**Reproduction:** `Inertia::scroll($paginator)` sends the paginator's own flat JSON, while a paginator inside a Data class is typed `{ data, links, meta }`; the infinite-scroll prop's type is wrong.

**Manual workaround:** `/** @var ScrollProp<CursorPaginatedDataCollection<array-key, X>> */ public ScrollProp $items` with `new ScrollProp(X::collect($cursorPaginator, CursorPaginatedDataCollection::class), …)` (type-safety rule 10).

### P-043

**Raw `Inertia::defer()` props are typed as required keys**

- **Type Boundary:** pagination and deferred props
- **Source:** eval-02 §3
- **Upstream:** no upstream issue filed
- **Status:** open

**Reproduction:** a deferred prop built with `Inertia::defer(fn () => …)` generates `stats: ProjectStatsData | undefined` with the key required; on first load the key is absent.

**Manual workaround:** `public Lazy|ProjectStatsData $stats` with `Lazy::inertiaDeferred(fn () => …)` generates `stats?: ProjectStatsData` (type-safety rule 9).

### P-044

**`Lazy::closure()` and default-included props are typed optional**

- **Type Boundary:** pagination and deferred props
- **Source:** eval-02 §4 and §9
- **Upstream:** no upstream issue filed
- **Status:** open

**Reproduction:** a prop built with `Lazy::closure()` or marked `defaultIncluded` is always sent but generated as `prop?: X`, so every component must handle an `undefined` that never happens.

**Manual workaround:** none recorded; avoid these wrappers for props that are always sent.

### P-045

**Prop names in reloads and Inertia components are plain strings**

- **Type Boundary:** pagination and deferred props
- **Source:** overview §2; ecosystem B.2; type-safety rule 9
- **Upstream:** none
- **Status:** open

**Reproduction:** `router.reload({ only: ['stast'] })`, `<Deferred data="stast">`, `<WhenVisible data="…">`, `<InfiniteScroll data="…">` all compile; Inertia's `<Deferred data: string | string[]>` isn't keyed to the page's props. `router.optimistic<TProps>()` takes any type. A renamed prop silently loads nothing.

**Manual workaround:** `const page = forPage<'projects/show'>()` (`@/lib/page`) gives typed `only`/`except`/`reset`, `<page.Deferred>`, `<page.WhenVisible>`, `<page.InfiniteScroll>` and `page.optimistic()`; the `type-safety/typed-prop-names` and `type-safety/typed-inertia-components` lint rules reject the raw forms.

### P-046

**A nested partial reload returns only the subtree**

- **Type Boundary:** pagination and deferred props (partial reloads)
- **Source:** eval-02 §3
- **Upstream:** none (expected Inertia behaviour)
- **Status:** open

**Reproduction:** a partial reload with `only: ['project.stats']` returns only that subtree; checking it as the full page props fails, and checking it loosely proves nothing. Separately, a requested key missing from the response goes unnoticed.

**Manual workaround:** partial-reload Contracts are checked as `PartialPageContract<'issues/show', 'comments'>` (`DeepPartial` of the page props), and the requested keys must be present.

## Flash messages

### P-047

**Flash data is untyped and read through a cast**

- **Type Boundary:** flash messages
- **Source:** ecosystem A.3, B.2 and C; eval-01 S4
- **Upstream:** none
- **Status:** open

**Reproduction:** the Base Kit sends `Inertia::flash('toast', ['type' => 'success', 'message' => …])` and reads it in `use-flash-toast.ts` as `(event as CustomEvent).detail?.flash?.toast as FlashToast | undefined`; `flashDataType` is never set, so a changed toast shape compiles.

**Manual workaround:** `App\Support\Inertia\Flash::success()` backed by `App\Data\FlashData`, generated into `InertiaConfig['flashDataType']`; flash is recorded as a Contract, including on redirects.

## JSON endpoints

### P-048

**`useHttp` request and response types are hand-picked**

- **Type Boundary:** JSON endpoints
- **Source:** overview §2; ecosystem A.3 and B.2; type-safety rule 14
- **Upstream:** none
- **Status:** open

**Reproduction:** `useHttp<{ q: string }, SearchResults>()` takes whatever types are named; the Base Kit's `use-two-factor-auth.ts` calls `useHttp` for JSON with hand-written shapes. Nothing ties them to the controller.

**Manual workaround:** a JSON action returns a Data object (`: SearchResultsData`); the route is branded with it (`RouteTypes::brands`), and `useRouteHttp(search(workspace), { q: null })` derives request and response from the route.

### P-049

**`useHttp` resolves `undefined` on a 422 despite `Promise<T>`**

- **Type Boundary:** JSON endpoints
- **Source:** overview §4; `reference/showcase/resources/js/components/search/use-search.ts`
- **Upstream:** behaviour introduced by [inertiajs/inertia#3142](https://github.com/inertiajs/inertia/pull/3142) (`return undefined as TResponse`); no upstream issue filed for the return type
- **Status:** open

**Reproduction:** `const results = await http.submit()` with a query the server rejects: `results` is `undefined` while typed `SearchResultsData`.

**Manual workaround:** read results from `http.response` and errors from `http.errors`, never from the resolved value.

### P-050

**Vendor JSON endpoints have no Source of Truth**

- **Type Boundary:** JSON endpoints
- **Source:** overview §2; type-safety rule 14
- **Upstream:** none
- **Status:** open

**Reproduction:** Fortify's 2FA QR code, secret key and recovery-code endpoints return JSON from controllers the app doesn't own; the Base Kit types them by hand (`TwoFactorSetupData`).

**Manual workaround:** declare the response per vendor action in `config/types.php` (`route_responses`: a Data class, or a TypeScript type such as `'{ svg: string; url: string } | []'`); tests check every response against it, and Contract Coverage fails on a declared endpoint never called.

### P-051

**Vendor JSON declared as a TypeScript type gets no shape coverage**

- **Type Boundary:** JSON endpoints
- **Source:** type-safety "Remaining gaps"; spec "Accepted gaps"
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `'{ svg: string; url: string } | []'` for the QR code endpoint: each recorded response is checked by `tsc`, but nothing reports a union member no test produced.

**Manual workaround:** none; prefer declaring a Data class where the JSON is one object.

**Reasoning:** Contract Coverage reads shapes from Data classes. Parsing arbitrary TypeScript types to enumerate their states would mean a TypeScript type analyser in PHP for the few vendor endpoints whose JSON isn't one object.

## Broadcasting

The Reference Implementation never exercised this Type Boundary, so these Problems have no recorded workaround beyond hand-typing. The Testbed App will exercise them (spec user stories 44–46 and 76).

### P-052

**Broadcast payloads are hand-typed and unverified**

- **Type Boundary:** broadcasting
- **Source:** spec user stories 44 and 46; ecosystem C ("Broadcast / env")
- **Upstream:** none
- **Status:** open

**Reproduction:** an event `CommentPosted implements ShouldBroadcast` returns `['id' => …, 'body' => …]` from `broadcastWith()`; the listener's payload is typed by hand, `useEcho(channel, 'CommentPosted', (e: { id: number; text: string }) => …)`, and compiles after the PHP keys change.

**Manual workaround:** hand-write the payload type next to the listener and keep it in sync.

### P-053

**Broadcast event names are plain strings**

- **Type Boundary:** broadcasting
- **Source:** spec user story 45
- **Upstream:** none
- **Status:** open

**Reproduction:** `useEcho(channel, 'CommentPostd', cb)` or a stale name after `broadcastAs()` changes compiles and silently never fires.

**Manual workaround:** none; names are typed by hand.

### P-054

**Channel names and parameters are hand-written**

- **Type Boundary:** broadcasting
- **Source:** spec user story 45
- **Upstream:** none
- **Status:** open

**Reproduction:** `Broadcast::channel('workspace.{workspace}', …)` in `routes/channels.php`; the client subscribes with `` `workspace.${workspace.slug}` `` while the channel binds by id. Both compile; the subscription is refused or joins the wrong channel.

**Manual workaround:** none; channel strings are built by hand.

## Translations

The Reference Implementation never exercised this Type Boundary. ADR-0006 decides the approach (spec user stories 47–49).

### P-055

**Translation keys are unchecked strings**

- **Type Boundary:** translations
- **Source:** spec user story 47; ADR-0006
- **Upstream:** none
- **Status:** open

**Reproduction:** `lang/en/auth.php` defines `'throttle' => 'Too many login attempts. Please try again in :seconds seconds.'`; the client calls `t('auth.throtle')` and compiles, rendering the raw key.

**Manual workaround:** none; keys are copied by hand.

### P-056

**Translation `:param` names are unchecked**

- **Type Boundary:** translations
- **Source:** spec user story 47; ADR-0006
- **Upstream:** none
- **Status:** open

**Reproduction:** `t('auth.throttle', { second: 5 })` compiles; the message renders with the literal `:seconds`.

**Manual workaround:** none.

### P-057

**Other locales can miss keys or params**

- **Type Boundary:** translations
- **Source:** spec user story 48; ADR-0006
- **Upstream:** none
- **Status:** open

**Reproduction:** add a key to `lang/en/` but not `lang/de/`, or drop `:seconds` from the German message: nothing fails; German users see the fallback or a message missing its value.

**Manual workaround:** none.

## Exposed config

The Reference Implementation never exercised this Type Boundary beyond `config()->string('app.name')` in shared props (spec user stories 50–51).

### P-058

**`VITE_*` variables are untyped**

- **Type Boundary:** exposed config
- **Source:** spec user story 51; ecosystem C ("Broadcast / env")
- **Upstream:** none
- **Status:** open

**Reproduction:** the Base Kit's `vite-env.d.ts` only references `vite/client`, whose `ImportMetaEnv` has an index signature; `import.meta.env.VITE_APP_NAM` compiles and is `undefined` at runtime (`resources/js/app.tsx` reads `VITE_APP_NAME`).

**Manual workaround:** hand-write `ImportMetaEnv` keys for the variables in `.env.example`.

### P-059

**Server settings and feature flags reach React ad hoc**

- **Type Boundary:** exposed config
- **Source:** spec user story 50
- **Upstream:** none
- **Status:** open

**Reproduction:** a feature flag is added to `share()` as `'features' => ['boards' => Feature::active('boards')]` or passed as an inline prop; its type is written by hand, or hidden by the shared props index signature ([P-013](#p-013)).

**Manual workaround:** add the setting as a typed property of the shared props Data class.

### P-060

**`config()` values are `mixed` in PHP**

- **Type Boundary:** exposed config
- **Source:** eval-01 S2; eval-03 §9
- **Upstream:** none (by design: config is untyped)
- **Status:** open

**Reproduction:** `'name' => config('app.name')` is `mixed`, so nothing proves the value is the string the TypeScript type promises (Wayfinder `next` generates `name: unknown`; PHPStan max reports it).

**Manual workaround:** typed accessors, `config()->string('app.name')`, enforced by PHPStan max.

## Every Type Boundary

Problems in generation or verification that affect every Type Boundary.

### P-061

**Unmapped PHP classes become `undefined`**

- **Type Boundary:** every Type Boundary (seen in form payloads and page props)
- **Source:** overview §2 and §4; eval-02 §3 and §9; `reference/showcase/app/Data/Attachments/StoreAttachmentData.php`
- **Upstream:** no upstream issue filed (typescript-transformer)
- **Status:** open

**Reproduction:** `public UploadedFile $file` generates `file: undefined`; a `DateTimeInterface` property generates `undefined` (the Laravel extension maps only `CarbonInterface`). Any class without a transformer does the same with only a warning.

**Manual workaround:** `->replaceType(UploadedFile::class, new TypeScriptRaw('File'))` (with `File | null` in `useRouteForm` until a file is picked) and `->replaceType(DateTimeInterface::class, 'string')`.

### P-062

**`mixed` becomes `any`**

- **Type Boundary:** every Type Boundary
- **Source:** eval-02 §4 and §9
- **Upstream:** none
- **Status:** open

**Reproduction:** `public mixed $meta` or an untyped `public array $items` generates `any` / `any[]`; template bounds are dropped. Anything typed with them compiles.

**Manual workaround:** PHPStan max with 100 % type coverage forbids untyped properties; arrays declare their item type (`/** @var array<int, TaskData> */`).

### P-063

**Same-named Data classes produce duplicate types**

- **Type Boundary:** every Type Boundary
- **Source:** eval-02 §4 and §9
- **Upstream:** no upstream issue filed (typescript-transformer `FlatModuleWriter`)
- **Status:** open

**Reproduction:** `App\Data\Issues\SummaryData` and `App\Data\Projects\SummaryData`: the flat module silently emits two `export type SummaryData`; `tsc` then fails on the generated file.

**Manual workaround:** rename one, or `#[TypeScript(name: 'IssueSummaryData')]`.

### P-064

**Generated types go stale or missing**

- **Type Boundary:** every Type Boundary
- **Source:** eval-02 §7 and §9; eval-01 §6; overview §2
- **Upstream:** none
- **Status:** open

**Reproduction:** edit a Data class while `composer dev` runs: without a watcher, the editor and `tsc` check against the old types. typescript-transformer's `--watch` is slow and dies on a provider exception; Wayfinder's Vite plugin watches only routes and `Http`; generation fails in a fresh clone because the gitignored output directory doesn't exist.

**Manual workaround:** a Vite plugin (`vite-plugins/php-types.ts`) that regenerates on PHP changes under `app/`, plus `File::ensureDirectoryExists()` before generating; build, typecheck and CI regenerate first.

### P-065

**Generated types are never checked against real payloads**

- **Type Boundary:** every Type Boundary
- **Source:** overview §1 and §2; eval-02 §3; eval-01 §3
- **Upstream:** none
- **Status:** open

**Reproduction:** a generator that lies gives types `tsc` trusts. eval-02's Contract test found 7 mismatches no other check caught, among them [P-040](#p-040), [P-043](#p-043) and [P-071](#p-071); the Base Kit's hand-written types were wrong the same way ([P-012](#p-012), [P-036](#p-036)).

**Manual workaround:** the Contract recorder: every page, partial reload, flash and JSON response seen by any feature test is written as a `satisfies` file checked by `tsc` (`tests/Support/InertiaContracts.php`).

### P-066

**Shapes no test produced are never checked**

- **Type Boundary:** every Type Boundary
- **Source:** overview §2; type-safety "What checks what"
- **Upstream:** none
- **Status:** open

**Reproduction:** a nullable field only ever `null` in tests, a list only ever empty, a union variant never produced, or a page, deferred prop or endpoint no test hits: its Contracts pass while `tsc` never saw the other shape.

**Manual workaround:** Contract Coverage, `php artisan types:coverage --strict`, fails CI on each unverified shape; close it with a test that produces it (`tests/Feature/ShapeCoverageTest.php`).

### P-067

**Combinations are proven per shape, not per combination**

- **Type Boundary:** every Type Boundary
- **Source:** overview §5; type-safety "Remaining gaps"
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** "`completedAt` is set when `status` is `done`" is never checked: Contract Coverage proves each property's shapes independently.

**Manual workaround:** model the correlation as a discriminated union if the UI relies on it; each variant is then checked.

**Reasoning:** by design. A TypeScript object type is a set of independent properties, so proving each property's every shape covers the whole type; the only correlation a type expresses is a union, and each variant is checked on its own. A correlation outside the type isn't a typing claim, so no type can be wrong about it.

### P-068

**Type assertions override generated types**

- **Type Boundary:** every Type Boundary
- **Source:** overview §2; type-safety rule 14
- **Upstream:** none
- **Status:** open

**Reproduction:** `props.project as ProjectData`, `<T>x` or `user!.name` in app code compiles whatever the generated type says.

**Manual workaround:** the `type-safety/no-type-assertions` lint rule rejects `as`, `<T>x` and `!` (not `as const`) outside the boundary modules ([P-069](#p-069)).

### P-069

**Casts remain in three boundary modules**

- **Type Boundary:** every Type Boundary
- **Source:** overview §5; type-safety "Remaining gaps"
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `@/lib/requests`, `@/lib/page` and `components/typed-form.tsx` contain casts: Inertia types errors as `Record<string, string>` and props as its global type, and constrains forms with a type a generic can't satisfy; minting a `FieldName` is a cast by definition.

**Manual workaround:** each cast states what proves it (the recorded Contracts); the lint rule allows casts only in these modules.

**Reasoning:** Inertia's own types are looser than the generated ones, so bridging them needs casts somewhere. Confining them to three modules, each cast justified and backed by Contracts, keeps the rest of the app cast-free.

### P-070

**Lint rules are syntactic**

- **Type Boundary:** every Type Boundary
- **Source:** overview §5; type-safety "Remaining gaps"; spec "Accepted gaps"; ecosystem B.6
- **Upstream:** none (oxlint JS plugins get no type information)
- **Status:** accepted gap

**Reproduction:** `const r = router; r.post(url, data)` or a re-exported `useForm` escapes the request and cast rules. `router.visit(url)` with a server-provided URL string (the passkey redirect) is allowed.

**Manual workaround:** none; review.

**Reasoning:** oxlint's JS plugins have no type information, so rules match syntax. The narrowed JSX types (ADR-0004) carry the one check where escaping through a variable mattered most; the rest is left to review.

### P-072

**Data shapes are hand-written or registered one by one**

- **Type Boundary:** every Type Boundary
- **Source:** spec user stories 6, 10 and 17; overview §2
- **Upstream:** by design: laravel-typescript-transformer v3's [published provider stub](https://github.com/spatie/laravel-typescript-transformer/blob/main/stubs/TypeScriptTransformerServiceProvider.stub) transforms only classes marked `#[TypeScript]`
- **Status:** closed

**Reproduction:** the Base Kit generates only routes, so a shape a laravel-data class sends is written by hand in TypeScript (`type Project = { name: string; openIssues: number }`); change `public int $openIssues` to `string` and React still compiles. With typescript-transformer's stock setup, each class needs `#[TypeScript]` to be generated.

**Manual workaround:** the Reference Implementation's `TypeScriptTransformerServiceProvider` transforms every Data class in `app/`, its output is gitignored, and `composer types` runs before typecheck and tests.

**Closed by:** `php artisan strictly:generate` ([`packages/laravel/src/Console/GenerateCommand.php`](../packages/laravel/src/Console/GenerateCommand.php)) generates every laravel-data class anywhere in `app/` into the gitignored `resources/js/generated/index.ts` (`@/generated`), with no registration, plus Wayfinder's routes. The installer gitignores the output and makes `build`, `build:ssr`, `types:check` and `ci:check` generate first. PHPStan rules `strictly.dataClassFinal` and `strictly.dataNamespace` keep Data classes final and alone in `App\Data`. Scenarios: `data-class-typed-passes`, `data-property-type-changed-fails-tsc`, `non-final-data-class-fails`, `non-data-class-in-data-namespace-fails`.

## Findings not registered

Findings from the sources that are not ways a type can be wrong at a Type Boundary of Base Kit + Overlay:

- **Wayfinder `next` findings** (eval-01 §2 scorecard, bugs B2–B18: dotted nested rule keys, dropped `Rule::enum()`, invalid TS for dynamic `in:`, stale analysis cache, empty-database models, dangling references under `skipLibCheck`, `JsonResource` wrapping, accessor and paginator types, absolute paths, Vite plugin lag, unpopulated named FormRequest types). The Overlay doesn't use Wayfinder `next` (ADR-0003); re-evaluate when it reaches a tagged v1. B1 is shared with stable Wayfinder and is [P-001](#p-001).
- **Rejected tools** (eval-03): modeltyper's soundness bugs, Ziggy, Hybridly, momentum-\*, rules→zod generators, Scramble. Not used.
- **typescript-transformer emits `import {}` rather than `import type`** (eval-02 §9): only breaks `verbatimModuleSyntax`, which neither the Base Kit nor the Overlay enables.
- **Contract recorder implementation notes** (eval-02 §3 and §9): `$response->json()` turns `{}` into `[]`; in Inertia v3 tests `session('errors')` is a plain array. Gotchas for building the recorder, not Problems.
- **`Inertia::render` calls `toArray()` eagerly** (eval-02 §7): partial reloads still compute every prop. Performance, not typing.
- **Base Kit PHPStan max errors and the strict-rules `staticMethod.dynamicCall` false positives** (eval-03 §9): Kit Conversion and configuration work; the one that reaches a Type Boundary is [P-060](#p-060).
- **Verbosity of Data and Page classes** (eval-02 §1): a cost of the chosen approach, not a wrong type.

[overview]: research/reference-overview.md
[eval-01]: research/evaluations/01-wayfinder-next.md
[eval-02]: research/evaluations/02-laravel-data-ts.md
[eval-03]: research/evaluations/03-other-tools.md
[ecosystem]: research/ecosystem.md
[type-safety]: ../reference/template/docs/type-safety.md
[spec]: https://github.com/mrsafalpiya/strictly-laravel/issues/1
