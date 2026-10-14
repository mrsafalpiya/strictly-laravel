# The fixture-app harness

The harness is the primary test seam for the Overlay. It generates the latest Base Kit, installs both Overlay packages from this repo's local paths, runs `php artisan strictly:install`, optionally applies a **scenario** (a set of file edits), runs the app's `composer ci:check` (or one step of it), and asserts the outcome: pass, or fail with an expected error substring. Test the Overlay here, the way an app developer meets it. Don't assert on generator internals.

## Commands

Run these from the repo root. First-time setup: `composer install && pnpm install`.

| Command | What it does |
|---|---|
| `pnpm test` | Full suite: version sync, fresh install passes `ci:check`, `strictly:install` is idempotent, every scenario. |
| `pnpm test <pattern>...` | Only the tests whose names match, e.g. `pnpm test example-type-error-fails-tsc`. |
| `pnpm harness` | Fresh install only: `strictly:install` and every `ci:check` step must pass on the latest Base Kit + Overlay (the nightly check). Each step runs on its own, and a failure names the stage and the files that broke. |
| `pnpm harness <scenario>... [--step <step>]` | Run the named scenarios and report each one. `--step` overrides the scenario's step. |
| `pnpm harness --list` | List the scenarios. |
| `pnpm harness --fresh` / `STRICTLY_FRESH_BASE_KIT=1 pnpm test` | Regenerate the latest Base Kit first. |
| `pnpm typecheck` | Typecheck the harness (strict `tsc`). |
| `pnpm lint:php` | Run Pint on the Composer package (`--test` to check only, as CI does). |

Timings on a warm cache: about 8 s for a scenario that runs a single step and about 20 s for a full `ci:check`. A fresh Base Kit takes about 1.5 min to generate, plus about 20 s to install the packages.

## CI

| Workflow | When | Runs |
|---|---|---|
| `.github/workflows/ci.yml` | Every push to `main` and every pull request | `pnpm typecheck`, `pnpm lint:php --test`, then `pnpm test`. The runner starts with no fixture cache, so `pnpm test` always uses a freshly generated Base Kit. |
| `.github/workflows/nightly.yml` | Daily at 03:17 UTC, or by hand (`gh workflow run nightly.yml`) | `pnpm harness --fresh`: the fresh-install check against the latest upstream Base Kit. |

Both workflows share their setup through `.github/actions/setup` and upload `.fixtures/*.log` when they fail. Under GitHub Actions, `pnpm harness` also prints every fresh-install failure as an `::error` annotation titled `Fresh install failed at <stage>`. The stage is `strictly:install` or `ci:check:<step>`, and the annotation lists the files the tool named, so a red nightly run shows what broke on its summary page.

The files come from `harness/src/failure-report.ts`, which knows the output formats of tsc, oxlint, oxfmt, Pint, PHPStan and Pest. When no format matches, the report falls back to the tail of the output. When you add a `ci:check` step that runs a new tool, teach that module its format and add a unit test in `harness/tests/failure-report.test.ts` that uses the tool's real output. For `strictly:install`, any installer row (`<label> .... <status>`) whose status isn't `applied` or `unchanged` counts as a failure. A label that is an app-relative path is reported as the file, so a Kit Conversion skip should be reported as a row of its own, labelled with the skipped file's path. Such a row fails the fresh install even when `strictly:install` exits 0, as ADR-0005 requires of the nightly run. When generating the Base Kit or requiring the packages fails, the report names the failed command.

## Where the fixtures live

`.fixtures/` is gitignored. It is also an empty git repository of its own: oxlint and oxfmt honour `.gitignore` files up to the enclosing repo root, and without that boundary the monorepo's `/.fixtures/` rule would hide every fixture file from `vp check`.

