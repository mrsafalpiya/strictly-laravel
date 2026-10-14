# Experiment 03 — alternative / complementary type-safety tools (2026-10-14)

Stack: laravel/react-starter-kit main (Laravel 13.36.0, inertia-laravel 3.x, @inertiajs/react 3.9.1,
Wayfinder 0.1.21), PHPStan 2.3.1 / Larastan 3.13.0, TS 5.9.3, PHP 8.5.8, Node 26.3.0, pnpm 11.6.0.
Implemented from the fixture spec: enums `ProjectStatus` / `Priority`, models `Project` / `Task`
(+ migration, factories), `StoreProjectRequest`. Generated outputs and contract files live in
`artifacts/` (moved out of `resources/js` so the project `tsc` stays clean). JSON dump script:
`scripts-exp/dump-models.php`. PHPStan variant configs: `phpstan-*.neon`.

## Verdicts

| Tool | Status | Verdict |
|---|---|---|
| fumeapp/modeltyper | v3.14.0 (2026-09-25), 199★, 16 open issues, active | **Avoid** — 5 soundness bugs |
| Laravel 13 JsonResource → TS | nothing first-party | n/a — only Wayfinder `next` infers `toArray()` |
| tightenco/ziggy `--types` | v2.6.5 (2026-10-10), 4.3k★, active | **Avoid** — no gain over Wayfinder |
| Hybridly | npm 0.9.0 / 0.10.0-beta.37 (2026-09-27), 593★ | **Avoid** — Vue-only, replaces Inertia |
| momentum-*, based/laravel-typescript | last releases 2022–2024 | **Avoid** — dead |
| wendelladriel/laravel-validated-dto | v4.7.0 (2026-05-26) | not relevant — no TS output |
| spatie typescript-transformer v3 | 3.0.0 on 2026-03-13; laravel pkg 3.3.0, core 3.3.1 | **Main candidate** (exp 02) |
| romegasoftware/laravel-schema-generator (rules → zod) | v1.0.13, 31★ | **Avoid** — rejects input Laravel accepts |
| Scramble + openapi-typescript | v0.13.47 / 7.13.0 | JSON APIs only, not Inertia props |
| Inertia v3 `InertiaConfig` augmentation | built in | **Adopt** as target for generated shared props |
| Precognition (Inertia v3 forms) | built in | **Adopt** instead of client-side zod |
| TypeScript 7.0.2 | stable since 2026-07-08 | **Adopt** — drop-in, ~6× faster |
| Larastan max + bleedingEdge + strict-rules + type-coverage | current | **Adopt** — 16 small fixes |

## 0. The starter kit already fails `tsc`

Untouched kit: 3 errors (same on TS 5.9 / 6.0 / 7.0):

```
resources/js/actions/Illuminate/Routing/RedirectController.ts(13,5): error TS2561: ... 'methods' does not exist in type 'RouteDefinition<["get","head","post","put","patch","delete","options","query"]>'
  Type '"query"' is not assignable to type 'Method'.
```

Laravel 13.35 added `QUERY` to `Router::$verbs`; `Route::redirect()` (routes/settings.php:9) registers every
verb; Wayfinder's `type Method` lacks `"query"`. Upstream: https://github.com/laravel/wayfinder/issues/326
(opened 2026-10-12). Workaround: avoid `Route::redirect` (or patch the generated type).

## 1. fumeapp/modeltyper

Model → TS interface from DB schema + casts/accessors/relations/counts/exists + enums. No routes, page props
or FormRequests; no watch mode (`run-after-migrate` only). ~0.6 s. https://github.com/fumeapp/modeltyper

```ts
export interface Project {
  id: number
  owner_id: number
  name: string
  description: string | null
  status: ProjectStatus
  budget: number | null            // WRONG: decimal:2 serialises as "1234.50"
  settings: Array<unknown>         // WRONG: it's {color, notify}; @property array{...} ignored
  is_public: boolean
  starts_on: string | null
  internal_notes?: string | null   // $hidden → optional (--no-hidden drops it)
  created_at: string | null
  updated_at: string | null
  progress: number                 // WRONG: accessor not in $appends, never serialised
  owner: User                      // required even when not loaded
  tasks: Task[]
  tasks_count: number              // required even without withCount()
  owner_exists: boolean
  tasks_exists: boolean
}
// Task: assignee: User  -- WRONG: nullable BelongsTo
// User: notifications: DatabaseNotification[]; passkeys: Passkey[]  -- undeclared types
```

