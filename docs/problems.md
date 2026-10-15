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

**Reference Implementation names.** Manual workarounds use the Reference Implementation's names: `config/types.php`, the `type-safety/*` lint rules, the `@/lib/*` modules, and the template's and Tracklane's classes and files. That code was retired once the Overlay had extracted it (#31), so these names describe what it did; its overview and standard are kept in the research docs (below). In the Overlay the config is `config/strictly.php` and suppressible rules are `strictly/<rule>` (oxlint) and `strictly.<rule>` (PHPStan), per ADR-0007.

**Adding a Problem.** Copy an entry, take the next free ID, add a row to the index, and give a reproduction concrete enough to become a breaking scenario.

**Sources** cited by the entries:

- **overview**: [`research/reference-overview.md`][overview]
- **eval-01**, **eval-02**, **eval-03**: [`research/evaluations/01-wayfinder-next.md`][eval-01], [`02-laravel-data-ts.md`][eval-02], [`03-other-tools.md`][eval-03]
- **ecosystem**: [`research/ecosystem.md`][ecosystem]
- **type-safety**: the Reference Implementation's standard, [`research/type-safety.md`][type-safety]
- **spec**: the parent spec, [issue #1][spec]

## Index

| ID | Problem | Type Boundary | Status |
|---|---|---|---|
| [P-001](#p-001) | Wayfinder output fails `tsc` on Laravel 13.35+ (`QUERY` verb) | routes | open |
| [P-002](#p-002) | Wayfinder reads binding keys only from controller type-hints | routes | closed |
| [P-003](#p-003) | Route parameters are structural, so any model's key fits | routes | closed |
| [P-004](#p-004) | Wayfinder's output formatter collapses function arguments | routes | open |
| [P-005](#p-005) | `withoutScopedBindings()` inside `scopeBindings()` has no effect | routes | open |
| [P-006](#p-006) | Query strings are untyped | routes | closed |
| [P-104](#p-104) | A query property without a default fails on a URL that leaves its key out | routes | closed |
| [P-105](#p-105) | A query value the route function leaves out of the URL reads as a different default | routes | closed |
| [P-106](#p-106) | A route whose action takes no query class accepts any query string | routes | closed |
| [P-151](#p-151) | A closure route's query class doesn't type its route function | routes | closed |
| [P-171](#p-171) | A closure route PHPStan can't see as one isn't checked | routes | accepted gap |
| [P-007](#p-007) | Hard-coded URLs bypass the route types | routes | closed |
| [P-008](#p-008) | Route keys are checked for existence, not identity | routes | accepted gap |
| [P-116](#p-116) | A route-key brand can be put on a value that isn't its model's key | routes | closed |
| [P-117](#p-117) | A Data class built from no single model gets no route-key brand on its key | routes | accepted gap |
| [P-009](#p-009) | Page props are hand-written per page | page props | closed |
| [P-010](#p-010) | Nothing ties a page name to a page component file | page props | closed |
| [P-011](#p-011) | Pages rendered by vendor view closures have no props source | page props | closed |
| [P-071](#p-071) | laravel-data's `#[Hidden]` is ignored by the type generator | page props | closed |
| [P-012](#p-012) | `auth.user` is typed non-null but is `null` for guests | shared props | closed |
| [P-013](#p-013) | Shared props type has an index signature that hides typos | shared props | accepted gap |
| [P-088](#p-088) | A prop shared beside the shared props type has no type | shared props | closed |
| [P-089](#p-089) | A page rendered without the Inertia middleware lacks the shared props its type promises | shared props | accepted gap |
| [P-014](#p-014) | Inertia's request APIs accept any payload | form payloads | closed |
| [P-096](#p-096) | Inertia's `<Form>` takes any payload and error keys | form payloads | closed |
| [P-100](#p-100) | A form to a route without an input brand names its payload by hand | form payloads | closed |
| [P-097](#p-097) | A closure route's input isn't on its route type | form payloads | closed |
| [P-015](#p-015) | Form control names are plain strings | form payloads | closed |
| [P-016](#p-016) | `jsxImportSource` also changes the JSX runtime import | form payloads | closed |
| [P-017](#p-017) | laravel-data `rules()` replaces the inferred rules | form payloads | closed |
| [P-099](#p-099) | A nested Data class's `rules()` replace its inferred rules | form payloads | closed |
| [P-018](#p-018) | Inferred `required` rejects empty arrays | form payloads | closed |
| [P-019](#p-019) | `int` is validated as `numeric` | form payloads | closed |
| [P-020](#p-020) | PHPDoc literal unions are not validated | form payloads | closed |
| [P-098](#p-098) | A boolean literal input type is validated only as a boolean | form payloads | accepted gap |
| [P-021](#p-021) | Typed iterables are not cast by default | form payloads | closed |
| [P-022](#p-022) | An invalid item in a typed list is a 500 | form payloads | closed |
| [P-023](#p-023) | Calendar dates and datetimes are indistinguishable | form payloads | closed |
| [P-075](#p-075) | A datetime input that isn't an ISO-8601 timestamp is a 500 | form payloads | closed |
| [P-173](#p-173) | A datetime input's TypeScript type doesn't say which format the server reads | form payloads | accepted gap |
| [P-189](#p-189) | A datetime input typed by an interface is a 500 for every value | form payloads | closed |
| [P-024](#p-024) | Actions can read request keys their input type doesn't declare | form payloads | closed |
| [P-113](#p-113) | An input's rules can validate a key it doesn't declare | form payloads | closed |
| [P-112](#p-112) | An action without an input class has its payload checked by nothing | form payloads | closed |
| [P-167](#p-167) | A closure route can take a FormRequest or read the request's input | form payloads | closed |
| [P-168](#p-168) | Input read from the request outside a controller isn't rejected | form payloads | accepted gap |
| [P-128](#p-128) | A model key in an input class is a plain number, so another model's key type-checks | form payloads | closed |
| [P-157](#p-157) | A model key named unlike one and validated by no `exists` rule needs no `#[KeyOf]` | form payloads | accepted gap |
| [P-025](#p-025) | Vendor controllers' payloads have no Source of Truth | form payloads | closed |
| [P-026](#p-026) | Input reads are seen per key | form payloads | accepted gap |
| [P-027](#p-027) | `FieldName` proves a name came from some `field()`, not this form's | form payloads | accepted gap |
| [P-028](#p-028) | Client-side error keys are not tied to the input type | validation errors | closed |
| [P-029](#p-029) | The server can return error keys that aren't fields | validation errors | closed |
| [P-030](#p-030) | Validation runs before authorization | validation errors | closed |
| [P-126](#p-126) | An input's `authorize()` reads the route's models untyped | validation errors | closed |
| [P-155](#p-155) | An input whose `rules()` take a route model is validated only through its route | validation errors | accepted gap |
| [P-031](#p-031) | Enum values are hand-mirrored in TypeScript | enums | closed |
| [P-032](#p-032) | Literal and enum-case PHPDoc types become `unknown` | enums | closed |
| [P-033](#p-033) | Enum-keyed maps claim every key is present | enums | closed |
| [P-034](#p-034) | Iterating an enum's values needs a cast | enums | closed |
| [P-035](#p-035) | A new enum case can go unhandled in label maps | enums | closed |
| [P-074](#p-074) | A label map typed loosely isn't tied to the enum | enums | accepted gap |
| [P-036](#p-036) | The Base Kit's hand-written `User` type has drifted | models | closed |
| [P-037](#p-037) | Larastan ignores `casts()` without config | models | closed |
| [P-038](#p-038) | Larastan types every `BelongsTo` as nullable | models | accepted gap |
| [P-039](#p-039) | Lazy loading and unloaded attributes silently change a prop's shape | models | closed |
| [P-040](#p-040) | Shipped paginator types are wrong | pagination and deferred props | closed |
| [P-041](#p-041) | A generic `replaceType` target crashes generation | pagination and deferred props | closed |
| [P-042](#p-042) | `Inertia::scroll()` sends a flat paginator | pagination and deferred props | closed |
| [P-043](#p-043) | Raw `Inertia::defer()` props are typed as required keys | pagination and deferred props | closed |
| [P-044](#p-044) | `Lazy::closure()` and default-included props are typed optional | pagination and deferred props | accepted gap |
| [P-045](#p-045) | Prop names in reloads and Inertia components are plain strings | pagination and deferred props | closed |
| [P-046](#p-046) | A nested partial reload returns only the subtree | pagination and deferred props | closed |
| [P-092](#p-092) | A partial reload's shared props aren't checked | pagination and deferred props | accepted gap |
| [P-133](#p-133) | Contract Coverage doesn't look inside an infinite-scroll prop | pagination and deferred props | closed |
| [P-047](#p-047) | Flash data is untyped and read through a cast | flash messages | closed |
| [P-048](#p-048) | `useHttp` request and response types are hand-picked | JSON endpoints | closed |
| [P-049](#p-049) | `useHttp` resolves `undefined` on a 422 despite `Promise<T>` | JSON endpoints | closed |
| [P-108](#p-108) | A JSON endpoint that returns a list of Data objects has no response type | JSON endpoints | closed |
| [P-109](#p-109) | A closure route's response isn't on its route type | JSON endpoints | closed |
| [P-179](#p-179) | A closure route that answers JSON without a Data class isn't rejected | JSON endpoints | open |
| [P-180](#p-180) | JSON an action builds itself has no response type | JSON endpoints | accepted gap |
| [P-050](#p-050) | Vendor JSON endpoints have no Source of Truth | JSON endpoints | closed |
| [P-051](#p-051) | Vendor JSON declared as a TypeScript type gets no shape coverage | JSON endpoints | accepted gap |
| [P-052](#p-052) | Broadcast payloads are hand-typed and unverified | broadcasting | closed |
| [P-053](#p-053) | Broadcast event names are plain strings | broadcasting | closed |
| [P-054](#p-054) | Channel names and parameters are hand-written | broadcasting | closed |
| [P-142](#p-142) | Broadcast notifications and model broadcasts have no generated payload type | broadcasting | closed |
| [P-147](#p-147) | A broadcast notification or model broadcast needs an app event alongside it | broadcasting | accepted gap |
| [P-143](#p-143) | A public channel's name is hand-written | broadcasting | closed |
| [P-153](#p-153) | A misspelled channel pattern with parameters fails `tsc` on the argument count | broadcasting | closed |
| [P-144](#p-144) | An event can be listened for on a channel it is never broadcast on | broadcasting | closed |
| [P-145](#p-145) | A presence channel's member data is untyped | broadcasting | closed |
| [P-165](#p-165) | A presence channel's member data isn't checked by a Contract | broadcasting | accepted gap |
| [P-148](#p-148) | A channel object from Echo listens for any event with an untyped payload | broadcasting | open |
| [P-055](#p-055) | Translation keys are unchecked strings | translations | closed |
| [P-056](#p-056) | Translation `:param` names are unchecked | translations | closed |
| [P-057](#p-057) | Other locales can miss keys or params | translations | closed |
| [P-136](#p-136) | A pluralised message has no typed `choice()` on the client | translations | closed |
| [P-161](#p-161) | A message with a literal `\|` is a pluralised message | translations | accepted gap |
| [P-137](#p-137) | Translation keys used in PHP are unchecked | translations | closed |
| [P-163](#p-163) | Text no lang file defines can't be told from a misspelled key | translations | accepted gap |
| [P-138](#p-138) | Translations outside the app's lang files have no keys on the client | translations | accepted gap |
| [P-058](#p-058) | `VITE_*` variables are untyped | exposed config | closed |
| [P-140](#p-140) | A `VITE_*` variable `.env.example` lists can be unset when Vite builds | exposed config | closed |
| [P-059](#p-059) | Server settings and feature flags reach React ad hoc | exposed config | closed |
| [P-141](#p-141) | A value the root Blade template writes into the page reaches React untyped | exposed config | accepted gap |
| [P-060](#p-060) | `config()` values are `mixed` in PHP | exposed config | closed |
| [P-061](#p-061) | Unmapped PHP classes become `undefined` | every Type Boundary | closed |
| [P-062](#p-062) | `mixed` becomes `any` | every Type Boundary | closed |
| [P-063](#p-063) | Same-named Data classes produce duplicate types | every Type Boundary | closed |
| [P-064](#p-064) | Generated types go stale or missing | every Type Boundary | closed |
| [P-065](#p-065) | Generated types are never checked against real payloads | every Type Boundary | closed |
| [P-066](#p-066) | Shapes no test produced are never checked | every Type Boundary | closed |
| [P-084](#p-084) | Contract Coverage can't see shapes laravel-data doesn't describe | every Type Boundary | closed |
| [P-185](#p-185) | Contract Coverage doesn't look inside a generic Data class's template-typed items | every Type Boundary | open |
| [P-125](#p-125) | A form's empty defaults are a Contract Coverage gap no test can close | every Type Boundary | closed |
| [P-127](#p-127) | Contract Coverage depends on the random data factories produce | every Type Boundary | accepted gap |
| [P-132](#p-132) | Contract Coverage counts every variant of a discriminated union as seen when one is | every Type Boundary | closed |
| [P-067](#p-067) | Combinations are proven per shape, not per combination | every Type Boundary | accepted gap |
| [P-068](#p-068) | Type assertions override generated types | every Type Boundary | closed |
| [P-069](#p-069) | Casts remain in three boundary modules | every Type Boundary | accepted gap |
| [P-175](#p-175) | An `any` from an untyped API reaches typed code without a cast | every Type Boundary | open |
| [P-176](#p-176) | A hand-written type guard is trusted as written | every Type Boundary | accepted gap |
| [P-070](#p-070) | Lint rules are syntactic | every Type Boundary | accepted gap |
| [P-072](#p-072) | Data shapes are hand-written or registered one by one | every Type Boundary | closed |
| [P-073](#p-073) | A Data class that parses but can't be loaded silently drops its type | every Type Boundary | closed |
| [P-183](#p-183) | A Data class outside `App\Data` whose parent class doesn't exist still drops its type | every Type Boundary | accepted gap |
| [P-076](#p-076) | An empty map is sent as `[]`, which its type doesn't allow | every Type Boundary | closed |
| [P-080](#p-080) | An existing app silently lacks a hook a newer release adds, or one it lost | every Type Boundary | closed |
| [P-081](#p-081) | A half-updated app runs one release's Composer package with another's npm package | every Type Boundary | closed |
| [P-082](#p-082) | A release's app-side change the installer can't make goes unnoticed | every Type Boundary | closed |
| [P-124](#p-124) | `ci:check` fails in a fresh clone because feature tests need a Vite build | every Type Boundary | closed |
| [P-146](#p-146) | AI coding agents are taught the untyped way | every Type Boundary | closed |

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
- **Status:** closed

**Reproduction:** route `/w/{workspace:slug}` to `public function show(string $workspace)` (bound model not type-hinted). Wayfinder doesn't know the parameter is bound to `Workspace` by `slug`, so the generated function has no `{ slug }` object form and `show({ workspace })` can't take a `WorkspaceData`.

**Manual workaround:** always type-hint bound models in the controller action (`show(Workspace $workspace)`); a rule in type-safety.md, unenforced.

**Closed by:** `strictly:generate` (the `generate` step of `ci:check`, and `build` and `types:check`, which generate first) fails on a route parameter that names a binding field (`{workspace:slug}`) when its action doesn't type-hint a model for it, listing each one as `GET w/{workspace}: {workspace:slug} in App\Http\Controllers\WorkspaceController@show` (`StrictlyLaravel\Routes\RouteKeys::untypedBindings()`). With the model type-hinted, the route takes that model's [route key](#p-003) by the field: a `WorkspaceData` (its `slug`) or the `slug`. A parameter without a binding field (`{token}`) stays a plain `string | number`; one bound by `Route::bind()` is [P-008](#p-008)'s. Scenarios: `route-binding-field-typed-passes`, `route-binding-field-untyped-fails-generate`.

### P-003

**Route parameters are structural, so any model's key fits**

- **Type Boundary:** routes
- **Source:** overview §2 and §4; type-safety rule 15
- **Upstream:** no upstream issue filed
- **Status:** closed

**Reproduction:** Wayfinder types a bound parameter as `string | { key: string }`. With `show({ workspace, project })` expecting a project, `show({ workspace, project: issue })` or `show({ workspace, project: member.user })` type-checks because both have a `key`.

**Manual workaround:** nominal route keys. A Wayfinder template override types parameters bound to `Project` as `RouteKey<'Project', string>` (`App\Support\Wayfinder\RouteKeys`, `RouteTypes::arguments`); the route-key property of a Data class built by `fromModel(Project $project)` is generated with the same brand (`RouteKeysDataClassTransformer`), and a property holding another model's key declares `#[RouteKeyOf(Project::class)]`. Tests check every branded value sent is an existing key of its model (`tests/Support/RouteKeyChecks.php`), with a disjoint id range per table.

**Closed by:** nominal route keys ([`StrictlyLaravel\Routes\RouteKeys`](../packages/laravel/src/Routes/RouteKeys.php)). The package's Wayfinder `function-arguments` template ([`WayfinderTemplates::functionArguments()`](../packages/laravel/src/Routes/WayfinderTemplates.php)) types a parameter whose action type-hints a model (`show(Project $project)`) as the model's key by the field the route binds it by, `Key<'Project', 'id', number> | { id: Key<'Project', 'id', number> }` (`RouteKey<'Project', number>` names it, [P-128](#p-128)), from the npm package's [`routes` types](../packages/npm/routes/index.d.ts). A Data class built from the model (a static `from…(Project $project)` method) has each property named after a binding field the routes use for that model generated as `Key<'Project', …>`, and so does a property declaring [`#[RouteKeyOf(Project::class)]`](../packages/laravel/src/Data/RouteKeyOf.php) or `#[KeyOf]`, per item for a list ([`RouteKeyTypes`](../packages/laravel/src/TypeScript/RouteKeyTypes.php)). Input and query classes are branded only where a property declares its model ([P-128](#p-128)): they hold what the user sent. So `show(project)`, `show(project.id)` and `show(issue.project_id)` pass, and `show(issue)`, `show(issue.id)` or a plain number fail `tsc` with TS2345. Contracts check a route key as its plain value (`Contract<T>`), and the feature tests check it is an existing key of its model ([P-116](#p-116)). Kit Conversion types the Base Kit's passkey ids as `PasskeyData['id']`, since `destroy(passkey)` takes a passkey's key. Scenarios: `route-keys-nominal-passes`, `route-key-of-another-model-fails-tsc`, `route-key-plain-number-fails-tsc`.

### P-004

**Wayfinder's output formatter collapses function arguments**

- **Type Boundary:** routes
- **Source:** overview §4; Tracklane's `App\Support\Wayfinder\RouteTypes`
- **Upstream:** [laravel/wayfinder#328](https://github.com/laravel/wayfinder/issues/328)
- **Status:** open

**Reproduction:** a Wayfinder template override that writes a parameter type containing `import('@/lib/routes').RouteKey<'Project', string>` across several lines. The formatter collapses the argument list only up to the first `)`, which here is inside `import(…)`. The lines after it keep their line breaks and lose their indentation. The output still compiles, so the defect is cosmetic: the generated files are hard to read and diff.

**Manual workaround:** render the whole parameters argument on one line (`RouteTypes::arguments`).

The Overlay's own `function-arguments` template does the same ([`WayfinderTemplates::functionArguments()`](../packages/laravel/src/Routes/WayfinderTemplates.php)), so the route-key brands ([P-003](#p-003)) come out intact; the defect remains for any other template override.

### P-005

**`withoutScopedBindings()` inside `scopeBindings()` has no effect**

- **Type Boundary:** routes
- **Source:** overview §4; Tracklane's `NotificationController`
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

**Closed by:** a GET action's query string is a final Data class extending [`QueryData`](../packages/laravel/src/Data/QueryData.php) (a query class), type-hinted on the action. The Wayfinder `method` template override ([`WayfinderTemplates`](../packages/laravel/src/Routes/WayfinderTemplates.php), which looks the class up through [`RouteQuery`](../packages/laravel/src/Routes/RouteQuery.php)) types every route function of that action, `.url()` and `.form()` too, as taking `options?: QueryOptions<ProjectFiltersData>` ([`@mrsafalpiya/strictly-laravel/routes`](../packages/npm/routes/index.d.ts)) instead of `RouteQueryOptions`: `query` and `mergeQuery` are `Partial<ProjectFiltersData>`, so a misspelled key or a value of the wrong type fails `tsc`. `QueryData` parses the query string leniently: an invalid list item is dropped and any other key that fails its inferred or custom rules falls back to its default, so an old bookmark never gets a 422 or a 500. It is an ordinary Data class otherwise, so a Page class sends it back as a prop and the filter UI builds the next query from the same type. The PHPStan rule `strictly.inputData` accepts it on a controller action, and `strictly.queryDefault` keeps its defaults honest ([P-104](#p-104), [P-105](#p-105)). Routes whose action takes no query class take none ([P-106](#p-106)). Scenarios: `query-filters-typed-passes`, `invalid-query-value-falls-back-passes`, `query-key-misspelled-fails-tsc`, `query-value-wrong-type-fails-tsc`, `stale-bookmark-expects-422-fails-test`.

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
- **Status:** closed

**Reproduction:** `dashboard({ query: { tab: 'stats' } })` or `edit({ query: { anything: 1 } })` compiles for a route whose action declares no query class, and the action can still read the key (`$request->query('tab')`, [P-024](#p-024)). A vendor GET that reads a query string gets a query class only by declaring one in `config/strictly.php` ([P-025](#p-025)), as the Base Kit's password reset link (`email`) is. A closure route's query class is parsed leniently but doesn't type its route function, since Wayfinder gives the templates only a controller and method (as for inputs, [P-097](#p-097)).

**Manual workaround:** take a query class on every action that reads its query string.

**Closed by:** the Wayfinder `method` template override ([`WayfinderTemplates`](../packages/laravel/src/Routes/WayfinderTemplates.php)) types the `options` of every route function whose action has no query class ([`RouteQuery`](../packages/laravel/src/Routes/RouteQuery.php) finds none: a controller action without one, a closure route, a vendor action `config/strictly.php` declares none for) as `NoQueryOptions` ([`@mrsafalpiya/strictly-laravel/routes`](../packages/npm/routes/index.d.ts)), whose `query` and `mergeQuery` are `NoQueryClass`, a type no value fits. Passing a query string to such a route fails `tsc`: `error TS2353: Object literal may only specify known properties, and 'tab' does not exist in type 'NoQueryClass'.` On the server, the PHPStan rule `strictly.queryRead` ([`QueryReadRule`](../packages/laravel/src/PHPStan/QueryReadRule.php)) rejects reading the query string from the request in a controller (`$request->query(…)`, `$request->query->…`, `request()->query(…)`, `Request::query(…)`), with or without a query class: keys are read from the query class. Pagination needs no query class: `<Pagination>` follows the links the paginator builds, Inertia's `<InfiniteScroll>` asks for the next page itself, and the paginator reads `page` and `cursor` outside the controller, so neither goes through a route function's `query`. A closure route takes no query string through its route function either, and may neither take a query class nor read the query string: [P-151](#p-151). Scenarios: `route-query-typed-with-and-without-query-class-passes`, `query-on-route-without-query-class-fails-tsc`, `merge-query-on-closure-route-fails-tsc`, `query-read-without-query-class-fails-phpstan`; pagination keeps working in `paginators-typed-as-laravel-sends-them-passes` and the Testbed App.

### P-151

**A closure route's query class doesn't type its route function**

- **Type Boundary:** routes
- **Source:** found while closing [P-106](#p-106)
- **Upstream:** none (Wayfinder gives its templates the controller and method, not the route's closure)
- **Status:** closed

**Reproduction:** `Route::get('projects', fn (ProjectFiltersData $filters): IndexPage => …)->name('projects.index')` parses its query string leniently, but its route function can't tell it takes a query class, so `index()` from `@/routes/projects` takes `NoQueryOptions` and `index({ query: { sort: 'name' } })` fails `tsc` although `sort` is a property of the class. Nothing says why, and nothing rejects the closure. A closure route that reads `$request->query('tab')` isn't rejected either: `strictly.queryRead` checks controllers only. It fails safe: no route function can send such a route an untyped query string.

**Manual workaround:** take query classes, and read query strings, in controller actions only (as for inputs, [P-097](#p-097), and responses, [P-109](#p-109)).

**Closed by:** `strictly.closureRoute` ([P-097](#p-097)) rejects a closure route that takes a query class: `The closure route GET projects takes App\Data\ProjectFiltersData, a query class, but Wayfinder types a route function's query option only from a controller action: no route function can send its keys.` `strictly.queryRead` ([P-106](#p-106)) also rejects reading the query string anywhere in a closure route: `A closure route reads the query string from the request, where nothing types it: a route function sends only the keys of a controller action's query class.` Scenarios: `closure-routes-without-data-classes-pass`, `query-class-in-closure-route-fails-phpstan`.

### P-171

**A closure route PHPStan can't see as one isn't checked**

- **Type Boundary:** routes
- **Source:** found while closing [P-097](#p-097)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `$store = fn (StoreProjectData $data) => …; Route::post('projects', $store);`, or a closure registered through `Route::addRoute()`. `strictly.closureRoute`, `strictly.inputRead` and `strictly.queryRead` see a closure route only when its closure is written as the action argument of `Route::get/post/put/patch/delete/options/any/match()` (on the facade, the router or a route registrar), so such a route can take an input or query class, return a Data class or read the request, and its route function is untyped as in [P-097](#p-097), [P-109](#p-109) and [P-151](#p-151).

**Manual workaround:** write a closure route's closure in its route call, or use a controller action.

**Reasoning:** which closure a variable holds is known only where it is called, and the closure written in the route call is how the Base Kit and Laravel's documentation define closure routes. Such a route's function still fails safe for its query string (`NoQueryOptions`) and its response (`unknown`), `useRouteForm()` refuses it, and the validation-error Contracts and the form-endpoint and JSON-endpoint coverage still see the closure.

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

### P-116

**A route-key brand can be put on a value that isn't its model's key**

- **Type Boundary:** routes
- **Source:** overview §5; Tracklane's `RouteKeyChecks` test helper
- **Upstream:** none
- **Status:** closed

**Reproduction:** an `IssueData` declares `#[RouteKeyOf(Project::class)] public int $project_id`, but `fromModel()` fills it with the issue's `id`. The generated type says it is a project's key, so `show(issue.project_id)` type-checks and links to the wrong project, or to none. With one id sequence per table starting at 1, as a fresh test database has, the first issue's id is also the first project's, so even a test that looks the key up finds a project.

**Manual workaround:** the Reference Implementation's `RouteKeyChecks`: while a test serialises a Data object, every branded value must be an existing key of its model, and every table gets its own id range in tests.

**Closed by:** [`StrictlyLaravel\Testing\RouteKeyChecks`](../packages/laravel/src/Testing/RouteKeyChecks.php), started for every feature test by the installer's Pest hook (`RecordsContracts`). While a test's request is handled, laravel-data's serialisation checks every property typed as a [route key](#p-003) or another [model key](#p-128): a value that isn't an existing key of its model fails the request with `GET /issues/4000001 sent a value typed as a model's key that is no key of that model (Problem P-116): App\Data\IssueData.project_id is not the id of any App\Models\Project: 4000001`. A test that uses `RefreshDatabase` (or `DatabaseMigrations`) on SQLite gives every table its own range of a million ids, so ids of different models never coincide. Scenarios: `route-keys-nominal-passes` (its tests also prove the ranges are disjoint), `route-key-not-a-key-of-its-model-fails-test`. What remains, a key of the right model but the wrong row, is [P-008](#p-008).

### P-117

**A Data class built from no single model gets no route-key brand on its key**

- **Type Boundary:** routes
- **Source:** issue #20
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `ProjectData::from($project)` relies on laravel-data's own model normaliser, so the class has no `from…(Project $project)` method; or an `ActivityData` has both `fromIssue(Issue $issue)` and `fromComment(Comment $comment)`. Its `id` is generated as a plain `number`, so passing it to `show(project)` fails `tsc` although it is a project's key (the second class's `id` may be either model's).

**Manual workaround:** give the class a `fromModel(Project $project)` method, or split it into one Data class per model; a property that holds a known model's key can declare `#[RouteKeyOf(Project::class)]`.

**Reasoning:** the brand has to be derived from the PHP code, and only a `from…()` method's parameter type says which model a class's properties come from. Guessing would brand a key with the wrong model, which `tsc` would then trust; leaving it plain only refuses a call, which the developer fixes by naming the model.

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

**Closed by:** the page component's name derives from the Page class's (`App\Pages\Projects\ShowPage` is `projects/show`), and `@/generated` carries two checks ([`InertiaPagesProvider`](../packages/laravel/src/TypeScript/InertiaPagesProvider.php)): `__PageComponentCheck` fails `tsc` when a Page class's component file is missing or declares a prop the class doesn't send (even an optional one, which would always be missing), and `__PageFileCheck` fails it when a file under `resources/js/pages` has no Page class. `php artisan make:page projects/show` ([`MakePageCommand`](../packages/laravel/src/Console/MakePageCommand.php)) creates both, already in sync (harness test `make:page creates a Page class and its page component, already in sync`). The file check lists the page files found when the types were last generated, so the Vite plugin regenerates them when a file is created or deleted under `resources/js/pages` while the dev server runs (`ci:check`, `types:check` and `build` always generate first). Scenarios: `page-component-accepting-page-props-passes`, `page-component-missing-fails-tsc`, `page-component-unsent-prop-fails-tsc`, `page-component-optional-unsent-prop-fails-tsc`, `page-file-without-class-fails-tsc`; harness test "while the dev server runs, tsc sees a saved Data class and a new or deleted page file, and a half-written Data class, one that can't be loaded or two that generate the same type name keep the last good types".

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

**Closed by:** an action's input is a final Data class extending [`InputData`](../packages/laravel/src/Data/InputData.php), type-hinted on the action. The Wayfinder `method` template is overridden ([`WayfinderTemplates`](../packages/laravel/src/Routes/WayfinderTemplates.php), which renders Wayfinder's own template and brands its return types rather than copying it), so every route function of that action, `.form()` too, returns `RouteDefinition<…> & WithInput<StoreProjectData>` ([`@mrsafalpiya/strictly-laravel/routes`](../packages/npm/routes/index.d.ts)). `useRouteForm(route, defaults)`, `submit(route, data, options)` and `visit(route, options)` ([`@mrsafalpiya/strictly-laravel/react`](../packages/npm/react/index.d.ts)) take the payload from that brand: a wrong or missing field fails `tsc`, `submit()` refuses a route whose action takes no input and `visit()` one that does. The oxlint rule `strictly/typed-requests` rejects `useForm()`, `router.get/post/put/patch/delete()`, `router.visit()` with `data` or `method`, and `<Link data>` imported from Inertia; the PHPStan rule `strictly.inputData` ([`InputDataRule`](../packages/laravel/src/PHPStan/InputDataRule.php)) rejects a controller action taking a Data class that isn't an InputData. Kit Conversion sends the Base Kit's passkey deletion through `visit()`. Forms go through `<TypedForm>` ([P-096](#p-096)). Scenarios: `route-typed-requests-pass`, `route-form-wrong-field-fails-tsc`, `submit-wrong-field-fails-tsc`, `visit-route-that-takes-input-fails-tsc`, `inertia-use-form-fails-lint`.

### P-015

**Form control names are plain strings**

- **Type Boundary:** form payloads
- **Source:** overview §2; eval-02 §5; ecosystem B.2; ADR-0004
- **Upstream:** none
- **Status:** closed

**Reproduction:** `<Input name="emial" />` inside a typed form compiles; so does `<input name={someString}>`, and a wrapper component forwarding `name`.

**Manual workaround:** `field('email')` from `<TypedForm>`'s render prop returns a branded `FieldName`; the app's JSX types (`jsxImportSource: "@/types/jsx"`, `resources/js/types/jsx/jsx-runtime.d.ts`) narrow `name` on `<input>`/`<select>`/`<textarea>`/`<button>` to `FieldName`, and the Base Kit's UI components that forward `name` declare `name?: FieldName`. The `type-safety/typed-form-fields` lint rule covers third-party components inside `<TypedForm>`.

**Closed by:** the narrowed JSX types ([ADR-0004](adr/0004-narrowed-jsx-types-for-field-names.md)) ship in the npm package ([`@mrsafalpiya/strictly-laravel/jsx`](../packages/npm/jsx/jsx-runtime.d.ts)): React's JSX namespace, with `name` on `<input>`, `<select>`, `<textarea>` and `<button>` accepting only a [`FieldName`](../packages/npm/routes/index.d.ts), which only `field()` in `<TypedForm>`'s render prop mints ([P-096](#p-096)). `strictly:install` points tsconfig.json's `jsxImportSource` at it ([`JsxTypes`](../packages/laravel/src/Install/JsxTypes.php)), so a plain string as a control's name fails `tsc`, and so does a component that spreads its own `name: string` onto one until it declares `name?: FieldName`. Kit Conversion makes the Base Kit's UI components that forward `name` (`Input`, `PasswordInput`, `Button`, `Checkbox`, `Select`, `InputOTP` and the sidebar's buttons) declare it as a `FieldName`. The oxlint rule `strictly/typed-form-fields` rejects a literal `name` on any element inside `<TypedForm>`, for third-party components that type `name` as a plain string. Names that reach the DOM without JSX stay open: [P-027](#p-027). Scenarios: `typed-form-passes`, `raw-control-plain-name-fails-tsc`, `component-forwarding-string-name-fails-tsc`, `literal-name-in-typed-form-fails-lint`, `jsx-types-removed-fails-install-check`.

### P-016

**`jsxImportSource` also changes the JSX runtime import**

- **Type Boundary:** form payloads
- **Source:** overview §4; ADR-0004
- **Upstream:** by design since [vitejs/vite-plugin-react#726](https://github.com/vitejs/vite-plugin-react/pull/726) (the plugin respects tsconfig's `jsxImportSource`)
- **Status:** closed

**Reproduction:** set `"jsxImportSource": "@/types/jsx"` in `tsconfig.json` to narrow the JSX types ([P-015](#p-015)); the Vite React plugin then imports the JSX runtime from `@/types/jsx/jsx-runtime`, which has types only, and the app fails to build or render.

**Manual workaround:** pin the runtime in `vite.config.ts`: `react({ jsxImportSource: 'react' })`.

**Closed by:** `strictly:install` pins the Vite React plugin's runtime in vite.config.ts (`react({ jsxImportSource: 'react' })`, [`JsxTypes`](../packages/laravel/src/Install/JsxTypes.php)), so the compiled JSX imports React's runtime and only the types differ. The JSX module has types only (its package exports have no runtime entry), so an unpinned build fails loudly (`"./jsx/jsx-runtime" is not exported`) instead of shipping a broken app, and `ci:check:install` fails on an app that lost the pin. Proved by the harness test "the build compiles JSX with React's runtime" (the build passes with the pin and fails without it) and the scenario `vite-react-runtime-unpinned-fails-install-check`.

### P-017

**laravel-data `rules()` replaces the inferred rules**

- **Type Boundary:** form payloads
- **Source:** overview §2 and §4; type-safety rule 11
- **Upstream:** by design; laravel-data offers the opt-in `#[MergeValidationRules]`. No upstream issue filed.
- **Status:** closed

**Reproduction:** a Data class with `public string $slug` and `rules()` returning `['slug' => ['unique:projects']]`: the inferred `required|string` for `slug` is dropped, so a missing or non-string slug passes validation while the TypeScript type says `slug: string`.

**Manual workaround:** the `InputData` base class carries `#[MergeValidationRules]`.

**Closed by:** [`InputData`](../packages/laravel/src/Data/InputData.php) carries `#[MergeValidationRules]`, so an input's `rules()` are merged with the rules inferred from its types, and the PHPStan rule `strictly.inputData` ([`InputDataRule`](../packages/laravel/src/PHPStan/InputDataRule.php)) rejects a controller action that takes a Data class not extending it. A Data class with `rules()` nested in an input must extend it too: [P-099](#p-099). Scenarios: `custom-input-rules-merged-passes`, `plain-data-action-input-fails-phpstan`.

### P-099

**A nested Data class's `rules()` replace its inferred rules**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-017](#p-017)
- **Upstream:** by design; laravel-data reads `#[MergeValidationRules]` from each Data class. No upstream issue filed.
- **Status:** closed

**Reproduction:** an input with `public TaskData $task` (or `list<TaskData>`), where the plain Data class `TaskData` has `public string $title` and `rules()` returning `['title' => ['max:50']]`: the inferred `required|string` for `task.title` is dropped. Only the action's own parameter must extend InputData (`strictly.inputData`).

**Manual workaround:** make every Data class nested in an input that has `rules()` extend InputData too.

**Closed by:** the PHPStan rule `strictly.inputData` also rejects, in every input and query class, a property that nests a Data class with `rules()` not extending InputData ([`NestedInputDataRule`](../packages/laravel/src/PHPStan/NestedInputDataRule.php)): as the property's type, an item of a list, a map or a `DataCollection` of it, or a `#[DataCollectionOf]` class, at any depth. The message names the nested class (and the classes it is nested through). A nested class that extends InputData carries `#[MergeValidationRules]`, so its `rules()` are merged with its inferred ones. Scenarios: `nested-data-with-rules-fails-phpstan`, `nested-input-data-rules-merged-passes`.

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
- **Source:** overview §2; type-safety rule 8; the template's `LiteralTypesRuleInferrer`
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
- **Source:** overview §4; Tracklane's `config/data.php` and its saved-view tests
- **Upstream:** by design in laravel-data 4 (the `cast_and_transform_iterables` feature is off by default and announced as default in the next major). No upstream issue filed.
- **Status:** closed

**Reproduction:** `/** @var list<IssueStatus> */ public array $statuses` holds raw strings (`['todo']`) after `from()`, while PHPStan and TypeScript believe it holds enums.

**Manual workaround:** `'features' => ['cast_and_transform_iterables' => true]` in `config/data.php`.

**Closed by:** [`StrictInputConfig`](../packages/laravel/src/Workarounds/LaravelData/StrictInputConfig.php) turns `data.features.cast_and_transform_iterables` on at boot, whether or not the app published config/data.php, so a `list<IssueStatus>` holds enum cases. Scenarios: `typed-list-items-validated-passes`, `list-items-read-as-raw-values-fails-test`.

### P-022

**An invalid item in a typed list is a 500**

- **Type Boundary:** form payloads
- **Source:** overview §2 and §4; the template's `ListItemsRule`
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

**Closed by:** the `#[DateOnly]` attribute ([`packages/laravel/src/Data/DateOnly.php`](../packages/laravel/src/Data/DateOnly.php)) on a `Carbon`, `CarbonImmutable` or `CarbonInterface` property of a Data class, which keeps the declared class. Its cast reads and sends `"2026-10-14"` and rejects anything else (a timestamp, an impossible date such as `2026-02-30`) with a validation error on the field instead of a 500; the property is generated as `DateOnly` (`` `${number}-${number}-${number}` ``), with an `isDateOnly()` guard in `@/generated` that turns an `<input type="date">` value into one without a cast ([`DateOnlyTypes`](../packages/laravel/src/TypeScript/DateOnlyTypes.php)). Every other date is an ISO-8601 `string`; a datetime input is validated against its cast's format too ([P-075](#p-075)). Scenarios: `date-only-round-trips-passes`, `timestamp-for-date-only-fails-tsc`.

### P-075

**A datetime input that isn't an ISO-8601 timestamp is a 500**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-023](#p-023)
- **Upstream:** no upstream issue filed (laravel-data infers no rule for a `DateTimeInterface` property, so its cast is the first to see the value)
- **Status:** closed

**Reproduction:** an input Data class with `public CarbonImmutable $startsAt`; posting `startsAt: '2026-10-14'` or `'tomorrow'` passes validation, then laravel-data's `DateTimeInterfaceCast` throws `CannotCastDate` ("Could not cast date `2026-10-14` into a `Carbon\CarbonImmutable` using formats: Y-m-d\TH:i:sP"): a 500 instead of a 422, while the TypeScript type `string` accepts the value.

**Manual workaround:** `#[DateFormat(DATE_ATOM)]` on every datetime input property, or `#[DateOnly]` for a calendar date.

**Closed by:** [`DateFormatRuleInferrer`](../packages/laravel/src/Workarounds/LaravelData/DateFormatRuleInferrer.php) validates a `DateTimeInterface` property of any Data class against the formats its `DateTimeInterfaceCast` reads ([`DateFormatRule`](../packages/laravel/src/Workarounds/LaravelData/DateFormatRule.php)): a `#[WithCast(DateTimeInterfaceCast::class, format: …)]` format, otherwise `data.date_format` (DATE_ATOM by default). A value the cast can't read, or one naming an impossible date it would roll over (`2026-02-30T09:30:00+00:00`), gets a 422 on the field ("The starts at field must match the format Y-m-d\TH:i:sP."), alongside the other fields' errors; a timestamp ending in `Z`, which the cast reads, is accepted. Each item of a `list<CarbonImmutable>` is validated the same way, and a `#[DateOnly]` property gets `date_format:Y-m-d`, so its error comes with the others instead of after them. Null, a missing key and an `Optional` keep the inferred nullable and required rules, `rules()` still merge, an explicit `#[DateFormat]` replaces the inferred rule, and a property with another cast is left to that cast. A property typed `CarbonInterface` or `DateTimeInterface` is read as a `CarbonImmutable` ([P-189](#p-189)). The TypeScript type is still `string`: [P-173](#p-173). Scenarios: `datetime-input-validated-passes` (through a controller action, its input and validation-error Contracts checked by the full `ci:check`), `non-iso-datetime-for-input-fails-test`.

### P-173

**A datetime input's TypeScript type doesn't say which format the server reads**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-075](#p-075)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `public CarbonImmutable $startsAt` on an input is generated as `startsAt: string`, so `tsc` accepts `startsAt: new Date().toISOString()` (`2026-10-14T09:30:00.000Z`), whose milliseconds DATE_ATOM has no place for; the request gets a 422 on `startsAt` naming the format.

**Manual workaround:** send the format the server sends back (DATE_ATOM, `2026-10-14T09:30:00+00:00`), or add `u` or `v` to `data.date_format` to read milliseconds.

**Reasoning:** the server now rejects such a value with a 422 on the field, which is what P-075 asked. A template literal can't tell the formats apart (`${number}-${number}-${number}T${string}` takes the milliseconds too), and the format is the app's choice in `data.date_format` or a `#[WithCast]`, so a type that encodes it would need a branded datetime type and a helper to build one: a design of its own, worth a ticket if apps keep sending the wrong format.

### P-189

**A datetime input typed by an interface is a 500 for every value**

- **Type Boundary:** form payloads
- **Source:** code review of [P-075](#p-075)'s fix, whose Boost guidance recommended `CarbonInterface`
- **Upstream:** no upstream issue filed (laravel-data 4's `DateTimeInterfaceCast` calls `createFromFormat()` on the property's type)
- **Status:** closed

**Reproduction:** an input Data class with `public CarbonInterface $startsAt` (or `DateTimeInterface`, or `list<CarbonInterface>`); posting a valid `startsAt: '2026-10-14T09:30:00+00:00'` passes validation, then laravel-data throws `CannotCastDate` ("Could not cast date `2026-10-14T09:30:00+00:00` into a `Carbon\CarbonInterface` using formats: Y-m-d\TH:i:sP"), since an interface can't create an instance: a 500 for every value. Output Data classes are unaffected (a model's date is already an object, which isn't cast).

**Manual workaround:** type the property `CarbonImmutable`.

**Closed by:** [`InterfaceTypedDateCast`](../packages/laravel/src/Workarounds/LaravelData/InterfaceTypedDateCast.php), laravel-data's `DateTimeInterfaceCast` reading a property typed by an interface that `CarbonImmutable` implements as a `CarbonImmutable`. [`StrictInputConfig`](../packages/laravel/src/Workarounds/LaravelData/StrictInputConfig.php) makes it the global cast for `DateTimeInterface` while the app's `config/data.php` keeps laravel-data's; an app that casts dates with a class of its own keeps it. Its format rule is the one [P-075](#p-075) infers. A `#[WithCast(DateTimeInterfaceCast::class, …)]` on an interface-typed property still uses laravel-data's own cast. Scenario: `datetime-input-validated-passes` (a `CarbonInterface` and a `?DateTimeInterface` property round-trip through a controller action).
### P-024

**Actions can read request keys their input type doesn't declare**

- **Type Boundary:** form payloads
- **Source:** overview §2; type-safety rule 13
- **Upstream:** none
- **Status:** closed

**Reproduction:** an action taking `StoreProjectData $data` also reads `$request->boolean('notify')`. The form's type has no `notify`, so the client never sends it and the server silently uses the default.

**Manual workaround:** the test request records every key read (`input()`, `boolean()`, `only()`, `has()`, magic properties; `tests/Support/InputReads.php`) and the Contract `read satisfies InputKey<StoreProjectData>[]` fails on an undeclared key.

**Closed by:** every feature test's request is a [`TrackedRequest`](../packages/laravel/src/Testing/TrackedRequest.php) ([`RecordsContracts`](../packages/laravel/src/Testing/RecordsContracts.php) overrides the test case's `createTestRequest()`), which reports each input key the app reads by name (`input()`, `boolean()`, `string()`, `filled()`, `has()`, `hasAny()`, `only()`, `all('key')`, `query()`, `post()`, `file()`, `json()`, `$request->key`, `$request['key']`; a route parameter read as a property isn't input) to [`InputReads`](../packages/laravel/src/Testing/InputReads.php). A request to a form endpoint records the keys its action read, from the moment it reached its route, in its `form` Contract as `export const read = [...] satisfies InputKey<StoreProjectData>[]`, which fails `tsc` on a key the input type lacks: `Type '"notify"' is not assignable to type '"name" | "public"'.` Framework plumbing is ignored: keys starting with `_` (the CSRF token, `_method`) and the reads of the paginators (`page`, `cursor`) and of laravel-data (its `include`, `exclude`, `only` and `except` response partials). A read that names no key isn't seen: [P-026](#p-026). An action without an input class reads no input: [P-112](#p-112). Scenarios: `input-reads-declared-fields-pass-contract`, `input-read-not-a-field-fails-contract`.

### P-113

**An input's rules can validate a key it doesn't declare**

- **Type Boundary:** form payloads
- **Source:** the Reference Implementation's validation Contract (`validated satisfies InputKey<…>[]`, overview §2); recorded while closing [P-024](#p-024)
- **Upstream:** none
- **Status:** closed

**Reproduction:** an input with `#[Confirmed] public string $password` and no `password_confirmation` property, or whose own `rules()` add `'terms' => ['accepted']` for a key it doesn't declare. A feature test that posts the extra key passes, but the generated type has no such field, so the typed form never sends it and every real submit is refused.

**Manual workaround:** the validation Contract `validated satisfies InputKey<UpdatePasswordData>[]`, fed by a validator resolver that records every rule key (and the field a `confirmed` rule compares with).

**Closed by:** [`ValidatedFields`](../packages/laravel/src/Testing/ValidatedFields.php) wraps the validation factory's resolver (keeping one the app set) during feature tests and records the key of every rule a validator is made with, plus `{field}_confirmation` for `confirmed` (`confirmed:other` for `other`); a `*` segment stands for the first item (`tasks.*.title` → `tasks.0.title`). A request to a form endpoint records the fields validated since it reached its route in its `form` Contract as `export const validated = [...] satisfies InputKey<UpdatePasswordData>[]`, which fails `tsc` on a key the input type lacks: `Type '"password_confirmation"' is not assignable to type '"password"'.` A validator the action makes for data that isn't the request's (an imported file's rows) is recorded too, so validate such data outside the request's handling or declare its keys. Scenarios: `confirmed-input-declares-confirmation-passes`, `validated-key-not-an-input-field-fails-contract`.

### P-112

**An action without an input class has its payload checked by nothing**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-024](#p-024)
- **Upstream:** none
- **Status:** closed

**Reproduction:** an action taking a FormRequest, such as the Base Kit's `SecurityController::update(PasswordUpdateRequest $request)` before Kit Conversion gave it `PasswordUpdateData`, validates `current_password` and `password` and reads `$request->string('password')`; an app action taking a plain `Request` can read `$request->input('q')`. No input class types their payload, so their form has no fields (naming its payload as a `<TypedForm>` type argument fails lint, [P-100](#p-100)), and the input Contracts ([P-024](#p-024), [P-029](#p-029), [P-113](#p-113)) only check form endpoints, so the keys these actions validate, report errors for and read are checked against nothing. A vendor action is one of them until `config/strictly.php` declares its payload ([P-025](#p-025)); the Base Kit's Fortify actions that take no payload (logout, disabling two-factor authentication) aren't declared.

**Manual workaround:** take an input class on every action that reads the request's input, and a query class on a GET action that reads its query string ([P-006](#p-006)); declare one for a vendor action that reads either ([P-025](#p-025)). A GET with a query class records the keys it reads as a `query` Contract checked against the class.

**Closed by:** two PHPStan rules, which share [`ControllerAction`](../packages/laravel/src/PHPStan/ControllerAction.php) and [`RequestRead`](../packages/laravel/src/PHPStan/RequestRead.php) with `strictly.queryRead` ([P-106](#p-106)). [`FormRequestRule`](../packages/laravel/src/PHPStan/FormRequestRule.php) (`strictly.formRequest`) rejects a controller action parameter typed as a FormRequest: `App\Http\Controllers\ProjectController::store() takes App\Http\Requests\StoreProjectRequest, a FormRequest, where nothing types its payload: a typed form sends only the fields of its action's input class.` [`InputReadRule`](../packages/laravel/src/PHPStan/InputReadRule.php) (`strictly.inputRead`) rejects reading input from the request in any method of a controller (or closure in one) that takes no input or query class: the accessors of `InteractsWithInput` and `InteractsWithData` (`input()`, `string()`, `boolean()`, `all()`, `only()`, `has()`, `file()`, …), `get()`, `json()`, the `validate()` macros, a FormRequest's `validated()` and `safe()`, the `request` and `files` bags, a key read as a property (`$request->name`) or offset (`$request['name']`), `Request::input()` on the facade and `request('name')`. A method that takes an input or query class may still read the request, since its Contract checks every key it reads ([P-024](#p-024), [P-104](#p-104)), and reading what isn't the payload (`user()`, `route()`, `header()`, `ip()`, `session()`, `cookie()`) passes. Kit Conversion's `SecurityController::edit()` takes a plain `Request` and makes the Base Kit's `TwoFactorAuthenticationRequest`, which validates nothing, from it with `createFrom()` for Fortify's two-factor state handling. Vendor actions stay covered by their declarations ([P-025](#p-025)). Closure routes are covered too ([P-167](#p-167)); reads outside a controller aren't ([P-168](#p-168)). Scenarios: `form-request-in-action-fails-phpstan`, `input-read-without-input-class-fails-phpstan`, `input-class-and-request-metadata-passes`.

### P-167

**A closure route can take a FormRequest or read the request's input**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-112](#p-112)
- **Upstream:** none
- **Status:** closed

**Reproduction:** `Route::post('projects', fn (Request $request) => Project::create(['name' => $request->string('name')]))` or `fn (StoreProjectRequest $request) => …`. `strictly.inputRead` and `strictly.formRequest` check controllers only, so neither is rejected, and as with [P-097](#p-097) the route function has no input type, so no typed form can send the payload.

**Manual workaround:** handle a payload in a controller action that takes an input class.

**Closed by:** `strictly.closureRoute` ([P-097](#p-097)) rejects a closure route that takes a FormRequest (`… takes App\Http\Requests\StoreProjectRequest, a FormRequest, but Wayfinder types a route function's payload only from a controller action: no typed form can send it.`), and `strictly.inputRead` ([P-112](#p-112)) rejects reading input from the request anywhere in a closure route, with the accessors it rejects in a controller: `A closure route reads input from the request with string(), where nothing types it: a typed form sends only the fields of a controller action's input class.` Reading what isn't the payload (`$request->user()`) passes. Scenarios: `closure-routes-without-data-classes-pass`, `input-read-in-closure-route-fails-phpstan`.

### P-168

**Input read from the request outside a controller isn't rejected**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-112](#p-112)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** a controller action without an input class hands the request to another class (`$this->projects->create($request)`, a job, an action class) that reads `$request->input('name')`; or reads the request through a value PHPStan doesn't type as one (`app('request')` in code typed `mixed`). `strictly.inputRead` sees reads only in a controller's own methods and closures, on a value typed as a `Request`. The same holds for a vendor action that reads input and that `config/strictly.php` declares nothing for ([P-025](#p-025)): vendor code isn't analysed.

**Manual workaround:** take the input class in the action and pass it, not the request, to the code that needs the payload.

**Reasoning:** middleware, a FormRequest's own methods, Fortify's customisation callbacks (`Fortify::authenticateUsing()`) and other framework hooks read the request by design, so a rule can't reject every read outside a controller; and which action a service's read serves is only known at runtime. The typed way hands such code the input class, and the reads a feature test reaches are still recorded in the action's Contract when it has one ([P-024](#p-024)). The Base Kit's undeclared Fortify actions (logout, disabling two-factor authentication, resending the verification email, regenerating recovery codes) take no payload.

### P-128

**A model key in an input class is a plain number, so another model's key type-checks**

- **Type Boundary:** form payloads
- **Source:** found porting Tracklane's Issues area into the Testbed App (#24)
- **Upstream:** none
- **Status:** closed

**Reproduction:** the Testbed App's bulk action `BulkUpdateIssuesData` takes `/** @var list<int> */ array $ids`, the issues' primary keys, and is generated `ids: number[]`. In `pages/issues/index.tsx`, collecting the selection from `issue.number` (the per-project number, `RouteKey<'Issue', number>`) instead of `issue.id` still type-checks: the brand is assignable to `number`. The server only checks that each value is the id of *some* issue in the workspace, so in production, where tables share one id range, the request can update other issues than the ones selected; in feature tests the disjoint id ranges ([P-116](#p-116)) usually turn it into a validation error instead. The same holds for every key an input carries: `StoreIssueData.assigneeId`, `labelIds`, `cycleId`, `parentId`. [P-003](#p-003)'s brands don't help, for two reasons: input and query classes are never branded, because they hold what the user sent, and only a binding field a route uses gets a brand (`Issue` binds `{issue}` by `number`, so an issue's `id` has none, not even on `IssueListItemData`).

**Manual workaround:** name the field after the model it belongs to and check the call sites in review; the input's `exists` rules (`App\Rules\WorkspaceRules`) at least reject keys that belong to no row of the workspace.

**Closed by:** model keys branded by their model and field (ADR-0009). A Data property declared [`#[KeyOf(User::class)]`](../packages/laravel/src/Data/KeyOf.php), in an input, query or output class, is generated as `Key<'User', 'id', number>` from the npm package's [`routes` types](../packages/npm/routes/index.d.ts) (per item for a list; `#[KeyOf(Issue::class, 'number')]` for a key by another field than the primary key). A Data class built from a model brands its own primary key the same way, and the fields its routes bind it by ([P-003](#p-003)), so `issue.id` is `Key<'Issue', 'id', number>` and `issue.number` is `Key<'Issue', 'number', number>` ([`RouteKeys`](../packages/laravel/src/Routes/RouteKeys.php), [`RouteKeyTypes`](../packages/laravel/src/TypeScript/RouteKeyTypes.php)). Filling a bulk action's `#[KeyOf(Issue::class)] $ids` from the issues' numbers fails `tsc` with `error TS2322: Type 'number & { readonly [keyOf]: "Issue.number"; }' is not assignable to type 'number & { readonly [keyOf]: "Issue.id"; }'.`, and an issue's id for a `#[KeyOf(User::class)]` assignee with TS2345. The PHPStan rule `strictly.keyOf` ([`KeyOfRule`](../packages/laravel/src/PHPStan/KeyOfRule.php)) makes the attribute required on every property of a Data class named `…Id`, `…Ids`, `…_id` or `…_ids` or validated by an `exists` rule (in `rules()`, or laravel-data's `#[Exists]`), except the class's own primary key: `App\Data\BulkUpdateIssuesData::$ids is validated by an exists rule but declares no model, so TypeScript takes any value for it: another model's key, or another field's, fits.` A value that is no model's key takes a suppression with a reason. Contracts check a key as its plain value, and the feature tests check every key the server sends exists ([P-116](#p-116)). The Testbed App's inputs (`BulkUpdateIssuesData.ids`, `StoreIssueData.projectId`, `assigneeId`, `labelIds`, `cycleId`, `parentId`, and the rest the rule found) declare their models, and its selects look their value up among the options' keys (`selectedKey()`) instead of `Number(value)`. What the rule can't see is [P-157](#p-157). Scenarios: `model-keys-typed-from-output-to-input-passes`, `model-key-of-another-field-fails-tsc`, `model-key-of-another-model-fails-tsc`, `model-key-undeclared-fails-phpstan`.

### P-157

**A model key named unlike one and validated by no `exists` rule needs no `#[KeyOf]`**

- **Type Boundary:** form payloads
- **Source:** issue #39
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** an input with `public ?int $assignee` (no `Id` suffix) whose only check is a closure rule, or an output Data class with `public int $owner` holding a user's id, or a parent input whose `rules()` validate a nested class's key (`'tasks.*.ownerId' => ['exists:users,id']`) while the nested class names it `owner`. PHPStan's `strictly.keyOf` doesn't ask for `#[KeyOf]`, so the property stays a plain number in TypeScript and any other key fits, as in [P-128](#p-128).

**Manual workaround:** name a key property after its model with the `Id` suffix (`assigneeId`), or declare `#[KeyOf]` on it anyway.

**Reasoning:** the rule only knows a value is a key from its name or its `exists` rule. Guessing further (from the property's type, its model's relations or a custom rule's code) would raise false alarms on every count and amount, and the maintainer decided against name-based guessing beyond the suffixes (issue #39). The naming convention the rule enforces is the Laravel default for foreign keys.


### P-025

**Vendor controllers' payloads have no Source of Truth**

- **Type Boundary:** form payloads
- **Source:** overview §2; type-safety rule 13
- **Upstream:** none
- **Status:** closed

**Reproduction:** Fortify's login, register and 2FA controllers take no input Data class, so their payloads are hand-written. The Reference Implementation's declarations missed `remember` on register and `force` on enabling 2FA until the input Contracts caught them.

**Manual workaround:** declare the payload per vendor action in `config/types.php` (`route_inputs`: `Controller@method => Data class`, or a `QueryData` class for a GET). Tests submit the forms; every key the vendor validates, reports an error for or reads must be a field of the declaration, and Contract Coverage fails on a declared field never validated or read.

**Closed by:** vendor declarations ([`VendorDeclarations`](../packages/laravel/src/Routes/VendorDeclarations.php)) in the app's `config/strictly.php`, keyed by action: `vendor_inputs` names an input class for a vendor action (`AuthenticatedSessionController::class.'@store' => LoginData::class`) and `vendor_queries` a query class for a vendor GET. [`RouteInput`](../packages/laravel/src/Routes/RouteInput.php) and [`RouteQuery`](../packages/laravel/src/Routes/RouteQuery.php) read them before the action's own parameters, so the route is branded with them as an app action is (`<TypedForm {...store.form()}>`, `submit(store(), data)`, `reset(token, { query: { email } })`), and its requests are recorded and covered as a form endpoint's. The declarations are verified, not trusted:

- one naming an action no route runs, or a class that doesn't exist (spelled exactly: PHP class names ignore case, autoloading doesn't), can't be loaded or doesn't extend `InputData` or `QueryData`, fails `strictly:generate`;
- every key the vendor validates, reads or reports an error for during a feature test must be a field of the declared input (the `form` Contract of [P-024](#p-024), [P-029](#p-029) and [P-113](#p-113)): `Type '"remember"' is not assignable to type '"name" | "email" | "password" | "password_confirmation"'.` That includes reads through the vendor's own FormRequest (Fortify's `LoginRequest`), which [`InputReads`](../packages/laravel/src/Testing/InputReads.php) has the container build as a subclass that reports them ([`TracksInputReads`](../packages/laravel/src/Testing/TracksInputReads.php)); a final one can't be tracked ([P-026](#p-026));
- a GET to a route with a query class, declared or the action's own, records the query keys it validated and read as a `query` Contract (`__contracts__/_queries/`) checked against the class;
- Contract Coverage reports a declared field no test saw the vendor use ([`ContractCoverage`](../packages/laravel/src/Coverage/ContractCoverage.php)): `✗ LoginData.nickname is declared for a vendor action that never uses it (at POST /login): add a feature test that submits to POST /login with nickname, or remove it from the declaration in config/strictly.php if … doesn't validate or read it.`

`strictly:install` publishes `config/strictly.php` with the Base Kit's Fortify declarations ([`stubs/strictly.php`](../packages/laravel/stubs/strictly.php); the package's merged defaults declare nothing), and Kit Conversion adds their classes under `App\Data\Auth`, with the Reference Implementation's two findings declared: `remember` on registration and `force` on enabling two-factor authentication, both `bool|Optional`. Its `tests/Feature/ContractCoverageTest.php` submits to the Fortify actions the Base Kit's tests don't (password confirmation, the two-factor challenge, enabling and confirming two-factor authentication) and opens the password reset link with its `email`. Not declared: the passkey routes, whose requests Laravel Passkeys' own client sends, and the Fortify actions that take no payload (logout, disabling two-factor authentication, resending the verification email, regenerating recovery codes), whose reads are checked by nothing ([P-168](#p-168)). Scenarios: `vendor-input-declared-passes`, `vendor-input-undeclared-read-fails-contract`, `vendor-input-undeclared-force-fails-contract`, `vendor-form-wrong-field-fails-tsc`, `vendor-input-field-never-used-fails-coverage`, `vendor-request-reads-declared-key-passes`, `vendor-request-reads-undeclared-key-fails-contract`, `vendor-query-declared-passes`, `vendor-query-key-misspelled-fails-tsc`, `vendor-query-undeclared-read-fails-contract`, `vendor-declaration-unknown-class-fails-generate`, `vendor-declaration-unloadable-class-fails-generate`.

### P-026

**Input reads are seen per key**

- **Type Boundary:** form payloads
- **Source:** overview §5; type-safety "Remaining gaps"; spec "Accepted gaps"
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** an action reading the whole input (`$request->all()['notify']`, `$request->input()['notify']`, `collect($request->all())`, `except('name')`, `$request->request->get('notify')`) names no field, so a key read that way and missing from the input type isn't detected; the same holds for a vendor action's declared payload ([P-025](#p-025)), where a `final` vendor FormRequest can't be tracked at all. Reads in code paths no test reaches aren't seen. Framework plumbing is ignored on purpose: keys starting with `_` (the CSRF token, `_method`), the paginators' `page` and `cursor`, and laravel-data's `include`, `exclude`, `only` and `except` response partials.

**Manual workaround:** read the input through the input class (`$data->notify`), never through the request; a vendor field read that way must also be validated, or Contract Coverage reports it as never used.

**Reasoning:** reads are recorded through the request's accessors ([`TrackedRequest`](../packages/laravel/src/Testing/TrackedRequest.php), [P-024](#p-024)), so a read that names no key can't be attributed to a field. The typed way doesn't read the request at all (the input class is the payload), so the gap only bites code that bypasses it, and in vendor code a field read that way must still be validated or Contract Coverage fails.

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
- **Status:** closed

**Reproduction:** the Base Kit's `<Form {...ProfileController.update.form()}>` has no type argument, so the names of its controls and the `errors` its render prop gives (`string` per any key) are untied to the action's rules: `errors.nmae` compiles. The route-typed helpers (`useRouteForm`, `submit`, `visit`) and the `strictly/typed-requests` lint rule don't cover the component.

**Manual workaround:** the Reference Implementation's headless `<TypedForm {...store.form()}>` with a `field()` render prop, and its lint rule rejecting an untyped `<Form>`.

**Closed by:** [`<TypedForm {...route.form()}>`](../packages/npm/react/index.d.ts) (`@mrsafalpiya/strictly-laravel/react`), Inertia's `<Form>` typed by the input Data class the route is branded with ([P-014](#p-014)): its render prop's `field()` takes only the input's field paths (nested and list ones too) and returns a `FieldName` ([P-015](#p-015)), and its `errors`, `resetOnSuccess`, `resetOnError` and `onError` are keyed by them, so a misspelled field or error key fails `tsc`. A route whose action takes no input gets a form without fields. The oxlint rule `strictly/typed-forms` rejects importing Inertia's `<Form>`. Kit Conversion turns the Base Kit's settings actions into input classes (`ProfileUpdateData`, `ProfileDeleteData`, `PasswordUpdateData`) and every Base Kit form into a `<TypedForm>`; the Fortify-backed ones take theirs from the payloads `config/strictly.php` declares for Fortify's actions ([P-025](#p-025), [P-100](#p-100)). Scenarios: `typed-form-passes`, `typed-form-wrong-field-fails-tsc`, `typed-form-wrong-error-key-fails-tsc`, `inertia-form-fails-lint`.

### P-100

**A form to a route without an input brand names its payload by hand**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-096](#p-096)
- **Upstream:** none
- **Status:** closed

**Reproduction:** Fortify's routes have no input class ([P-025](#p-025)), and a closure route's input isn't branded ([P-097](#p-097)), so `<TypedForm {...store.form()}>` for them has no fields. Its payload can be given as a type argument instead, which nothing checks against what the server validates: `<TypedForm<LoginData> {...store.form()}>` compiles with any Data class, and so does `<TypedForm<OtherData> {...update.form()}>` on a branded route whenever `OtherData` has a subset of its input's fields. The Base Kit's auth and two-factor forms do this after Kit Conversion (`App\Data\Auth\*Data`). The validation-error Contracts don't cover such a form either: its route isn't a form endpoint.

**Manual workaround:** keep each hand-named payload class next to the vendor action it describes and check it against the vendor's rules by reading them.

**Closed by:** the oxlint rule `strictly/typed-forms` rejects a type argument on `<TypedForm>` or an alias of it (`` `<TypedForm>`'s payload comes from the route it submits to: drop the type argument. `` …), so a form's payload, field names and error keys always come from its route's brand. A vendor route gets its brand from the payload `config/strictly.php` declares for its action ([P-025](#p-025)), so Kit Conversion's Fortify forms (login, registration, password reset and confirmation, the two-factor challenge and setup) drop their type arguments, and their routes are form endpoints whose validation errors, validated fields and reads are Contracts. A closure route can't take an input class, so its form has none to type ([P-097](#p-097)). Scenarios: `vendor-form-typed-by-declaration-passes`, `typed-form-type-argument-fails-lint`.

### P-097

**A closure route's input isn't on its route type**

- **Type Boundary:** form payloads
- **Source:** found while closing [P-014](#p-014)
- **Upstream:** none (Wayfinder gives its templates the controller and method, not the route's closure)
- **Status:** closed

**Reproduction:** `Route::post('projects', fn (StoreProjectData $data) => …)->name('projects.store')`: the generated `@/routes/projects` `store()` has no `WithInput` brand, so `useRouteForm(store(), …)` is refused as taking no input and `visit(store())` compiles, sending no payload. The PHPStan rule `strictly.inputData` checks controller actions only, so a plain Data class in such a closure isn't rejected either. The validation-error Contracts and the form-endpoint coverage do see the closure.

**Manual workaround:** take inputs in controller actions only.

**Closed by:** the PHPStan rule `strictly.closureRoute` ([`ClosureRouteRule`](../packages/laravel/src/PHPStan/ClosureRouteRule.php)) rejects a closure route that takes an input class, or any other Data class: `The closure route POST projects takes App\Data\StoreProjectData, an input class, but Wayfinder types a route function's payload only from a controller action: no typed form can send it.` Its tip says to move the route to a controller action, whose input class brands the route function. A closure route is a closure written as the action of `Route::get/post/put/patch/delete/options/any/match()`, on the facade, the router or a route registrar (`Route::middleware('auth')->post(…)`); [`RouteClosure`](../packages/laravel/src/PHPStan/RouteClosure.php) finds it, and also tells `strictly.inputRead` and `strictly.queryRead` when a read is inside one ([P-151](#p-151), [P-167](#p-167)). A route a test registers (where `$this` is a PHPUnit `TestCase`, as in a Pest test) is left alone: it exists only while the test runs, so no route function is generated for it, and a test route taking an input class is how a feature test checks the class's validation. A closure route the rule can't see as one isn't checked: [P-171](#p-171). Scenarios: `closure-routes-without-data-classes-pass`, `input-class-in-closure-route-fails-phpstan`.

## Validation errors

### P-028

**Client-side error keys are not tied to the input type**

- **Type Boundary:** validation errors
- **Source:** ecosystem A.3 and C; eval-02 §5
- **Upstream:** none
- **Status:** closed

**Reproduction:** the Base Kit reads `errors.name` from an untyped `<Form>` render prop (`string` per any key), so `errors.nmae` and `errors['tasks.0.titel']` compile.

**Manual workaround:** errors keyed by the input type's fields, including nested and array keys (`errors['settings.notifications.onAssign']`, `tasks.0.title`), through `useRouteForm`/`<TypedForm>`/`submit()` ([P-014](#p-014)).

**Closed by:** `useRouteForm()`'s `errors` and the `onError` of `useRouteForm().submit()` and `submit()` are `ErrorsOf<Input>`, keyed by every field path of the route's input, nested and list ones included (`settings.notifyOnAssign`, `tasks.0.title`; [`InputKey`](../packages/npm/routes/index.d.ts)), so a misspelled error key fails `tsc`. So are the errors of `<TypedForm>`'s render prop ([P-096](#p-096)). Scenarios: `route-typed-requests-pass`, `route-form-wrong-error-key-fails-tsc`.

### P-029

**The server can return error keys that aren't fields**

- **Type Boundary:** validation errors
- **Source:** overview §2 and §5; type-safety rule 13
- **Upstream:** none
- **Status:** closed

**Reproduction:** `throw ValidationException::withMessages(['project' => 'still has issues'])` from an action whose input has no `project` field: the client's typed `errors` never shows it.

**Manual workaround:** the validation Contract `errors satisfies InputKey<StoreIssueData>[]` fails on any key that isn't a field; refusals that aren't about a field are error toasts (`Flash::error('…'); return back();`).

**Closed by:** every request a feature test sends to a form endpoint (a route whose action takes an InputData) is recorded, and the validation errors it is refused with, flashed before a redirect or in a 422 JSON response, become a Contract, `export const errors = {…} satisfies ErrorsOf<StoreProjectData>`, which fails `tsc` on a key that isn't a field of the input ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php)). A refusal that isn't about a field is an error toast through the flash Data class (`FlashData::toast(ToastType::Error, …)`, [P-047](#p-047)). The same `form` Contract checks the fields the server validated and the input keys the action read ([P-113](#p-113), [P-024](#p-024)). Contract Coverage fails on a form endpoint no feature test submits to ([`ContractCoverage`](../packages/laravel/src/Coverage/ContractCoverage.php), scenario `form-endpoint-no-test-submits-fails-coverage`). Scenarios: `validation-errors-are-input-fields-pass-contract`, `error-key-not-an-input-field-fails-contract`.

### P-030

**Validation runs before authorization**

- **Type Boundary:** validation errors
- **Source:** overview §2 and §4; eval-02 §5; type-safety rule 11
- **Upstream:** no upstream issue filed (laravel-data's `authorize()` hook is opt-in)
- **Status:** closed

**Reproduction:** an action type-hinting an input Data class and calling `Gate::authorize()` in its body: a user without the ability submits invalid data and gets a 422 listing the fields instead of a 403.

**Manual workaround:** `public static function authorize(): bool` on the input class, which laravel-data runs before validation (`AuthorizedDataPipe`).

**Closed by:** laravel-data runs an input's `authorize()` before validation; the PHPStan rule `strictly.authorizeInInput` ([`AuthorizeInInputRule`](../packages/laravel/src/PHPStan/AuthorizeInInputRule.php)) rejects a controller action that takes an InputData and authorizes in its body instead (`Gate::authorize()`, `allowIf()`, `denyIf()`, `$this->authorize()`, `abort(403)`, `abort_if(…, 403)`, `abort_unless(…, 403)`). Matching is syntactic ([P-070](#p-070)). Scenarios: `unauthorized-input-gets-403-passes`, `authorize-in-action-body-fails-phpstan`.

### P-126

**An input's `authorize()` reads the route's models untyped**

- **Type Boundary:** validation errors
- **Source:** found porting Tracklane's Workspaces area into the Testbed App (#23)
- **Upstream:** by design (laravel-data calls `authorize()` through the container, which knows nothing of the route's bound parameters)
- **Status:** closed

**Reproduction:** changing a member's role is allowed per row (only owners touch owners, nobody demotes the last owner), so the check needs the `{membership}` the route binds. [P-030](#p-030) puts it in `UpdateMemberData::authorize()`, whose parameters are resolved from the container: `Membership $membership` there is a new, empty model, not the route's. The method has to read `$request->route('membership')`, which is `mixed`, and narrow it with `instanceof` (the Testbed App's `app/Data/Members/UpdateMemberData.php`). `rules()` has the same limit (`UpdateLabelData::rules()` reads `request()->route('label')`). Editing a comment is another: only its author may (`CommentPolicy::update`), so `UpdateCommentData::authorize()` reads `$request->route('comment')` the same way.

**Manual workaround:** take `Request $request` in `authorize()`, read the parameter with `$request->route('name')` and check it with `instanceof` before use.

**Closed by:** an InputData's `authorize()` and `rules()` (a nested InputData's `rules()` too) receive, for each parameter typed as a model (any `UrlRoutable`), the model the current route binds to the parameter of the same name; every other parameter still resolves through the container ([`RouteModelArguments`](../packages/laravel/src/Workarounds/LaravelData/RouteModelArguments.php), called by InputData's pipeline in place of laravel-data's `AuthorizedDataPipe` and by the `DataValidationRulesResolver` the service provider binds). It never falls back to an empty model: a parameter the route has no parameter of that name for, a route parameter left unbound (the action doesn't take the model, so it stays the raw key), or a call outside a request's route (`validate()` from a command or a unit test, [P-155](#p-155)) throws a `LogicException` naming the parameter and the route; a nullable parameter receives `null` for an optional route parameter the URL left out. The PHPStan rule `strictly.routeModelParameter` ([`RouteModelParameterRule`](../packages/laravel/src/PHPStan/RouteModelParameterRule.php)) rejects a model parameter of `authorize()` or `rules()` on any other Data class (a query class, a plain Data class), where it would still be a new, empty model. The Testbed App's `UpdateMemberData`, `UpdateCommentData`, `UpdateIssueData` and `UpdateLabelData` take the models as parameters. Scenarios: `bound-models-in-input-authorize-and-rules-passes`, `input-model-parameter-not-on-route-fails-test`, `model-parameter-in-query-rules-fails-phpstan`.

### P-155

**An input whose `rules()` take a route model is validated only through its route**

- **Type Boundary:** validation errors
- **Source:** found while closing [P-126](#p-126)
- **Upstream:** by design (laravel-data's `validate()` and `validateAndCreate()` take only the payload)
- **Status:** accepted gap

**Reproduction:** `UpdateLabelData::rules(Label $label)` gets the route's `{label}`. Validating that input outside a request to its route, with `UpdateLabelData::validate($payload)` from a command, a queued job or a unit test, has no route to take the label from, so it throws `…::rules() takes App\Models\Label $label, the model the current route binds to {label}, but there is no current route.` An input without model parameters validates anywhere, as before.

**Manual workaround:** validate the input through a request to its route (a feature test). Where the same rules are needed elsewhere, put them in a static method that takes the model and call it from both `rules()` and the other caller.

**Reasoning:** laravel-data gives `validate()` no way to pass the model, and falling back to an empty one is what P-126 removed. Inputs are validated by the request that carries them, and that path has the route.

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

**Closed by:** `enumValues` in `@/generated`, every backed enum's values in case order, string- and int-backed, typed as the enum ([`packages/laravel/src/TypeScript/EnumValuesProvider.php`](../packages/laravel/src/TypeScript/EnumValuesProvider.php)). `tsc` rejects the cast for an int-backed enum; for a string-backed one it still compiles, and the lint step rejects it as a type assertion ([P-068](#p-068)). Scenarios: `enum-values-in-case-order-pass`, `enum-keys-cast-fails-tsc`.

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
- **Status:** accepted gap

**Reproduction:** `$issue->project` for a non-nullable foreign key is `Project|null` to PHPStan, so `ProjectData::fromModel($issue->project)` is an error at level max, pushing code towards `?->` and nullable Data properties that don't match the data.

**Manual workaround:** declare non-nullable relations on the model: `@property-read Project $project`.

**Reasoning:** Larastan types `BelongsTo` as nullable on purpose: a related row can be missing even when the foreign key column is `NOT NULL`, for example without a database constraint or when the relation was loaded without its columns. Overriding that would make PHPStan trust data it can't see. The workaround is one PHPDoc line per relation and is standard Laravel practice, so the Overlay teaches it in its Boost core guideline instead of changing Larastan's types.

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
- **Source:** overview §2 and §4; the template's `UnwrapInertiaPropsVisitor`
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
- **Status:** closed

**Reproduction:** `Inertia::scroll($paginator)` sends the paginator's own flat JSON, while a paginator inside a Data class is typed `{ data, links, meta }`; the infinite-scroll prop's type is wrong.

**Manual workaround:** `/** @var ScrollProp<CursorPaginatedDataCollection<array-key, X>> */ public ScrollProp $items` with `new ScrollProp(X::collect($cursorPaginator, CursorPaginatedDataCollection::class), …)` (type-safety rule 10).

**Closed by:** the existing checks, proven to catch both ways of sending a raw paginator from a Page class. Filling a `ScrollProp<PaginatedDataCollection<…>>` property with `Inertia::scroll($paginator)` fails PHPStan, since the facade returns `ScrollProp<mixed>` (`… Inertia\ScrollProp<mixed> given.`), and so does `new ScrollProp($paginator)` (`… Inertia\ScrollProp<Illuminate\Pagination\LengthAwarePaginator<…>> given.`). Typing the property as the raw paginator instead (`ScrollProp<LengthAwarePaginator<int, X>>`) passes PHPStan, but its generated type is `{ data, links, meta }`, so the Contract of the feature test that renders the page fails `tsc` on the flat keys (`'"current_page"' does not exist in type …`), and Contract Coverage makes sure some test renders it. The typed way is unchanged. Scenarios: `inertia-scroll-into-typed-scroll-prop-fails-phpstan`, `scroll-prop-of-raw-paginator-fails-contract`, `scroll-prop-typed-as-its-items-passes`, `scroll-prop-every-item-shape-passes-coverage`.

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
- **Status:** accepted gap

**Reproduction:** a prop built with `Lazy::closure()` or marked `defaultIncluded` is always sent but generated as `prop?: X`, so every component must handle an `undefined` that never happens.

**Manual workaround:** declare a prop that is always sent as a plain property (`public StatsData $stats`), not `Lazy|StatsData`; use `Lazy` only with `Lazy::inertia()` or `Lazy::inertiaDeferred()`, for props that can be missing.

**Reasoning:** the generator types a `Lazy|X` property from its declared type, and the variants that are always sent differ only in how the value is built, so it can't tell them apart. The resulting type is looser than the data, never stricter: components handle an `undefined` that doesn't happen, but no wrong value gets through. The always-sent case already has a typed path, the plain property, which the deferred-props Boost skill teaches.

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

### P-133

**Contract Coverage doesn't look inside an infinite-scroll prop**

- **Type Boundary:** pagination and deferred props
- **Source:** found porting Tracklane's activity feed into the Testbed App (#25)
- **Upstream:** none (laravel-data describes a `ScrollProp` property as an object it knows nothing about)
- **Status:** closed

**Reproduction:** the activity feed page sends `/** @var ScrollProp<CursorPaginatedDataCollection<array-key, ActivityData>> */ public ScrollProp $activity`, generated as the paginated collection it wraps ([P-041](#p-041)). Contract Coverage reads a property's shape from laravel-data's description, which sees a `ScrollProp` and no Data class inside it, so it never walks the items: a test that renders the feed with only one kind of entry, or with only an empty feed, passes `strictly:coverage --strict`, and so does an item field only ever `null`, although `tsc` never saw the other shapes.

**Manual workaround:** none; render the same Data class in a prop Contract Coverage does walk.

**Closed by:** [`WrappedProp`](../packages/laravel/src/Coverage/WrappedProp.php) reads the Data class inside a `ScrollProp`, `MergeProp` or `OnceProp` prop from its PHPDoc type, the one its TypeScript type is generated from, and [`ShapeCoverage`](../packages/laravel/src/Coverage/ShapeCoverage.php) walks the prop as what Inertia sends: a paginated collection's `data`, a list, or one Data object. An infinite-scroll prop only ever empty, or an item field only ever `null`, is now a gap: `✗ EntryData.note is only ever null (at feed › entries[].note): …`. Scenarios: `scroll-prop-every-item-shape-passes-coverage`, `scroll-prop-item-only-null-fails-coverage`. The Testbed App's activity feed is such a prop.

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
- **Status:** closed

**Reproduction:** `useHttp<{ q: string }, SearchResults>()` takes whatever types are named; the Base Kit's `use-two-factor-auth.ts` calls `useHttp` for JSON with hand-written shapes. Nothing ties them to the controller.

**Manual workaround:** a JSON action returns a Data object (`: SearchResultsData`); the route is branded with it (`RouteTypes::brands`), and `useRouteHttp(search(workspace), { q: null })` derives request and response from the route.

**Closed by:** a JSON endpoint is a controller action whose return type is a Data class that isn't a Page class, `public function search(SearchQueryData $data): SearchResultsData` ([`RouteResponse`](../packages/laravel/src/Routes/RouteResponse.php)). The Wayfinder template override brands its route functions with it as well as with the input ([`WayfinderTemplates`](../packages/laravel/src/Routes/WayfinderTemplates.php)): `search(): RouteDefinition<'post'> & WithInput<SearchQueryData> & WithResponse<SearchResultsData>` ([`@mrsafalpiya/strictly-laravel/routes`](../packages/npm/routes/index.d.ts)). `useRouteHttp(route, init)` ([`@mrsafalpiya/strictly-laravel/react`](../packages/npm/react/index.d.ts)) takes the request data from the route's input (`useRouteHttp(stats())` when the action takes none) and types `response` and the result of `submit()` with the response, so a wrong field fails `tsc`; a route whose action declares no Data class response, a plain `JsonResponse` for instance, types it `unknown`, which must be checked before it is read. The `strictly/typed-requests` lint rule rejects Inertia's `useHttp()`. Every successful response a feature test gets from a JSON endpoint is recorded as a Contract, `export const response = {…} satisfies Contract<SearchResultsData>` ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php)), and Contract Coverage fails on a JSON endpoint no test calls and observes the shapes of the responses ([`ContractCoverage`](../packages/laravel/src/Coverage/ContractCoverage.php), at `POST /search › hits`). Fortify's two-factor endpoints are typed by the responses `config/strictly.php` declares for them ([P-050](#p-050)), so Kit Conversion moves the Base Kit's `use-two-factor-auth.ts` to `useRouteHttp()`. An action that answers JSON through anything but one Data class (a list, a collection, a nullable or union type) fails PHPStan: [P-108](#p-108); a JSON response the action builds itself stays `unknown`: [P-180](#p-180). A closure route can't return a Data class: [P-109](#p-109); one that answers JSON without a Data class isn't checked: [P-179](#p-179). Scenarios: `json-endpoint-typed-passes`, `json-response-wrong-field-fails-tsc`, `json-response-undeclared-is-unknown-fails-tsc`, `inertia-use-http-fails-lint`, `json-response-around-the-data-class-fails-contract`, `json-endpoint-no-test-calls-fails-coverage`, `json-response-list-only-empty-fails-coverage`.

### P-049

**`useHttp` resolves `undefined` on a 422 despite `Promise<T>`**

- **Type Boundary:** JSON endpoints
- **Source:** overview §4; Tracklane's `use-search` hook
- **Upstream:** behaviour introduced by [inertiajs/inertia#3142](https://github.com/inertiajs/inertia/pull/3142) (`return undefined as TResponse`); no upstream issue filed for the return type
- **Status:** closed

**Reproduction:** `const results = await http.submit()` with a query the server rejects: `results` is `undefined` while typed `SearchResultsData`.

**Manual workaround:** read results from `http.response` and errors from `http.errors`, never from the resolved value.

**Closed by:** `useRouteHttp(route, init).submit()` ([`@mrsafalpiya/strictly-laravel/react`](../packages/npm/react/index.js)) resolves with `{ ok: true, response }` or, on a 422, with `{ ok: false, errors }`, the validation errors keyed by the route's input (`ErrorsOf<SearchQueryData>`), which Inertia reports through `onError` before it resolves `undefined`; any other failure still rejects. Reading `result.response` before checking `result.ok` fails `tsc`, and so does an error key the input doesn't have. The npm package's tests (`packages/npm/tests/http.test.ts`) send it a 201, a 422 and a 500. Scenarios: `json-refusal-read-as-errors-passes`, `json-refusal-read-as-response-fails-tsc`, `json-refusal-wrong-error-key-fails-tsc`.

### P-108

**A JSON endpoint that returns a list of Data objects has no response type**

- **Type Boundary:** JSON endpoints
- **Source:** found while closing [P-048](#p-048)
- **Upstream:** none
- **Status:** closed

**Reproduction:** `public function recent(): array` with `@return list<ProjectData>`, or a `DataCollection` / `PaginatedDataCollection` return type: the PHP return type doesn't name a Data class, so the route isn't branded, `useRouteHttp(recent())` types the result `unknown`, no Contract records its responses and Contract Coverage doesn't list it. The same holds for a nullable or union return type (`?ProjectData`).

**Manual workaround:** return one Data class that holds the list (`RecentProjectsData` with `@param list<ProjectData> $projects`).

**Closed by:** the PHPStan rule `strictly.jsonResponse` ([`JsonResponseRule`](../packages/laravel/src/PHPStan/JsonResponseRule.php)) rejects a controller action whose native return type is something Laravel answers as JSON with no Data class (`array` or `iterable`, a `@return list<ProjectData>` included, a Collection, laravel-data's `DataCollection`, `PaginatedDataCollection` and `CursorPaginatedDataCollection`, a paginator, a model or an API resource: anything `Arrayable`, `Jsonable` or `JsonSerializable` that isn't a Data class), `App\Http\Controllers\ProjectController::recent() returns array, which Laravel sends as JSON that nothing types: useRouteHttp() types the route's response unknown, and no Contract checks it.`, and one that returns a nullable Data class or a union holding one (`?ProjectData`, `ProjectData|RedirectResponse`), `… returns App\Data\ProjectData|null, a nullable or union type, which declares no response: …`. Its tip says to return one Data class that holds the value (`RecentProjectsData` with a `list<ProjectData>` property), which is a JSON endpoint like any other: its route is branded, its responses are recorded as Contracts and Contract Coverage sees the list filled. Page classes (on their own, nullable or in a union), redirects, `Response`, downloads and `void` stay allowed, and so does a `JsonResponse`, JSON the action builds itself ([P-180](#p-180)). A closure route returning such JSON isn't checked: [P-179](#p-179). The PHPStan rule-test kit covers each rejected and allowed return type. Scenarios: `json-endpoint-returning-list-fails-phpstan`, `json-endpoint-returning-nullable-data-fails-phpstan`, `json-endpoint-returning-wrapped-list-passes`.

### P-109

**A closure route's response isn't on its route type**

- **Type Boundary:** JSON endpoints
- **Source:** found while closing [P-048](#p-048), like [P-097](#p-097) for inputs
- **Upstream:** none (Wayfinder gives its templates the controller and method, not the route's closure)
- **Status:** closed

**Reproduction:** `Route::get('stats', fn (): StatsData => …)->name('stats')`: the generated `@/routes` `stats()` has no `WithResponse` brand, so `useRouteHttp(stats())` types the result `unknown`. The JSON Contracts and the JSON-endpoint coverage do see the closure.

**Manual workaround:** return JSON from controller actions only.

**Closed by:** `strictly.closureRoute` ([P-097](#p-097)) also rejects a closure route whose return type, declared or inferred, is a Data class other than a Page class (a closure route may still render a page): `The closure route GET stats returns App\Data\StatsData, but Wayfinder types a route function's response only from a controller action: useRouteHttp() types its result unknown.` Scenarios: `closure-routes-without-data-classes-pass` (a controller action returns the Data class), `data-response-from-closure-route-fails-phpstan`.

### P-179

**A closure route that answers JSON without a Data class isn't rejected**

- **Type Boundary:** JSON endpoints
- **Source:** found while closing [P-108](#p-108)
- **Upstream:** none
- **Status:** open

**Reproduction:** `Route::get('projects/recent', fn (): array => Project::query()->latest()->take(5)->get()->all())`: Laravel answers the array as JSON, but `strictly.jsonResponse` checks controller actions only, so the route function's response is `unknown`, no Contract records it and Contract Coverage doesn't list it, without a word. A closure route returning a Data class fails `strictly.closureRoute` ([P-109](#p-109)), but its check stops at Data classes.

**Manual workaround:** return JSON from controller actions only, as one Data class.

### P-180

**JSON an action builds itself has no response type**

- **Type Boundary:** JSON endpoints
- **Source:** found while closing [P-108](#p-108)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `public function health(): JsonResponse { return response()->json(['status' => 'ok']); }`, or a `Responsable` whose `toResponse()` builds JSON, or a `mixed` return type: the route isn't branded, so `useRouteHttp(health())` types the result `unknown`; no Contract records the response and Contract Coverage doesn't list the route.

**Manual workaround:** return one Data class instead; where the JSON must stay untyped, narrow the `unknown` result before reading it, which `tsc` enforces.

**Reasoning:** a `JsonResponse` is the explicit way to answer JSON no Data class describes (a health check, a payload a third party dictates), and the client already can't read it without narrowing, so it fails loudly rather than silently. Rejecting it would leave such endpoints only a suppression; what `strictly.jsonResponse` rejects are the return types that look typed in PHP (`list<ProjectData>`, `?ProjectData`) yet reach the client as `unknown` ([P-108](#p-108)).

### P-050

**Vendor JSON endpoints have no Source of Truth**

- **Type Boundary:** JSON endpoints
- **Source:** overview §2; type-safety rule 14
- **Upstream:** none
- **Status:** closed

**Reproduction:** Fortify's 2FA QR code, secret key and recovery-code endpoints return JSON from controllers the app doesn't own; the Base Kit types them by hand (`TwoFactorSetupData`).

**Manual workaround:** declare the response per vendor action in `config/types.php` (`route_responses`: a Data class, or a TypeScript type such as `'{ svg: string; url: string } | []'`); tests check every response against it, and Contract Coverage fails on a declared endpoint never called.

**Closed by:** `vendor_responses` in `config/strictly.php` declares a vendor JSON endpoint's response per action, a Data class or, for JSON that isn't one object, a TypeScript type (`TwoFactorQrCodeController::class.'@show' => '{ svg: string; url: string } | []'`). [`RouteResponse`](../packages/laravel/src/Routes/RouteResponse.php) reads the declaration before the action's return type, so the route is branded `WithResponse<…>` and `useRouteHttp(qrCode())` types its result: reading `svg` before ruling out `[]` fails `tsc`. Every successful response a feature test gets is recorded as a JSON Contract checked against the declaration, `satisfies Contract<{ svg: string; url: string } | []>` ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php)), so a declaration that doesn't match what the vendor sends fails `tsc`; Contract Coverage fails on a declared endpoint no test calls and observes the shapes of a Data class response (a TypeScript type's it can't: [P-051](#p-051)). A declared class that doesn't exist, or isn't a Data class, fails `strictly:generate`. The Base Kit's two-factor endpoints are declared (`App\Data\Auth\TwoFactorSecretKeyData` for the secret key, which Fortify always sends as one object, TypeScript types for the QR code and the recovery codes), and Kit Conversion moves `use-two-factor-auth.ts` from `useHttp()` and its casts to `useRouteHttp()`. Scenarios: `vendor-json-response-declared-passes`, `vendor-json-response-mismatch-fails-contract`, `vendor-json-typescript-response-mismatch-fails-contract`, `vendor-json-union-response-misread-fails-tsc`, `vendor-json-endpoint-no-test-calls-fails-coverage`.

### P-051

**Vendor JSON declared as a TypeScript type gets no shape coverage**

- **Type Boundary:** JSON endpoints
- **Source:** type-safety "Remaining gaps"; spec "Accepted gaps"
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `'{ svg: string; url: string } | []'` for the QR code endpoint, as the Base Kit's `config/strictly.php` declares it ([P-050](#p-050)): each recorded response is checked by `tsc`, but nothing reports a union member no test produced (no test sees the `[]`).

**Manual workaround:** none; prefer declaring a Data class where the JSON is one object.

**Reasoning:** Contract Coverage reads shapes from Data classes. Parsing arbitrary TypeScript types to enumerate their states would mean a TypeScript type analyser in PHP for the few vendor endpoints whose JSON isn't one object.

## Broadcasting

The Reference Implementation never exercised this Type Boundary, so these Problems had no recorded workaround beyond hand-typing. The Overlay builds on Laravel's own client, `@laravel/echo-react`, which `php artisan install:broadcasting` installs and configures for a React app; the Testbed App's real-time comments exercise it (spec user stories 44–46 and 76).

**The convention.** A broadcast event uses `StrictlyLaravel\Broadcasting\BroadcastsData` and returns its payload from `broadcastData()`, declaring the payload's Data class as the return type. `strictly:generate` writes `@/generated/broadcasting`: `BroadcastEvents` maps each event, by the name Echo listens for it (`CommentPosted` for `App\Events\CommentPosted`, `.comment.posted` for one whose `broadcastAs()` is `comment.posted`), to that Data class, and `BroadcastChannels` holds each channel `routes/channels.php` defines with its parameters. React listens with `useChannelEvent(channel('issues.{issue}', { issue }), 'CommentPosted', (comment) => …)`, both imported from that module.

### P-052

**Broadcast payloads are hand-typed and unverified**

- **Type Boundary:** broadcasting
- **Source:** spec user stories 44 and 46; ecosystem C ("Broadcast / env")
- **Upstream:** by design: `@laravel/echo-react` types a payload from a global `Events` interface the app writes by hand, and its `useEcho()` takes any type argument
- **Status:** closed

**Reproduction:** an event `CommentPosted implements ShouldBroadcast` returns `['id' => …, 'body' => …]` from `broadcastWith()`; the listener's payload is typed by hand, `useEcho(channel, 'CommentPosted', (e: { id: number; text: string }) => …)`, and compiles after the PHP keys change.

**Manual workaround:** hand-write the payload type next to the listener and keep it in sync.

**Closed by:** an event's payload is a Data class: it uses [`BroadcastsData`](../packages/laravel/src/Broadcasting/BroadcastsData.php), whose `broadcastWith()` sends what `broadcastData(): CommentData` returns. The PHPStan rule `strictly.broadcastData` ([`BroadcastDataRule`](../packages/laravel/src/PHPStan/BroadcastDataRule.php)) rejects a broadcast event that sends its payload any other way (public properties, its own `broadcastWith()` array, a `broadcastData()` that declares no single Data class): `Broadcast event App\Events\ProjectUpdated sends a payload that has no generated type.` `@/generated/broadcasting` maps the event to the Data class's generated type ([`BroadcastingModule`](../packages/laravel/src/Broadcasting/BroadcastingModule.php)), and `useChannelEvent()` ([`@mrsafalpiya/strictly-laravel/echo`](../packages/npm/echo/index.d.ts), a wrapper around `@laravel/echo-react`'s `useEcho()`) types the callback's payload with it, so reading a field it lacks fails `tsc`. The oxlint rule `strictly/typed-broadcasts` rejects Echo's untyped `useEcho()`, `useEchoPresence()` and `useEchoPublic()`. Every broadcast a feature test makes, from a request or not, is recorded as a Contract, `export const payload = {…} satisfies Contract<BroadcastEvents['ProjectUpdated']>` ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php)), and Contract Coverage fails on an event no test broadcasts and observes the payloads' shapes ([`ContractCoverage`](../packages/laravel/src/Coverage/ContractCoverage.php), at `broadcast ProjectUpdated › description`). Broadcast notifications and model broadcasts are read through an app event: [P-142](#p-142). ADR-0008. Scenarios: `broadcast-payload-typed-passes`, `broadcast-payload-field-misread-fails-tsc`, `broadcast-payload-without-data-class-fails-phpstan`, `broadcast-payload-around-the-data-class-fails-contract`, `broadcast-event-never-broadcast-fails-coverage`.

### P-053

**Broadcast event names are plain strings**

- **Type Boundary:** broadcasting
- **Source:** spec user story 45
- **Upstream:** by design: `useEcho()` has an overload that takes any string ([`@laravel/echo-react`](https://github.com/laravel/echo/tree/2.x/packages/react))
- **Status:** closed

**Reproduction:** `useEcho(channel, 'CommentPostd', cb)` or a stale name after `broadcastAs()` changes compiles and silently never fires.

**Manual workaround:** none; names are typed by hand.

**Closed by:** `BroadcastEvents` in `@/generated/broadcasting` is keyed by the name Echo listens for each event under its default namespace ([`BroadcastEvents`](../packages/laravel/src/Broadcasting/BroadcastEvents.php)): relative to `App\Events`, with dots (`ProjectUpdated`, `Projects.ProjectArchived`), or a dot and the `broadcastAs()` name (`.project.renamed`). Generation reads `broadcastAs()` on an instance whose constructor never ran; a name that depends on the event's state fails `strictly:generate`, and so do two events with one name. `useChannelEvent()` takes only those keys, so a misspelled or stale name fails `tsc`: `error TS2345: Argument of type '"ProjectUpdatd"' is not assignable to parameter of type '"ProjectUpdated"'.` At runtime it listens for the full name (`.App\Events\ProjectUpdated`), whatever namespace Echo is configured with. A broadcast Contract is checked under the name the event really broadcast, so a name generation got wrong fails `tsc` too. The oxlint rule `strictly/typed-broadcasts` rejects `useEcho()`. ADR-0008. Scenarios: `broadcast-event-names-typed-passes`, `broadcast-event-name-misspelled-fails-tsc`, `use-echo-fails-lint`.

### P-054

**Channel names and parameters are hand-written**

- **Type Boundary:** broadcasting
- **Source:** spec user story 45
- **Upstream:** none
- **Status:** closed

**Reproduction:** `Broadcast::channel('workspace.{workspace}', …)` in `routes/channels.php`; the client subscribes with `` `workspace.${workspace.slug}` `` while the channel binds by id. Both compile; the subscription is refused or joins the wrong channel.

**Manual workaround:** none; channel strings are built by hand.

**Closed by:** `strictly:generate` reads the channels the app's broadcaster registered from `routes/channels.php` ([`BroadcastChannels`](../packages/laravel/src/Broadcasting/BroadcastChannels.php)) into `BroadcastChannels`, and `channel(pattern, params)` from `@/generated/broadcasting` takes only those patterns and exactly their parameters. A parameter the callback type-hints with a model (`fn (User $user, Project $project): bool`) takes that model's route key, `RouteKey<'Project', number>`, or the Data object holding it, as a route function does ([P-003](#p-003)); a plain one takes any value. A Data class built from a model a channel binds has its key generated as that route key even when no route binds the model. A misspelled pattern fails `tsc` (`error TS2345: Argument of type '"project.{project}"' is not assignable to parameter of type '"projects.{project}"'.`), and so does the slug for a channel bound by id. A callback with an `array` return type defines a presence channel, any other a private one, and `channel()` subscribes accordingly. On the server side, each broadcast Contract checks the event's private and presence channels against the defined patterns (`export const channels = [ "private-projects.4000001" ] satisfies BroadcastChannelName[];`), so an event broadcast on a channel no definition authorizes fails `tsc`. The Vite plugin regenerates when `routes/channels.php` changes. A public channel needs no definition, so `config/strictly.php` declares it instead ([P-143](#p-143)). Scenarios: `broadcast-channels-typed-passes`, `broadcast-channel-pattern-misspelled-fails-tsc`, `broadcast-channel-param-wrong-key-fails-tsc`, `broadcast-on-undefined-channel-fails-contract`.

### P-142

**Broadcast notifications and model broadcasts have no generated payload type**

- **Type Boundary:** broadcasting
- **Source:** found while closing [P-052](#p-052)
- **Upstream:** none
- **Status:** closed

**Reproduction:** a notification with `via(): ['broadcast']` whose `toBroadcast()` returns `new BroadcastMessage([...])`, read with `useEchoNotification(channel, (n: { title: string }) => …)`; or a model using `BroadcastsEvents`, read with `useEchoModel()`. Both payloads are typed by hand, no Contract records them, and `strictly/typed-broadcasts` leaves those hooks alone.

**Manual workaround:** broadcast an event of the app's own with a `BroadcastsData` payload alongside the notification or model change, and listen for that.

**Closed by:** the oxlint rule `strictly/typed-broadcasts` ([`packages/npm/oxlint/index.js`](../packages/npm/oxlint/index.js)) also rejects Echo's `useEchoNotification()` and `useEchoModel()`, imported from `@laravel/echo-react` by name, renamed or through a namespace import: ``Echo's `useEchoNotification()` reads a broadcast notification's hand-typed payload: broadcast an app event with a `BroadcastsData` payload alongside the notification, and listen for it with `useChannelEvent(channel, event, callback)` from `@/generated/broadcasting`, which types its payload from the event's Data class.`` (and "a model broadcast's" / "the model change" for `useEchoModel()`). The workaround becomes the only way to read one: the app event's payload is typed, recorded as a Contract and covered like any other (P-052). What that leaves is [P-147](#p-147). Scenarios: `broadcast-notification-through-app-event-passes`, `use-echo-notification-fails-lint`.

### P-147

**A broadcast notification or model broadcast needs an app event alongside it**

- **Type Boundary:** broadcasting
- **Source:** found while closing [P-142](#p-142)
- **Upstream:** none (Laravel Wayfinder's `next` branch and Laravel Ranger collect only `ShouldBroadcast` events)
- **Status:** accepted gap

**Reproduction:** a notification with `via(): ['broadcast']` and a `toBroadcast()`, or a model using `BroadcastsEvents`, has no client type for its own broadcast, and `strictly/typed-broadcasts` rejects the hooks that read it. To react to it in the browser the app broadcasts a second event of its own, so each change goes over the socket twice while the notification still broadcasts.

**Manual workaround:** broadcast an app event with a `BroadcastsData` payload alongside the notification or model change and listen for it with `useChannelEvent()`; drop `'broadcast'` from the notification's `via()` (or `BroadcastsEvents` from the model) when nothing else reads it.

**Reasoning:** a notification's `toBroadcast()` returns a `BroadcastMessage` around an untyped array, and a model broadcast sends the model's attributes (or its own `broadcastWith()` array) under event names derived at runtime, so typing them would need a second payload convention beside `BroadcastsData`, plus recording Laravel's `BroadcastNotificationCreated` and `BroadcastableModelEventOccurred` as Contracts. An app event already gets all of that, and the extra broadcast is cheap next to a payload nothing checks.

### P-143

**A public channel's name is hand-written**

- **Type Boundary:** broadcasting
- **Source:** found while closing [P-054](#p-054)
- **Upstream:** none (Laravel needs no definition for a public channel)
- **Status:** closed

**Reproduction:** an event broadcasts on `new Channel('status')`; the client listens with `useChannelEvent(publicChannel('statuss'), …)`. Both compile, since nothing in `routes/channels.php` names the channel, and the broadcast Contract checks only private and presence channels.

**Manual workaround:** define the channel in `routes/channels.php` and broadcast on it as a private channel whose callback returns `true`, so `channel()` names it. That isn't equivalent: a private channel needs an authenticated user, so guests, whom public channels exist for, can't listen.

**Closed by:** the app declares its public channels in `config/strictly.php`'s `public_channels`, next to the vendor declarations, since Laravel defines them nowhere: a name (`'status'`), or a pattern keyed by itself with the models its parameters hold the route key of (`'projects.{project}.public' => ['project' => Project::class]`), which the installer publishes empty for new apps and the package's defaults give existing ones ([`PublicChannels`](../packages/laravel/src/Broadcasting/PublicChannels.php)). `BroadcastChannels::of()` returns them next to the channels `routes/channels.php` defines, with the visibility `public`, so `BroadcastChannels` in `@/generated/broadcasting` covers all three kinds. `publicChannel(pattern, params)` takes only the declared patterns, with their parameters typed as `channel()` types them (a bound one takes the model's route key or its Data object), and `channel()` takes only private and presence ones: a misspelled name fails `tsc` (`error TS2345: Argument of type '"statuss"' is not assignable to parameter of type '"status" | "projects.{project}.public"'.`), and so does any public channel in an app that declares none (`… parameter of type 'never'.`). Each broadcast Contract now checks every channel the event was broadcast on, public ones included, so broadcasting on an undeclared one fails `tsc` (`error TS2820: Type '"statuss"' is not assignable to type 'BroadcastChannelName'. Did you mean '"status"'?`). A declaration that isn't a name, binds a parameter its pattern doesn't have or a class that isn't a model, names a `private-` or `presence-` channel, or repeats a pattern `routes/channels.php` defines fails `strictly:generate`. Scenarios: `broadcast-public-channels-declared-passes`, `broadcast-public-channel-misspelled-fails-tsc`, `broadcast-on-undeclared-public-channel-fails-contract`, `broadcast-public-channel-declaration-invalid-fails-generate`.

### P-153

**A misspelled channel pattern with parameters fails `tsc` on the argument count**

- **Type Boundary:** broadcasting
- **Source:** found while closing [P-143](#p-143)
- **Upstream:** none
- **Status:** closed

**Reproduction:** an app whose channels take different parameters (`projects.{project}`, `App.Models.User.{id}`) calls `channel('project.{project}', { project })`. `tsc` fails with `error TS2554: Expected 1 arguments, but got 2.` at the parameters instead of naming the pattern: it falls back to every pattern for the one it can't match, and the parameters of every pattern at once are none. The same holds for `publicChannel()`.

**Manual workaround:** none needed for safety, since the call fails `tsc`; read the pattern instead of the reported argument.

**Closed by:** `ChannelArgs` ([`echo/index.d.ts`](../packages/npm/echo/index.d.ts)) lets a pattern `tsc` couldn't match take its parameters or not, so the pattern is what fails: `error TS2345: Argument of type '"project.{project}.public"' is not assignable to parameter of type '"status" | "projects.{project}.public"'.` A pattern typed as a union of several takes no parameters. Scenarios: `broadcast-public-channels-declared-passes`, `broadcast-public-channel-with-params-misspelled-fails-tsc`.

### P-144

**An event can be listened for on a channel it is never broadcast on**

- **Type Boundary:** broadcasting
- **Source:** found while closing [P-053](#p-053) and [P-054](#p-054)
- **Upstream:** none
- **Status:** closed

**Reproduction:** `CommentPosted` broadcasts on `issues.{issue}`; the client calls `useChannelEvent(channel('projects.{project}', { project }), 'CommentPosted', cb)`. The pattern and the event name are each checked, but not that the event goes to that channel, so the callback never fires.

**Manual workaround:** none; check each listener's channel against the event's `broadcastOn()` by hand.

**Closed by:** each broadcast event names the channel patterns it is sent on with a repeatable `#[BroadcastsOn('issues.{issue}')]` ([`BroadcastsOn`](../packages/laravel/src/Broadcasting/BroadcastsOn.php), ADR-0010), and the PHPStan rule `strictly.broadcastsOn` requires one (`Broadcast event App\Events\ProjectUpdated declares no channel it is sent on.`). A pattern must name a channel the app knows, private or presence from `routes/channels.php` or public from `config/strictly.php`'s `public_channels`, or `strictly:generate` fails (`App\Events\ProjectUpdated: #[BroadcastsOn('project.{project}')] names no channel.`). `@/generated/broadcasting` maps each channel's pattern to the events declared on it (`ChannelEvents`); `channel()` and `publicChannel()` return a handle that carries its pattern, and `useChannelEvent(handle, event, cb)` takes only that pattern's events, or for a handle whose pattern is one of several, the events sent on every one of them: `error TS2345: Argument of type '"ProjectUpdated"' is not assignable to parameter of type '"ProjectShared"'.` The declaration duplicates `broadcastOn()`, which builds the names at runtime, so it is verified both ways. Each broadcast Contract records the pattern of every channel the event went to, matched as Laravel's broadcaster matches it, and checks it against the event's declaration, so a `broadcastOn()` that sends the event elsewhere fails `tsc` (`error TS2322: Type '"App.Models.User.{id}"' is not assignable to type '"projects.{project}"'.`). Contract Coverage reports a declared pattern no feature test broadcasts the event on, a stale declaration (`✗ ProjectUpdated on App.Models.User.{id}: no feature test broadcasts this event on this channel: …`), unless the event's Contracts already fail on a channel it doesn't declare, and a public channel no event declares, which listeners would hear nothing on (`✗ maintenance: no event's #[BroadcastsOn] names this public channel: …`). Scenarios: `broadcast-event-on-undeclared-channel-fails-tsc`, `broadcast-on-channel-not-declared-fails-contract`, `broadcast-declared-channel-never-broadcast-fails-coverage`, `broadcast-public-channel-no-event-declares-fails-coverage`, `broadcast-on-unknown-channel-pattern-fails-generate`, `broadcast-event-without-broadcasts-on-fails-phpstan`, and the passing `broadcast-channels-typed-passes`, `broadcast-event-names-typed-passes`, `broadcast-payload-typed-passes`, `broadcast-public-channels-declared-passes`.

### P-145

**A presence channel's member data is untyped**

- **Type Boundary:** broadcasting
- **Source:** found while closing [P-054](#p-054)
- **Upstream:** by design: `@laravel/echo-react`'s presence callbacks take `any`
- **Status:** closed

**Reproduction:** `Broadcast::channel('issues.{issue}.viewers', fn (User $user, Issue $issue): array => ['id' => $user->id, 'name' => $user->name])`; the client reads the members through `here()`, `joining()` and `leaving()` on `usePresenceChannel()`'s channel, typed by hand.

**Manual workaround:** type the member data by hand next to the listener.

**Closed by:** a presence channel's callback returns a Data class of what each member shares, declared as its return type (`fn (User $user, Issue $issue): ?ViewerData => …`, `null` refusing the user; a channel class's `join()` the same). `BroadcastChannels` reads the declared return type: a Data class makes the channel a presence one and is generated as its `member` in `BroadcastChannels` (`@/generated/broadcasting`). `usePresence(channel, { here, joining, leaving })` from there ([`echo/index.d.ts`](../packages/npm/echo/index.d.ts)) takes only a presence channel's handle, with its parameters typed as `channel()` types them, joins it through `@laravel/echo-react`'s `useChannel()` (ADR-0008), and types each callback's members as that Data class, so reading a field it lacks fails `tsc` (`error TS2339: Property 'email' does not exist on type 'ViewerData'.`). The PHPStan rule `strictly.presenceData` ([`PresenceDataRule`](../packages/laravel/src/PHPStan/PresenceDataRule.php)) rejects a channel callback that returns an array (`Presence channel issues.{issue}.viewers returns its members' data as an array.`), and one that returns a Data class without declaring it, which generation would take for a private channel; a callback returning `bool` is untouched. The oxlint rule `strictly/typed-broadcasts` also rejects Echo's `usePresenceChannel()` (``Echo's `usePresenceChannel()` hands out a presence channel whose members are typed by hand: …``). What that leaves is [P-165](#p-165). Scenarios: `presence-members-typed-passes`, `presence-member-field-misread-fails-tsc`, `presence-channel-returns-array-fails-phpstan`, `use-presence-channel-fails-lint`, and the passing `broadcast-channels-typed-passes`, `skill-add-broadcast-event-example-passes`.

### P-165

**A presence channel's member data isn't checked by a Contract**

- **Type Boundary:** broadcasting
- **Source:** found while closing [P-145](#p-145)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** a presence channel's `ViewerData` gains a `#[WithTransformer]` (or a `toArray()` override) that changes what it serialises to. Its members reach the browser in the `channel_data` of the `/broadcasting/auth` response, which no feature test records, so the difference from the generated `ViewerData` type fails nothing, and Contract Coverage doesn't ask for a test that joins the channel.

**Manual workaround:** a feature test that authorizes the presence channel through a Pusher-protocol broadcaster (switch the test to the Reverb connection, as the Testbed App's `CommentBroadcastTest` does for its private channel) and asserts the `user_info` in the response's `channel_data`.

**Reasoning:** feature tests broadcast on the `null` connection, whose `auth()` never runs a channel's callback, so no test sees member data unless it installs and configures a real broadcaster's SDK (`pusher/pusher-php-server` for Reverb and Pusher). Recording `channel_data` from such responses is possible, but Contract Coverage couldn't require it of every app with a presence channel, and a Contract nothing requires proves little. The member type is generated from the Data class like every other, so what stays unchecked is only that class's own serialisation.

### P-148

**A channel object from Echo listens for any event with an untyped payload**

- **Type Boundary:** broadcasting
- **Source:** found while closing [P-142](#p-142)
- **Upstream:** by design: `@laravel/echo-react`'s `useChannel()` returns Echo's channel, whose `listen()` and `notification()` take any name and callback
- **Status:** open

**Reproduction:** `useChannel('App.Models.User.1').channel()?.listen('CommentPostd', (e: { body: string }) => …)`, or `.notification((n: { title: string }) => …)` on it, or the same on `echo().private(…)`, compiles and passes lint: `strictly/typed-broadcasts` rejects only Echo's listening hooks, not the channel objects its other hooks and `echo()` return.

**Manual workaround:** listen through `useChannelEvent()` and follow presence members through `usePresence()` only, and leave Echo's channel objects to joining and leaving.

## Translations

The Reference Implementation never exercised this Type Boundary. ADR-0006 decides the approach (spec user stories 47–49).

### P-055

**Translation keys are unchecked strings**

- **Type Boundary:** translations
- **Source:** spec user story 47; ADR-0006
- **Upstream:** none
- **Status:** closed

**Reproduction:** `lang/en/auth.php` defines `'throttle' => 'Too many login attempts. Please try again in :seconds seconds.'`; the client calls `t('auth.throtle')` and compiles, rendering the raw key.

**Manual workaround:** none; keys are copied by hand.

**Closed by:** `strictly:generate` reads the default locale's lang files (`app.locale`: every PHP file under `lang/<locale>/`, nested groups and directories flattened to the keys `__()` takes, plus `lang/<locale>.json`; [`Translations`](../packages/laravel/src/Translations/Translations.php)) and writes `@/generated/translations` ([`TranslationsModule`](../packages/laravel/src/Translations/TranslationsModule.php)): a `TranslationKeys` type, and the `t()` the npm package's [`createTranslator()`](../packages/npm/translations/index.d.ts) binds to each locale's messages, written as generated JSON that Vite bundles (no shared props, no request). `t()` takes only those keys, template-literal keys included, so a misspelled one fails `tsc`: `error TS2345: Argument of type '"auth.throtle"' is not assignable to parameter of type 'keyof TranslationKeys'.` The Vite plugin regenerates when a lang file changes. ADR-0006. Scenarios: `translation-keys-typed-passes`, `translation-key-misspelled-fails-tsc`.

### P-056

**Translation `:param` names are unchecked**

- **Type Boundary:** translations
- **Source:** spec user story 47; ADR-0006
- **Upstream:** none
- **Status:** closed

**Reproduction:** `t('auth.throttle', { second: 5 })` compiles; the message renders with the literal `:seconds`.

**Manual workaround:** none.

**Closed by:** `TranslationKeys` maps each key to the `:params` its default-locale message takes, named as Laravel's translator fills them (`:seconds`, `:Seconds` and `:SECONDS` are all the param `seconds`; a placeholder starts with a letter, so `10:30` is none), and `t(key, params)` takes exactly those: a misspelled param fails with `error TS2561: Object literal may only specify known properties, but 'second' does not exist in type 'TranslationParams<"seconds">'. Did you mean to write 'seconds'?`, a missing one with `error TS2554: Expected 2 arguments, but got 1.`, and a message without params takes none. At runtime `t()` fills them as Laravel does (`packages/npm/tests/translations.test.ts`). Scenarios: `translation-params-typed-passes`, `translation-param-misspelled-fails-tsc`, `translation-param-missing-fails-tsc`.

### P-057

**Other locales can miss keys or params**

- **Type Boundary:** translations
- **Source:** spec user story 48; ADR-0006
- **Upstream:** none
- **Status:** closed

**Reproduction:** add a key to `lang/en/` but not `lang/de/`, or drop `:seconds` from the German message: nothing fails; German users see the fallback or a message missing its value.

**Manual workaround:** none.

**Closed by:** `strictly:install` publishes `tests/Feature/LocaleParityTest.php` (a hook, so a deleted one is restored and `ci:check:install` fails without it), which runs [`LocaleParity::assert()`](../packages/laravel/src/Testing/LocaleParity.php): every locale other than the default must have exactly its keys, each with the same params. One line per gap: `de: auth.password is missing`, `de: auth.throttle lacks :seconds`, a param the default message doesn't take (`t()` never fills it) and a key the default locale doesn't have. The Testbed App's Projects area is translated into German and covered by it. Scenarios: `locales-match-passes`, `locale-missing-key-fails-test`, `locale-missing-param-fails-test`.

### P-136

**A pluralised message has no typed `choice()` on the client**

- **Type Boundary:** translations
- **Source:** found building the translations boundary (#28)
- **Upstream:** none
- **Status:** closed

**Reproduction:** `lang/en/issues.php` defines `'count' => '{0} No issues|{1} One issue|[2,*] :count issues'`; the client calls `t('issues.count', { count: 3 })`, which compiles and renders the whole message, pipes and ranges included. `trans_choice()` selects the variant on the server; nothing does on the client.

**Manual workaround:** one key per variant (`issues.count_none`, `issues.count_one`, `issues.count_many`), chosen in TypeScript.

**Closed by:** a message is pluralised when it contains `|` (`StrictlyLaravel\Translations\Translations::isPlural()`), and `@/generated/translations` lists those keys as `PluralTranslationKey`. Its `choice(key, count, params?)` picks the form as Laravel's `MessageSelector` does (a `{n}` or `[from,to]` range holding the count first, `*` leaving a range open, then the plural rule of the locale whose message it is, falling back to the default locale's message like `t()`), fills `:count` with the count (or a `count` param) and takes the message's other `:params`. `t()` rejects a pluralised key (`error TS2345: Argument of type '"issues.count"' is not assignable to parameter of type '"issues.count is a plural message: use choice()"'.`) and `choice()` every other key (`… '"issues.title is not a plural message: use t()"'.`). The locale parity test ([P-057](#p-057)) reports a locale whose message is pluralised where the default locale's isn't, or the other way round (`de: issues.count isn't plural, but the en message is, so choice() can't pick its form`), except that a locale whose plural rule has one form (Japanese, Chinese, Korean, Turkish…) may leave a message unpluralised, since `trans_choice()` and `choice()` take its only form; the number of forms may differ, since each locale's plural rule has its own. The npm package's unit tests compare `choice()` with what `trans_choice()` returns in `en`, `de`, `fr`, `ru`, `pl`, `ar` and `ja`. Scenarios: `translation-plural-choice-passes`, `translation-plural-key-in-t-fails-tsc`, `translation-singular-key-in-choice-fails-tsc`, `translation-only-key-plural-in-t-fails-tsc`, `translation-only-key-choice-without-params-fails-tsc` (an app with a single key), `locale-plural-mismatch-fails-test`, `locale-single-plural-form-unpluralised-passes`.

### P-161

**A message with a literal `|` is a pluralised message**

- **Type Boundary:** translations
- **Source:** found typing `choice()` (#47)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `lang/en/app.php` defines `'title' => 'Tracklane | Projects'`, which isn't pluralised. `t('app.title')` fails `tsc` (`… is a plural message: use choice()`), and `choice('app.title', 1)` renders `Tracklane `, the first form. In PHP, `__('app.title')` fails PHPStan (`strictly.translationPlural`: `Translation 'app.title' is pluralised: use trans_choice().`, [P-137](#p-137)), and `trans_choice('app.title', 1)` renders `Tracklane `.

**Manual workaround:** keep the `|` out of the message: `` `${t('app.name')} | ${t('projects.index.title')}` ``, or a different character (`·`, `—`).

**Reasoning:** `|` is Laravel's form separator and has no escape: `trans_choice()` splits such a message on the server just as `choice()` does on the client. Only `__()` renders it whole, which the Overlay rejects for the same reason as `t()`, and telling a literal `|` from a form separator would mean guessing at the message's intent; a wrong guess renders a pluralised message whole, which is the Problem P-136 closed.

### P-137

**Translation keys used in PHP are unchecked**

- **Type Boundary:** translations
- **Source:** found translating the Testbed App's flash messages (#28)
- **Upstream:** none
- **Status:** closed

**Reproduction:** `FlashData::success(__('projects.flash.saevd', ['key' => $project->key]))` passes PHPStan and the tests; the toast shows the raw key. A param misspelled in `__()`'s replacements leaves the `:key` placeholder unfilled the same way.

**Manual workaround:** a feature test that asserts the flashed message's text.

**Closed by:** the PHPStan rule [`TranslationRule`](../packages/laravel/src/PHPStan/TranslationRule.php) checks `__()`, `trans()`, `trans_choice()`, `Lang::get()`, `Lang::choice()` and the Translator's `get()` and `choice()` as `tsc` checks `t()` and `choice()` ([P-055](#p-055), [P-056](#p-056), [P-136](#p-136)), against the default locale's messages as `strictly:generate` reads them (PHP lang files with nested and subdirectory keys, and the JSON file) over Laravel's own lang files (`validation.*`, `auth.*`, `passwords.*`, `pagination.*`), which the translator falls back to when the app hasn't published them ([P-138](#p-138)). A key neither defines fails with `Translation key 'projects.flash.saevd' isn't defined in locale en.` (`strictly.translationKey`). A key naming a group of messages (`__('dates.months')` for `'months' => ['Jan', …]`, `trans('validation.attributes')`), which Laravel returns as an array, is defined; a choice call on one fails (`Translation key 'dates.months' names a group of messages, not one.`). The replacements must be exactly the message's `:params`, matched as on the client (`:key`, `:Key` and `:KEY` are the param `key`): `Translation 'projects.flash.saved' needs the param 'key'.` and `… takes no param 'kye'.` (`strictly.translationParams`); `trans_choice()` may leave out `count`, which it fills from the number, and a closure replacement fills a `<tag>`, not a `:param`. A pluralised message goes through a choice call and any other through a get call (`Translation 'issues.count' is pluralised: use trans_choice().`, `strictly.translationPlural`), as `choice()` and `t()` on the client: `__()` renders every form, and `trans_choice()` has none to pick. A key, or replacements, that PHPStan can't resolve to literals (a union of literal keys is fine, each is checked) can't be checked, so it is reported as `strictly.translationDynamic`, which a suppression with its reason accepts (ADR-0007), just as `t()` takes no `string` key. A package's namespaced key (`billing::invoices.title`) isn't checked, as its lang files aren't read. Each analysed file depends on the default locale's lang files through PHPStan's result cache, so editing a lang file re-checks the calls. Rule-test kit cases: `packages/laravel/tests/PHPStan/TranslationRuleTest.php`. Scenarios: `translation-calls-in-php-pass-phpstan`, `translation-key-misspelled-in-php-fails-phpstan`, `translation-param-misspelled-in-php-fails-phpstan`.

### P-163

**Text no lang file defines can't be told from a misspelled key**

- **Type Boundary:** translations
- **Source:** found checking translation keys in PHP (#48)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** the Base Kit flashes `__('Profile updated.')` and has no `lang/en.json`; Laravel's translator renders text it has no message for as it is. `__('Profile updatd.')` passes PHPStan the same way, and so does a misspelled text key that `lang/en.json` defines, which then renders untranslated in every locale.

**Manual workaround:** give the message a `group.item` key (`__('settings.flash.profile_updated')`), which must be defined.

**Reasoning:** Laravel documents text as its own key ("translation strings as keys") and renders it when no lang file defines it, and the Base Kit relies on that. So [P-137](#p-137)'s rule reports only an undefined key shaped like a lang file's (`group.item`, dot-separated with no whitespace), and accepts other text, checking only that its own `:params` are passed. Requiring every text to be defined would fail every app that uses the convention, and the Base Kit, until each such text is copied into `lang/en.json` unchanged.

### P-138

**Translations outside the app's lang files have no keys on the client**

- **Type Boundary:** translations
- **Source:** found building the translations boundary (#28)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `t('pagination.next')` or `t('validation.required')` fails `tsc` in an app that hasn't published Laravel's lang files, though `__()` finds them on the server; a package's namespaced keys (`lang/vendor/<package>/`, `__('package::file.key')`) are never generated.

**Manual workaround:** `php artisan lang:publish` copies Laravel's own files into `lang/`, after which their keys are generated like the app's.

**Reasoning:** the client only gets the messages the app owns, so its bundle doesn't carry every package's translations, and every key `t()` takes is one the app's own locales are checked for (P-057). Validation messages need no client-side key: the server sends them translated with the errors (P-028).

## Exposed config

The Reference Implementation never exercised this Type Boundary beyond `config()->string('app.name')` in shared props (spec user stories 50–51).

**The convention.** Config the frontend sees comes from one of two places, and both are typed:

- **Server settings and feature flags** are properties of the shared props Data class (`App\Data\SharedProps`, [P-012](#p-012)), usually a nested Data class such as `FeaturesData`, built in the share step from `config()`'s typed accessors (`config()->boolean('tracklane.features.cycles')`). React reads them from `usePage().props`, typed from the Data class; nothing else carries them ([P-059](#p-059), [P-060](#p-060), [P-088](#p-088)).
- **Build-time values** are `VITE_*` variables listed in `.env.example`, read as `import.meta.env.VITE_*`, typed from `.env.example` ([P-058](#p-058)) and set wherever Vite builds ([P-140](#p-140)). They are public: they end up in the bundle.

### P-058

**`VITE_*` variables are untyped**

- **Type Boundary:** exposed config
- **Source:** spec user story 51; ecosystem C ("Broadcast / env")
- **Upstream:** by design: Vite's `ImportMetaEnv` has an index signature unless an app sets the `strictImportMetaEnv` type option ([`types/importMeta.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/types/importMeta.d.ts))
- **Status:** closed

**Reproduction:** the Base Kit's `vite-env.d.ts` only references `vite/client`, whose `ImportMetaEnv` has an index signature; `import.meta.env.VITE_APP_NAM` compiles and is `undefined` at runtime (`resources/js/app.tsx` reads `VITE_APP_NAME`).

**Manual workaround:** hand-write `ImportMetaEnv` keys for the variables in `.env.example`.

**Closed by:** `strictly:generate` types `import.meta.env` from the `VITE_*` variables `.env.example` lists ([`ViteEnvTypes`](../packages/laravel/src/TypeScript/ViteEnvTypes.php)): `@/generated` sets Vite's `strictImportMetaEnv` type option, which removes the index signature, and declares each listed variable `readonly VITE_…: string`. A variable `.env.example` doesn't list fails `tsc` where it is read: `error TS2339: Property 'VITE_SENTRY_DSN' does not exist on type 'ImportMetaEnv'.` The Vite plugin regenerates the types when `.env.example` is saved. Only Vite's default `VITE_` prefix is typed; with another `envPrefix` the app's variables fail `tsc` until it reverts. Scenarios: `vite-env-variable-in-env-example-passes`, `vite-env-variable-not-in-env-example-fails-tsc`; harness test (`harness/tests/vite-plugin.test.ts`): "saving .env.example regenerates too".

### P-140

**A `VITE_*` variable `.env.example` lists can be unset when Vite builds**

- **Type Boundary:** exposed config
- **Source:** found while closing [P-058](#p-058)
- **Upstream:** none (Vite inlines whatever the environment has, and `undefined` for the rest)
- **Status:** closed

**Reproduction:** `.env.example` lists `VITE_SENTRY_DSN`, so `import.meta.env.VITE_SENTRY_DSN` is typed `string` ([P-058](#p-058)), but the `.env` of a deployment written before the variable was added doesn't set it. `vite build` succeeds and the bundle reads `undefined`.

**Manual workaround:** compare `.env` with `.env.example` before each build.

**Closed by:** the npm package's Vite plugin ([`packages/npm/vite/index.js`](../packages/npm/vite/index.js)) compares the `VITE_*` variables `.env.example` lists with the environment Vite loaded (its `.env` files and the process environment). A build fails on each one that isn't set (`[strictly] .env.example lists VITE_APP_NAME, but the environment Vite runs with doesn't set it, so import.meta.env.VITE_APP_NAME is undefined although its type is string. …`), and the dev server warns. An empty value counts as set. `ci:check` doesn't build, so it doesn't run this check. Harness tests: "the build fails when the environment lacks a VITE_* variable .env.example lists, which import.meta.env types as a string (P-140)" (`harness/tests/overlay.test.ts`), and the dev server's warning (`harness/tests/vite-plugin.test.ts`).

### P-059

**Server settings and feature flags reach React ad hoc**

- **Type Boundary:** exposed config
- **Source:** spec user story 50
- **Upstream:** by design: Inertia's `usePage<TPageProps>()` trusts the type argument it is given ([`usePage.ts`](https://github.com/inertiajs/inertia/blob/master/packages/react/src/usePage.ts))
- **Status:** closed

**Reproduction:** a feature flag is added to `share()` as `'features' => ['boards' => Feature::active('boards')]` or passed as an inline prop; its type is written by hand (`usePage<{ features: { boards: boolean } }>().props.features`), or hidden by the shared props index signature ([P-013](#p-013)).

**Manual workaround:** add the setting as a typed property of the shared props Data class.

**Closed by:** the shared props Data class is the one way in ([P-012](#p-012)): a setting or flag is a property of it, generated into `usePage().props`. A value shared beside it fails its Contract ([P-088](#p-088)). The oxlint rule `strictly/typed-page-props` ([`packages/npm/oxlint/index.js`](../packages/npm/oxlint/index.js)) rejects a type argument on Inertia's `usePage()` other than a generated `PageProps<'component'>`, so a flag's type can't be written by hand: `` `usePage()` takes its props' type from the generated shared props and Page classes: drop the type argument. `` The Testbed App's feature flags (`App\Data\FeaturesData`, from `config/tracklane.php`) go this way, and its tests render pages with each flag on and off. A value the root Blade template writes into the page bypasses it: [P-141](#p-141). Scenarios: `feature-flags-through-shared-props-pass`, `feature-flag-typed-by-hand-fails-lint`.

### P-141

**A value the root Blade template writes into the page reaches React untyped**

- **Type Boundary:** exposed config
- **Source:** found while closing [P-059](#p-059)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `resources/views/app.blade.php` writes `<script>window.tracklane = @json(['boards' => config('tracklane.features.boards')])</script>` and a hand-written `declare global { interface Window { tracklane: { boards: boolean } } }` types it. Nothing compares the declaration with what the template writes.

**Manual workaround:** share the value through the shared props Data class instead.

**Reasoning:** the template's output isn't an Inertia response, so no Contract records it, and a `Window` declaration is a hand-written type like any other the app may write. The convention (above) sends every server value through the shared props, which are checked; rejecting every `Window` augmentation would also reject legitimate ones for third-party scripts.

### P-060

**`config()` values are `mixed` in PHP**

- **Type Boundary:** exposed config
- **Source:** eval-01 S2; eval-03 §9
- **Upstream:** none (by design: config is untyped)
- **Status:** closed

**Reproduction:** `'name' => config('app.name')` is `mixed`, so nothing proves the value is the string the TypeScript type promises (Wayfinder `next` generates `name: unknown`; PHPStan max reports it).

**Manual workaround:** typed accessors, `config()->string('app.name')`, enforced by PHPStan max.

**Closed by:** the shared props are a Data class with typed properties ([P-012](#p-012)), and the app's PHPStan runs at max level, so a `config()` value passed to one fails the `test` step (`Parameter $name of class App\Data\SharedProps constructor expects string, mixed given.`) until it is read with a typed accessor (`config()->string()`, `config()->boolean()`, `config()->integer()`), which throws when the value isn't of that type. Kit Conversion's `HandleInertiaRequests` reads the app name that way. Scenarios: `config-value-typed-accessor-passes`, `config-value-mixed-fails-phpstan`.

## Every Type Boundary

Problems in generation or verification that affect every Type Boundary.

### P-061

**Unmapped PHP classes become `undefined`**

- **Type Boundary:** every Type Boundary (seen in form payloads and page props)
- **Source:** overview §2 and §4; eval-02 §3 and §9; Tracklane's `StoreAttachmentData`
- **Upstream:** no upstream issue filed (typescript-transformer)
- **Status:** closed

**Reproduction:** `public UploadedFile $file` generates `file: undefined`; a `DateTimeInterface` property generates `undefined` (the Laravel extension maps only `CarbonInterface`). Any class without a transformer does the same with only a warning.

**Manual workaround:** `->replaceType(UploadedFile::class, new TypeScriptRaw('File'))` (with `File | null` in `useRouteForm` until a file is picked) and `->replaceType(DateTimeInterface::class, 'string')`.

**Closed by:** [`UnmappedClassTypes`](../packages/laravel/src/Workarounds/TypeScriptTransformer/UnmappedClassTypes.php) generates `UploadedFile` (and subclasses) as `File` and any `DateTimeInterface` as `string`; every other PHP class without a TypeScript type fails `strictly:generate` with the property and the class named, and the previous output stays ([`UnmappedClassCheck`](../packages/laravel/src/Workarounds/TypeScriptTransformer/UnmappedClassCheck.php)). `File | null` until a file is picked belongs to the typed forms ([P-014](#p-014)). Scenarios: `uploaded-file-and-datetime-typed-passes`, `file-name-for-uploaded-file-fails-tsc`, `unmapped-class-fails-generation`.

### P-062

**`mixed` becomes `any`**

- **Type Boundary:** every Type Boundary
- **Source:** eval-02 §4 and §9
- **Upstream:** no upstream issue filed (typescript-transformer 3.3 transpiles `mixed` to `any` and keeps only a `@template`'s name; [spatie/typescript-transformer#58](https://github.com/spatie/typescript-transformer/issues/58) asked for configurable fallbacks against v2)
- **Status:** closed

**Reproduction:** `public mixed $meta` or an untyped `public array $items` generates `any` / `any[]`; template bounds are dropped. Anything typed with them compiles.

**Manual workaround:** PHPStan max with 100 % type coverage forbids untyped properties; arrays declare their item type (`/** @var array<int, TaskData> */`).

**Closed by:** [`MixedAsUnknown`](../packages/laravel/src/Workarounds/TypeScriptTransformer/MixedAsUnknown.php) generates `mixed` as `unknown` wherever the Overlay emits TypeScript (a Data class, a Page class and its `OnceProp`, `MergeProp` and `ScrollProp` props, the shared props, an input or query class, a JSON response, a broadcast payload, and inside their arrays: `array<string, mixed>` is `Record<string, unknown>`), and an array with no item type as `unknown[] | Record<string, unknown>`, so a reader narrows before reading a field. [`TemplateBounds`](../packages/laravel/src/Workarounds/TypeScriptTransformer/TemplateBounds.php) writes a generic Data class's `@template T of X` as `T extends X` (`object` for laravel-data's own base classes and any abstract Data class such as `InputData`, `string | number` for `\BackedEnum`, and no constraint for a class with no TypeScript type such as a model, so such a bound never fails generation). Contract Coverage reports a `mixed` property only ever `null` like any nullable one. The one `any` left in typescript-transformer's output is a PHPDoc `callable` with no signature, which no JSON value can be (PHP forbids `callable` as a property type). Scenarios: `mixed-field-read-unnarrowed-fails-tsc`, `mixed-prop-narrowed-passes`, `mixed-generates-unknown-at-every-type-boundary-passes`, `generic-data-class-outside-bound-fails-tsc`, `generic-data-class-within-bounds-passes`.

### P-063

**Same-named Data classes produce duplicate types**

- **Type Boundary:** every Type Boundary
- **Source:** eval-02 §4 and §9
- **Upstream:** no upstream issue filed (typescript-transformer `FlatModuleWriter`)
- **Status:** closed

**Reproduction:** `App\Data\Issues\SummaryData` and `App\Data\Projects\SummaryData`: the flat module silently emits two `export type SummaryData`; `tsc` then fails on the generated file.

**Manual workaround:** rename one, or `#[TypeScript(name: 'IssueSummaryData')]`.

**Closed by:** `strictly:generate` (the `generate` step of `ci:check`, and `build` and `types:check`, which generate first) fails before it writes `@/generated` when two or more PHP classes generate the same type name: Data classes, enums, and an app class named like one of Strictly Laravel's own types (`DateOnly`, `InertiaPages`, …). It names every clashing class and the fix, one line per name, such as "`App\Data\Issues\SummaryData` and `App\Data\Projects\SummaryData` both generate `SummaryData`. Rename one, or give one a TypeScript name with `#[TypeScript(name: '…')]`." The check wraps typescript-transformer's writer ([`DuplicateTypeNames`](../packages/laravel/src/Workarounds/TypeScriptTransformer/DuplicateTypeNames.php)), so nothing is written and the last good types stay; while the dev server runs, the Vite plugin logs the failure like any other ([P-064](#p-064)). Page classes never clash, since their type names come from the page path ([P-010](#p-010)). Scenarios: `same-named-data-classes-fail-generate`, `same-named-data-classes-renamed-passes`; harness test "while the dev server runs, tsc sees a saved Data class and a new or deleted page file, and a half-written Data class, one that can't be loaded or two that generate the same type name keep the last good types".

### P-064

**Generated types go stale or missing**

- **Type Boundary:** every Type Boundary
- **Source:** eval-02 §7 and §9; eval-01 §6; overview §2; spec user stories 8 and 9
- **Upstream:** no upstream issue filed for spatie/php-structure-discoverer reading a PHP file that doesn't parse as if it were empty (`TokenCollection::fromCode()` swallows the `ParseError`)
- **Status:** closed

**Reproduction:** edit a Data class while `composer dev` runs: without a watcher, the editor and `tsc` check against the old types. typescript-transformer's `--watch` is slow and dies on a provider exception; Wayfinder's Vite plugin watches only routes and `Http`; generation fails in a fresh clone because the gitignored output directory doesn't exist. And a Data class saved half-written (`public int $openIssues` followed by `public stri`) makes `strictly:generate` exit 0 with the type missing from `@/generated`, so every component that uses it breaks while the developer types.

**Manual workaround:** a Vite plugin (`vite-plugins/php-types.ts`) that regenerates on PHP changes under `app/`, plus `File::ensureDirectoryExists()` before generating; build, typecheck and CI regenerate first.

**Closed by:** the npm package's Vite plugin ([`packages/npm/vite/index.js`](../packages/npm/vite/index.js), `@mrsafalpiya/strictly-laravel/vite`), which `strictly:install` registers in `vite.config.ts` ([`ViteTypesPlugin`](../packages/laravel/src/Install/ViteTypesPlugin.php)). While the dev server runs it runs `php artisan strictly:generate --skip-routes` on start and whenever a PHP file under `app/` is created, saved or deleted (and a page component file under `resources/js/pages` is created or deleted, [P-010](#p-010), or `.env.example` is saved, [P-058](#p-058)): saves are debounced, runs never overlap and queue at most one more, and a failed run is logged without stopping the dev server. `strictly:generate` refuses to run while a PHP file it reads doesn't parse ([`UnparsableFiles`](../packages/laravel/src/Workarounds/UnparsableFiles.php)) or a class that gets a type can't be loaded ([P-073](#p-073)), so it writes nothing and the last good types stay. Build, typecheck and `ci:check` generate first, and generation creates the gitignored output directory ([P-072](#p-072)). Scenarios: `data-class-mid-edit-fails-generate`, `data-class-edit-finished-passes`; harness tests: "while the dev server runs, tsc sees a saved Data class and a new or deleted page file, and a half-written Data class, one that can't be loaded or two that generate the same type name keep the last good types", "generated TypeScript is gitignored, and ci:check, typecheck and build regenerate it in a fresh clone", and the plugin's timing through a real Vite dev server (`harness/tests/vite-plugin.test.ts`).

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

**Closed by:** Contract Coverage, `php artisan strictly:coverage --strict` ([`CoverageCommand`](../packages/laravel/src/Console/CoverageCommand.php)), which `ci:check` runs as `ci:check:coverage`, after the tests and before `tsc`. It reads the sidecars of the Contracts the tests recorded ([P-065](#p-065)) and compares them with the Page classes and the Data classes they hold ([`ContractCoverage`](../packages/laravel/src/Coverage/ContractCoverage.php), [`ShapeCoverage`](../packages/laravel/src/Coverage/ShapeCoverage.php)). It fails on a page no test renders, and, at any depth and per Data class property, on a nullable field only ever `null`, an Optional field never sent, a list or map only ever empty, a union of Data classes never sent as one of its variants and a scalar union (`int|string`) never sent as one of its members. Each gap is one line that names the page or field, where it was looked for and the test to add: `✗ ProjectData.lead is only ever null (at projects/show › project.lead): add a feature test that renders projects/show with project.lead not null.` The shared props and the flash data are proven the same way against their Data classes ([P-012](#p-012), [P-047](#p-047)): every page's shared props (`at shared props › …`, and a gap when no test renders a page through the Inertia middleware) and everything flashed, so a flash key no test flashes is a gap (`at flash data › …`). Run without `--strict`, only unrendered pages fail. A fresh install has no gaps: Kit Conversion adds `tests/Feature/ContractCoverageTest.php` with `tests/Pest.php`, which renders the Base Kit's pages with a status message, with passkeys and the appearance page. The other dimensions report into the same Contract Coverage with the Problems that record their Contracts: deferred props ([P-043](#p-043): a lazy page prop no test loads), JSON endpoints ([P-048](#p-048), [P-050](#p-050)), form endpoints and declared vendor fields ([P-024](#p-024), [P-025](#p-025)) and broadcasts ([P-052](#p-052)). Shapes laravel-data doesn't describe (an array shape, a list of a union, a list of lists) are rejected by PHPStan instead ([P-084](#p-084)). Scenarios: `every-shape-exercised-passes-coverage`, `page-no-test-renders-fails-coverage`, `nullable-prop-only-null-fails-coverage`, `optional-prop-only-absent-fails-coverage`, `list-prop-only-empty-fails-coverage`, `union-variant-never-seen-fails-coverage`, `scalar-union-member-never-seen-fails-coverage`, `coverage-without-recorded-contracts-fails`, `shared-prop-only-null-fails-coverage`, `flash-key-never-flashed-fails-coverage`; harness test: "make:page creates a Page class and its page component, already in sync".

### P-084

**Contract Coverage can't see shapes laravel-data doesn't describe**

- **Type Boundary:** every Type Boundary
- **Source:** found while closing [P-066](#p-066)
- **Upstream:** none (laravel-data's `DataConfig` describes one item class per collection, by design)
- **Status:** closed

**Reproduction:** Contract Coverage reads a property's shapes from laravel-data's description of its Data class, which knows one item type per collection and nothing inside a PHPDoc array shape. So these pass `strictly:coverage --strict` although `tsc` never saw the other shape: a page prop `/** @param list<array{lead: ?string}> $projects */` whose `lead` every test sends as `null`; `/** @param list<int|string> $estimates */` only ever sent strings; `/** @param list<IssueData|MilestoneData> $focus */` only ever sent issues (laravel-data reads every item as an `IssueData`); and a nested list `list<list<MemberData>>`.

**Manual workaround:** model the item as a Data class (a `ProjectSummaryData` with `public ?string $lead`, or a Data class wrapping the union), whose shapes Contract Coverage does check.

The Testbed App had one: the cycle page's `issuesByStatus` (`array<value-of<IssueStatus>, array<int, IssueListItemData>>`, a map of lists), whose issues' shapes went unchecked.

**Closed by:** the PHPStan rule `strictly.dataShape` ([`DataShapeRule`](../packages/laravel/src/PHPStan/DataShapeRule.php)) rejects the shapes Contract Coverage can't see in the public properties of every Data class, Page, input and query classes included (promoted constructor parameters and their `@param` or `@var` too): an array shape at any depth, a list or map whose item type is a union (of Data classes, of scalars, or with `null`) and a list or map of lists or maps. Its message names the property and the part of its type, `App\Pages\Projects\IndexPage::$projects has an array shape (array{name: string, lead: string|null}) in its type, inside which Contract Coverage can't see.`, and its tip says to model the item as a Data class, for a union of Data classes one whose property is the union, its variants told apart by a literal discriminant, as Contract Coverage checks them ([P-132](#p-132)). Input and query classes are included because laravel-data validates such shapes only as `array` (and every item of a union of Data classes as the first), so a request's shape went unchecked too. Lists and maps of one type stay allowed, as do a union of literals of one scalar type (`list<'low'|'high'>`), `list<int|float>` (one TypeScript `number`, as Contract Coverage counts it) and a template type with a union bound, which each use of the class decides; a `#[Hidden]` property is never sent, so it is exempt. The Testbed App's cycle page now sends `list<StatusGroupData>`, each with its status and `list<IssueListItemData>`, so Contract Coverage checks its issues. Scenarios: `array-shape-page-prop-fails-phpstan`, `array-shape-modelled-as-data-class-passes-coverage`; the rule-test kit's `DataShapeRuleTest` covers each rejected and allowed form. The Contract scenarios that send a value around an array shape (`hand-built-page-prop-fails-contract`, `json-response-around-the-data-class-fails-contract`, `broadcast-payload-around-the-data-class-fails-contract`) now suppress `strictly.dataShape` with a reason, showing the Contract still catches what such an app sends.

### P-185

**Contract Coverage doesn't look inside a generic Data class's template-typed items**

- **Type Boundary:** every Type Boundary
- **Source:** found while closing [P-084](#p-084)
- **Upstream:** none (laravel-data describes a `list<TItem>` property as an array with no item class, since a template type is no class)
- **Status:** open

**Reproduction:** a generic Data class `/** @template TItem of Data */ final class ListingData extends Data` with `/** @param list<TItem> $items */`, sent as `/** @param ListingData<IssueData> $backlog */`. laravel-data describes `items` as an `Array` with no Data class, so Contract Coverage checks only that the list isn't always empty and never walks its items: an `IssueData.assignee` only ever `null` there passes `strictly:coverage --strict`. A union type argument (`ListingData<IssueData|MilestoneData>`) passes `strictly.dataShape` too, since the rule checks the generic class's own `list<TItem>` and leaves the template's argument to each use ([P-084](#p-084)).

**Manual workaround:** render the same Data class in a prop Contract Coverage does walk, or use a non-generic Data class per item type (`IssueListingData` with `list<IssueData>`).

### P-125

**A form's empty defaults are a Contract Coverage gap no test can close**

- **Type Boundary:** every Type Boundary (seen in form payloads)
- **Source:** found porting Tracklane's Projects area into the Testbed App (#23); the Reference Implementation exempted input classes from its coverage check (`types:coverage`, "Input classes only appear as form defaults/filters, which are empty by design")
- **Upstream:** none
- **Status:** closed

**Reproduction:** a create page sends its input class as the form's initial state, `new CreatePage(defaults: new StoreProjectData(key: '', description: null, leadId: null, …))`, which every render sends with `description` and `leadId` null by design. Contract Coverage reports `✗ StoreProjectData.description is only ever null (at projects/create › defaults.description): add a feature test that renders projects/create with defaults.description not null.`, which no test can do, so `ci:check` can't pass without changing the page.

**Manual workaround:** none that keeps the convention: send the defaults as a different class, or drop the nullable fields from them.

**Closed by:** an input class is the type of what the form sends back as well, so a value the server accepted shows the same states. The Contract recorder keeps what each form request sent when the server accepted it (validated without errors, below 400) in its `form` record ([`ContractRecorder`](../packages/laravel/src/Testing/ContractRecorder.php)), and [`ContractCoverage`](../packages/laravel/src/Coverage/ContractCoverage.php) feeds it to [`ShapeCoverage::observeAccepted()`](../packages/laravel/src/Coverage/ShapeCoverage.php): a test that creates a project with a description closes the gap. Accepted values only mark states as seen; a field no test submits filled in is no gap of its own, since every form endpoint's input is already checked by its `form` Contracts. A gap on an input class now names both ways to close it: `…: add a feature test that renders projects/create with defaults.description not null, or one whose request a form endpoint accepts with StoreProjectData's description not null.` Scenarios: `form-defaults-empty-by-design-pass-coverage`, `form-field-never-sent-fails-coverage`.

### P-127

**Contract Coverage depends on the random data factories produce**

- **Type Boundary:** every Type Boundary
- **Source:** found porting Tracklane into the Testbed App (#23)
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `ProjectFactory` fills `description` with `fake()->optional()->sentence()`, and the only test that renders the project edit page leaves it to the factory. Contract Coverage passes or fails `UpdateProjectData.description is only ever null` from one run to the next.

**Manual workaround:** in the tests Contract Coverage relies on, set every nullable, optional or list field explicitly, once filled in and once empty.

**Reasoning:** Contract Coverage reports what the tests produced, and only the app's tests decide what that is; the Overlay can't tell a value a test chose from one a factory drew. Each gap already names the test to add, and once a test sets the field explicitly the result is stable. The Testbed App's tests set every such field and run its Contract Coverage repeatedly without a gap.

### P-132

**Contract Coverage counts every variant of a discriminated union as seen when one is**

- **Type Boundary:** every Type Boundary
- **Source:** found porting Tracklane's Board area into the Testbed App (#25)
- **Upstream:** none
- **Status:** closed

**Reproduction:** the activity feed's `ActivityData.payload` is `IssueCreatedPayload|StatusChangedPayload|PriorityChangedPayload|AssigneeChangedPayload|CommentedPayload|MemberJoinedPayload`, a discriminated union on a literal `type` (`/** @var ActivityType::StatusChanged */`). Three of its variants send the same keys (`from`, `to`, `type`). Contract Coverage told union variants apart by their keys only, so a test that only ever records a status change passes `strictly:coverage --strict` as if it had sent a priority change and an assignee change too, although `tsc` never saw those variants (an `IssuePriority` where an `IssueStatus` was, a `UserSummaryData | null` `to`).

**Manual workaround:** none; a gap that isn't reported can't be noticed. Exercise every variant anyway.

**Closed by:** a value is a union variant only if, for each of the variant's properties typed as a literal, it sends one of the literal's values, as `tsc` narrows a discriminated union ([`ShapeCoverage::isVariant()`](../packages/laravel/src/Coverage/ShapeCoverage.php)). The literals come from the same PHPDoc type the TypeScript literal is generated from ([`LiteralValues`](../packages/laravel/src/TypeScript/LiteralValues.php), shared with the `in:` rule inferred for a literal input, [P-020](#p-020)): string, int and float literals, class constants and enum cases. A test that only records a status change now fails with `✗ ActivityData.payload is never seen as PriorityChangedPayload (…)`. Scenarios: `discriminated-union-every-variant-passes-coverage`, `discriminated-union-variant-never-seen-fails-coverage`. The Testbed App's activity feed test sends every variant.

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
- **Status:** closed

**Reproduction:** `props.project as ProjectData`, `<T>x` or `user!.name` in app code compiles whatever the generated type says.

**Manual workaround:** the `type-safety/no-type-assertions` lint rule rejects `as`, `<T>x` and `!` (not `as const`) outside the boundary modules ([P-069](#p-069)).

**Closed by:** the installer hook `vite.config.ts: oxlint rejects type and non-null assertions` ([`ViteLintPlugin::rejectAssertions()`](../packages/laravel/src/Install/ViteLintPlugin.php)) turns on oxlint's own `typescript/consistent-type-assertions` (with `assertionStyle: 'never'`, which still allows `as const`) and `typescript/no-non-null-assertion` in the app's Vite+ lint config. `props.project as ProjectData` and `<UserData>meta` fail `ci:check:lint` with `typescript(consistent-type-assertions): Do not use any type assertions.`, and `auth.user!.name` with `typescript(no-non-null-assertion): Forbidden non-null assertion.` App code narrows with a check instead (`=== null`, `typeof`, a type guard for an `unknown`, [P-062](#p-062)); a cast that is really needed takes a suppression with its reason (ADR-0007). The vendored shadcn/ui components in `resources/js/components/ui/`, which cast CSS variables to `React.CSSProperties`, are already outside lint (the Base Kit's `ignorePatterns`), and the Overlay's own casts live in the npm package ([P-069](#p-069)), so app code needs no other exemption. Kit Conversion narrows the appearance `use-appearance.tsx` reads from `localStorage` with a check against the `Appearance` values, and types `use-current-url.ts`'s `whenCurrentUrl()` with overloads instead of `null as TIfFalse`. What still asserts without a cast: an `any` ([P-175](#p-175)) and a hand-written type guard ([P-176](#p-176)). Scenarios: `type-assertion-on-page-prop-fails-lint`, `angle-bracket-assertion-on-unknown-fails-lint`, `non-null-assertion-fails-lint`, `narrowed-instead-of-asserted-passes`, `assertion-rules-added-by-reinstall-fails-lint`.

### P-069

**Casts remain in three boundary modules**

- **Type Boundary:** every Type Boundary
- **Source:** overview §5; type-safety "Remaining gaps"
- **Upstream:** none
- **Status:** accepted gap

**Reproduction:** `@/lib/requests`, `@/lib/page` and `components/typed-form.tsx` contain casts: Inertia types errors as `Record<string, string>` and props as its global type, and constrains forms with a type a generic can't satisfy; minting a `FieldName` is a cast by definition.

**Manual workaround:** each cast states what proves it (the recorded Contracts); the lint rule allows casts only in these modules.

**Reasoning:** Inertia's own types are looser than the generated ones, so bridging them needs casts somewhere. Confining them to three modules, each cast justified and backed by Contracts, keeps the rest of the app cast-free.

### P-175

**An `any` from an untyped API reaches typed code without a cast**

- **Type Boundary:** every Type Boundary
- **Source:** issue #52
- **Upstream:** none
- **Status:** open

**Reproduction:** `const project: ProjectData = JSON.parse(text)`, or a third-party function typed as returning `any`, compiles and passes lint: TypeScript lets `any` flow into any type, so the value is cast without `as`, and the rules against type assertions ([P-068](#p-068)) don't see it.

**Manual workaround:** read such a value as `unknown` (`const parsed: unknown = JSON.parse(text)`) and narrow it.

### P-176

**A hand-written type guard is trusted as written**

- **Type Boundary:** every Type Boundary
- **Source:** issue #52
- **Upstream:** by design: TypeScript doesn't check a written type predicate (`value is UserData`) against the function's body
- **Status:** accepted gap

**Reproduction:** `function isUser(value: unknown): value is UserData { return typeof value === 'object'; }` compiles and passes lint, and every `isUser(meta) && meta.name` after it reads `meta` as a `UserData` the check never proved, like a cast ([P-068](#p-068)).

**Manual workaround:** check in the guard's body every field its predicate claims, and review guards as closely as casts.

**Reasoning:** narrowing an `unknown` ([P-062](#p-062)) needs a guard whenever the check doesn't fit in one expression, and the predicate is how TypeScript lets a function narrow. Lint can't compare a predicate with its body (oxlint's own rules have no such check, and JS plugins are syntactic, [P-070](#p-070)), so rejecting written predicates would reject the narrowing P-068 asks for.

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
- **Status:** closed

**Reproduction:** save `final class ProjectData extends Dat` (a half-typed parent class) while `composer dev` runs. The file parses, so `strictly:generate` runs; loading the class throws, typescript-transformer skips it, and generation exits 0 with `ProjectData` missing from `@/generated`. Every component that uses the type breaks until the class loads again. `ci:check` still fails (PHPStan reports the unknown class), so only the dev loop is affected.

**Manual workaround:** none; finish the edit and the next save regenerates the type.

**Closed by:** `strictly:generate` (the `generate` step of `ci:check`, and `build` and `types:check`, which generate first) loads every class under `app/` that typescript-transformer would transform before it generates anything, and fails when one can't be loaded, listing each as `app/Data/ProjectData.php: App\Data\ProjectData can't be loaded: Class "App\Data\Dat" not found` ([`UnloadableClasses`](../packages/laravel/src/Workarounds/TypeScriptTransformer/UnloadableClasses.php)). Nothing is written, so while the dev server runs the Vite plugin logs the failure and the last good types stay ([P-064](#p-064)); the first save after which the class loads regenerates them. A class that can't be loaded counts when it is a backed enum, when its parent classes or interfaces make it a Data class (Page classes are Data classes), or when it is in `App\Data` or `App\Pages`, whatever its half-typed parent. Any other class, such as a service provider for a dev-only package that a production install leaves out, and one marked `#[Hidden]` are skipped as before, so they never fail a build. This runs before anything else loads an app class, so it also reports an input or query class that `config/strictly.php` declares for a vendor action (the Kit's `App\Data\Auth\LoginData`); one declared from outside `App\Data` that can't be loaded fails the vendor declarations' check with its load error ([P-025](#p-025)). A Data class elsewhere whose parent class doesn't exist is [P-183](#p-183). Scenarios: `data-class-parent-missing-fails-generate`, `data-class-outside-data-namespace-unloadable-fails-generate`, `vendor-declared-input-unloadable-fails-generate`, `unloadable-class-without-a-type-passes`; harness test "while the dev server runs, tsc sees a saved Data class and a new or deleted page file, and a half-written Data class, one that can't be loaded or two that generate the same type name keep the last good types".

### P-183

**A Data class outside `App\Data` whose parent class doesn't exist still drops its type**

- **Type Boundary:** every Type Boundary
- **Source:** found while closing [P-073](#p-073)
- **Upstream:** no upstream issue filed (as [P-073](#p-073))
- **Status:** accepted gap

**Reproduction:** save `final class ReportData extends Dat` in `app/Reports/ReportData.php` (a Data class outside `App\Data`, which `strictly.dataNamespace` allows) while `composer dev` runs. Its parent class doesn't exist, so nothing in its source says it is a Data class: `strictly:generate` skips it as typescript-transformer does, exits 0, and `ReportData` is missing from `@/generated` until the class loads again. `ci:check` still fails (PHPStan reports the unknown class), so only the dev loop is affected.

**Manual workaround:** keep Data classes in `App\Data`, as the Boost guideline asks; there a Data class that can't be loaded fails generation whatever its parent.

**Reasoning:** a class whose own parent class doesn't exist could be anything. Failing generation on every such class in `app/` would also fail every production build (`build` generates first) on classes that legitimately can't be loaded there, such as a service provider for a dev-only package that `composer install --no-dev` leaves out. The Data namespace tells a Data class mid-edit from those. Outside it, a class that extends a Data class and lacks an interface or trait still fails generation.

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

### P-124

**`ci:check` fails in a fresh clone because feature tests need a Vite build**

- **Type Boundary:** every Type Boundary
- **Source:** spec user story 58; found porting Tracklane into the Testbed App (#23)
- **Upstream:** none (the Base Kit builds before its tests in its own CI)
- **Status:** closed

**Reproduction:** clone an installed app and run `composer ci:check`. `public/build` is gitignored and nothing in `ci:check` builds, so every feature test that renders a page fails with `Vite manifest not found at: …/public/build/manifest.json` (16 of the Base Kit's own tests). In a working copy that was built once, a new page fails the same way (`Unable to locate file in Vite manifest: resources/js/pages/projects/index.tsx`) until the next build. No Contract is recorded for those pages.

**Manual workaround:** run `pnpm run build` before `ci:check`, or call `$this->withoutVite()` in the test case (the Reference Implementation's `tests/TestCase.php` did).

**Closed by:** [`RecordsContracts`](../packages/laravel/src/Testing/RecordsContracts.php), which the installer applies to every feature test, renders pages without the Vite build: Contracts check payloads, not asset tags. A test that needs the real tags calls `$this->withVite()`. Scenarios: `fresh-clone-without-build-passes-test`, `vite-assets-without-build-fails-test`.

### P-146

**AI coding agents are taught the untyped way**

- **Type Boundary:** every Type Boundary
- **Source:** spec user stories 65 to 67; issue #30
- **Upstream:** by design: Laravel Boost's guidance is written for any Inertia app ([`inertia-laravel/core`](https://github.com/laravel/boost/blob/main/.ai/inertia-laravel/core.blade.php), [`inertia-react-development`](https://github.com/laravel/boost/tree/main/.ai/inertia-react))
- **Status:** closed

**Reproduction:** the Base Kit is generated with `--no-boost`, so an AI coding agent working in an installed app gets no guidance at all. Add Boost the usual way (`composer require laravel/boost --dev`, `php artisan boost:install`) and the agent files it writes (`CLAUDE.md` or `AGENTS.md`, `.claude/skills`) say "Use `Inertia::render()` for server-side routing", and its `inertia-react-development` skill shows `<Link href="/users">`, `router.visit('/users')`, `useForm` and `<Form>`. Nothing mentions Page classes, input classes, `<TypedForm>`, `useRouteHttp()`, `forPage()`, Contracts or Contract Coverage. An agent that follows the guidance writes code `ci:check` rejects (`strictly.inertiaRender`, `strictly/typed-requests`, `strictly/no-hardcoded-urls`), or hand-types the props `ci:check` would have generated, and then works around the checks.

**Manual workaround:** paste the type-safety standard (the Reference Implementation's `docs/type-safety.md`, kept as [`research/type-safety.md`][type-safety]) into the app's `CLAUDE.md` and keep it in step with each release by hand.

**Closed by:** the Composer package requires `laravel/boost` and ships a Boost core guideline (`resources/boost/guidelines/core.md`: the condensed standard, what checks what, and that it overrides Boost's generic Inertia guidance) and one skill per workflow (`resources/boost/skills/strictly-*/SKILL.md`), which Boost reads from the installed package, so they update with it. Boost installs a third-party package's guidance only when the app's `boost.json` lists it, and the Base Kit gitignores `boost.json` along with every agent file Boost writes; [`BoostGuidance`](../packages/laravel/src/Boost/BoostGuidance.php) adds the package to `boost.json` before `boost:install` and `boost:update` run, so no guidance is selected or committed by hand. The installer hook `Composer scripts: boost:update after composer update` ([`BoostUpdateScript`](../packages/laravel/src/Install/BoostUpdateScript.php)) runs `boost:update` after `composer update`, as `laravel new` does for an app it installs Boost in. Each skill's worked example is a scenario that passes the full `ci:check`, and `harness/tests/boost-guidance.test.ts` fails when a skill's code drifts from its scenario, quotes a diagnostic no breaking scenario produces, or names a lint rule or PHPStan identifier that doesn't exist. Scenarios: `skill-add-page-example-passes`, `skill-add-form-example-passes`, `skill-add-query-filters-example-passes`, `skill-add-json-endpoint-example-passes`, `skill-add-deferred-props-example-passes`, `skill-add-broadcast-event-example-passes`, `skill-add-translation-example-passes`, `skill-close-coverage-gap-example-passes`, `skill-close-coverage-gap-example-gap-fails-coverage`. Harness tests: "Boost installs the package's core guideline and every skill, and nothing it writes is committed (P-146)" and "composer update runs boost:update; an app that lost that script fails ci:check:install until strictly:install restores it (P-146)".

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
[type-safety]: research/type-safety.md
[spec]: https://github.com/mrsafalpiya/strictly-laravel/issues/1
