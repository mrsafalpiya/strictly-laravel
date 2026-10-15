> **Archived from the Reference Implementation (2026-10-14).** This is the template's own standard, `docs/type-safety.md`, kept verbatim when the Reference Implementation's code was retired (#31). It describes that template, not the Overlay: paths such as `app/Support/…`, `config/types.php`, `lint/type-safety.js`, `tests/Support/…` and `@/lib/*` name files of the template and Tracklane that are no longer in this repo. The Problem register cites its rules as "type-safety rule N"; what the Overlay ships instead is in the Problem register's **Closed by** entries and the Composer package's Boost guidance (`packages/laravel/resources/boost/`).

# Type safety: how this codebase works

PHP is the single source of truth for every shape that crosses into React. You never write a TypeScript
type for server data by hand — you write PHP, and the TypeScript appears (Vite regenerates it ~1 s after
you save while `composer dev` runs; `composer types` does it by hand).

```
PHP (app/)                                 generated (resources/js/generated, @/types)   React
─────────────────────────────────────────  ────────────────────────────────────────────  ─────────────────────────
App\Pages\Projects\ShowPage (page props) → PageProps<'projects/show'>                  → pages/projects/show.tsx
App\Data\**\*Data          (data shapes) → ProjectData, StoreProjectData, …             → import type { … } from '@/types'
App\Enums\*                (enums)       → 'active' | 'archived' …                      → satisfies Record<ProjectStatus, …>
App\Data\SharedProps / FlashData         → usePage().props / page.flash                 → typed everywhere
routes + controller type-hints           → @/routes/*, @/actions/* (Wayfinder)          → show({ project })
```

## The rules

### Pages

1. **Every Inertia page is a `Page` class**: `App\Pages\Projects\ShowPage` ⇔ `resources/js/pages/projects/show.tsx`.
   `php artisan make:page projects/show` creates both. Controllers `return new ShowPage(...)`.
   `tsc` fails if the page file is missing or its component asks for a prop the class doesn't send;
   an arch test fails if a page file has no class, or if anything calls `Inertia::render()` with an array.
2. **Shared props** live in `App\Data\SharedProps` (built in `HandleInertiaRequests::share`); flash messages
   go through `App\Support\Inertia\Flash::success()` and are typed by `App\Data\FlashData`.
   Guest-visible values are nullable (`auth.user: UserData | null`) — use `useUser()` on authenticated pages.

### Data classes (everything sent to React)

3. **Every prop is a laravel-data class** in `App\Data\<Area>\`: `final`, camelCase properties, built with a
   named `fromModel()` so Larastan checks every argument. Document which relations it needs loaded:
    ```php
    final class ProjectData extends Data
    {
        public function __construct(public int $id, public ProjectStatus $status, public ?UserSummaryData $lead) {}

        /** Requires lead. */
        public static function fromModel(Project $project): self
        {
            return new self(id: $project->id, status: $project->status, lead: $project->lead === null ? null : UserSummaryData::fromModel($project->lead));
        }
    }
    ```
    Never send Eloquent models or `JsonResource`s — the Data class is the whitelist (hidden columns can't leak).
    Only Data classes go in `App\Data` (arch test); helpers go in `App\Support`, rules in `App\Rules`.
4. **Arrays need their item type**: `/** @var array<int, TaskData> */ public array $tasks` → `TaskData[]`.
   `Collection::all()` gives `array<int, X>` (not `list<X>`).
5. **Dates**: `CarbonInterface` → ISO-8601 `string`. Calendar dates use `#[DateOnly]` → `"2026-10-14"` both ways.
6. **Enums**: backed enums anywhere in `app/` become unions of their values. Put labels/colours/icons in
   `resources/js/lib/domain.ts` as `satisfies Record<Enum, …>` — a new PHP case then fails `tsc` until it is
   handled. Iterate `enumValues.Status` from `@/generated` — every backed enum's values, generated in case order
   (`Object.keys(labels) as Status[]` is a cast, and wrong for int enums). For a literal union that isn't an enum,
   `allOf<WeekStart>()('monday', 'sunday')` (`@/lib/domain`) fails to compile when a member is missing.
7. **Maps keyed by an enum**: prefer a list of objects (`array<int, ColumnData>` with a `status` field) — it
   keeps order and can't lie. If you need a map, write `/** @var array<value-of<Status>, int> */` →
   `Partial<Record<Status, number>>` (PHPStan can't prove every key is present, so TS doesn't claim it).
   An empty PHP map serialises as `[]`, not `{}`.
8. **Literal types and discriminated unions**: `/** @var 'monday'|'sunday' */` → `'monday' | 'sunday'` (and the
   server validates it). For unions, give each variant a literal discriminator:
   `/** @var ActivityType::Commented */ public ActivityType $type = ActivityType::Commented` → `type: 'commented'`,
   then `switch (x.type) { … default: return x satisfies never; }` in React.
9. **Deferred / optional props**: `public Lazy|ProjectStatsData $stats` + `Lazy::inertiaDeferred(fn () => …)` →
   `stats?: ProjectStatsData`, so the component must handle "not loaded yet". `Lazy::inertia()` = only on
   partial reloads.
   **Prop names** (`only`/`except`/`reset`, `<Deferred data>`, `<WhenVisible data>`, `<InfiniteScroll data>`) go
   through `const page = forPage<'projects/show'>()` from `@/lib/page`: `router.reload({ only: page.only('stats') })`,
   `<page.Deferred data="stats">`. Optimistic updates too: `optimistic: page.optimistic((props) => …)` is typed by
   the page's props (Inertia's `router.optimistic<TProps>()` takes any type you name). Lint rejects raw
   `only: ['stats']` lists, `router.optimistic()` and direct imports of those components.
