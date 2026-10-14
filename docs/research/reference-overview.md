> **Archived from the earlier research thread (2026-10-14).** This is the Reference Implementation's own overview, kept verbatim apart from paths rewritten to where things now live in this repo. Its "copy `template/` for new projects" advice is superseded by the Overlay approach (ADR-0001); the evaluation apps themselves were not copied, only their findings. The full-size originals remain in `/home/safal/.t3/scratch/2026-10-14-i-want-to-setup-a-978ad4b8` for as long as that scratch folder exists.

# Type-safe Laravel + Inertia + React: research, template, and a large test app

**Recommendation (Oct 2026):** start from `reference/template/`, the official Laravel React starter kit plus a
type-generation and verification layer. You write PHP and the TypeScript is generated, then **verified against
what the server actually sends**. There's nothing to keep in sync by hand.

| Directory | What it is |
|---|---|
| `reference/template/` | **The starter to copy for new projects** (git repo, 13 commits). Read `reference/template/README.md`, then `reference/template/docs/type-safety.md` (the whole standard in one page). |
| `reference/showcase/` | **Tracklane**, a multi-tenant issue tracker built on the template to stress-test it: 28 pages, 90 Data classes, 13 models, 197 tests. |
| `docs/research/evaluations/` | Findings of each candidate evaluation, one file per evaluation (the evaluation apps were not copied). |
| `docs/research/` | Shared fixture spec and showcase spec. |

## 1. What the industry uses today, and what I tested

