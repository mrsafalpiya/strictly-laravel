# Experiment 02 — laravel-data v4 + typescript-transformer v3 (+ Wayfinder 0.1.21 for routes)

Everything below was built and run in this directory; all TS/JSON snippets are copied from real generated output
(`resources/js/generated/*.ts`, `resources/js/__contract__/*`). Code is committed on branch `experiment-02`.

**Versions:** Laravel 13.36.0, PHP 8.5.8, spatie/laravel-data 4.23.0, spatie/laravel-typescript-transformer 3.3.0,
spatie/typescript-transformer 3.3.1, inertiajs/inertia-laravel 3.5.1, @inertiajs/react 3.9.1, laravel/wayfinder 0.1.21,
TypeScript 5.9.3, Larastan 3.13.0, chokidar 5.0.0 (watch mode only).

**Final state:** 51 tests pass (6 contract, 4 input, 1 cost), `tsc --noEmit` clean (incl. contract files),
`vp check` clean, `vp build` works, Larastan level 7 clean, Larastan max adds no errors from this code
(16 pre-existing starter-kit errors). Headless Chromium smoke test passed (pagination, deferred `stats` loading,
nested `tasks.0.title` errors rendering, create → redirect → flash).

## 1. Verdict

**Yes, with caveats — the strongest "PHP is the source of truth" option tested.** Adopt three things:
1. **The page-props pattern** (§8): one `PageData` class per page with `#[InertiaPage]`, plus a custom provider that
   generates `PageProps<'x'>`, `InertiaConfig['sharedPageProps']` and a compile-time page-file check.
2. **The contract test in CI** (§3): it found 7 real mismatches between generated types and actually-sent JSON.
3. **The documented workarounds** (§9).

Why it works:
- A Data class is both the **runtime shape** and the **TS source**. PHP native types enforce the shape at construction
  (`ProjectStatsData::from(['done' => 'abc'])` throws TypeError; missing nested key → `CannotCreateData`).
- Explicit field whitelisting: `internal_notes`, `owner_id` can't leak; accessors included only when declared.
- Generated types immediately caught **real bugs in the starter kit's hand-written types**: `auth.user` nullable for
  guests, `user.avatar` typed but never sent.
- tsc caught every breakage scenario (§6). ~0.9 s save→types via a 50-line Vite plugin. Larastan 7 and max OK.

Why not an unqualified yes:
- typescript-transformer v3 is 7 months old (3.0.0, March 2026); controllers feature "quite beta", watch mode
  "heavily experimental".
- 2 bugs (`#[Hidden]` from laravel-data ignored; paginator `links[].page` missing) and unsound defaults
  (`DateTimeInterface` → `undefined`, enum-keyed arrays → `Record` with all keys required, `Inertia::scroll`
  paginator shape). Each has a one-line workaround, found only via the contract test.
- Verbosity: ~10–20 PHP lines per prop shape + ~20-line PageData per page.
- laravel-data validation inference traps: `int` → `numeric`, non-nullable `array` → `required|array` (rejects `[]`),
  `#[Date]` passes `2026-05-01` but the default cast then throws 500.

## 2. What was built
| Area | Files |
|---|---|
| Domain | `app/Enums/{ProjectStatus,Priority,FlashType}.php`, `app/Models/{Project,Task}.php`, migrations, factories, `app/Policies/ProjectPolicy.php` |
| Output DTOs | `app/Data/{ProjectData,TaskData,ProjectListItemData,ProjectSettingsData,ProjectStatsData,ProjectAbilitiesData,ProjectFiltersData,UserSummaryData,ProjectStatusOptionData,PriorityOptionData,EnumOptionData}.php` |
| Page DTOs | `app/Data/Pages/{ProjectIndexPageData,ProjectShowPageData,ProjectCreatePageData}.php`, `app/Data/Probe/*` (edge-case probe page `/probe`) |
| Shared | `app/Data/Shared/{SharedData,AuthData,UserData,FlashData}.php`, `HandleInertiaRequests.php` |
| Input DTOs | `app/Data/Input/{StoreProjectData,UpdateProjectData,TaskInputData}.php` |
| Page-props infra | `app/Support/Inertia/{InertiaPage,PageData}.php`, `app/Support/TypeScript/{InertiaPagesTransformedProvider,PaginatorTypesTransformedProvider}.php`, `app/Providers/TypeScriptTransformerServiceProvider.php` |
| React | `resources/js/pages/projects/{index,show,create}.tsx`, `pages/probe.tsx` |
| Generated (gitignored) | `resources/js/generated/{types.ts,inertia.ts}` |
| Feedback loop | `vite.config.ts` → `typescriptTransformer()` plugin |
| Tests | `tests/Feature/InertiaContractTest.php` (writes `resources/js/__contract__/*.ts`), `ProjectInputTest.php`, `PartialReloadCostTest.php` |

