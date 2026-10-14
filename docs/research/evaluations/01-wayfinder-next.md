# Experiment 01 — Laravel Wayfinder `next` (beta) as the single source of types

Stack: Laravel 13.36 · inertia-laravel 3.5.1 · @inertiajs/react 3.9.1 · React 19 · TS 5.x · PHP 8.5.8 · Node 26.
Wayfinder: `laravel/wayfinder dev-next @ be273f8` (pulls `laravel/ranger 0.5.1`, `laravel/surveyor 0.3.0`).
Vite plugin: `@laravel/vite-plugin-wayfinder 0.1.10` (latest on npm; no `next` build of the plugin exists).

Everything below was run in this directory; generated output, contract files and logs are kept (see "Files" at the end).

---

## 1. Verdict

**Not production-ready as the only, trusted source of types for a long-lived project.** It is a good *route-helper + enum* generator, a decent *model-column* generator, and a mediocre-to-unsound *Inertia props / form request* generator.

- **Great:** route/action helpers (typed route-model-binding params, `.form()` variants), named routes, string/int enums + enum `Meta` constants, `$hidden`, `whenLoaded`/`whenCounted`, deferred/optional props, nullable `auth.user`, `sharedPageProps` augmentation, ~1 s regeneration in `vite dev`.
- **Lies (tsc passes, runtime differs):** `decimal:2` typed `number` (JSON is a string); non-appended accessor typed as always present; `JsonResource` props typed without the `data` wrapper Inertia v3 actually sends; paginator `data`/`links` typed `Record<string, unknown>` (they are arrays).
- **Useless (`unknown`):** paginator with `->through()`, `array_map`/`Collection::map` results, `->count()` in closures, `->only()`, `array` cast, `?->toDateString()`, `config()` values.
- **Form requests are weak:** `tasks.*.title` is emitted as a literal dotted key (no nesting, despite the README), `Rule::enum()` becomes `string` (or the field is dropped), `sometimes|required` is typed required, dynamic `in:` rules produce **syntactically invalid TS** that breaks `tsc`.
- **Operational hazards:** mtime-based analysis cache serves stale types after `git stash`/`mv`/`cp -p`-style restores; DB schema changes (migrations) are never picked up without `--fresh` (~13 s); generation silently succeeds against an empty/missing DB and emits column-less models (`Task = Record<string, never>`); dangling type refs in `types.d.ts` silently become `any` under the default `skipLibCheck: true`; the Laravel 13 `query` verb bug is **not fixed on `next`** (tsc fails out of the box); output embeds absolute machine paths (44 files).
- **Missing:** no page types for `Route::inertia()` pages (welcome, dashboard) or Fortify view closures (`auth/*`); no `flashDataType` for Inertia v3 `Inertia::flash()`; nothing links `pages/projects/show.tsx` to `Inertia.Pages.Projects.Show` (pure convention).

Recommendation: if adopted, use it for routes + enums, and for models/page props **only** with the guardrails in §10 (PHPDoc `@property`/`@var array{...}` on the PHP side, `skipLibCheck: false`, `wayfinder:generate --fresh` in CI after `migrate`, and a contract test like the one in this experiment). Do not let it be the thing that guarantees JSON soundness. Beta status ("API is subject (and likely) to change prior to v1.0.0") — pin the commit.

---

## 2. Scores per spec item

Legend: ✅ correct · 🟡 partially (correct only after PHP-side annotation, or imprecise but not lying) · ❌ wrong (type lies about runtime JSON or emits invalid TS) · ⛔ unsupported (nothing / `unknown`).
"Raw" = what Wayfinder emits with no annotations; "After workaround" = state of the code now.