The starting point is `laravel/react-starter-kit` (`main`, Sept 2026): Laravel 13, Inertia v3, React 19,
Wayfinder 0.1.21, Fortify. It **only generates routes**. `User`, shared props and every page's props are written
by hand in TypeScript, and **those hand-written types were already wrong**: `auth.user` is typed non-null but is
`null` for guests, `user.avatar` is typed but never sent, and `status?: string` is actually sent as `null`. Its
generated Wayfinder output also **fails `tsc` out of the box** on Laravel 13.35+ (the new `QUERY` verb,
laravel/wayfinder#326).

Each candidate implemented the same fixture domain (`docs/research/fixture-spec.md`) and was checked with a *contract
test*: real JSON from feature tests, written out as `{…} satisfies GeneratedType`, so `tsc` decides whether the
generated types are true.

| Approach | Result | Verdict |
|---|---|---|
| **Laravel Wayfinder `next`** (beta, `dev-next`): infers everything statically, no annotations | Routes and enums are good. Of 39 checks: 15 correct, 11 wrong, 6 unsupported. It types decimals as numbers, paginator `data` as `Record<string, unknown>`, and nested form-request rules as literal `"tasks.*.title"` keys. It can emit invalid TS, silently generates empty models against an empty DB, and a cold run takes 12–14 s. | Promising, but not yet trustworthy as the source of truth (`docs/research/evaluations/01-wayfinder-next.md`) |
| **spatie/laravel-data v4 + typescript-transformer v3**, Wayfinder stable for routes | Explicit Data classes are both the runtime shape and the TS source. All breakage scenarios were caught by `tsc`. The contract test found 7 gaps, all fixable. Generation takes about 0.7 s. | **Chosen** (`docs/research/evaluations/02-laravel-data-ts.md`) |
| fumeapp/modeltyper, Ziggy `--types`, Hybridly, momentum-\*, rules→zod generators, Scramble | modeltyper has 5 soundness bugs, and model types aren't prop types anyway. Ziggy gives nothing over Wayfinder. Hybridly is Vue-only. momentum-\* is dead. The generated zod rejected 3 of 4 payloads Laravel accepts. Scramble covers JSON APIs only. | Avoid (`docs/research/evaluations/03-other-tools.md`) |
| TypeScript 7 (native), PHPStan max + strict-rules | TS 7 is a drop-in replacement and `tsc` drops from about 3.2 s to 0.5 s. PHPStan max needed 16 small fixes in the kit. | Adopt both |

## 2. What the template adds to the starter kit

**Generation (automatic, about 1 s after each PHP save while `composer dev` runs):**
- **Page props.** One `App\Pages\…\XPage` class per page. The component name comes from the class
  (`App\Pages\Settings\ProfilePage` → `settings/profile`), and `PageProps<'settings/profile'>` is generated with a
  **compile-time check** that the page file exists and accepts exactly those props (`InertiaPagesProvider`).
- **Shared and flash props.** `SharedProps` and `FlashData` are generated into Inertia's `InertiaConfig`, replacing
  the kit's hand-written, already-wrong types.
- **Data and enums.** Every laravel-data class and backed enum in `app/` is picked up with no registration.
- **Typing fixes on top of typescript-transformer.**
  - PHPDoc literal types (`'a'|'b'`, `Enum::Case`) produce real literals, which makes discriminated unions possible.
  - `array<value-of<E>, V>` becomes the sound `Partial<Record<E, V>>`.
  - `UploadedFile` becomes `File`.
  - `ScrollProp<T>` becomes `T` (it used to crash generation).
  - Correct paginator types.
  - `#[DateOnly]` for calendar dates.
- **Validation inference that matches the generated TS.**
  - `rules()` is merged rather than replaced (`InputData`).
  - `int` → `integer`.
  - Empty arrays are allowed.
  - Every item of a typed list is validated (a bad enum used to be a 500).
  - Literal unions → `in:`.
  - Authorization can run before validation.

**Verification (so the types can't drift):**
- **Contract recorder.** Every page, partial reload (requested keys must be present), flash (including on
  redirects) and JSON endpoint seen by *any* feature test becomes a `satisfies` file checked by `tsc`. No
  per-test code is needed.
- **Arch tests.** They forbid `Inertia::render([...])`, page files without a class, non-final or non-Data classes
  in `App\Data`, and inputs not extending `InputData`.
- **PHPStan max** with Larastan (reading `casts()`), strict-rules, bleeding edge, 100 % type coverage, and Pest
  tests included. **TS 7** strict with `noUncheckedIndexedAccess`. **Eloquent strict mode** at runtime.
- **Contract coverage.** `types:coverage --strict` fails CI when a page, deferred prop or JSON endpoint is never
  exercised by a test, or when a nullable field was only ever `null`, a list only ever empty, or a union variant
  never seen. Those are the shapes `tsc` never got to check.
- **Typed strings everywhere.**
  - Query strings come from a `QueryData` class on the GET action. It's parsed leniently, and the Wayfinder `query`
    option is typed through a template override.
  - Form payloads are inferred from the action's `InputData` (`<TypedForm>` + `field('name')`). Fortify's payloads
    are declared in `config/types.php`.
  - JSON response types are derived from the route.
  - Prop names (`only`, `<Deferred data>`, `<InfiniteScroll data>`) go through `forPage<'x'>()`.
  - Field names are a branded `FieldName` only `field()` produces. The app's JSX types (a `jsxImportSource` that
    re-exports React's JSX namespace) narrow `name` on raw `<input>`/`<select>`/`<textarea>`/`<button>` to it,
    so `tsc` checks every form control, including components that pass a `name` through.
  - Route parameters are nominal: a parameter bound to `Project` takes `RouteKey<'Project', string>`, which only
    a ProjectData's `key` (or a field declared `#[RouteKeyOf(Project::class)]`) carries. Passing `member.user`
    where a membership is expected no longer type-checks.
  - Requests are typed by their route: `useRouteForm(route, defaults)`, `submit(route, data)`, `visit(route)` and
    `useRouteHttp(route, …)` take the payload, error keys and JSON response from the route. Fortify's JSON
    endpoints declare their responses in `config/types.php`, and tests check each one.
  - Enum value lists are generated from PHP (`enumValues`), so pickers need no `Object.keys(…) as Enum[]`.
  - Custom oxlint rules reject the untyped alternatives (`useForm`, `router.post(url, data)`, `<Link data>`),
    hard-coded URLs, and `as`/`!` casts outside three boundary modules that say why each cast holds.
- **Validation and input contracts.** Every field the server validates, every error key it returns and every input
  key it reads (the test request records `input()`, `boolean()`, `only()`, `has()`, magic properties…) must be a
  field of the action's input type. That checks declared Fortify payloads against what Fortify really validates
  *and reads*, with no hand-maintained exceptions. It found two undeclared fields: `remember` on register and
  `force` on enabling 2FA. It also forbids invented error keys.
- **Route-key checks.** While tests run, every branded route-key value the server serialises must exist as a key
  of its model. Each table gets its own id range in tests, so a user id can't pass for a membership id.
- `composer ci:check` runs generate → pint → phpstan → lint/format → pest + contracts → coverage → tsc. That's about
  20 s on the template and 25 s on the showcase, and it passes from a **fresh clone**.

**DX:**
- `php artisan make:page projects/show`
- `composer types`
- a typed `<Pagination>`
- `useUser()`
- the `lib/domain.ts` enum-label pattern

## 3. The large test app (`reference/showcase/`, "Tracklane")

Feature areas were built by four parallel engineers (agents) following only `docs/type-safety.md`. Each one
logged every friction point, and every lesson was folded back into the template.

- **Scale:**
  - 28 pages, 17 controllers, 88 Data classes, 13 models, 9 enums
  - about 7.3k lines of PHP in `app/`, 12.4k in `resources/js`, 3.2k in tests
  - 773 lines and 122 types generated
  - seeded with about 2k issues, 4k comments and 7.5k activities
- **Coverage:** multi-tenant scoped routing, filters round-tripping through the query string, pagination, cursor
  infinite scroll, deferred props and deferred groups, partial reloads, an optimistic drag-and-drop board, nested
  JSON-column forms, discriminated unions (activity feed, notifications), file uploads, bulk actions, a
  Cmd+K JSON search, saved views and per-row abilities.
- **Result:** 197 tests and 1,540 assertions, with 292 recorded contracts all type-checked.
  `types:coverage --strict` reports **0 unverified shapes**: every page, deferred prop, endpoint, nullable field,
  list and union variant was checked against real data. PHPStan max is clean.
- **Browser smoke test:** a headless-Chromium run passes. It logs in through a typed form, visits every page with
  no console or HTTP errors, then:
  - does an inline edit and posts a comment
  - creates an issue and checks validation display
  - creates a label through `TypedForm`
  - changes the password
  - opens the command palette
  - loads more via infinite scroll

## 4. Bugs and traps found in the ecosystem

Each one is worked around in the template.

**Wayfinder 0.1.21**
- `Route::redirect()` breaks `tsc` on Laravel 13 (`QUERY` verb).
- Binding keys come only from controller type-hints.
- Route parameters are structural (`string | { key: string }`): any model with the same key name fits.
- Its output formatter collapses function arguments up to the first `)`, so parameter types containing
  `import('…')` must be rendered on one line.

**Vite+ / plugin-react**
- `tsconfig.json`'s `jsxImportSource` also changes the runtime import unless `react({ jsxImportSource: 'react' })`
  pins it.

**typescript-transformer 3.3**
- Literal and enum-case PHPDoc types become `unknown`.
- `UploadedFile` and `DateTimeInterface` become `undefined`.
- A generic `replaceType` target crashes generation.
- The paginator type is missing `links[].page`, and cursor `data` is a `Record`.
- laravel-data's `#[Hidden]` is ignored.

**laravel-data 4**
- `rules()` replaces the inferred rules.
- `required` rejects empty arrays.
- `int` is validated as `numeric`, so 1.5 gets truncated.
- Typed iterables aren't cast by default, so arrays the types call enums hold raw strings.
- An invalid enum in a list causes a 500.
- Validation runs before authorization.

**Larastan**
- It ignores `casts()` unless `parseModelCastsMethod` is set.
- `BelongsTo` relations are always nullable.

**Laravel**
- A `withoutScopedBindings()` group inside a `scopeBindings()` group has no effect.

**Inertia v3**
- `useHttp` resolves `undefined` on a 422 despite its `Promise<T>` type.

## 5. Starting a new project

```bash
cp -r template my-app && cd my-app && rm -rf .git && git init
composer setup && composer dev
php artisan make:page projects/index      # then write a Data class, return the page from a controller
composer ci:check                          # before pushing; CI runs the same
```

What remains is listed at the end of `docs/type-safety.md`, and it's small:
- input reads are seen per key: a vendor reading the whole input array and indexing it isn't seen (such fields
  must then be validated, or coverage fails)
- `FieldName` proves a name came from `field()`, not from the enclosing form's `field()`
- three boundary modules keep documented casts over Inertia's loose types, and the lint rules are syntactic
  (aliasing `router` escapes them)
- route keys are checked for existence, not identity (another project's key is still a project key)

Field combinations are covered by construction, since TypeScript object types only correlate fields through unions,
and each union variant is checked. Non-field errors are rejected outright: they're flash toasts.

## Sources

- [Laravel Wayfinder announcement (next/beta)](https://laravel.com/blog/laravel-wayfinder-end-to-end-type-safety-for-php-and-typescript) and [README on the `next` branch](https://github.com/laravel/wayfinder/tree/next)
- [Inertia v3 TypeScript docs](https://inertiajs.com/docs/v3/advanced/typescript)
- [typescript-transformer v3 × laravel-data](https://spatie.be/docs/typescript-transformer/v3/laravel/laravel-data), [laravel-data v4](https://spatie.be/docs/laravel-data/v4/introduction)
- [laravel/react-starter-kit](https://github.com/laravel/react-starter-kit), [laravel/wayfinder#326](https://github.com/laravel/wayfinder/issues/326)
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- Community guides: [Laravel News: type-safe shared data and page props](https://laravel-news.com/type-safe-shared-data-and-page-props-in-inertiajs), [Lucky Media: type-safe Inertia apps](https://www.luckymedia.dev/blog/building-type-safe-inertia-apps-with-react-and-typescript)
