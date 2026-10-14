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
| [P-006](#p-006) | Query strings are untyped | routes | closed |
| [P-104](#p-104) | A query property without a default fails on a URL that leaves its key out | routes | closed |
| [P-105](#p-105) | A query value the route function leaves out of the URL reads as a different default | routes | closed |
| [P-106](#p-106) | A route whose action takes no query class accepts any query string | routes | open |
| [P-007](#p-007) | Hard-coded URLs bypass the route types | routes | closed |
| [P-008](#p-008) | Route keys are checked for existence, not identity | routes | accepted gap |
| [P-009](#p-009) | Page props are hand-written per page | page props | closed |
| [P-010](#p-010) | Nothing ties a page name to a page component file | page props | closed |
| [P-011](#p-011) | Pages rendered by vendor view closures have no props source | page props | closed |
| [P-071](#p-071) | laravel-data's `#[Hidden]` is ignored by the type generator | page props | closed |
| [P-012](#p-012) | `auth.user` is typed non-null but is `null` for guests | shared props | closed |
| [P-013](#p-013) | Shared props type has an index signature that hides typos | shared props | accepted gap |
| [P-088](#p-088) | A prop shared beside the shared props type has no type | shared props | closed |
| [P-089](#p-089) | A page rendered without the Inertia middleware lacks the shared props its type promises | shared props | accepted gap |
| [P-014](#p-014) | Inertia's request APIs accept any payload | form payloads | closed |
| [P-096](#p-096) | Inertia's `<Form>` takes any payload and error keys | form payloads | open |
| [P-097](#p-097) | A closure route's input isn't on its route type | form payloads | open |
| [P-015](#p-015) | Form control names are plain strings | form payloads | open |
| [P-016](#p-016) | `jsxImportSource` also changes the JSX runtime import | form payloads | open |
| [P-017](#p-017) | laravel-data `rules()` replaces the inferred rules | form payloads | closed |
| [P-099](#p-099) | A nested Data class's `rules()` replace its inferred rules | form payloads | open |
| [P-018](#p-018) | Inferred `required` rejects empty arrays | form payloads | closed |
| [P-019](#p-019) | `int` is validated as `numeric` | form payloads | closed |
| [P-020](#p-020) | PHPDoc literal unions are not validated | form payloads | closed |
| [P-098](#p-098) | A boolean literal input type is validated only as a boolean | form payloads | accepted gap |
| [P-021](#p-021) | Typed iterables are not cast by default | form payloads | closed |
| [P-022](#p-022) | An invalid item in a typed list is a 500 | form payloads | closed |
| [P-023](#p-023) | Calendar dates and datetimes are indistinguishable | form payloads | closed |
| [P-075](#p-075) | A datetime input that isn't an ISO-8601 timestamp is a 500 | form payloads | open |
| [P-024](#p-024) | Actions can read request keys their input type doesn't declare | form payloads | open |
| [P-025](#p-025) | Vendor controllers' payloads have no Source of Truth | form payloads | open |
| [P-026](#p-026) | Input reads are seen per key | form payloads | accepted gap |
| [P-027](#p-027) | `FieldName` proves a name came from some `field()`, not this form's | form payloads | accepted gap |
| [P-028](#p-028) | Client-side error keys are not tied to the input type | validation errors | closed |
| [P-029](#p-029) | The server can return error keys that aren't fields | validation errors | closed |
| [P-030](#p-030) | Validation runs before authorization | validation errors | closed |
| [P-031](#p-031) | Enum values are hand-mirrored in TypeScript | enums | closed |
| [P-032](#p-032) | Literal and enum-case PHPDoc types become `unknown` | enums | closed |
| [P-033](#p-033) | Enum-keyed maps claim every key is present | enums | closed |
| [P-034](#p-034) | Iterating an enum's values needs a cast | enums | closed |
| [P-035](#p-035) | A new enum case can go unhandled in label maps | enums | closed |
| [P-074](#p-074) | A label map typed loosely isn't tied to the enum | enums | accepted gap |
| [P-036](#p-036) | The Base Kit's hand-written `User` type has drifted | models | closed |
| [P-037](#p-037) | Larastan ignores `casts()` without config | models | closed |
| [P-038](#p-038) | Larastan types every `BelongsTo` as nullable | models | open |
| [P-039](#p-039) | Lazy loading and unloaded attributes silently change a prop's shape | models | closed |
| [P-040](#p-040) | Shipped paginator types are wrong | pagination and deferred props | closed |
| [P-041](#p-041) | A generic `replaceType` target crashes generation | pagination and deferred props | closed |
| [P-042](#p-042) | `Inertia::scroll()` sends a flat paginator | pagination and deferred props | open |
| [P-043](#p-043) | Raw `Inertia::defer()` props are typed as required keys | pagination and deferred props | closed |
| [P-044](#p-044) | `Lazy::closure()` and default-included props are typed optional | pagination and deferred props | open |
| [P-045](#p-045) | Prop names in reloads and Inertia components are plain strings | pagination and deferred props | closed |
| [P-046](#p-046) | A nested partial reload returns only the subtree | pagination and deferred props | closed |
| [P-092](#p-092) | A partial reload's shared props aren't checked | pagination and deferred props | accepted gap |
| [P-047](#p-047) | Flash data is untyped and read through a cast | flash messages | closed |
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
| [P-061](#p-061) | Unmapped PHP classes become `undefined` | every Type Boundary | closed |
| [P-062](#p-062) | `mixed` becomes `any` | every Type Boundary | open |
| [P-063](#p-063) | Same-named Data classes produce duplicate types | every Type Boundary | open |
| [P-064](#p-064) | Generated types go stale or missing | every Type Boundary | closed |
| [P-065](#p-065) | Generated types are never checked against real payloads | every Type Boundary | closed |
| [P-066](#p-066) | Shapes no test produced are never checked | every Type Boundary | closed |
| [P-084](#p-084) | Contract Coverage can't see shapes laravel-data doesn't describe | every Type Boundary | open |
| [P-067](#p-067) | Combinations are proven per shape, not per combination | every Type Boundary | accepted gap |
| [P-068](#p-068) | Type assertions override generated types | every Type Boundary | open |
| [P-069](#p-069) | Casts remain in three boundary modules | every Type Boundary | accepted gap |
| [P-070](#p-070) | Lint rules are syntactic | every Type Boundary | accepted gap |
| [P-072](#p-072) | Data shapes are hand-written or registered one by one | every Type Boundary | closed |
| [P-073](#p-073) | A Data class that parses but can't be loaded silently drops its type | every Type Boundary | open |
| [P-076](#p-076) | An empty map is sent as `[]`, which its type doesn't allow | every Type Boundary | closed |
| [P-080](#p-080) | An existing app silently lacks a hook a newer release adds, or one it lost | every Type Boundary | closed |
| [P-081](#p-081) | A half-updated app runs one release's Composer package with another's npm package | every Type Boundary | closed |
| [P-082](#p-082) | A release's app-side change the installer can't make goes unnoticed | every Type Boundary | closed |

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
- **Status:** closed

**Reproduction:** `index(workspace, { query: { statuse: ['todo'] } })` compiles, and the server reads `$request->query('status')` with nothing tying the two together. An invalid value from an old bookmark is a 422 or a 500.

**Manual workaround:** a `QueryData` class type-hinted on the GET action (`index(IssueFiltersData $filters)`), parsed leniently (invalid items fall back to defaults); a Wayfinder template override types the route function's `query` option as `QueryOptions<IssueFiltersData>` (`RouteTypes::queryOptions`). The same object is sent back as a prop so the filter UI is typed by it.

**Closed by:** a GET action's query string is a final Data class extending [`QueryData`](../packages/laravel/src/Data/QueryData.php) (a query class), type-hinted on the action. The Wayfinder `method` template override ([`WayfinderTemplates`](../packages/laravel/src/Routes/WayfinderTemplates.php), which looks the class up through [`RouteQuery`](../packages/laravel/src/Routes/RouteQuery.php)) types every route function of that action, `.url()` and `.form()` too, as taking `options?: QueryOptions<ProjectFiltersData>` ([`@mrsafalpiya/strictly-laravel/routes`](../packages/npm/routes/index.d.ts)) instead of `RouteQueryOptions`: `query` and `mergeQuery` are `Partial<ProjectFiltersData>`, so a misspelled key or a value of the wrong type fails `tsc`. `QueryData` parses the query string leniently: an invalid list item is dropped and any other key that fails its inferred or custom rules falls back to its default, so an old bookmark never gets a 422 or a 500. It is an ordinary Data class otherwise, so a Page class sends it back as a prop and the filter UI builds the next query from the same type. The PHPStan rule `strictly.inputData` accepts it on a controller action, and `strictly.queryDefault` keeps its defaults honest ([P-104](#p-104), [P-105](#p-105)). Routes whose action takes no query class still take any query: [P-106](#p-106). Scenarios: `query-filters-typed-passes`, `invalid-query-value-falls-back-passes`, `query-key-misspelled-fails-tsc`, `query-value-wrong-type-fails-tsc`, `stale-bookmark-expects-422-fails-test`.

### P-104

**A query property without a default fails on a URL that leaves its key out**

- **Type Boundary:** routes
- **Source:** found while closing [P-006](#p-006)
- **Upstream:** none
- **Status:** closed

**Reproduction:** a query class with `public ProjectSort $sort` and no default. `QueryOptions` makes every key optional, so `index()` and `index({ query: { statuses: ['active'] } })` compile, and both URLs leave `sort` out: laravel-data can't build the class, and the request is a 500. A key that fails validation is left out the same way, so it has nothing to fall back to either.

**Manual workaround:** give every query property a default (the Reference Implementation's convention, unchecked).

**Closed by:** the PHPStan rule `strictly.queryDefault` ([`QueryDefaultRule`](../packages/laravel/src/PHPStan/QueryDefaultRule.php)) rejects a property of a `QueryData` subclass, promoted or declared, without a default. A nullable property without one is `null` and an Optional one is Optional, as laravel-data fills them, so those pass. Scenarios: `query-filters-typed-passes`, `query-property-without-default-fails-phpstan`.

### P-105

**A query value the route function leaves out of the URL reads as a different default**

- **Type Boundary:** routes
- **Source:** found while closing [P-006](#p-006)
- **Upstream:** by design: Wayfinder's `queryParams()` skips a `null` value and writes nothing for an empty list
- **Status:** closed

**Reproduction:** a query class with `public ?string $search = 'launch'` and `/** @var list<ProjectStatus> */ public array $statuses = [ProjectStatus::Active]`. `index({ query: { search: null, statuses: [] } })` compiles, but the URL is `/projects`, so the server reads `search: 'launch'` and `statuses: [Active]`: not what the client sent, and nothing fails.

**Manual workaround:** none.

**Closed by:** the PHPStan rule `strictly.queryDefault` ([`QueryDefaultRule`](../packages/laravel/src/PHPStan/QueryDefaultRule.php)) requires a nullable query property to default to `null` and a list to `[]`, the values an absent key stands for. Scenarios: `query-filters-typed-passes`, `query-default-not-sendable-fails-phpstan`.

### P-106

**A route whose action takes no query class accepts any query string**

- **Type Boundary:** routes
- **Source:** found while closing [P-006](#p-006)
- **Upstream:** none (Wayfinder's `query` option is `RouteQueryOptions` on every route)
- **Status:** open

**Reproduction:** `dashboard({ query: { tab: 'stats' } })` or `edit({ query: { anything: 1 } })` compiles for a route whose action declares no query class, and the action can still read the key (`$request->query('tab')`, [P-024](#p-024)). Vendor GETs that do read a query string (Fortify's password reset reads `email`) have no class to type it by yet ([P-025](#p-025)). A closure route's query class is parsed leniently but doesn't type its route function, since Wayfinder gives the templates only a controller and method (as for inputs, [P-097](#p-097)).

**Manual workaround:** take a query class on every action that reads its query string.

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

**Closed by:** Page classes: a page's props are the constructor of a final class extending `StrictlyLaravel\Inertia\Page` ([`packages/laravel/src/Inertia/Page.php`](../packages/laravel/src/Inertia/Page.php)), which a controller returns, and `strictly:generate` turns each one into `PageProps<'component'>` in `@/generated` ([`InertiaPagesProvider`](../packages/laravel/src/TypeScript/InertiaPagesProvider.php), with types named after the page component by [`PageTransformer`](../packages/laravel/src/TypeScript/PageTransformer.php)). The PHPStan rule `strictly.inertiaRender` ([`InertiaRenderRule`](../packages/laravel/src/PHPStan/InertiaRenderRule.php)) rejects `Inertia::render()`, `inertia('…')`, `ResponseFactory::render()` and `Route::inertia()`, so no page is rendered from an untyped array. Kit Conversion turns the Base Kit's pages, controllers and routes into Page classes and removes the hand-written props types from its page components and from the components the security settings page passes its props to (`manage-passkeys`, `manage-two-factor`, `passkey-item`, whose hand-written `Passkey` type gives way to the generated `PasskeyData`). Scenarios: `page-class-props-typed-passes`, `page-prop-renamed-fails-tsc`, `inertia-render-with-array-fails-phpstan`.

### P-010

**Nothing ties a page name to a page component file**

- **Type Boundary:** page props
- **Source:** eval-01 §4; eval-02 §8; overview §2
- **Upstream:** none
- **Status:** closed

**Reproduction:** `Inertia::render('project/show', …)` when the file is `pages/projects/show.tsx` compiles; the Base Kit only catches it at test time (`testing.ensure_pages_exist`), and nothing checks that the component's props match. A page file with no PHP counterpart is not reported.

**Manual workaround:** the page component name derives from the `Page` class; the generated `__PageComponentCheck` (`CheckPage<'projects/show', typeof import('@/pages/projects/show').default>`) fails `tsc` when the file is missing or asks for a prop the class doesn't send. An arch test fails a page file without a class. `php artisan make:page` creates both.

**Closed by:** the page component's name derives from the Page class's (`App\Pages\Projects\ShowPage` is `projects/show`), and `@/generated` carries two checks ([`InertiaPagesProvider`](../packages/laravel/src/TypeScript/InertiaPagesProvider.php)): `__PageComponentCheck` fails `tsc` when a Page class's component file is missing or declares a prop the class doesn't send (even an optional one, which would always be missing), and `__PageFileCheck` fails it when a file under `resources/js/pages` has no Page class. `php artisan make:page projects/show` ([`MakePageCommand`](../packages/laravel/src/Console/MakePageCommand.php)) creates both, already in sync (harness test `make:page creates a Page class and its page component, already in sync`). The file check lists the page files found when the types were last generated, so the Vite plugin regenerates them when a file is created or deleted under `resources/js/pages` while the dev server runs (`ci:check`, `types:check` and `build` always generate first). Scenarios: `page-component-accepting-page-props-passes`, `page-component-missing-fails-tsc`, `page-component-unsent-prop-fails-tsc`, `page-component-optional-unsent-prop-fails-tsc`, `page-file-without-class-fails-tsc`; harness test "while the dev server runs, tsc sees a saved Data class and a new or deleted page file, and a half-written Data class keeps the last good types".

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
- **Status:** closed

**Reproduction:** a Data property marked with laravel-data's `#[Hidden]` is never sent, but stays a required key in the generated type; `tsc` trusts a value that is always missing.

**Manual workaround:** mark the property with both attributes, `#[DataHidden, TsHidden]` (laravel-data's and typescript-transformer's `Hidden`).

**Closed by:** [`HiddenDataProperties`](../packages/laravel/src/Workarounds/TypeScriptTransformer/HiddenDataProperties.php) leaves every property marked with laravel-data's `#[Hidden]` out of the generated type; typescript-transformer's own attribute is no longer needed. Scenarios: `hidden-data-property-left-out-passes`, `hidden-data-property-read-fails-tsc`.

## Shared props

### P-012

**`auth.user` is typed non-null but is `null` for guests**

- **Type Boundary:** shared props
- **Source:** overview §1; eval-02 §1; eval-03 §5; ecosystem A.3
- **Upstream:** none
- **Status:** closed

**Reproduction:** the Base Kit's `types/global.d.ts` declares `sharedPageProps: { auth: Auth; … }` with `Auth = { user: User }`; `HandleInertiaRequests::share()` sends `$request->user()`, which is `null` for guests. `usePage().props.auth.user.name` compiles on a guest page.

**Manual workaround:** `App\Data\SharedProps` built in `share()`, generated into `InertiaConfig['sharedPageProps']`, with `auth.user: UserData | null`; `useUser()` for authenticated pages.

**Closed by:** the shared props are one Data class, the app's only subclass of [`Shared`](../packages/laravel/src/Inertia/Shared.php), built in the Inertia middleware's share step; `strictly:generate` writes its type into Inertia's global config typing, `InertiaConfig['sharedPageProps']` ([`InertiaConfigProvider`](../packages/laravel/src/TypeScript/InertiaConfigProvider.php)), so `usePage().props` is typed on every page with no hand-written global type. Kit Conversion converts the Base Kit's `HandleInertiaRequests` to build `App\Data\SharedProps` (with `AuthData`, whose `user` is `?UserData`, and `UserData`, [P-036](#p-036)), removes its hand-written `sharedPageProps` from `types/global.d.ts`, and gives authenticated pages `useUser()` (`resources/js/hooks/use-user.ts`, used by the profile settings page), which returns a non-null `UserData` and throws on a page guests can see. Every page a feature test renders records the shared props it received as a Contract ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php), `export const shared = {…} satisfies Contract<SharedPageProps>`), so a guest page's `auth.user: null` is checked against the type (the Base Kit's own welcome page test records one). Scenarios: `guest-page-reads-auth-user-fails-tsc`, `use-user-on-authenticated-page-passes`.

### P-013

**Shared props type has an index signature that hides typos**

- **Type Boundary:** shared props
- **Source:** ecosystem A.3; eval-03 §5
- **Upstream:** by design: Inertia types every page's props as `PageProps & SharedPageProps & …`, and its own `PageProps` is `{ [key: string]: unknown }` ([`packages/core/src/types.ts`](https://github.com/inertiajs/inertia/blob/master/packages/core/src/types.ts))
- **Status:** accepted gap

**Reproduction:** the Base Kit's `sharedPageProps` ends with `[key: string]: unknown`, so `usePage().props.sidebarOpne` compiles. Removing it changes nothing: Inertia's own `PageProps`, which `usePage().props` always includes, has the same index signature, so a misspelt key still reads as `unknown`.

**Manual workaround:** the hand-written declaration is deleted and replaced by the generated `SharedProps`, which has no index signature (Kit Conversion does this, [P-012](#p-012)).

**Reasoning:** the index signature is Inertia's, and an app can't remove it: declaration merging only adds to `PageProps`, and the Base Kit's toolchain stays as it is (ADR-0004). A misspelt key reads as `unknown`, which `tsc` rejects wherever a typed value is needed (rendered, assigned, passed as a prop, or read further); only a truthiness test or a comparison compiles. Turning on `noPropertyAccessFromIndexSignature` would reject `props.sidebarOpne`, but also every dot access on a `Record`, starting with the Base Kit's `errors.name`. Scenario guarding the reasoning: `shared-prop-typo-used-as-value-fails-tsc`.

### P-088

**A prop shared beside the shared props type has no type**

- **Type Boundary:** shared props
- **Source:** found while closing [P-012](#p-012)
- **Upstream:** none
- **Status:** closed

**Reproduction:** with the shared props generated from a Data class, the share step returns `'features' => ['boards' => true]` next to the Data class's props, or a controller calls `Inertia::share('features', …)`. Every page receives the key, no type declares it, and it reads as `unknown` ([P-013](#p-013)), so the app casts it.

**Manual workaround:** add the value as a typed property of the shared props Data class.

**Closed by:** every page a feature test renders records the props the share step sent, except Inertia's own `errors`, as a Contract checked against `SharedPageProps` ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php)), so a key the Data class doesn't declare fails `tsc` with `TS2353: Object literal may only specify known properties`. A prop the page's Page class declares is the page's own and is left out (the Contract is then checked against `Omit<SharedPageProps, 'key'>`). Scenarios: `shared-prop-beside-data-class-fails-contract`, `shared-prop-in-data-class-passes-contract`.

### P-089

**A page rendered without the Inertia middleware lacks the shared props its type promises**

- **Type Boundary:** shared props
- **Source:** found while closing [P-088](#p-088)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** a route outside the `web` middleware group renders a Page class. The Inertia middleware doesn't run, so the page receives no shared props, yet `usePage().props.auth` is typed as present.

**Manual workaround:** render Inertia pages only from routes in the `web` group.

**Reasoning:** Inertia needs its middleware on every page route (asset versioning, the 303 after a `PUT`/`PATCH`/`DELETE`, flash and validation errors), and the Base Kit registers it on the `web` group, where all its routes live. The Contract recorder can't tell such a page from one whose app shares nothing, so it records no shared props Contract for a page that received no shared props at all.

## Form payloads

### P-014

**Inertia's request APIs accept any payload**

- **Type Boundary:** form payloads
- **Source:** overview §2; ecosystem A.3 and B.2; type-safety rules 11 and 13
- **Upstream:** none
- **Status:** closed

**Reproduction:** the Base Kit's `<Form {...ProfileController.update.form()}>` has no generic, so its payload and `errors` are untied to the request's rules. `useForm<T>()` takes whatever `T` is named; `router.post(url, data)` and `<Link data>` accept any object.

**Manual workaround:** input Data classes extending `InputData`, type-hinted on the action; Wayfinder's `.form()` is branded with the action's input class (template override, `RouteTypes::brands`), so `useRouteForm(route, defaults)`, `<TypedForm>`, `submit(route, data)` and `visit(route)` (`@/lib/requests`) take payload, error keys and target from the route. The `type-safety/typed-requests` lint rule rejects `useForm`, `useHttp`, `router.get/post/put/patch/delete`, `<Link data>` and untyped `<Form>`.

**Closed by:** an action's input is a final Data class extending [`InputData`](../packages/laravel/src/Data/InputData.php), type-hinted on the action. The Wayfinder `method` template is overridden ([`WayfinderTemplates`](../packages/laravel/src/Routes/WayfinderTemplates.php), which renders Wayfinder's own template and brands its return types rather than copying it), so every route function of that action, `.form()` too, returns `RouteDefinition<…> & WithInput<StoreProjectData>` ([`@mrsafalpiya/strictly-laravel/routes`](../packages/npm/routes/index.d.ts)). `useRouteForm(route, defaults)`, `submit(route, data, options)` and `visit(route, options)` ([`@mrsafalpiya/strictly-laravel/react`](../packages/npm/react/index.d.ts)) take the payload from that brand: a wrong or missing field fails `tsc`, `submit()` refuses a route whose action takes no input and `visit()` one that does. The oxlint rule `strictly/typed-requests` rejects `useForm()`, `router.get/post/put/patch/delete()`, `router.visit()` with `data` or `method`, and `<Link data>` imported from Inertia; the PHPStan rule `strictly.inputData` ([`InputDataRule`](../packages/laravel/src/PHPStan/InputDataRule.php)) rejects a controller action taking a Data class that isn't an InputData. Kit Conversion sends the Base Kit's passkey deletion through `visit()`. Inertia's `<Form>` is still untyped: [P-096](#p-096). Scenarios: `route-typed-requests-pass`, `route-form-wrong-field-fails-tsc`, `submit-wrong-field-fails-tsc`, `visit-route-that-takes-input-fails-tsc`, `inertia-use-form-fails-lint`.

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
- **Status:** closed

**Reproduction:** a Data class with `public string $slug` and `rules()` returning `['slug' => ['unique:projects']]`: the inferred `required|string` for `slug` is dropped, so a missing or non-string slug passes validation while the TypeScript type says `slug: string`.

**Manual workaround:** the `InputData` base class carries `#[MergeValidationRules]`.

**Closed by:** [`InputData`](../packages/laravel/src/Data/InputData.php) carries `#[MergeValidationRules]`, so an input's `rules()` are merged with the rules inferred from its types, and the PHPStan rule `strictly.inputData` ([`InputDataRule`](../packages/laravel/src/PHPStan/InputDataRule.php)) rejects a controller action that takes a Data class not extending it. A nested Data class inside an input still has its `rules()` replace its inferred ones: [P-099](#p-099). Scenarios: `custom-input-rules-merged-passes`, `plain-data-action-input-fails-phpstan`.

### P-099

**A nested Data class's `rules()` replace its inferred rules**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-017](#p-017)
- **Upstream:** by design; laravel-data reads `#[MergeValidationRules]` from each Data class. No upstream issue filed.
- **Status:** open

**Reproduction:** an input with `public TaskData $task` (or `list<TaskData>`), where the plain Data class `TaskData` has `public string $title` and `rules()` returning `['title' => ['max:50']]`: the inferred `required|string` for `task.title` is dropped. Only the action's own parameter must extend InputData (`strictly.inputData`).

**Manual workaround:** make every Data class nested in an input that has `rules()` extend InputData too.

### P-018

**Inferred `required` rejects empty arrays**

- **Type Boundary:** form payloads
- **Source:** overview §4; eval-02 §1, §5 and §9; type-safety rule 11
- **Upstream:** discussed and declined in the comments of [spatie/laravel-data#681](https://github.com/spatie/laravel-data/issues/681) (Laravel's `required` treats `[]` as missing)
- **Status:** closed

**Reproduction:** `public array $tags` (non-nullable) is inferred `required|array`; the TypeScript type `string[]` allows `[]`, which the server rejects with a 422.

**Manual workaround:** `StrictTypesRuleInferrer` replaces `required` with `present` for arrays, lists and Data collections; `#[Min(1)]` where a list must not be empty.

**Closed by:** [`PresentArrayRuleInferrer`](../packages/laravel/src/Workarounds/LaravelData/PresentArrayRuleInferrer.php) replaces the inferred `required` of a non-null array, list or Data collection with `present`: `[]` is accepted, a missing key is not. Every laravel-data workaround is applied to the app's `data` config at boot, published or not ([`StrictInputConfig`](../packages/laravel/src/Workarounds/LaravelData/StrictInputConfig.php)). Scenarios: `empty-list-input-accepted-passes`, `missing-list-input-fails-test`.

### P-019

**`int` is validated as `numeric`**

- **Type Boundary:** form payloads
- **Source:** overview §4; eval-02 §1 and §5
- **Upstream:** [spatie/laravel-data#814](https://github.com/spatie/laravel-data/pull/814) (PR adding an `integer` option, declined; its comments note the docs claim `integer`)
- **Status:** closed

**Reproduction:** `public int $estimate` is inferred `numeric`; `1.5` passes validation and is silently truncated to `1`, while the TypeScript type is `number` either way.

**Manual workaround:** `StrictTypesRuleInferrer` replaces `numeric` with `integer` for `int` properties.

**Closed by:** [`IntegerRuleInferrer`](../packages/laravel/src/Workarounds/LaravelData/IntegerRuleInferrer.php) replaces the inferred `numeric` of an `int` property with `integer`, so `1.5` gets a 422 ("The estimate field must be an integer."). Scenarios: `integer-input-rejects-a-fraction-passes`, `fraction-for-integer-input-fails-test`.

### P-020

**PHPDoc literal unions are not validated**

- **Type Boundary:** form payloads
- **Source:** overview §2; type-safety rule 8; `reference/template/app/Support/Data/LiteralTypesRuleInferrer.php`
- **Upstream:** no upstream issue filed
- **Status:** closed

**Reproduction:** `/** @var 'monday'|'sunday' */ public string $weekStartsOn` generates `'monday' | 'sunday'` (once [P-032](#p-032) is worked around), but the server accepts any string.

**Manual workaround:** `LiteralTypesRuleInferrer` adds `in:monday,sunday` from the PHPDoc literal union.

**Closed by:** [`LiteralRuleInferrer`](../packages/laravel/src/Workarounds/LaravelData/LiteralRuleInferrer.php) adds `in:` from the PHPDoc literal union the TypeScript is generated from, read where typescript-transformer reads it ([`PropertyAnnotation`](../packages/laravel/src/TypeScript/PropertyAnnotation.php)): string, int and float literals, class constants and enum cases, optionally `|null`; a list of literals has every item validated. A `true`/`false` literal adds no rule: [P-098](#p-098). Scenarios: `literal-union-input-validated-passes`, `value-outside-literal-union-fails-test`.

### P-098

**A boolean literal input type is validated only as a boolean**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-020](#p-020)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `/** @param true $termsAccepted */ public bool $termsAccepted` on an input is generated as `termsAccepted: true`, but only `boolean` is inferred, so `false` passes validation.

**Manual workaround:** `#[Accepted]` (or `#[Declined]`) on the property.

**Reasoning:** Laravel has no rule that means exactly "this boolean": `accepted` also takes `"yes"` and `"on"`, `in:1` rejects `true` sent as JSON. A `true`-only input is the terms-checkbox pattern, which `#[Accepted]` states directly; anything else is a union `LiteralRuleInferrer` handles.

### P-021

**Typed iterables are not cast by default**

- **Type Boundary:** form payloads
- **Source:** overview §4; `reference/showcase/config/data.php`; `reference/showcase/tests/Feature/Collaboration/SavedViewTest.php`
- **Upstream:** by design in laravel-data 4 (the `cast_and_transform_iterables` feature is off by default and announced as default in the next major). No upstream issue filed.
- **Status:** closed

**Reproduction:** `/** @var list<IssueStatus> */ public array $statuses` holds raw strings (`['todo']`) after `from()`, while PHPStan and TypeScript believe it holds enums.

**Manual workaround:** `'features' => ['cast_and_transform_iterables' => true]` in `config/data.php`.

**Closed by:** [`StrictInputConfig`](../packages/laravel/src/Workarounds/LaravelData/StrictInputConfig.php) turns `data.features.cast_and_transform_iterables` on at boot, whether or not the app published config/data.php, so a `list<IssueStatus>` holds enum cases. Scenarios: `typed-list-items-validated-passes`, `list-items-read-as-raw-values-fails-test`.

### P-022

**An invalid item in a typed list is a 500**

- **Type Boundary:** form payloads
- **Source:** overview §2 and §4; `reference/template/app/Support/Data/ListItemsRule.php`
- **Upstream:** no upstream issue filed
- **Status:** closed

**Reproduction:** posting `statuses: ['bogus']` to an action taking `/** @var list<IssueStatus> */ public array $statuses` passes validation (no per-item rule is inferred) and fails while casting: a 500 instead of a 422.

**Manual workaround:** `StrictTypesRuleInferrer` adds `ListItemsRule` to lists of scalars and backed enums, validating every item.

**Closed by:** [`ListItemsRuleInferrer`](../packages/laravel/src/Workarounds/LaravelData/ListItemsRuleInferrer.php) adds [`ListItemsRule`](../packages/laravel/src/Workarounds/LaravelData/ListItemsRule.php) to a typed list of scalars or backed enums, so an invalid item gets a 422 ("The statuses.1 value is invalid.") instead of failing while casting. Scenarios: `typed-list-items-validated-passes`, `invalid-list-item-for-input-fails-test`.

### P-023

**Calendar dates and datetimes are indistinguishable**

- **Type Boundary:** form payloads (also page props)
- **Source:** eval-02 §4, §5 and §9; type-safety rule 5; eval-01 M5
- **Upstream:** no upstream issue filed
- **Status:** closed

**Reproduction:** every date is generated as `string`, so a due date and a timestamp look the same to React. `#[Date]` on a Carbon property validates `2026-05-01`, then the default cast throws `CannotCastDate`: a 500.

**Manual workaround:** a `#[DateOnly]` attribute with `DateOnlyCast`: `"2026-10-14"` both ways; other dates are ISO-8601 strings.

**Closed by:** the `#[DateOnly]` attribute ([`packages/laravel/src/Data/DateOnly.php`](../packages/laravel/src/Data/DateOnly.php)) on a `Carbon`, `CarbonImmutable` or `CarbonInterface` property of a Data class, which keeps the declared class. Its cast reads and sends `"2026-10-14"` and rejects anything else (a timestamp, an impossible date such as `2026-02-30`) with a validation error on the field instead of a 500; the property is generated as `DateOnly` (`` `${number}-${number}-${number}` ``), with an `isDateOnly()` guard in `@/generated` that turns an `<input type="date">` value into one without a cast ([`DateOnlyTypes`](../packages/laravel/src/TypeScript/DateOnlyTypes.php)). Every other date is an ISO-8601 `string`. A plain datetime input given anything but an ISO-8601 timestamp is still a 500: [P-075](#p-075). Scenarios: `date-only-round-trips-passes`, `timestamp-for-date-only-fails-tsc`.

### P-075

**A datetime input that isn't an ISO-8601 timestamp is a 500**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-023](#p-023)
- **Upstream:** no upstream issue filed (laravel-data infers no rule for a `DateTimeInterface` property, so its cast is the first to see the value)
- **Status:** open

**Reproduction:** an input Data class with `public CarbonImmutable $startsAt`; posting `startsAt: '2026-10-14'` or `'tomorrow'` passes validation, then laravel-data's `DateTimeInterfaceCast` throws `CannotCastDate` ("Could not cast date `2026-10-14` into a `Carbon\CarbonImmutable` using formats: Y-m-d\TH:i:sP"): a 500 instead of a 422, while the TypeScript type `string` accepts the value.

**Manual workaround:** `#[DateFormat(DATE_ATOM)]` on every datetime input property, or `#[DateOnly]` for a calendar date.

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

### P-096

**Inertia's `<Form>` takes any payload and error keys**

- **Type Boundary:** form payloads
- **Source:** split from [P-014](#p-014) and [P-028](#p-028) while closing them
- **Upstream:** none
- **Status:** open

**Reproduction:** the Base Kit's `<Form {...ProfileController.update.form()}>` has no type argument, so the names of its controls and the `errors` its render prop gives (`string` per any key) are untied to the action's rules: `errors.nmae` compiles. The route-typed helpers (`useRouteForm`, `submit`, `visit`) and the `strictly/typed-requests` lint rule don't cover the component.

**Manual workaround:** the Reference Implementation's headless `<TypedForm {...store.form()}>` with a `field()` render prop, and its lint rule rejecting an untyped `<Form>`.

### P-097

**A closure route's input isn't on its route type**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-014](#p-014)
- **Upstream:** none (Wayfinder gives its templates the controller and method, not the route's closure)
- **Status:** open

**Reproduction:** `Route::post('projects', fn (StoreProjectData $data) => …)->name('projects.store')`: the generated `@/routes/projects` `store()` has no `WithInput` brand, so `useRouteForm(store(), …)` is refused as taking no input and `visit(store())` compiles, sending no payload. The PHPStan rule `strictly.inputData` checks controller actions only, so a plain Data class in such a closure isn't rejected either. The validation-error Contracts and the form-endpoint coverage do see the closure.

**Manual workaround:** take inputs in controller actions only.

## Validation errors

### P-028

**Client-side error keys are not tied to the input type**

- **Type Boundary:** validation errors
- **Source:** ecosystem A.3 and C; eval-02 §5
- **Upstream:** none
- **Status:** closed

**Reproduction:** the Base Kit reads `errors.name` from an untyped `<Form>` render prop (`string` per any key), so `errors.nmae` and `errors['tasks.0.titel']` compile.

**Manual workaround:** errors keyed by the input type's fields, including nested and array keys (`errors['settings.notifications.onAssign']`, `tasks.0.title`), through `useRouteForm`/`<TypedForm>`/`submit()` ([P-014](#p-014)).

**Closed by:** `useRouteForm()`'s `errors` and the `onError` of `useRouteForm().submit()` and `submit()` are `ErrorsOf<Input>`, keyed by every field path of the route's input, nested and list ones included (`settings.notifyOnAssign`, `tasks.0.title`; [`InputKey`](../packages/npm/routes/index.d.ts)), so a misspelled error key fails `tsc`. The errors of Inertia's `<Form>` are still untyped: [P-096](#p-096). Scenarios: `route-typed-requests-pass`, `route-form-wrong-error-key-fails-tsc`.

### P-029

**The server can return error keys that aren't fields**

- **Type Boundary:** validation errors
- **Source:** overview §2 and §5; type-safety rule 13
- **Upstream:** none
- **Status:** closed

**Reproduction:** `throw ValidationException::withMessages(['project' => 'still has issues'])` from an action whose input has no `project` field: the client's typed `errors` never shows it.

**Manual workaround:** the validation Contract `errors satisfies InputKey<StoreIssueData>[]` fails on any key that isn't a field; refusals that aren't about a field are error toasts (`Flash::error('…'); return back();`).

**Closed by:** every request a feature test sends to a form endpoint (a route whose action takes an InputData) is recorded, and the validation errors it is refused with, flashed before a redirect or in a 422 JSON response, become a Contract, `export const errors = {…} satisfies ErrorsOf<StoreProjectData>`, which fails `tsc` on a key that isn't a field of the input ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php)). A refusal that isn't about a field is an error toast through the flash Data class (`FlashData::toast(ToastType::Error, …)`, [P-047](#p-047)). Contract Coverage fails on a form endpoint no feature test submits to ([`ContractCoverage`](../packages/laravel/src/Coverage/ContractCoverage.php), scenario `form-endpoint-no-test-submits-fails-coverage`). Scenarios: `validation-errors-are-input-fields-pass-contract`, `error-key-not-an-input-field-fails-contract`.

### P-030

**Validation runs before authorization**

- **Type Boundary:** validation errors
- **Source:** overview §2 and §4; eval-02 §5; type-safety rule 11
- **Upstream:** no upstream issue filed (laravel-data's `authorize()` hook is opt-in)
- **Status:** closed

**Reproduction:** an action type-hinting an input Data class and calling `Gate::authorize()` in its body: a user without the ability submits invalid data and gets a 422 listing the fields instead of a 403.

**Manual workaround:** `public static function authorize(): bool` on the input class, which laravel-data runs before validation (`AuthorizedDataPipe`).

## Enums

**Closed by:** laravel-data runs an input's `authorize()` before validation; the PHPStan rule `strictly.authorizeInInput` ([`AuthorizeInInputRule`](../packages/laravel/src/PHPStan/AuthorizeInInputRule.php)) rejects a controller action that takes an InputData and authorizes in its body instead (`Gate::authorize()`, `allowIf()`, `denyIf()`, `$this->authorize()`, `abort(403)`, `abort_if(…, 403)`, `abort_unless(…, 403)`). Matching is syntactic ([P-070](#p-070)). Scenarios: `unauthorized-input-gets-403-passes`, `authorize-in-action-body-fails-phpstan`.

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
- **Status:** closed

**Reproduction:** `/** @var ActivityType::Commented */ public ActivityType $type` and `/** @var 'monday'|'sunday' */ public string $weekStartsOn` both generate `unknown`, so discriminated unions and exhaustive `switch` statements are impossible.

**Manual workaround:** `LiteralTypesTranspiler` turns PHPDoc string, int, float, bool and enum-case constants into TypeScript literals (`type: 'commented'`).

**Closed by:** `strictly:generate` turns PHPDoc string, int, float, `true`/`false`, class-constant and enum-case types into TypeScript literals at any depth of a type, an enum case as its backing value ([`LiteralTypes`](../packages/laravel/src/Workarounds/TypeScriptTransformer/LiteralTypes.php), applied through the Overlay's Data class transformer). Validating a literal union on input is still [P-020](#p-020). Scenarios: `literal-types-discriminate-union-passes`, `literal-type-outside-union-fails-tsc`.

### P-033

**Enum-keyed maps claim every key is present**

- **Type Boundary:** enums
- **Source:** eval-02 §3 and §9; overview §2; type-safety rule 7
- **Upstream:** no upstream issue filed (typescript-transformer)
- **Status:** closed

**Reproduction:** `/** @var array<ProjectStatus, int> */` generates `Record<ProjectStatus, number>`, claiming every status is a key, while the server sends only the statuses it counted. An empty PHP map also serialises as `[]`, not `{}`.

**Manual workaround:** `/** @var array<value-of<Status>, int> */` generates `Partial<Record<Status, number>>` (`LiteralTypesTranspiler`); prefer a list of objects with a `status` field.

**Closed by:** `array<value-of<Status>, V>` is generated as `Partial<Record<Status, V>>` ([`EnumKeyedMaps`](../packages/laravel/src/Workarounds/TypeScriptTransformer/EnumKeyedMaps.php)), so an absent key reads as `V | undefined`. An empty map is still sent as `[]`, which reads safely through the partial record; its recorded Contract accepts the `[]` ([P-076](#p-076)). Scenarios: `enum-keyed-map-may-miss-keys-passes`, `enum-keyed-map-read-as-present-fails-tsc`.

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
- **Status:** closed

**Reproduction:** add `case Blocked = 'blocked'` to `IssueStatus`; a label map typed `Record<string, string>` or built with a cast still compiles and shows nothing for the new case.

**Manual workaround:** labels, colours and icons live in `resources/js/lib/domain.ts` as `satisfies Record<IssueStatus, …>`, so `tsc` fails until the case is handled; unions end with `x satisfies never`.

**Closed by:** the enum unions generated from PHP ([P-031](#p-031)): a label map written `satisfies Record<IssueStatus, …>` fails `tsc` until it handles a case added in PHP. A map typed loosely (`Record<string, string>`) isn't tied to the enum: [P-074](#p-074). Scenarios: `enum-labels-cover-every-case-passes`, `new-enum-case-without-label-fails-tsc`.

### P-074

**A label map typed loosely isn't tied to the enum**

- **Type Boundary:** enums
- **Source:** found while closing [P-035](#p-035)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `const labels: Record<string, string> = { todo: 'To do', done: 'Done' }` keeps compiling after `case Blocked = 'blocked'` is added to `IssueStatus`, and shows nothing for the new case.

**Manual workaround:** write label, colour and icon maps `satisfies Record<IssueStatus, …>` and end switches over enum values with `x satisfies never`.

**Reasoning:** a map typed with `string` keys is a legitimate TypeScript type that says nothing about the enum, so `tsc` has nothing to check, and a lint rule can't see which enum a map is meant to cover (oxlint's JS plugins are syntactic, [P-070](#p-070)). The typed way costs nothing and is caught by `tsc`; casts are [P-068](#p-068).

## Models

### P-036

**The Base Kit's hand-written `User` type has drifted**

- **Type Boundary:** models
- **Source:** overview §1; ecosystem A.3; eval-02 §1; spec "Problem Statement"
- **Upstream:** none
- **Status:** closed

**Reproduction:** `resources/js/types/auth.ts` types `avatar` and `two_factor_enabled`, which nothing on the server sends, omits `two_factor_confirmed_at`, which is sent, and ends with `[key: string]: unknown`. The full Eloquent model is serialised as `auth.user`, so any column not `#[Hidden]` reaches the browser.

**Manual workaround:** a `UserData` class is the whitelist of what is sent; models are never sent directly (type-safety rule 3).

**Closed by:** Kit Conversion: the shared `auth.user` is `App\Data\UserData` (`id`, `name`, `email`, `email_verified_at`), built from the model in the share step, so only those fields reach the browser ([P-012](#p-012)). The hand-written `User` and `Auth` types are removed from `types/auth.ts`, and the components that took a `User` (`user-info`, `user-menu-content`) take the generated `UserData`; `user-info` and `app-header` no longer read the `avatar` nothing sends. Every page Contract checks `auth.user` against `UserData`. Scenarios: `user-avatar-read-fails-tsc`, `user-data-typed-passes`.

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
- **Status:** closed

**Reproduction:** a `PaginatedDataCollection` prop: the shipped `LengthAwarePaginator` type lacks `links[].page` (sent as `number | null` since Laravel 11). A `CursorPaginatedDataCollection` from `X::collect($cursorPaginator, …)` is keyed `array-key`, so `data` becomes a `Record` instead of `X[]`.

**Manual workaround:** `PaginatorTypesProvider` replaces both types (`data: TValue[]`, `links` with `page`), registered after the laravel-data extension; a typed `<Pagination>` component.

**Closed by:** [`PaginatorTypes`](../packages/laravel/src/Workarounds/TypeScriptTransformer/PaginatorTypes.php) replaces the shipped `LengthAwarePaginator` and `CursorPaginator` types (`data: TValue[]`, page links with `page: number | null`), so `PaginatedDataCollection` and `CursorPaginatedDataCollection` props are `{ data, links, meta }` as Laravel sends them. The npm package's `Pagination` component (`@mrsafalpiya/strictly-laravel/react`, [`packages/npm/react/index.d.ts`](../packages/npm/react/index.d.ts)) takes a page paginator: the generated type fits it, a cursor paginator doesn't. Scenarios: `paginators-typed-as-laravel-sends-them-passes`, `paginator-link-without-page-fails-tsc`, `cursor-paginator-in-pagination-fails-tsc`.

### P-041

**A generic `replaceType` target crashes generation**

- **Type Boundary:** pagination and deferred props
- **Source:** overview §2 and §4; `reference/template/app/Support/TypeScript/UnwrapInertiaPropsVisitor.php`
- **Upstream:** no upstream issue filed (typescript-transformer)
- **Status:** closed

**Reproduction:** `->replaceType(ScrollProp::class, 'never')` for `/** @var ScrollProp<CursorPaginatedDataCollection<array-key, ActivityData>> */` emits the invalid `never<…>` and generation crashes.

**Manual workaround:** `UnwrapInertiaPropsVisitor`, a visitor hook that replaces `ScrollProp<T>`, `MergeProp<T>`, `DeferProp<T>`, `OptionalProp<T>` and `OnceProp<T>` with `T`.

**Closed by:** [`InertiaPropWrappers`](../packages/laravel/src/Workarounds/TypeScriptTransformer/InertiaPropWrappers.php), a visitor that replaces `ScrollProp<T>`, `MergeProp<T>` and `OnceProp<T>` with `T`. `DeferProp<T>` and `OptionalProp<T>` are absent on the first load, so they aren't unwrapped to a required `T`: they fail generation, pointing to the typed way ([P-043](#p-043)). Scenarios: `scroll-prop-typed-as-its-items-passes`, `scroll-prop-items-misused-fails-tsc`.

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

**Closed by:** a deferred or lazy page prop is declared `Lazy|ReportStatsData` and built with `Lazy::inertiaDeferred(fn () => …)` (or `Lazy::inertia()`, sent only when asked for), which is generated as `stats?: ReportStatsData`, so a page component that reads it as loaded fails `tsc` (`TS18048: 'stats' is possibly 'undefined'`). A prop typed as Inertia's raw `DeferProp` or `OptionalProp`, which carries no value type, fails generation and names the typed way ([`RawInertiaPropCheck`](../packages/laravel/src/TypeScript/RawInertiaPropCheck.php)). Contract Coverage reports a lazy page prop no feature test loads as an unexercised gap ([`ContractCoverage`](../packages/laravel/src/Coverage/ContractCoverage.php)): `✗ reports › stats: no feature test loads this deferred prop: add a feature test that renders reports and loads stats (…)`; loading it (`$page->loadDeferredProps()` or a partial reload) records a partial-reload Contract that proves its type ([P-046](#p-046)). Scenarios: `deferred-prop-loaded-in-a-test-passes`, `deferred-prop-read-as-loaded-fails-tsc`, `raw-deferred-prop-fails-generation`, `deferred-prop-never-loaded-fails-coverage`.

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

**Closed by:** `forPage<'reports'>()` from the npm package's React helpers ([`packages/npm/react/index.d.ts`](../packages/npm/react/index.d.ts), `@mrsafalpiya/strictly-laravel/react`), whose page names and props `@/generated` registers ([`InertiaPagesProvider`](../packages/laravel/src/TypeScript/InertiaPagesProvider.php)). It returns `only`, `except` and `reset` (a prop name of the page, a shared prop's or a dotted path such as `report.stats`), `page.optimistic()` (the callback receives and returns the page's props), and Inertia's `Deferred`, `WhenVisible` and `InfiniteScroll` with `data` narrowed to the page's prop names. A renamed prop fails `tsc` wherever it is named: `TS2345: Argument of type '"statistics"' is not assignable to parameter of type …`. Three oxlint rules the installer turns on reject the untyped forms ([`packages/npm/oxlint/index.js`](../packages/npm/oxlint/index.js)): `strictly/typed-prop-names` (an `only`, `except` or `reset` that isn't `page.<key>(…)`), `strictly/typed-inertia-components` (importing Inertia's `Deferred`, `WhenVisible` or `InfiniteScroll`) and `strictly/typed-optimistic-updates` (`router.optimistic()`, or an `optimistic` that isn't `page.optimistic(…)`). The rules are syntactic ([P-070](#p-070)). Scenarios: `typed-prop-names-pass`, `renamed-prop-in-reload-fails-tsc`, `renamed-prop-in-deferred-fails-tsc`, `renamed-prop-in-infinite-scroll-fails-tsc`, `raw-only-list-fails-lint`, `untyped-deferred-fails-lint`, `router-optimistic-fails-lint`.

### P-046

**A nested partial reload returns only the subtree**

- **Type Boundary:** pagination and deferred props (partial reloads)
- **Source:** eval-02 §3
- **Upstream:** none (expected Inertia behaviour)
- **Status:** open

**Reproduction:** a partial reload with `only: ['project.stats']` returns only that subtree; checking it as the full page props fails, and checking it loosely proves nothing. Separately, a requested key missing from the response goes unnoticed.

**Manual workaround:** partial-reload Contracts are checked as `PartialPageContract<'issues/show', 'comments'>` (`DeepPartial` of the page props), and the requested keys must be present.

**Closed by:** the Contract recorder ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php)) records a partial reload of a page (Inertia's `X-Inertia-Partial-Component` names it) as `export const props = {…} satisfies Contract<PartialReload<PageProps<'reports'>, 'stats'>>`. `PartialReload` ([`packages/npm/contracts/index.d.ts`](../packages/npm/contracts/index.d.ts)) requires every requested prop, even one the page's type marks optional, allows any other prop, and follows a dotted request (`report.stats`) into the subtree Inertia returns; a reload with only `except` requires nothing. A requested prop missing from the response fails `tsc` (`Property 'stats' is missing in type '{}' but required in type …`), and so does a requested name the page doesn't have (`TS2344`). Requested shared props aren't checked: [P-092](#p-092). Scenarios: `partial-reload-of-nested-prop-passes-contract`, `partial-reload-missing-requested-key-fails-contract`.

### P-092

**A partial reload's shared props aren't checked**

- **Type Boundary:** pagination and deferred props (partial reloads)
- **Source:** found while closing [P-046](#p-046)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `router.reload({ only: page.only('auth') })` reloads a shared prop. The partial reload's Contract checks only the page's own props, so neither the value of `auth` nor its presence in the response is checked for that request.

**Manual workaround:** none needed in practice; see the reasoning.

**Reasoning:** the shared props come from one share step, which runs the same way for a partial reload as for a full render, and every full render records them as a Contract checked against `SharedPageProps` ([P-088](#p-088)). A partial reload sends a subset of the same values, so checking it again would prove little. The Overlay leaves them out of the partial reload's Contract rather than check them against a second, partial type.

## Flash messages

### P-047

**Flash data is untyped and read through a cast**

- **Type Boundary:** flash messages
- **Source:** ecosystem A.3, B.2 and C; eval-01 S4
- **Upstream:** none
- **Status:** closed

**Reproduction:** the Base Kit sends `Inertia::flash('toast', ['type' => 'success', 'message' => …])` and reads it in `use-flash-toast.ts` as `(event as CustomEvent).detail?.flash?.toast as FlashToast | undefined`; `flashDataType` is never set, so a changed toast shape compiles.

**Manual workaround:** `App\Support\Inertia\Flash::success()` backed by `App\Data\FlashData`, generated into `InertiaConfig['flashDataType']`; flash is recorded as a Contract, including on redirects.

**Closed by:** flash data is one Data class, the app's only subclass of [`Flash`](../packages/laravel/src/Inertia/Flash.php), whose `flash()` is the typed helper; `strictly:generate` writes its type into `InertiaConfig['flashDataType']` with every key optional, because a response carries only what was flashed for it ([`InertiaConfigProvider`](../packages/laravel/src/TypeScript/InertiaConfigProvider.php)), so `usePage().flash` and the router's `flash` event are typed without a cast. The PHPStan rule `strictly.inertiaFlash` ([`InertiaFlashRule`](../packages/laravel/src/PHPStan/InertiaFlashRule.php)) rejects `Inertia::flash()`, `ResponseFactory::flash()` and `Response::flash()`. Every feature test records what was flashed as a Contract checked against `FlashData` ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php)): with the page when a page renders it, and on its own (`__contracts__/_flash/`) when a redirect flashes it. Kit Conversion adds `App\Data\FlashData`, `ToastData` and the `App\Enums\ToastType` enum, flashes the Base Kit's toasts through `FlashData::toast()`, removes its hand-written `FlashToast` type and reads the toast in `use-flash-toast` without a cast. Scenarios: `inertia-flash-with-array-fails-phpstan`, `flash-toast-misread-fails-tsc`, `flash-around-the-data-class-fails-contract`, `flash-through-data-class-passes`.

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
- **Status:** closed

**Reproduction:** `public UploadedFile $file` generates `file: undefined`; a `DateTimeInterface` property generates `undefined` (the Laravel extension maps only `CarbonInterface`). Any class without a transformer does the same with only a warning.

**Manual workaround:** `->replaceType(UploadedFile::class, new TypeScriptRaw('File'))` (with `File | null` in `useRouteForm` until a file is picked) and `->replaceType(DateTimeInterface::class, 'string')`.

**Closed by:** [`UnmappedClassTypes`](../packages/laravel/src/Workarounds/TypeScriptTransformer/UnmappedClassTypes.php) generates `UploadedFile` (and subclasses) as `File` and any `DateTimeInterface` as `string`; every other PHP class without a TypeScript type fails `strictly:generate` with the property and the class named, and the previous output stays ([`UnmappedClassCheck`](../packages/laravel/src/Workarounds/TypeScriptTransformer/UnmappedClassCheck.php)). `File | null` until a file is picked belongs to the typed forms ([P-014](#p-014)). Scenarios: `uploaded-file-and-datetime-typed-passes`, `file-name-for-uploaded-file-fails-tsc`, `unmapped-class-fails-generation`.

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
- **Source:** eval-02 §7 and §9; eval-01 §6; overview §2; spec user stories 8 and 9
- **Upstream:** no upstream issue filed for spatie/php-structure-discoverer reading a PHP file that doesn't parse as if it were empty (`TokenCollection::fromCode()` swallows the `ParseError`)
- **Status:** closed

**Reproduction:** edit a Data class while `composer dev` runs: without a watcher, the editor and `tsc` check against the old types. typescript-transformer's `--watch` is slow and dies on a provider exception; Wayfinder's Vite plugin watches only routes and `Http`; generation fails in a fresh clone because the gitignored output directory doesn't exist. And a Data class saved half-written (`public int $openIssues` followed by `public stri`) makes `strictly:generate` exit 0 with the type missing from `@/generated`, so every component that uses it breaks while the developer types.

**Manual workaround:** a Vite plugin (`vite-plugins/php-types.ts`) that regenerates on PHP changes under `app/`, plus `File::ensureDirectoryExists()` before generating; build, typecheck and CI regenerate first.

**Closed by:** the npm package's Vite plugin ([`packages/npm/vite/index.js`](../packages/npm/vite/index.js), `@mrsafalpiya/strictly-laravel/vite`), which `strictly:install` registers in `vite.config.ts` ([`ViteTypesPlugin`](../packages/laravel/src/Install/ViteTypesPlugin.php)). While the dev server runs it runs `php artisan strictly:generate --skip-routes` on start and whenever a PHP file under `app/` is created, saved or deleted (and a page component file under `resources/js/pages` is created or deleted, [P-010](#p-010)): saves are debounced, runs never overlap and queue at most one more, and a failed run is logged without stopping the dev server. `strictly:generate` refuses to run while a PHP file it reads doesn't parse ([`UnparsableFiles`](../packages/laravel/src/Workarounds/UnparsableFiles.php)), so it writes nothing and the last good types stay. Build, typecheck and `ci:check` generate first, and generation creates the gitignored output directory ([P-072](#p-072)). Scenarios: `data-class-mid-edit-fails-generate`, `data-class-edit-finished-passes`; harness tests: "while the dev server runs, tsc sees a saved Data class and a new or deleted page file, and a half-written Data class keeps the last good types", "generated TypeScript is gitignored, and ci:check, typecheck and build regenerate it in a fresh clone", and the plugin's timing through a real Vite dev server (`harness/tests/vite-plugin.test.ts`).

### P-065

**Generated types are never checked against real payloads**

- **Type Boundary:** every Type Boundary
- **Source:** overview §1 and §2; eval-02 §3; eval-01 §3
- **Upstream:** none
- **Status:** closed

**Reproduction:** a generator that lies gives types `tsc` trusts. eval-02's Contract test found 7 mismatches no other check caught, among them [P-040](#p-040), [P-043](#p-043) and [P-071](#p-071); the Base Kit's hand-written types were wrong the same way ([P-012](#p-012), [P-036](#p-036)).

**Manual workaround:** the Contract recorder: every page, partial reload, flash and JSON response seen by any feature test is written as a `satisfies` file checked by `tsc` (`tests/Support/InertiaContracts.php`).

**Closed by:** the Contract recorder ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php)). `strictly:install` applies [`RecordsContracts`](../packages/laravel/src/Testing/RecordsContracts.php) to the app's feature tests in `tests/Pest.php` (Kit Conversion writes it into the file it converts, [`PestContractsHook`](../packages/laravel/src/Install/PestContractsHook.php) adds it to one the app edited), so every page any feature test renders is written, with no per-test code, to the gitignored `resources/js/__contracts__/<page component>/<hash>.ts` as `export const props = {…} satisfies Contract<PageProps<'settings/profile'>>`: the page's own props exactly as the browser receives them, checked against the generated type (`Contract<T>` only lets an empty map arrive as `[]`, [P-076](#p-076)). `ci:check` runs `tsc` after the tests, so a wrong value, a missing prop or a key the generated type doesn't have fails it. Each Contract has a `.json` sidecar for Contract Coverage ([P-066](#p-066)). The other Type Boundaries' payloads are recorded with the Problems that type them: shared props ([P-012](#p-012), [P-088](#p-088): recorded with the page as `shared`), partial reloads ([P-046](#p-046): recorded as `PartialReload` of the page props), flash ([P-047](#p-047): recorded with the page as `flash`, and on its own for a redirect), JSON responses ([P-048](#p-048), [P-050](#p-050)), validation errors and input reads ([P-024](#p-024), [P-029](#p-029)) and broadcasts ([P-052](#p-052)). Scenarios: `page-props-sent-through-data-class-pass-contract`, `hand-built-page-prop-fails-contract`; harness test: "feature tests record Contracts when Kit Conversion skipped an edited tests/Pest.php".

### P-066

**Shapes no test produced are never checked**

- **Type Boundary:** every Type Boundary
- **Source:** overview §2; type-safety "What checks what"
- **Upstream:** none
- **Status:** closed

**Reproduction:** a nullable field only ever `null` in tests, a list only ever empty, a union variant never produced, or a page, deferred prop or endpoint no test hits: its Contracts pass while `tsc` never saw the other shape.

**Manual workaround:** Contract Coverage, `php artisan types:coverage --strict`, fails CI on each unverified shape; close it with a test that produces it (`tests/Feature/ShapeCoverageTest.php`).

**Closed by:** Contract Coverage, `php artisan strictly:coverage --strict` ([`CoverageCommand`](../packages/laravel/src/Console/CoverageCommand.php)), which `ci:check` runs as `ci:check:coverage`, after the tests and before `tsc`. It reads the sidecars of the Contracts the tests recorded ([P-065](#p-065)) and compares them with the Page classes and the Data classes they hold ([`ContractCoverage`](../packages/laravel/src/Coverage/ContractCoverage.php), [`ShapeCoverage`](../packages/laravel/src/Coverage/ShapeCoverage.php)). It fails on a page no test renders, and, at any depth and per Data class property, on a nullable field only ever `null`, an Optional field never sent, a list or map only ever empty, a union of Data classes never sent as one of its variants and a scalar union (`int|string`) never sent as one of its members. Each gap is one line that names the page or field, where it was looked for and the test to add: `✗ ProjectData.lead is only ever null (at projects/show › project.lead): add a feature test that renders projects/show with project.lead not null.` The shared props and the flash data are proven the same way against their Data classes ([P-012](#p-012), [P-047](#p-047)): every page's shared props (`at shared props › …`, and a gap when no test renders a page through the Inertia middleware) and everything flashed, so a flash key no test flashes is a gap (`at flash data › …`). Run without `--strict`, only unrendered pages fail. A fresh install has no gaps: Kit Conversion adds `tests/Feature/ContractCoverageTest.php` with `tests/Pest.php`, which renders the Base Kit's pages with a status message, with passkeys and the appearance page. The other dimensions report into the same Contract Coverage with the Problems that record their Contracts: deferred props ([P-043](#p-043): a lazy page prop no test loads), JSON endpoints ([P-048](#p-048), [P-050](#p-050)), form endpoints and declared vendor fields ([P-024](#p-024), [P-025](#p-025)) and broadcasts ([P-052](#p-052)). Shapes laravel-data doesn't describe stay unchecked ([P-084](#p-084)). Scenarios: `every-shape-exercised-passes-coverage`, `page-no-test-renders-fails-coverage`, `nullable-prop-only-null-fails-coverage`, `optional-prop-only-absent-fails-coverage`, `list-prop-only-empty-fails-coverage`, `union-variant-never-seen-fails-coverage`, `scalar-union-member-never-seen-fails-coverage`, `coverage-without-recorded-contracts-fails`, `shared-prop-only-null-fails-coverage`, `flash-key-never-flashed-fails-coverage`; harness test: "make:page creates a Page class and its page component, already in sync".

### P-084

**Contract Coverage can't see shapes laravel-data doesn't describe**

- **Type Boundary:** every Type Boundary
- **Source:** found while closing [P-066](#p-066)
- **Upstream:** none (laravel-data's `DataConfig` describes one item class per collection, by design)
- **Status:** open

**Reproduction:** Contract Coverage reads a property's shapes from laravel-data's description of its Data class, which knows one item type per collection and nothing inside a PHPDoc array shape. So these pass `strictly:coverage --strict` although `tsc` never saw the other shape: a page prop `/** @param list<array{lead: ?string}> $projects */` whose `lead` every test sends as `null`; `/** @param list<int|string> $estimates */` only ever sent strings; `/** @param list<IssueData|MilestoneData> $focus */` only ever sent issues (laravel-data reads every item as an `IssueData`); and a nested list `list<list<MemberData>>`.

**Manual workaround:** model the item as a Data class (a `ProjectSummaryData` with `public ?string $lead`, or a Data class wrapping the union), whose shapes Contract Coverage does check.

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

### P-073

**A Data class that parses but can't be loaded silently drops its type**

- **Type Boundary:** every Type Boundary
- **Source:** found while closing [P-064](#p-064)
- **Upstream:** no upstream issue filed (typescript-transformer's `DiscoverTypesAction` catches the reflection error and skips the class)
- **Status:** open

**Reproduction:** save `final class ProjectData extends Dat` (a half-typed parent class) while `composer dev` runs. The file parses, so `strictly:generate` runs; loading the class throws, typescript-transformer skips it, and generation exits 0 with `ProjectData` missing from `@/generated`. Every component that uses the type breaks until the class loads again. `ci:check` still fails (PHPStan reports the unknown class), so only the dev loop is affected.

**Manual workaround:** none; finish the edit and the next save regenerates the type.

### P-076

**An empty map is sent as `[]`, which its type doesn't allow**

- **Type Boundary:** every Type Boundary
- **Source:** found while closing [P-065](#p-065)
- **Upstream:** by design: PHP has one array type, and [`json_encode()`](https://www.php.net/manual/en/function.json-encode.php) encodes an empty array as `[]` whatever its keys would have been
- **Status:** closed

**Reproduction:** a page prop typed `array<value-of<ProjectStatus>, int>` (generated as `Partial<Record<ProjectStatus, number>>`, [P-033](#p-033)) or `array<string, int>` (`{ [x: string]: number }`) is sent as `[]` when it is empty, and so is a Data object whose props are all optional and absent. Its recorded Contract fails `tsc`: `error TS2559: Type 'never[]' has no properties in common with type 'Partial<Record<ProjectStatus, number>>'`. The payload is harmless (reading `[]` by key gives `undefined`, as the type allows), but every test that renders an empty map fails `ci:check`.

**Manual workaround:** none in the Reference Implementation, whose Contracts compared against the plain generated type.

**Closed by:** Contracts are checked against `Contract<T>` ([`@mrsafalpiya/strictly-laravel/contracts`](../packages/npm/contracts/index.d.ts)), which is T except that an object type with no required property may also be `[]`, at any depth. Nothing else is relaxed: a non-empty list sent for a map, or `[]` for an object with a required property, still fails. Scenarios: `empty-map-page-prop-passes-contract`, `list-sent-for-map-page-prop-fails-contract`.

### P-080

**An existing app silently lacks a hook a newer release adds, or one it lost**

- **Type Boundary:** every Type Boundary
- **Source:** spec user stories 68 and 69
- **Upstream:** none
- **Status:** closed

**Reproduction:** an app installed with an earlier release runs `composer update` and `npm update`, but the installer hooks it got at install time are the only ones it has. A hook a newer release adds (a tsconfig flag, a lint rule, a `ci:check` step) never reaches it. The same happens when an app loses a hook by accident, for example a merge that drops `"noUncheckedIndexedAccess": true` from `tsconfig.json`: `text.split(' ')[0].toUpperCase()` then compiles, and `ci:check` passes.

**Manual workaround:** diff the app against a fresh install by hand after every update.

**Closed by:** `strictly:install` is safe to run again ([`InstallCommand`](../packages/laravel/src/Console/InstallCommand.php)). It applies every hook that is missing, never touches converted or user files, and changes nothing on an app that is fully installed. `strictly:install --check` applies everything to a scratch copy of the app ([`ScratchCopy`](../packages/laravel/src/Install/ScratchCopy.php)). It fails, naming each hook, when the installer would change something. `ci:check` runs it as its first step (`ci:check:install`). The [upgrade guide](../packages/laravel/UPGRADE.md) tells an app to run the installer after every update. Scenarios: `hook-removed-fails-install-check`, `hook-removed-restored-by-reinstall-passes`, `hook-removed-restored-by-reinstall-catches-unchecked-index`. Harness tests: "strictly:install is idempotent: running it again on a fully installed app is a no-op" and "re-running strictly:install restores a missing hook and reports one it can't apply, leaving that file alone".

### P-081

**A half-updated app runs one release's Composer package with another's npm package**

- **Type Boundary:** every Type Boundary
- **Source:** spec user story 71; ADR-0001 (one version for both packages)
- **Upstream:** none
- **Status:** closed

**Reproduction:** `composer update` brings `mrsafalpiya/strictly-laravel` 0.2.0 while `@mrsafalpiya/strictly-laravel` stays at 0.1.0, or the other way round. One release then generates the types, and the other release's React helpers, JSX types and lint rules check them. Nothing tells the developer.

**Manual workaround:** compare `composer show mrsafalpiya/strictly-laravel` with `npm ls @mrsafalpiya/strictly-laravel` after every update.

**Closed by:** the npm package's Vite plugin ([`packages/npm/vite/index.js`](../packages/npm/vite/index.js)) compares its own version with the Composer package's version in `vendor/composer/installed.json`. When they differ it prints a `[strictly]` warning in the dev server and in every build, naming both versions and pointing to the upgrade guide. A Composer dev version (`dev-main`) carries no release number, so it isn't compared. Harness tests: "the dev server and the build warn when the Composer and npm package versions differ", which first checks that a build with matching versions prints no warning, and "Vite plugin: Composer and npm package versions" (`harness/tests/vite-plugin.test.ts`).

### P-082

**A release's app-side change the installer can't make goes unnoticed**

- **Type Boundary:** every Type Boundary
- **Source:** spec user stories 69 and 70
- **Upstream:** none
- **Status:** closed

**Reproduction:** an app's `vite.config.ts` builds its plugin list in a function (`plugins: lazyPlugins(plugins)`), which the installer can't patch. The installer reports the Strictly Laravel Vite plugin as `not applied` once, and then nothing else does. `ci:check` passes, and the dev server never regenerates the types. A release that needs any change only the app's developer can make (one the installer can't apply) has the same gap.

**Manual workaround:** read the installer's output and the release notes carefully.

**Closed by:** `ci:check:install` (`strictly:install --check`, [P-080](#p-080)) fails while any hook is `not applied`, and the error says what to do by hand. A hook the developer applied by hand counts as applied. The [upgrade guide](../packages/laravel/UPGRADE.md) lists each release's app-side changes and documents the release-check convention: every such change is applied by a hook, or detected by a hook that fails until it's made, or checked by a rule in the earliest tool that can express it, or marked as having no check, with the reason. Scenarios: `vite-plugin-unpatchable-fails-install-check`, `vite-plugin-registered-by-hand-passes`.

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
