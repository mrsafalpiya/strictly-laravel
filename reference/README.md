# Reference Implementation (read-only)

The hand-built template and the Tracklane app from the earlier research thread, copied here so tickets can extract from them. They are a **spec to extract from, not code to build on**: Strictly Laravel is delivered as an Overlay on the latest Base Kit (ADR-0001), so nothing here is installed, run by CI, or included in the monorepo's tooling (Composer, pnpm workspace, PHPStan, oxlint, tsc).

| Directory | What it is | Source |
|---|---|---|
| `template/` | The Base Kit (`main` @ `717b8f5`) copied and modified into a strictly typed starter. Start with `template/docs/type-safety.md` (the whole standard) and `template/README.md`. | `template` repo @ `891f687`, clean working tree |
| `showcase/` | **Tracklane**, the large issue tracker built on `template/` (28 pages, 88 Data classes, 13 models, 197 tests). Source for the Testbed App port. | `showcase` repo @ `4a5a3cd` **plus 13 uncommitted working-tree changes** (the latest state, back-porting "requests typed by their route") |

Copied from each repo's working tree with its own `.gitignore` applied, so `vendor/`, `node_modules/`, generated types, recorded Contracts, `.env` and SQLite databases are not included; the original git histories were not carried over. To run one, copy it out of the monorepo first and run `composer setup`.

Known departures from decisions made since (see ADRs and the spec, issue #1): it adopts TypeScript 7 and rewrites `tsconfig.json` (dropped in the Overlay), and enforces conventions with Pest arch tests (moving to PHPStan rules).

Delete this directory once the Overlay has extracted everything from `template/` and Tracklane has been ported into the Testbed App.