Contract test (`satisfies Project` on real JSON, with `--optional-relations --optional-counts --optional-exists --no-hidden --use-enums --plain-enums`):

```
budget:            Type 'string' is not assignable to type 'number'
settings:          '"color"' does not exist in type 'unknown[]'
priority:          Type 'number' is not assignable to type '"1" | "2" | "3" | "4"'
assignee (null):   Type 'null' is not assignable to type 'User | undefined'
plain project:     Property 'progress' is missing
models.ts:         Cannot find name 'DatabaseNotification' / 'Passkey'
```

Bigger issue: model types ≠ page-prop types; props are whatever the controller selects.

## 2. API Resources → TS
Laravel 13 has `JsonApiResource`, `toResource()`, `#[Collects]`, `#[PreserveKeys]`, but no TS output and no
`@template` on `JsonResource`. Spatie's v3 docs: "we do not support Laravel's `Resource` classes". Only
Wayfinder `next` infers `toArray()`.

## 3. Ziggy vs Wayfinder stable
`ziggy:generate --types` (~0.6 s) catches unknown names (only with `strictRouteNames`), missing/wrong params.
Gotchas: `--types` path argument confusion, `.d.ts` shadowing `ziggy.js`, `methods: string[]` type mismatch.
Wayfinder's import-based helpers catch the same errors and a deleted route becomes a broken import. Avoid Ziggy.

## 4. Hybridly
No React adapter, replaces Inertia, pre-1.0, single maintainer. Avoid.

## 5. Typed-props packages
- Inertia v3 itself generates nothing; provides `InertiaConfig` augmentation + generics. Docs point to Wayfinder `next`.
- spatie transformer v3: rewrite with TS AST, config in a service provider, typed `route()` helper + controller
  types ("quite beta"), `--watch` beta, unwraps `Inertia\Response<Data>` and laravel-data `InertiaLazy`/`Deferred`.
- momentum-trail/modal/lock/preflight, based/laravel-typescript, 7nohe/laravel-zodgen: dead.
- Starter kit's hand-written `auth.user: User` is non-null but guests get `null`; `[key: string]: unknown` hides typos.

## 6. Scramble + openapi-typescript
OpenAPI for JSON routes only; no Inertia understanding. Use only for a public JSON API.

## 7. Runtime validation (zod from FormRequest)
Generated schema rejected 3 of 4 payloads Laravel accepts (numeric strings, empty→null, `Rule::enum` accepting
`4` and `"4"`; `exists`/`unique` impossible client-side). Use generated payload types + Precognition instead.

## 8. TypeScript 7
`latest` 7.0.2 (native). No JS API until 7.1 (matters for typescript-eslint only).

| Version | Wall (3 runs) | Memory | Errors |
|---|---|---|---|
| 5.9.3 | 3.09 / 3.26 / 4.59 s | 272 MB | 3 |
| 6.0.3 | 3.36 / 3.36 / 3.39 s | – | 3 |
| **7.0.2** | **0.49 / 0.56 / 0.56 s** | 193 MB | 3 (identical) |

Drop-in: `types:check`, `pnpm build`, `vp check` all work, no tsconfig changes.

## 9. Larastan max / strict-rules / type coverage

| Config | Errors |
|---|---|
| level 7 (kit default) | 0 |
| level 8 / 9 / max | 10 / 13 / **16** |
| max + bleedingEdge | 16 |
| max + strict-rules | 23 |
| max + strict-rules + bleedingEdge + fixture models | 26 |
| type-coverage 100% | 1 |

Errors at max: `$request->user()` → `User|null` in auth-only controllers (use `#[CurrentUser] User $user`),
`Route::inertia(...)->name()` on `mixed` (macro), `config()` / `$request->input()` mixed (use `config()->string()`,
`$request->string()`). Strict-rules: `staticMethod.dynamicCall` false positives on Eloquent builders → disable.
`pest --type-coverage` 98.2% (Pest 5 requires PHPUnit 13).

## 10. Community view
Stable today: laravel-data + typescript-transformer v3. Zero-annotation: Wayfinder `next` (beta, memory/speed
issues on large apps). No credible third contender.