### Wayfinder `query` verb workaround
`Route::redirect()` registers ANY, which in Laravel 13.35+ includes `QUERY`; Wayfinder 0.1.21's `type Method` lacks
`"query"` (open upstream: laravel/wayfinder#324/#325/#326). Fix: `Route::get('settings', fn () => to_route('profile.edit'));`.

## 3. Soundness — contract test
Feature test sends real `X-Inertia` requests (incl. partial reloads) and writes
`export const contract = <raw json> satisfies PageProps<'x'> & SharedData & Errors;` (`satisfies` also does
excess-property checks). Gotcha: re-encode via `json_decode(..., false)` since `$response->json()` turns `{}` into `[]`.

| # | Mismatch | Kind | Fix |
|---|---|---|---|
| 1 | laravel-data `#[Hidden]` prop not sent but required in TS | **Bug** (`DataClassPropertyProcessor` uses `&&`) | `#[DataHidden, TsHidden]` |
| 2 | Paginator `links[]` has `page: number\|null`; shipped type lacks it | **Bug/stale** | `PaginatorTypesTransformedProvider` override |
| 3 | `DateTimeInterface` property → `undefined` | Missing default | `replaceType(DateTimeInterface::class, 'string')` |
| 4 | `array<ProjectStatus,int>` → `Record<ProjectStatus, number>` (all keys required) | Over-strict | `Partial<Record<...>>` literal type |
| 5 | `Inertia::scroll(paginator)` sends flat paginator; generator assumes `{data,links,meta}` | Semantic gap | literal flat type |
| 6 | Raw `Inertia::defer()` → `stats: X \| undefined` (key required) | Semantic gap | `Lazy::inertiaDeferred()` → `stats?: X` |
| 7 | Nested partial reload returns only subtree | Expected | `DeepPartial<>` in partial contracts |

## 4. Scorecard
| Spec item | Score | Generated TS / notes |
|---|---|---|
| string enum | correct | `'active' \| 'on_hold' \| 'archived'` (keep unions; native TS enums break literal comparisons) |
| int enum | correct | `1 \| 2 \| 3 \| 4` |
| nullable | correct | `string \| null` |
| dates | partially | `string`; serialised as `DATE_ATOM`; date-only columns need `#[WithTransformer(DateTimeInterfaceTransformer::class, format:'Y-m-d')]` |
| decimal:2 | correct | `?string` → `string \| null` (`"1234.50"`) |
| settings json | correct | nested Data `{color: string, notify: boolean}` |
| hidden `internal_notes` | correct | absent |
| `progress` accessor | correct | only because the DTO declares it |
| relations / counts | correct | `owner: UserSummaryData`, `tasks: TaskData[]`, `tasks_count: number` |
| collections | correct | `TaskData[]` |
| `mixed`, untyped array | partially | `any`, `any[]` |
| enum-keyed array | wrong | see #4 |
| PaginatedDataCollection | partially | correct after #2 fix; `X::collect($paginator)` statically loose |
| CursorPaginatedDataCollection | correct | |
| Inertia::scroll | wrong by default | #5 |
| deferred (`Lazy::inertiaDeferred`) | correct | `stats?: ProjectStatsData` |
| `Lazy::closure`, `defaultIncluded` | partially | always sent, typed optional |
| laravel-data `#[Hidden]` | wrong (bug #1) | |
| shared props | correct | `auth.user: UserData \| null` |
| routes (Wayfinder) | correct after QUERY fix | |
| input Store/Update | correct TS; validation inference needs care | |

Writers: `FlatModuleWriter` (chosen; single module) silently emits duplicate `export type` for same-named classes in
different namespaces (tsc catches; fix with `#[TypeScript(name:)]`).

## 5. Input side
Server error keys `budget, name, starts_on, status, tags.1, tasks.0.priority, tasks.0.title` match
`FormDataErrors<StoreProjectData>`; `useForm<StoreProjectData>`, `` form.errors[`tasks.${i}.title`] `` and
`<Form<StoreProjectData> {...ProjectController.store.form()}>` are typed. tsc errors on `errors['tasks.0.titel']`,
`setData('status','deleted')`, `setData('tasks.0.priority',5)`. `<Form>` field `name=` attributes are unchecked.

Traps: `array $tags = []` → `required|array` (rejects `[]`); `#[Date]` + Carbon → 500 `CannotCastDate`
(use `#[DateFormat('Y-m-d'), WithCast(DateTimeInterfaceCast::class, format:'!Y-m-d')]`); `int` → `numeric`; no `authorize()`.

## 6. Breakage detection
| Mutation | tsc in React |
|---|---|
| rename `owner_name` | yes |
| remove route `projects.create` | yes |
| remove enum case `OnHold` | yes |
| owner becomes nullable | yes |
| attribute → `'project/show'` | yes: `Cannot find module '@/pages/project/show'` |
| page declares a prop the server doesn't send | yes |
| remove `stats` | yes |

## 7. Feedback loop & performance
`typescript:transform` ~0.71 s (artisan boot ~0.62 s). Vite plugin: save → types ~870 ms. `--watch` ~2.6 s, needs
chokidar, provider exceptions kill it. Output dir must pre-exist. `Inertia::render` calls `toArray()` eagerly
(partial reload of `stats` ran 5 queries vs 3 for full visit).

## 8. Page-props pattern
```php
#[Attribute(Attribute::TARGET_CLASS)]
final readonly class InertiaPage { public function __construct(public string $component) {} }

abstract class PageData extends Data {
    public static function component(): string { /* reflect #[InertiaPage] */ }
    public function toResponse($request) { return Inertia::render(static::component(), $this)->toResponse($request); }
}

#[InertiaPage('projects/show')]
class ProjectShowPageData extends PageData {
    public function __construct(public ProjectData $project, public Lazy|ProjectStatsData $stats, public ProjectAbilitiesData $can) {}
}
```
Generated `inertia.ts`:
```ts
export type PageProps<K extends PageComponent> = InertiaPages[K];
declare module '@inertiajs/core' { export interface InertiaConfig { sharedPageProps: SharedData; } }
type CheckPage<K extends PageComponent, C extends (props: InertiaPages[K]) => unknown> = [K, C];
export type __PageComponentCheck = [
    CheckPage<'projects/show', typeof import('@/pages/projects/show').default>,
    // ...
];
```

## 9. Bugs and rough edges
1. `#[Hidden]` (laravel-data) ignored by laravel-typescript-transformer 3.3.0.
2. `LengthAwarePaginator` type misses `links[].page`.
3. Unknown classes → `undefined` (with only a warning).
4. `array<Enum,V>` → `Record` with all keys required.
5. Paginator in Data = `{data, links, meta}`; in `Inertia::scroll()` = flat.
6. `FlatModuleWriter` silently duplicates same-named types.
7. Watch mode fragile, slow.
8. Output dir must pre-exist.
9. laravel-data validation inference traps (see §5).
10. Dates typed plain `string`.
11. `Lazy::closure`/`defaultIncluded` typed optional though always sent.
12. `mixed` → `any`; template bounds dropped.
13. Generated code uses `import {}` not `import type` (breaks `verbatimModuleSyntax`).
14. Wayfinder 0.1.21 + Laravel 13 `QUERY` verb.
15. Inertia v3 tests: `session('errors')` is a plain array.
