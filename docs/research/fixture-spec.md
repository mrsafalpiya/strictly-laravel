# Shared type-safety fixture spec

Every experiment implements this same mini-domain on top of a copy of the official
`laravel/react-starter-kit` (Laravel 13, Inertia v3, React 19, Wayfinder 0.1.21 stable,
Larastan level 7, pnpm). The goal is to compare how well each tooling approach carries
PHP types to React **automatically**, and how **correct** (sound) the generated types are.

## Domain

### Enums
- `App\Enums\ProjectStatus: string` — `Active = 'active'`, `OnHold = 'on_hold'`, `Archived = 'archived'`; method `label(): string`.
- `App\Enums\Priority: int` — `Low = 1`, `Medium = 2`, `High = 3`, `Urgent = 4`.

### Models (+ migrations + factories)
- `Project`
  - `id`, `owner_id` (FK users), `name` string, `description` nullable text,
    `status` (cast `ProjectStatus`), `budget` decimal(10,2) nullable (cast `decimal:2`),
    `settings` json (cast `array`, shape `{color: string, notify: bool}`),
    `is_public` bool (cast `boolean`), `starts_on` date nullable (cast `immutable_date`),
    `internal_notes` text nullable (**in `$hidden`**), timestamps.
  - relations: `owner(): BelongsTo<User>`, `tasks(): HasMany<Task>`
  - accessor: `progress` via `Attribute<int, never>` (percent of completed tasks), appended via `$appends`? NO — only exposed when explicitly selected; note how each tool handles it.
- `Task`
  - `id`, `project_id`, `assignee_id` nullable FK users, `title` string,
    `priority` (cast `Priority`), `completed_at` nullable datetime (cast `datetime`), timestamps.
  - relations: `project(): BelongsTo<Project>`, `assignee(): BelongsTo<User>` (nullable)

### Routes / controllers (auth + verified middleware)
- `GET /projects` → `ProjectController@index` → `Inertia::render('projects/index', [...])`
  - `projects`: paginated (15) list, each item: id, name, status, owner name, tasks_count
  - `filters`: `{search: string|null, status: string|null}` from the query string
  - `statuses`: list of `{value, label}` for the enum
- `GET /projects/{project}` → `show` → `Inertia::render('projects/show', [...])`
  - `project`: full project incl. owner + tasks (with assignee), `budget`, `settings`, dates
  - `stats`: **deferred** prop (`Inertia::defer`) `{open: int, done: int}`
  - `can`: `{update: bool, delete: bool}` from policy
- `POST /projects` → `store(StoreProjectRequest)`; rules:
  `name: required|string|max:120`, `description: nullable|string`,
  `status: required|Rule::enum(ProjectStatus)`, `budget: nullable|numeric`,
  `starts_on: nullable|date`, `tags: array`, `tags.*: string`,
  `tasks: array`, `tasks.*.title: required|string`, `tasks.*.priority: required|Rule::enum(Priority)`
- `PUT /projects/{project}` → `update(UpdateProjectRequest)` (same as store, all `sometimes`)

### Shared data (HandleInertiaRequests)
- `auth.user` (nullable — guests!), `name`, `sidebarOpen`, and a `flash` toast `{type, message}|null`.

### React pages
- `resources/js/pages/projects/index.tsx`, `resources/js/pages/projects/show.tsx`, `resources/js/pages/projects/create.tsx`
  using the generated types + generated route helpers + Inertia `<Form>` / `useForm`.

## What to evaluate (write results to FINDINGS.md in the experiment dir)
1. Exactly which TS gets generated for each item above (paste the snippets).
2. **Soundness**: does the generated type match the JSON that is *actually* sent?
   Technique: in a feature test, request the page with `X-Inertia: true` (+ `X-Inertia-Version`),
   dump `props` to `resources/js/__contract__/<page>.ts` as
   `import type {...}; export const x = <json> satisfies <GeneratedType>;` then run `tsc --noEmit`.
   Note mismatches (e.g. dates: Carbon serialises to ISO string; decimal cast → string; enum → value).
3. **Inference without annotations**: what did you have to write by hand?
4. **Feedback loop**: does the type update automatically during `vite dev` when PHP changes? How fast?
5. **Breakage detection**: rename a PHP field / remove a route / change an enum case — does `tsc` catch it in React?
6. Larastan level (try `max`) passes?
7. Performance of generation (time), bugs, rough edges, beta status.