| # | Spec item | Raw | After workaround | Evidence (generated TS) |
|---|---|---|---|---|
| E1 | `ProjectStatus: string` enum | ✅ | ✅ | `type ProjectStatus = "active" \| "on_hold" \| "archived"`; `export const ProjectStatus = { Active, OnHold, Archived } as const` |
| E2 | `Priority: int` enum | ✅ | ✅ | `type Priority = 1 \| 2 \| 3 \| 4`; `export const Priority = { Low, Medium, High, Urgent } as const` |
| E3 | `label()` with `WAYFINDER_GENERATE_ENUM_METHODS=true` | ✅ | ✅ | `export const ProjectStatusMeta = { active: { label: "Active" }, on_hold: { label: "On hold" }, archived: { label: "Archived" } } as const` (static `options()` correctly skipped) |
| M1 | enum cast (`status`, `priority`) | ✅ | ✅ | `status: App.Enums.ProjectStatus`, `priority: App.Enums.Priority` |
| M2 | `decimal:2` cast (`budget`) | ❌ | 🟡 | raw `budget: number \| null` — JSON is `"1234.50"`. With `@property string\|null $budget` → `budget: string \| null` |
| M3 | `array` cast (`settings`) | ⛔ | 🟡 | raw `settings: unknown[] \| Record<string, unknown>`. With `@property array{color: string, notify: bool} $settings` → `{ color: string, notify: boolean }` |
| M4 | `boolean` cast | ✅ | ✅ | `is_public: boolean` |
| M5 | `immutable_date` | 🟡 | 🟡 | `starts_on: string \| null`; JSON is a full ISO datetime (`"2026-01-15T00:00:00.000000Z"`), not a date — type is "true" but carries no format info |
| M6 | `datetime` | ✅ | ✅ | `completed_at: string \| null`, `created_at: string \| null` |
| M7 | `$hidden` (`internal_notes`) | ✅ | ✅ | absent from type and from JSON |
| M8 | relations | 🟡 | 🟡 | `owner?: App.Models.User \| null, tasks?: App.Models.Task[]` — sound (optional), but non-nullable BelongsTo is `\| null` and `->load()` is never reflected, so the show page needs `project.owner?.name` / `project.tasks ?? []` even though they are always loaded |
| M9 | accessor `progress` (`Attribute<int, never>`, not appended) | ❌ | 🟡 | raw `progress: number` **required** on every `Project` but never in JSON (contract: `missing showInitialProps.project: "progress"`). Fix: `#[WayfinderIgnore]` on the accessor, expose as a separate prop; then an `->append('progress')`'d model is not typed with it |
| M10 | `withCount('tasks')` on a model passed directly | ⛔ | ⛔ | `tasks_count` sent but not in type (can't read it without a cast) |
| R1 | `name: required\|string\|max:120` | ✅ | ✅ | `name: string;` |
| R2 | nullable (`description`, `budget`, `starts_on`) | ✅ | ✅ | `description?: string \| null; budget?: number \| null; starts_on?: string \| null;` |
| R3 | `Rule::enum(ProjectStatus)` | ❌ | 🟡 (manual TS) | `status: string;` — a bare `'x' => Rule::enum(...)` (not in an array) **drops the field entirely** |
| R4 | `tags: array`, `tags.*: string` | ❌ | 🟡 (manual TS) | `tags?: unknown[]; "tags.*"?: string;` |
| R5 | `tasks.*.title`, `tasks.*.priority` | ❌ | 🟡 (manual TS) | `tasks?: unknown[]; "tasks.*.title": string; "tasks.*.priority": string;` — dotted keys are also **required** at top level, which makes `useForm<Request>()` unusable (`FormDataType` rejects `unknown[]`) |
| R6 | `UpdateProjectRequest` (`sometimes`) | ❌ | ❌ | `name: string; status: string;` — `sometimes\|required` typed as required |
| P1 | paginator `->paginate(15)->through(fn => [...])` | ⛔ | 🟡 | raw `projects: unknown`. With `@var LengthAwarePaginator<int, array{...}>` → `{ current_page: number, data: Record<string, unknown>, links: Record<string, unknown>, ... }` (wrong: arrays). Working fix: `$projects = $paginator->toArray()` + `@var array{data: list<array{...}>, links: list<...>, ...}` → exact |
| P2 | paginator of models passed directly (`->paginate(2)`) | ❌ | ❌ | `data: Record<string, unknown>`, `links: Record<string, unknown>` (contract: `"__not_an_array__"`). No workaround other than P1's |
| P3 | deferred prop (`Inertia::defer`) | 🟡 | ✅ | raw `stats?: { open: unknown, done: unknown }` (`->count()` in closure unknown); with `(int)` casts → `stats?: { open: number, done: number }`. Optional is correct (absent on first load, `deferredProps.default = ["stats"]`) |
| P4 | `Inertia::optional`, `Inertia::merge` | ✅ | ✅ | `optionalProp?: { heavy: true }`, `mergeProp: number[]` |
| P5 | Model passed directly (`'project' => $project`) | 🟡 | 🟡 | `project: App.Models.Project`; same model type whether or not relations/counts are loaded (see M8–M10) |
| P6 | `$model->only([...])` | ⛔ | ⛔ | `only: Record<string, unknown>` |
| P7 | hand-mapped array | ✅ | ✅ | `mapped: { id: number, status: App.Enums.ProjectStatus, budget: string \| null, settings: {...}, starts_on: string \| null, created_at: string \| null, is_public: boolean }` (inherits the model's attribute types — including the M2/M3 lies when the model is not annotated) |
| P8 | `JsonResource` | ❌ | ✅ (global) | type is the bare `toArray()` shape `{ id, name, status, status_label, budget, starts_on: unknown, created_at, owner?: {...} \| null, tasks_count?: number }`; JSON is `{ "data": { ... } }`. Fix: `JsonResource::withoutWrapping()` makes runtime match. `whenLoaded`/`whenCounted` → `?:` (correct). `->resolve()` → `unknown[]` (❌) |
| P9 | `ResourceCollection` (`::collection()`) | ❌ | ✅ (global) | typed `{...}[]`, JSON is `{ "data": [...] }`; fixed by `withoutWrapping()` |
| P10 | `array_map(fn …)` / `Collection->map()->all()` | ⛔ | 🟡 | `priorities: unknown[]`, `passkeys: unknown[]`. Fix: move into a method with `@return list<array{...}>` (e.g. `Priority::options()`) |
| P11 | conditional keys (`$props['x'] = …` inside `if`) | ❌ | ❌ | starter-kit `settings/security` → `{ ..., "": boolean }` (the two conditional keys collapse into one empty-string key) |
| S1 | `auth.user` nullable for guests | ✅ | ✅ | `auth: { user: App.Models.User \| null }`; guest contract passes; flagged real nullability bugs in starter-kit `settings/profile.tsx` |
| S2 | `name` (`config('app.name')`) | ⛔ | ✅ | raw `name: unknown`; with `config()->string('app.name')` → `name: string` |
| S3 | `flash` (shared, typed by PHPDoc `array{type: 'success'\|…, message: string}\|null`) | 🟡 | 🟡 | `flash: { type: string, message: string } \| null` — literal union widened to `string` |
| S4 | Inertia v3 `Inertia::flash()` (top-level `page.flash`) | ⛔ | ⛔ | no `flashDataType` augmentation generated |
| S5 | `sharedPageProps` for `usePage()` | ✅ | ✅ | generated `inertia-config.d.ts` augments `@inertiajs/core` `InertiaConfig.sharedPageProps` (had to delete the starter kit's hand-written one in `types/global.d.ts`) |
| RT1 | Route / action helpers | ✅ | ✅ | `show(args: { project: number \| { id: number } } \| [project] \| number \| { id: number }, options?)`, `.url()`, `.form()`, `.get()/.head()`, named `routes/projects` |
| RT2 | Laravel 13 `query` verb (`Route::redirect`/`Route::any`) | ❌ | 🟡 | `tsc`: `Type '"query"' is not assignable to type 'Method'` in `Illuminate/Routing/RedirectController.ts`. **Not fixed on `next`.** Patched by `scripts/patch-wayfinder.mjs` |
| PG | page types for `Route::inertia()` and Fortify view closures | ⛔ | ⛔ | only controller-rendered components get `Inertia.Pages.*` (no `Welcome`, `Dashboard`, `Auth.*`) |

Raw score (39 items): ✅ 15 · 🟡 7 · ❌ 11 · ⛔ 6. After PHP-side workarounds most ❌ move to 🟡/✅, but form requests (R3–R6), P2, P6, P11, S4, PG remain broken.

---

## 3. Soundness: contract test

`tests/Feature/WayfinderContractTest.php` seeds data, requests every page with `X-Inertia` + `X-Inertia-Version` (plus a partial reload for the deferred `stats`), and writes `resources/js/__contract__/*.ts` containing:
- a whole-literal `export const x = <json> satisfies <GeneratedType>` (catches excess keys), and
- **granular** checks per leaf `(<json leaf>) satisfies At<T, [path]>` and per object `expectNever<MissingKeys<…>>` / `expectNever<ExtraKeys<…>>` (helpers in `__contract__/_helpers.ts`, hand-written). This matters: a whole-literal `satisfies` only reports the **first** mismatch per object (it reported `budget` but hid the missing `progress`).

`scripts/contract-report.py` turns `tsc` output into one line per JSON path. Only Inertia-level noise: every page JSON has `errors: {}`, which is not in `Inertia.SharedData` (stripped by the test).

### 3a. Raw (no annotations) — `storage/experiment-logs/contract.noannot.report.txt`
| JSON path | Generated type says | Actually sent |
|---|---|---|
| `project.budget` (show, bareModel, loadedModel, mapped, resource) | `number \| null` | `"1234.50"` (string) |
| `project` keys | requires `progress` | no `progress` key |
| `project.settings` | `unknown[] \| Record<string, unknown>` | `{ "color": "#ff0000", "notify": true }` (cannot read without cast) |
| `loadedModel.tasks_count` | not declared | `2` |
| `resource` / `resourceCollection` | bare object / array | `{ "data": … }` wrapper |
| `paginatedModels.data` | `Record<string, unknown>` | array of projects |
| `paginatedModels.links` | `Record<string, unknown>` | `[{url, label, page, active}]` |
| `indexProps.projects` | `unknown` | full paginator (nothing checked; `page.data.map` does not compile) |

Dates (`created_at`, `completed_at`, `starts_on`) all match (`string`), enums match (sent as values), guest `auth.user: null` matches.

### 3b. After PHP-side workarounds
Main `tsc` clean. Remaining known-bad patterns are kept out of the main build in `__contract__/known-bad/` and checked with `npx tsc -p tsconfig.known-bad.json` (`storage/experiment-logs/contract.known-bad.report.txt`): `paginatedModels` (data/links), `resourceResolved` (`unknown[]`), `tasks_count` on models with `withCount`, `progress` on `append()`'d models.

---

## 4. Page component ↔ page props link

**Convention only. Nothing enforces it.** Wayfinder emits `Inertia.Pages.Projects.Show` (derived from the string in `Inertia::render('projects/show')`) and `App.Http.Controllers.ProjectController.Show.Response = Inertia.Pages.Projects.Show`. The developer writes `export default function ProjectShow(props: Inertia.Pages.Projects.Show)` by hand. Annotating the wrong page type (or none) is not detected; a component string with no matching `.tsx` file is not detected; renaming the component in PHP (`projects/show` → `projects/detail`) is only caught because the old type name `Inertia.Pages.Projects.Show` disappears (breakage test 8). The opt-in `WAYFINDER_GENERATE_INERTIA_COMPONENT=true` (in config, not in README) only adds `component: "projects/show"` to route definitions and `show.withComponent(...)` helpers (for Inertia v3 instant visits) — it does not tie a file to a type.

---

## 5. Breakage detection (`scripts/breakage.sh`, logs in `storage/breakage/*.txt`)

Each case: mutate PHP → `wayfinder:generate` → `tsc` → revert.

| Change | Detected in React by `tsc`? | Notes |
|---|---|---|
| Rename DB column (`description` → `summary`) via migration, **cached** generate | ❌ **No** | model analysis cache does not notice schema changes |
| same, `wayfinder:generate --fresh` (~14 s) | ✅ | `show.tsx: Property 'description' does not exist on type 'Project'` |
| migration written but not run | ❌ | types come from the live DB (`ModelInspector`), not migration files |
| Remove route `projects.create` | ✅ | `Property 'create' does not exist` (index.tsx, create.tsx) + `Inertia.Pages.Projects.Create` gone |
| Remove enum case `Archived` | ✅ | `show.tsx: comparison … 'ProjectStatus' and '"archived"' have no overlap` |
| Rename enum case name `OnHold`→`Paused` | ✅ | `Property 'OnHold' does not exist` |
| Rename prop key `can` → `permissions` | ✅ | `Property 'can' does not exist on type 'Show'` |
| Rename nested prop key `filters.search` → `q` | ✅ | `Property 'search' does not exist on type '{ q: … }'` |
| Change prop type `can.update` bool → `'yes'\|'no'` | ⚪ no app error | code (`can.update && …`) is still valid TS; the contract test flags it |
| Rename form request field `name` → `title` | ✅ | 4 errors in `create.tsx` (useForm data, setData, errors) |
| Rename relation `assignee` → `owner` | ✅ | `Property 'assignee' does not exist on type 'Task'` |
| Add route param `{tab}` | ✅ | `ProjectController.show(project.id)` argument not assignable |
| Rename Inertia component | ✅ (indirectly) | only because the type name changed (see §4) |
| **Revert a file with an older mtime** (`mv file.orig file`) | ❌ **stale** | types kept the mutated version → 26 bogus errors until files were `touch`ed (bug B5) |

---

## 6. Feedback loop & performance

- **Vite plugin**: with `pnpm dev` running, editing a controller / model / enum / form request updates `types.d.ts` in **1.0–1.2 s** (measured: 4 cases + reverts). But:
  - default plugin `patterns` are `routes/**/*.php`, `app/**/Http/**/*.php` → **model and enum edits are not watched by default**; I widened to `app/**/*.php` + `config/wayfinder.php` (see `vite.config.ts`). Migrations are pointless to watch (cache doesn't see them, B6).
  - plugin still logs `Types generated for actions, routes` (stale message from the old beta).
  - the old `formVariants: true` option passes `--with-form` which `next` rejects (`The "--with-form" option does not exist.`) — must be removed per README upgrade notes.
- **`php artisan wayfinder:generate`** (small app + Fortify + Passkeys):
  - cold (`--fresh`): **11.9–14.0 s**, peak memory **138.5 MB** (`memory_get_peak_usage(true)`)
  - cached, no change: **0.8–1.2 s**, peak **44.5 MB**
  - cache `storage/wayfinder-cache` ≈ 19 MB; output 64 files ≈ 624 KB. Command raises `memory_limit` to 1536M by itself.
- `tsc --noEmit` whole app ≈ 4–5 s; `pnpm build` 4.7 s (generation included).

---

## 7. Larastan

- **Level 7: passes** — after one config change unrelated to Wayfinder: `parseModelCastsMethod: true` in `phpstan.neon`. Without it, Larastan ignores `protected function casts()` (declared return type `array<string, string>`), infers `status: string`, `starts_on: string|null`, `budget: float|null`, and produced 2 false errors in `ProjectResource` (`->label()`, `->toDateString()` "on string"). Wayfinder by contrast reads `casts()` correctly by default.
- **Level `max`:** all experiment code (models, controller, requests, resource, policy, enums) passes after small fixes (`?->`/`??` on BelongsTo, typed `tasks_count`, `@var array<string, mixed>` for `safe()->except()`). 16 remaining errors are all in **pre-existing starter-kit files** (`routes/web.php`, `routes/settings.php`, `Settings/*` controllers, `FortifyServiceProvider`, `config/fortify.php`).
- Synergy: the PHPDoc annotations that fix Wayfinder (`@property`, `@return list<array{…}>`, `@var array{…}`) are the same ones Larastan reads — but Larastan does **not** verify inline `@var` against the real value, so only the contract test catches a lying `@var`.

---

## 8. Bugs found (with repro)

| # | Bug | Repro / evidence |
|---|---|---|
| B1 | `query` HTTP verb missing from generated `Method` union → `tsc` fails on any Laravel 13 app using `Route::redirect`/`Route::any`. **Not fixed on `next`.** | fresh starter kit + `composer require laravel/wayfinder:dev-next` → `php artisan wayfinder:generate && npx tsc --noEmit` → `RedirectController.ts: Type '"query"' is not assignable to type 'Method'` |
| B2 | Invalid TypeScript emitted for dynamic `in:` rules (a **syntax** error; `skipLibCheck` doesn't help, whole `tsc` fails) | `'x' => ['required', 'in:'.implode(',', array_column(ProjectStatus::cases(), 'value'))]` → `x: ;` → `types.d.ts(150,39): error TS1110: Type expected.` |
| B3 | Nested/wildcard validation rules not undotted; README example (`meta.description` → `meta?: { description?: … }`) does not reproduce. `FormRequests::toDefinition` has nesting code but surveyor/ranger pass flat dotted keys | `'tasks.*.title' => 'required\|string'` → `"tasks.*.title": string` (required, top level); README's own `meta` example → `"x_meta.description"?: string \| null` |
| B4 | `Rule::enum()` / `new Enum()` / `Rule::in()` objects dropped by surveyor `AddsValidationRules` (only rules with `->value` kept) → `string`, or **field disappears** when the rule is not in an array | `'status' => ['required', Rule::enum(ProjectStatus::class)]` → `status: string`; `'x' => Rule::enum(ProjectStatus::class)` → no `x` key |
| B5 | Analysis cache is mtime-based: restoring an older file version (older mtime) serves **stale types** | `cp f f.orig; edit f; generate; mv f.orig f; generate` → edited types remain; 26 phantom `tsc` errors until `touch` |
| B6 | DB schema changes never invalidate the model cache | rename column via migration → generate → unchanged; `--fresh` (13 s) picks it up |
| B7 | Generating against an empty / missing DB **succeeds silently** (exit 0, no warning) with column-less models | `DB_DATABASE=/tmp/empty.sqlite php artisan wayfinder:generate --fresh` → `Project = { budget…, settings…, owner?, tasks? }` (docblock props only); non-existent DB → `Task = Record<string, never>` |
| B8 | Dangling type references emitted into `types.d.ts`; with the starter kit's `skipLibCheck: true` they silently become **`any`** | `#[WayfinderIgnore]` on accessor + `'progressValue' => $loaded->progress` → `progressValue: Illuminate.Database.Eloquent.Casts.Attribute`; a probe assigning it to `{ totally: 'wrong' }` compiled. Only `--skipLibCheck false` reports TS2694 |
| B9 | Conditional array keys collapse to `"": T` | starter-kit `SecurityController::edit` (`$props['twoFactorEnabled'] = …` in `if`) → `Security = … & { …, "": boolean }` |
| B10 | Dynamic keys from method calls become `""` | Fortify `Fortify::username() => 'required\|string'` → `AuthenticatedSessionController.Store.Request = { "": string; password: string; … }` |
| B11 | `JsonResource` types assume no `data` wrapper, but Inertia v3 serialises resources via `toResponse()` (with `data`) | contract: `variants_resource: extra "data"`; inline comment in `TypeScriptConverter::convertResourceResponse` claims Inertia calls `->toArray()` directly |
| B12 | Paginator generics ignored; `data`/`links` typed `Record<string, unknown>` (they're arrays); `->through()` → `unknown` | see P1/P2 |
| B13 | Accessor not in `$appends` typed as required model attribute | `progress: number` on every `App.Models.Project`; contract `missing … "progress"` |
| B14 | `sometimes` ignored for optionality | `UpdateProjectRequest` `'name' => 'sometimes\|required\|…'` → `name: string` |
| B15 | Absolute filesystem paths embedded in 44 generated files (`@see /home/…/ProjectController.php:19`) → output not reproducible across machines; can't commit it without churn | `grep -rl /home/ resources/js/wayfinder \| wc -l` → 44 |
| B16 | `file` rule typed `string \| null` | `'x_file' => 'nullable\|file'` → `x_file?: string \| null` |
| B17 | Vite plugin (0.1.10) lags: stale log message, `formVariants`/`actions`/`routes` options break the command, default watch patterns miss models/enums | see §6 |
| B18 | `README` documents named FormRequest types (`App.Http.Requests.…`) but `FormRequests::$named` is never populated; types only exist per controller action (`App.Http.Controllers.ProjectController.Store.Request`) | `grep "named\[" vendor/laravel/wayfinder/src/Converters/FormRequests.php` — no writer |

No crashes or OOMs observed; peak memory 138 MB cold.

---

## 9. Manual steps that were required

1. `composer require laravel/wayfinder:dev-next -W`; `php artisan vendor:publish --tag=wayfinder-config`.
2. `.env`: `WAYFINDER_GENERATE_ENUM_METHODS=true`.
3. Delete `resources/js/actions`, `resources/js/routes`; rewrite ~25 imports (`@/routes/*` → `@/wayfinder/routes/*`, `@/actions/*` → `@/wayfinder/*`).
4. `vite.config.ts`: remove `formVariants`; widen `patterns`; set `command` to run the `query` patch; ignore `__contract__` in lint/fmt.
5. Add `scripts/patch-wayfinder.mjs` (B1) and the `pnpm wayfinder` script.
6. Delete the hand-written `sharedPageProps` augmentation from `types/global.d.ts` (otherwise two declarations merge/conflict silently under `skipLibCheck`).
7. Point `types/auth.ts` `User` at `App.Models.User` (the starter kit's `avatar` doesn't exist server-side).
8. Fix starter-kit pages that assumed non-null `auth.user` (a real catch).
9. PHP annotations: `@property string|null $budget`, `@property array{color: string, notify: bool} $settings` on `Project`; `#[WayfinderIgnore]` on the `progress` accessor; `(int)` casts on deferred `count()`s; `config()->string('app.name')`; `Priority::options()` with `@return list<array{value:int,label:string}>`; `@var array{…}` paginator shape after `->toArray()`; `JsonResource::withoutWrapping()`.
10. Hand-re-declare nested/enum parts of `StoreProjectRequest` in `create.tsx` (`Omit<Generated, \`${string}.${string}\` | 'tags' | 'tasks' | 'status'> & {…}`).
11. `tsconfig.json`: `skipLibCheck: false` (B8).
12. CI: `php artisan wayfinder:generate --fresh` after `migrate` (B5/B6/B7); never trust the cache across a branch switch.

---

## 10. Recommended workarounds (if you adopt it anyway)

- **Make types true at the source:** annotate `decimal`/`json` columns with `@property`; never expose non-appended accessors (`#[WayfinderIgnore]`); cast aggregate results with `(int)`; put array-building behind methods with `@return array{…}`/`list<…>` shapes.
- **Paginators:** don't pass them raw. Use `->toArray()` + `@var array{data: list<…>, links: list<…>, …}`, or a small PHP helper with a documented array shape.
- **Resources:** `JsonResource::withoutWrapping()` globally; avoid `->resolve()` and `->only()` in props.
- **Form requests:** treat generated request types as usable only for flat forms; hand-type nested/enum parts, or use the generated type just for `errors` keys.
- **Guardrails:** `skipLibCheck: false`; the contract test (`WayfinderContractTest` + `_helpers.ts`) in CI; `wayfinder:generate --fresh` in CI; pin the `dev-next` commit in `composer.lock`; don't commit generated output (B15; already in `.gitignore`).
- **Page linkage:** adopt a lint rule / naming convention (`export default function X(props: Inertia.Pages.<Path>)`) yourself — Wayfinder provides none.

---

## 11. Files

- Domain: `app/Enums/{ProjectStatus,Priority}.php`, `app/Models/{Project,Task}.php`, `app/Http/Controllers/ProjectController.php`, `app/Http/Requests/Projects/*`, `app/Http/Resources/ProjectResource.php`, `app/Policies/ProjectPolicy.php`, `routes/projects.php`, `database/migrations/2026_10_14_000001_create_projects_table.php`, `database/factories/{Project,Task}Factory.php`
- Shared data: `app/Http/Middleware/HandleInertiaRequests.php` (`flash`, `config()->string`)
- React: `resources/js/pages/projects/{index,show,create,variants}.tsx` (variants = experiment-only), `resources/js/pages/settings/profile.tsx` (switched to the generated page type)
- Contract: `tests/Feature/WayfinderContractTest.php`, `resources/js/__contract__/` (`_helpers.ts` hand-written, rest generated), `tsconfig.known-bad.json`, `scripts/contract-report.py`
- Experiments: `scripts/breakage.sh` → `storage/breakage/`; `storage/experiment-logs/` (no-annotation `types.d.ts`, contract reports)
- Workaround: `scripts/patch-wayfinder.mjs`
- Generated: `resources/js/wayfinder/` (`types.d.ts`, `inertia-config.d.ts`, `vite-env.d.ts`, route/enum modules)

Final state: `npx tsc --noEmit` ✅ (with `skipLibCheck: false`), `php artisan test` ✅ 46 tests, `phpstan` level 7 ✅, `pnpm check` ✅, `pnpm build` ✅.
