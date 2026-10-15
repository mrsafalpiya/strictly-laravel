# Research

| File | What it is |
|---|---|
| `ecosystem.md` | Facts (with sources) about the Base Kit and the type-safety ecosystem as of 2026-10-14. |
| `reference-overview.md` | The Reference Implementation's overview: what was tested, what the template adds, Tracklane, upstream bugs found. |
| `type-safety.md` | The Reference Implementation's standard: the template's rules, and which tool enforces each. The Problem register cites it as "type-safety rule N". |
| `evaluations/01-wayfinder-next.md` | Wayfinder `next` (beta) evaluated with Contract tests: 15/39 correct. Evidence for ADR-0003. |
| `evaluations/02-laravel-data-ts.md` | laravel-data + typescript-transformer v3 + stable Wayfinder: chosen stack. Evidence for ADR-0003. |
| `evaluations/03-other-tools.md` | modeltyper, Ziggy, Hybridly, zod generators, Scramble, TS 7, PHPStan max. |
| `fixture-spec.md` | The shared fixture domain every evaluation implemented. |
| `showcase-spec.md` | The spec Tracklane was built from. |

The evaluation apps (code, scripts, breakage scenarios) were not copied, only their findings; references inside the findings to their own files point into those apps. The Reference Implementation's code (the template and Tracklane) was archived in this repo until the Overlay had extracted the template and Tracklane had been ported into the Testbed App, then retired (#31); paths in `reference-overview.md` and `type-safety.md` name files of those two apps.
