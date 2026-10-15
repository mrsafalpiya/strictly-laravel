# Developing the Overlay

How to work on Strictly Laravel itself: the Composer and npm packages, the installer, Kit Conversion and the Testbed App. Every change is driven by a Problem in [`docs/problems.md`](../problems.md) and proven by harness scenarios.

## The loop

### 1. Start from a Problem

Find the Problem your ticket closes in `docs/problems.md`. Read its reproduction, its manual workaround (usually what the Reference Implementation did by hand, under `reference/`) and any ADR that touches its Type Boundary.

If the work has no Problem yet, record one first (see "Adding a Problem" in the register). A change that closes no Problem is either enforcement or infrastructure for one; name the Problem it serves.

**Done when:** you can name the Problem IDs the change closes, and each has a reproduction concrete enough to turn into a scenario.

### 2. Prove it with harness scenarios

Each Problem gets at least two scenarios in the fixture-app harness ([`harness.md`](harness.md)):

- a **passing** scenario: the typed way works, and the app's checks pass;
- a **breaking** scenario: a known edit that reproduces the Problem, which must make the checks fail with a specific diagnostic (the `tsc`, PHPStan or oxlint message, or the failing Contract).

Each scenario names the Problem ID it guards. A scenario is **green** when the app's checks end the way it expects (pass for a passing scenario, fail with the named diagnostic for a breaking one) and **red** otherwise. Write the breaking scenario first and watch it go red before the fix: the checks still pass on the broken edit, which is the Problem reproduced. Then build the fix until both scenarios are green.

Assert on what an app developer sees: pass, or fail with the expected diagnostic. Generator internals, intermediate files and private classes stay out of assertions. A scenario may run only the relevant step of `ci:check` (for example `tsc` alone) for speed. Use the secondary seams only where the harness is too coarse: PHPStan's rule-test kit for a PHPStan rule, oxlint's rule tester for a lint rule, a real Vite dev server with a stand-in generator for the Vite plugin's timing.

**Done when:** every Problem the change closes has a passing and a breaking scenario, the breaking one fails with the named diagnostic, and both are green against the change.

### 3. Verify on the fresh fixture and the Testbed App

- Run the harness with no scenario on a freshly generated latest Base Kit: `strictly:install` must succeed and the app's `ci:check` must pass. This catches upstream drift in the hooks and Kit Conversion.
- The Testbed App's `ci:check` must stay green: full feature tests, Contracts, Contract Coverage at zero unverified shapes, and PHPStan max. It is the long-lived app that receives package changes, so it also proves the update path. It lives in `testbed/`: a Base Kit with both packages linked from `packages/` (a Composer path repository and pnpm `link:`) and Tracklane ported onto them. Set it up once with `composer install`, `pnpm install`, `cp .env.example .env` and `php artisan key:generate`, all in `testbed/`, then run `composer ci:check` there. A package change that alters what the installer writes reaches it through `php artisan strictly:install`, as in any app. Each Tracklane area owns its own files: `routes/workspace/<area>.php`, `resources/js/navigation/areas/<area>.ts`, `tests/Feature/<Area>/`, and its own directories under `app/Data`, `app/Pages` and `resources/js/{pages,components}`.

**Done when:** both are green on the final state of the change.

### 4. Close the Problem

In `docs/problems.md`, set the Problem's status to `closed`, add **Closed by** with the scenario names, and update its index row. When a closed Problem leaves a remaining limitation, record it as its own Problem with status `accepted gap` and its **Reasoning**, so it stays visible to app developers.

**Done when:** the register matches the code: every Problem the change closes reads `closed`, and every limitation the change leaves is an `accepted gap` with reasoning.

## Rules that apply throughout

**Enforcement placement.** Put each rule in the earliest tool that can express it: PHPStan, then oxlint, then `tsc`, then tests and Contracts. A rule caught in the editor beats one caught in CI.

**Upstream workarounds.** A fix for a third-party tool's defect (typescript-transformer, laravel-data, Wayfinder, Larastan, Inertia, Laravel, the Vite React plugin) lives in its own isolated unit whose doc comment cites the Problem ID and links the upstream issue, so it can be deleted when upstream ships a fix. When the register says "no upstream issue filed", tell the maintainer so one can be filed, then link it in both places.

**Base Kit toolchain.** Leave the Base Kit's toolchain choices and versions alone; the narrowed JSX types are the single override (ADR-0004). Every tsconfig change and generated `.d.ts` must be valid under both the kit's `tsc` and the TS 7 compiler embedded in type-aware oxlint; `ci:check` runs both.

**Kit Conversion.** The converted version of each Base Kit file lives at `packages/laravel/kit/<app-relative path>`. `packages/laravel/kit-conversion.json` lists, for each one, the SHA-256 of every upstream version it may replace (`upstream`) and of every converted version an earlier release wrote (`earlierConversions`), which the installer leaves alone like the current one (ADR-0005). To convert another file, add both. A file the Base Kit doesn't have but a conversion needs (the Page classes a converted controller returns) also lives under `kit/`, listed in its converting file's `adds`; the installer writes it only when it converts that file, so it never recreates one an app deleted, and it needs no hashes. When upstream changes a converted file, the fresh install fails with a `skipped (unknown content)` row, and the installer's warning gives the new hash. Check that the conversion still fits the new upstream version, update it if needed, and add the hash to `upstream`. When you change a file under `kit/`, `pnpm test` fails until the hash of its previous committed version is in `earlierConversions`; the failure names the hash. Keep each conversion a minimal diff from upstream, and make sure it passes the app's Pint preset and PHPStan.

**Installer hooks.** Every edit `strictly:install` makes to an app's tooling is a hook, listed in `InstallCommand::hooks()` with the label its row prints. A hook takes every path from the root it is given, never from `base_path()`, `config_path()` or `resource_path()`, because `strictly:install --check` (`ci:check:install`) runs it on a scratch copy of the app. That copy leaves out `.git`, `vendor`, `node_modules`, `storage`, `bootstrap/cache` and `public/build`, so a hook can't edit anything under them. A hook returns whether it changed anything, changes nothing when it is already applied (a re-run must be a no-op), and throws when it can't be applied, with a message that says what to do by hand. It never overwrites content it doesn't recognise. A new hook reaches every existing app the next time it runs the installer, and until then that app's `ci:check` fails on it. Prove a new hook with a `reinstall` scenario (`docs/agents/harness.md`).

**Releases that need app changes.** When a change needs existing apps to do something (`composer update` alone isn't enough), add it to the upgrade guide, [`packages/laravel/UPGRADE.md`](../../packages/laravel/UPGRADE.md), under the coming release, and give it a release check as the guide's convention describes.

**ADRs, sparingly.** Record an ADR in `docs/adr/` only for a decision that is hard to reverse, would surprise a reader without the context, and was a real trade-off between options. Everything else belongs in the Problem, the code or the commit message. Match the existing ADRs' format and take the next number. When a change contradicts an existing ADR, flag the conflict explicitly (`docs/agents/domain.md`) and let the maintainer decide whether to reopen it.

**Vocabulary.** Name domain concepts with the terms in [`GLOSSARY.md`](../../GLOSSARY.md): Problem, Type Boundary, Contract, Contract Coverage, Base Kit, Overlay, Kit Conversion, Testbed App, Tracklane, Reference Implementation, Source of Truth. This applies to code, scenario names, comments, commits and tickets. A concept missing from the glossary is a signal to add it there first.

**The Reference Implementation is read-only.** `reference/` is a spec to extract from. Copy what a Problem needs into the packages; leave `reference/` untouched and out of all tooling.
