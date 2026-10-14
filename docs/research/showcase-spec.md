# Showcase app: "Tracklane" — multi-tenant issue tracker

Purpose: stress the type-safety setup with the shapes real apps hit, at a realistic size
(≈25+ pages, ≈15 models, ≈20 controllers). Every feature lists the typing scenario it exercises.

## Domain
| Area | Feature | Typing scenario exercised |
|---|---|---|
| Workspaces (tenancy) | create/switch workspace, current workspace in shared props | shared props, nullable shared data, route model binding with scoped params (`/w/{workspace:slug}/...`) |
| Members | invite by email, roles enum (owner/admin/member/guest), remove | string-backed enum + label/color metadata, policies → `can` objects |
| Invitations | accept via signed URL, expire | dates, nullable, signed routes |
| Projects | CRUD, key (e.g. `TRK`), color, archived flag, lead | form requests, select options, boolean, colors as string literal union |
| Issues | CRUD, number per project (`TRK-42`), status (workflow enum), priority (int enum), estimate (int|null), due date, assignee, labels (m2m), parent issue (sub-issues) | int-backed enum, many-to-many, self relation, nested optional relations |
| Issue list | filters (status[], priority[], assignee, label, search, sort), length-aware pagination | query-string typed filters round-trip, paginator shape |
| Board | kanban columns per status, drag to move (PATCH) | `Record<Status, Issue[]>` map types, optimistic update |
| Comments | markdown body, edit/delete own, reactions | polymorphic-ish, nested arrays, per-item `can` |
| Activity feed | infinite scroll of events (Inertia v3 scroll props / cursor pagination) | discriminated unions (event type → payload shape) |
| Labels | CRUD, color | simple CRUD baseline |
| Cycles (sprints) | start/end dates, progress stats (deferred prop) | deferred props, computed numbers, date ranges |
| Dashboard | stats cards + charts (counts per status, burn-down series) | deferred/lazy props, tuples/series arrays |
| Saved views | stores filter JSON per user | JSON column with typed shape (cast to Data object) |
| Notifications | database notifications list, mark read, unread count in shared props | Laravel notification `data` JSON typed via discriminated union |
| Attachments | file upload on issue (multipart) | `File` in form types, upload progress |
| Settings | workspace settings (name, slug, default view, json prefs) | nested object forms, nested validation errors |
| Global search | command palette hitting JSON endpoint (non-Inertia) | typed `fetch`/`useHttp` against a JSON controller action |
| Bulk actions | select many issues → change status/assignee | array payloads `ids: number[]`, errors `ids.3` |

## Non-functional
- Seeders with realistic volume (≈5 workspaces, 30 projects, 2k issues) to check perf of generation & pages.
- Feature tests for every controller + contract tests (actual Inertia JSON `satisfies` generated type).
- Larastan max, tsc strict (noUncheckedIndexedAccess), lint, all green in CI script.
