# Strictly Laravel

A template for Laravel + Inertia + React projects that gives end-to-end type safety with little or no manual work, applied on top of the official React starter kit.

## Language

**Strictly Laravel**:
The template as a whole: the Overlay, its conventions, and the guidance that enforces them.
_Avoid_: the starter kit, the boilerplate

**Base Kit**:
The official Laravel React starter kit, freshly generated at its latest version, before anything from Strictly Laravel is applied.
_Avoid_: starter kit (ambiguous), upstream template

**Overlay**:
Everything Strictly Laravel adds on top of a Base Kit, delivered as installable packages rather than as a fork.
_Avoid_: patch, fork, custom starter kit

**Testbed App**:
A large application built on Base Kit + Overlay whose purpose is to exercise every Type Boundary and prove the Overlay works against the latest Base Kit. Its domain is Tracklane.
_Avoid_: demo app, example app, sample project

**Type Boundary**:
Any place where data or names cross between PHP and TypeScript (routes, page props, shared props, form payloads, validation errors, enums, models, pagination and deferred props, flash messages, JSON endpoints, broadcasting, translations, exposed config).
_Avoid_: interface, API surface

**Source of Truth**:
The side of a Type Boundary whose definition is authoritative; in Strictly Laravel this is always PHP.
_Avoid_: schema, master definition

**Contract**:
A real payload the server produced during a test (page props, flash, JSON response, validation errors), recorded and checked by `tsc` against the generated type for its Type Boundary.
_Avoid_: snapshot, fixture

**Contract Coverage**:
The degree to which every shape a generated type permits (each page, deferred prop, nullable as non-null, non-empty list, union variant) has been observed in at least one Contract.
_Avoid_: test coverage (that means lines of code)

**Reference Implementation**:
The earlier hand-built template and its large test app (Tracklane) that proved the approach as a copied project, before it was turned into an Overlay.
_Avoid_: old template, prototype

**Tracklane**:
The multi-tenant issue tracker domain used by the Testbed App (workspaces, projects, issues, comments, labels, cycles).
_Avoid_: showcase, demo

**Kit Conversion**:
The installer step that replaces the Base Kit's own code (its pages, controllers, shared props and hand-written types) with versions that follow Strictly Laravel's conventions.
_Avoid_: migration, patching

**Problem**:
A recorded way in which a type can be wrong, or a type has to be maintained by hand, at a Type Boundary; each one is eventually closed by the Overlay or accepted as a documented gap.
_Avoid_: issue, bug (those mean defects in a tool)