10. **Pagination**: `/** @var PaginatedDataCollection<int, X> */` + `X::collect($paginator, PaginatedDataCollection::class)`
    → `{ data: X[], links, meta }`; render with `<Pagination paginator={…} />`. Infinite scroll:
    `/** @var ScrollProp<CursorPaginatedDataCollection<array-key, X>> */ public ScrollProp $items` +
    `new ScrollProp(X::collect($cursorPaginator, CursorPaginatedDataCollection::class), …)`.

### Requests (everything React sends)

11. **Inputs are Data classes extending `App\Support\Data\InputData`.** Type-hint one in a controller and the
    request is validated; the same class types the form, **inferred from the route**:
    `const form = useRouteForm(store(workspace), defaults)` (`@/lib/requests`) has `data`/`setData`/`errors` of
    `StoreProjectData` — errors keyed by its properties including nested/array ones
    (`errors['settings.notifications.onAssign']`, `tasks.0.title`) — and `form.submit(options)` sends it there.
    Send the initial form state from the page, typed as the input class (`public StoreProjectData $defaults`).
    - **Validation is inferred from the types and matches TS**: non-null → required, `int` → `integer`,
      arrays → `present` (empty allowed; add `#[Min(1)]` otherwise), each item of a typed list is validated,
      literal unions → `in:`. Add attributes (`#[Max(120)]`, `#[DateFormat('Y-m-d')]`) or `rules()`;
      `rules()` is **merged** with the inferred rules (that's why `InputData` exists).
    - **Authorize before validating**: `public static function authorize(): bool` on the input class
      (otherwise an unauthorized user gets a 422 listing fields instead of a 403).
    - Records scoped to a tenant/parent: use `exists` rules built in `rules()` (see the showcase's `WorkspaceRules`).
    - One-off requests: `submit(update(route), { status })` — the payload is the route's input type (PATCH:
      `Optional|…` properties → optional keys), and `onError` receives errors keyed by its fields.
      `visit(destroy(route))` for requests without a payload (GETs, or actions without input); `visit()` refuses a
      route that takes a payload. Lint rejects Inertia's `router.get/post/put/patch/delete()`, `<Link data>`,
      `useForm()` and `useHttp()` outside `@/lib/requests`: they accept any payload.
    - Uploads: `public UploadedFile $file` → `file: File`; `useRouteForm` holds file fields as `File | null` until
      one is picked (the server still requires it).
12. **Query strings** (filters, `?archived=1`): a Data class extending `App\Support\Data\QueryData`, type-hinted
    in the GET action (`public function index(ProjectFiltersData $filters)`). Parsing is lenient (invalid items and
    keys fall back to defaults, so old bookmarks never 422), and Wayfinder's route function gets a typed `query`:
    `index(workspace, { query: { status: ['active'], archived: true } })` — a wrong key or value fails `tsc`.
    Send the same object back as a prop so the filter UI is typed by it too.
13. **Forms**: `useRouteForm(route, defaults)` for rich forms; for plain ones use `<TypedForm>` from
    `@/components/typed-form` — its payload type is **inferred from the route** (Wayfinder brands `.form()` with the
    action's InputData), and field names come from the render prop:
    `<TypedForm {...store.form()}>{({ errors, field }) => <Input name={field('name')} />}</TypedForm>`.
    `field()` returns a branded `FieldName`, and `name` only accepts that — on `Input`, `Textarea`, `PasswordInput`,
    `Checkbox`, `Select`, `InputOTP`, `Button` **and on React's own `<input>`/`<select>`/`<textarea>`/`<button>`**:
    the app's JSX types (`tsconfig.json` → `jsxImportSource: "@/types/jsx"`, `resources/js/types/jsx/jsx-runtime.d.ts`)
    are React's with those controls' `name` narrowed to `FieldName`. A plain string can't name a field, even in a
    variable, and a component forwarding `name` to a raw control must declare it `name?: FieldName`, or `tsc` fails.
    (Vite still compiles JSX with React's runtime; only the types differ.) Lint rejects Inertia's untyped `<Form>` and,
    inside `<TypedForm>`, a literal `name="…"` on third-party components whose `name` is a plain string.
    Controllers you don't own (Fortify) declare their payload in `config/types.php` (`Controller@method => Data
class`, or a `QueryData` class for a GET's query string). The declaration is verified, not trusted: tests submit
    those forms with payloads built from the declared class, every key the vendor **validates, reports an error for
    or reads** (`$request->boolean('remember')`, `only()`, `has()`, `$request->password`, … — the test request
    records reads, see `tests/Support/InputReads.php`) must be a field of it (`tsc`), and coverage fails if a
    declared field is never validated or read (misnamed, or not something the vendor uses). The same read check
    applies to your own actions: an action can't read a request key its InputData doesn't declare.
    **Errors are fields**: every validation error the server returns must be a field of the action's input type
    (checked from the recorded contracts). A refusal that isn't about a field (e.g. "this project still has
    issues") is an error toast: `Flash::error('…'); return back();`.
14. **JSON endpoints** (non-Inertia, e.g. search): return a Data object from the controller (`: SearchResultsData`);
    the route is branded with it, so the client derives both types from the route:
    `const http = useRouteHttp(search(workspace), { q: null })` → `await http.submit()` is a `SearchResultsData`.
    Vendor JSON endpoints declare their response in `config/types.php` (`route_responses`: a Data class, or a
    TypeScript type for JSON that isn't one object — Fortify's 2FA QR code is `'{ svg: string; url: string } | []'`);
    the tests check every response against it. Without a declared response, the response is `unknown`.
    **Casts**: lint rejects `x as T`, `<T>x` and `x!` (`as const` is fine) except in the boundary modules
    (`@/lib/requests`, `@/lib/page`, `components/typed-form.tsx`), where each cast states something the compiler
    can't see and says why. **URLs** come from Wayfinder: lint rejects hard-coded paths (`href="/dashboard"`).

### Routes, auth, models

15. **Routes** come from Wayfinder: `import { show } from '@/routes/projects'` → `show({ workspace, project })`.
    Pass Data objects directly: Wayfinder reads binding keys (`{slug}`, `{key}`) **from the controller method's
    type-hints**, so always type-hint bound models. Never hard-code a URL. Avoid `Route::redirect()` until
    laravel/wayfinder#326 ships (Laravel 13's `QUERY` verb breaks the generated types).
    **Route parameters are nominal**: a parameter bound to `Project` takes `RouteKey<'Project', string>` (or an object
    with such a `key`), and the route-key property of a Data class built by `fromModel(Project $project)` is generated
    as exactly that (`App\Support\Wayfinder\RouteKeys`). So `show({ workspace, project })` accepts a ProjectData or
    its `key`, but not an issue, an issue's key, `member.user` where a membership is expected, or a string literal.
    A property holding _another_ model's key declares it: `#[RouteKeyOf(Project::class)] public string $projectKey`.
    Tests check every branded value a response sends is an existing key of its model (`tests/Support/RouteKeyChecks.php`;
    each table gets its own id range in tests, so a user id is never also a membership id).
16. **Authorization**: policies + `Gate::authorize()`; send abilities as a Data object (`can: ProjectAbilitiesData`)
    instead of recomputing permissions in JS.
17. **Models**: `Model::shouldBeStrict()` is on — lazy loading or reading an unloaded attribute throws (factories
    must set every column the app reads). Declare non-nullable `BelongsTo` relations with
    `@property-read Project $project`; Larastan types relations as nullable and reads casts from `casts()`.

## What checks what

| Check                                                       | Catches                                                                                                                                                                                                                                                                                                                                                                                              | Command            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `tsc` (TS 7, strict + `noUncheckedIndexedAccess`)           | React using a prop, field, route, query key or form field that doesn't exist; a form control (ours or a raw `<input>`/`<select>`/`<textarea>`/`<button>`) named by anything but `field()`; a route given another model's key; a form, payload, error key or JSON response that doesn't match the route's types; missing page file; page expecting unsent props; unhandled enum case or union variant | `pnpm types:check` |
| Lint (`lint/type-safety.js`)                                | Prop names written as raw strings (`only`, `except`, `reset`); literal field names on third-party components inside `<TypedForm>`; Inertia's untyped `Form`/`Deferred`/`WhenVisible`/`InfiniteScroll`/`useForm`/`useHttp`/`router.post…`/`<Link data>`; hard-coded URLs; type assertions outside the boundary modules                                                                                | `pnpm check`       |
| Contracts (`tests/Support/InertiaContracts.php`)            | Generated types disagreeing with what the server **actually** sent: every page, partial reload (requested keys must be present), flash (also on redirects) and JSON endpoint seen by any feature test; every field the server validates, every error key it returns and every input key it reads being a field of the action's input type; every route-key value being a real key of its model       | `composer test`    |
| Contract coverage (`php artisan types:coverage --strict`)   | A page, deferred prop, JSON endpoint or form endpoint no test exercises; a declared vendor field never validated or read; a declared vendor JSON endpoint never called; a route-key brand a response contradicted; a nullable field only ever `null`, a list only ever empty, a union variant or scalar-union member never seen — anything whose type `tsc` never got to check                       | `composer test`    |
| PHPStan max + Larastan + strict-rules + 100 % type coverage | PHP building a Data object with wrong/nullable values; untyped code (tests included)                                                                                                                                                                                                                                                                                                                 | `composer analyse` |
| Arch tests (`tests/Arch`)                                   | `Inertia::render([...])`, page files without a class, non-final/non-Data classes in `App\Data`, inputs not extending `InputData`                                                                                                                                                                                                                                                                     | `composer test`    |
| Pest                                                        | Behaviour                                                                                                                                                                                                                                                                                                                                                                                            | `composer test`    |

`composer ci:check` runs all of it in order: generate → pint → phpstan → lint/format → pest (+ contracts) →
contract coverage → tsc. When coverage reports an unverified shape, add a test that produces it (see
`tests/Feature/ShapeCoverageTest.php`).

## Remaining gaps

- **Combinations are proven per shape, not per combination** — by design: a TypeScript object type is a set of
  independent properties, so proving each property's every shape (non-null, non-empty, each union variant and
  member) covers the whole type. The only way a type correlates properties is a union, and each variant is
  checked on its own. A correlation _outside_ the type (e.g. "`completedAt` is set when `status` is `done`") isn't a
  typing claim, so no type can be wrong about it; model it as a discriminated union if the UI relies on it.
- **Input reads are seen per key.** A vendor that reads the whole input (`$request->all()['x']`, `except()`) names no
  field, so such a field only counts if the vendor validates it (otherwise coverage reports it as never used — it
  can't pass silently, but a key read that way and missing from the declaration isn't detected). Reads in code paths
  no test reaches aren't seen either, and a `final` vendor FormRequest can't be tracked (its fields then fail as
  never read). Framework plumbing is ignored: `_token`-style keys, the paginator's `page`/`cursor`, laravel-data's
  `include`/`exclude`.
- **`FieldName` proves a name came from `field()`, not from _this_ form's `field()`**: a name taken from one
  `<TypedForm>` and used inside another type-checks. Names reaching the DOM without JSX (`createElement`,
  `FormData.append`) aren't covered, and third-party components typing `name` as `string` are only covered by the
  lint rule inside `<TypedForm>`.
- **Casts remain in three boundary modules** (`@/lib/requests`, `@/lib/page`, `components/typed-form.tsx`): Inertia
  types errors as `Record<string, string>` and props as its global type, and constrains forms with a type a generic
  can't satisfy; minting `FieldName` is a cast by definition. Each states what proves it (the recorded contracts).
  The request and cast rules are syntactic: `const r = router; r.post(…)` or a re-exported `useForm` escapes them.
  `router.visit(url)` with a server-provided URL string (the passkey redirect) is allowed.
- **Vendor JSON responses declared as TypeScript types** (not Data classes) are checked response by response by
  `tsc`, but get no shape coverage (which union members a test produced).
- **Route keys are checked for existence, not identity**: a `ProjectData` whose `key` is filled with _another_
  project's key passes (it is still a project key), and keys scoped to a parent (an issue `number` within a project)
  are checked against all rows. Brands are per model (class basename), not per binding field; parameters bound by
  explicit `Route::bind()` closures or to non-Eloquent `UrlRoutable`s stay plain `string | number`. Disjoint id
  ranges are applied on SQLite test databases only.