| Path | Contents | Rebuilt when |
|---|---|---|
| `base-kit/` (+ `base-kit.stamp.json`, `base-kit.log`) | The output of `vendor/bin/laravel new base-kit --react --pest --pnpm --no-boost --database=sqlite --git --no-interaction`, using the `laravel/installer` pinned in the root `composer.json`. | `--fresh`, or the stamp is missing |
| `installed/` | `base-kit` with `mrsafalpiya/strictly-laravel` (a Composer path repo, symlinked) and `@mrsafalpiya/strictly-laravel` (`link:`) required, committed in the app's own git repo. | The Base Kit or either package manifest changes. Package code is symlinked, so code edits need no rebuild. |
| `<app>/` (+ `<app>.log`) | A throwaway `cp -a` copy of `installed/` with `strictly:install` already run: `fresh-install`, `idempotent-install`, `scenario-<name>`. | Every run. It stays on disk afterwards for inspection. |

Every app is its own git repo. Run `git diff` in an app to see what `strictly:install` and the scenario changed. All apps sit at the same depth, so the relative symlinks that Composer and pnpm create still work in copies. Each `<app>.log` holds every command the harness ran in that app and its full output.

Every fixture command runs without the AI-agent environment variables (`AI_AGENT`, `CLAUDECODE`, …, taken from `laravel/agent-detector`). Under an agent, `laravel/pao` changes Pest's CLI and output, and the installer's Pest conversion breaks. Fixtures must behave the same for humans and agents.

## `ci:check` and its steps

`strictly:install` makes `ci:check` a sequence of named Composer scripts, so each step can run on its own as `composer ci:check:<step>`:

| Step | Runs |
|---|---|
| `lint` | `<pm> run check` (Vite+: type-aware oxlint + oxfmt) |
| `tsc` | `<pm> run types:check` (`tsc --noEmit`) |
| `test` | `@test` (Pint, PHPStan, Pest) |

`<pm>` is the package manager detected from the app's lockfile. Later tickets add steps such as generation and Contracts. Type errors only fail `tsc`: type-aware oxlint doesn't report them.

## Scenario format

```
harness/scenarios/<name>/
├── scenario.json
└── files/            optional; mirrored onto the app root (files are written or overwritten)
```

```json
{
    "problem": "none",
    "description": "What the scenario proves.",
    "step": "tsc",
    "expect": { "outcome": "fail", "errorContains": "error TS2322: Type 'string' is not assignable to type 'number'." },
    "delete": ["resources/js/some-file.ts"]
}
```

- `problem` (required): the id of the Problem it guards (from `docs/problems.md`), or `"none"` for examples.
- `description` (required): one sentence.
- `step` (optional): a `ci:check` step. When it's omitted the full `ci:check` runs. Use a single step for speed whenever the Problem is caught by one tool.
- `expect` (required): `{"outcome": "pass"}` or `{"outcome": "fail", "errorContains": "<substring>"}`. Failing means a non-zero exit code and the substring in the combined output, with ANSI codes stripped. Pick a specific diagnostic (an error code and message), not just a file name.
- `delete` (optional): app-relative paths removed before `files/` is copied.

Unknown keys are rejected. The examples are `example-typed-code-passes` and `example-type-error-fails-tsc`.

## Adding scenarios for a Problem

1. Reproduce the Problem in a scratch app (`pnpm harness`, then edit `.fixtures/fresh-install`) until you know the exact edit and the diagnostic the fix should produce.
2. Add a breaking scenario: the Problem's reproduction written the way an app developer would, with `expect.outcome` set to `fail` and the specific diagnostic.
3. Add a passing scenario: the typed way that should work, with `expect.outcome` set to `pass`.
4. Set `"problem"` to the Problem's id and `"step"` to the tool that catches it (full `ci:check` if several do).
5. Run `pnpm test <name>` and watch the breaking scenario fail for the right reason before the fix lands (red), then pass.
6. Before finishing, run `pnpm test` to make sure the fresh install still passes. Run it with `STRICTLY_FRESH_BASE_KIT=1` when upstream may have moved.
