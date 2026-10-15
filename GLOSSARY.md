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

**Data class**:
A spatie/laravel-data class: the PHP definition of a shape that crosses a Type Boundary, from which its TypeScript type is generated. Final, and the only kind of class in the app's Data namespace (`App\Data`).
_Avoid_: DTO, resource

**Page class**:
The Data class that holds the props of exactly one Inertia page, under `App\Pages`; its constructor defines the props, its name gives the page component's (`App\Pages\Settings\ProfilePage` is `settings/profile`), and a controller renders the page by returning it.
_Avoid_: page DTO, view model

**Input class**:
The Data class a controller action type-hints to receive a request's payload: it extends `InputData`, validates the request with rules inferred from its types, and brands the action's Wayfinder route, so the form's payload and error keys come from it. A route whose action takes one is a **form endpoint**.
_Avoid_: form request, request DTO

**JSON endpoint**:
A non-Inertia route whose action declares a Data class (not a Page class) as its return type, which laravel-data sends as JSON; the class is its response, and it brands the action's Wayfinder route, so `useRouteHttp(route, init)` types the result from it.
_Avoid_: API route, resource endpoint

**Broadcast event**:
An event the app broadcasts (`implements ShouldBroadcast`) whose payload is a Data class: it uses `BroadcastsData` and returns the payload from `broadcastData()`, declaring that class as the return type. `@/generated/broadcasting` maps it, by the name Echo listens for it (`CommentPosted` for `App\Events\CommentPosted`), to the payload's type, so `useChannelEvent(channel('issues.{issue}', { issue }), 'CommentPosted', cb)` types `cb`; `channel()` takes only the patterns `routes/channels.php` defines, with their parameters.
_Avoid_: broadcast message, socket event

**Query class**:
The Data class a GET action type-hints to receive its query string (list filters): it extends `QueryData`, is parsed leniently (an invalid value falls back to its default, never a 422), and types the `query` option of the action's Wayfinder route. A Page class can send it back as a prop, so the filter UI is typed by it too.
_Avoid_: filter request, search DTO

**Vendor declaration**:
An entry in the app's `config/strictly.php` that names, for an action of a controller the app doesn't own (Fortify's), the input class, query class or JSON response its own code can't carry: `AuthenticatedSessionController::class.'@store' => LoginData::class`. The route is branded, recorded and covered as if the action declared it itself, and the feature tests verify it: every key the vendor validates, reads or reports an error for must be a field of it, every response must match it, and Contract Coverage reports a declared field the vendor never uses.
_Avoid_: vendor override, route map

**Route key**:
A model's key as the routes and broadcast channels bound to that model take it (`show(Project $project)` takes a project's `id`, `{project:slug}` its `slug`), typed nominally by the model: `RouteKey<'Project', number>`, so another model's key or a plain number doesn't fit. A Data class property holds one when the class is built from the model (a `from…(Project $project)` method) and the property is named after a binding field the routes use for it, or when it declares `#[RouteKeyOf(Project::class)]`. Feature tests check every route key the server sends is an existing key of its model.
_Avoid_: ID type, typed id

**Default locale**:
The locale `app.locale` names, whose lang files are the Source of Truth for translation keys: `t()` takes exactly their keys and each message's `:params`, and every other locale must have the same keys and params (the locale parity test, `tests/Feature/LocaleParityTest.php`). Messages reach the client as generated JSON bundled by Vite; only the locale's name may travel in the shared props.
_Avoid_: base language, master locale

**Contract**:
A real payload the server produced during a test (page props, flash, JSON response, validation errors, broadcast), recorded and checked by `tsc` against the generated type for its Type Boundary.
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

**Hook**:
One edit the installer (`strictly:install`) makes to an app's tooling, such as a tsconfig flag, a Vite plugin entry or a `ci:check` step. Re-running the installer applies any hook that is missing, and `ci:check` fails while one is.
_Avoid_: patch, setup step

**Release check**:
The check that fails in an existing app's `ci:check` until the app makes a change a release needs. It is listed with that change in the upgrade guide.
_Avoid_: migration (that means a database migration)

**Problem**:
A recorded way in which a type can be wrong, or a type has to be maintained by hand, at a Type Boundary; each one is eventually closed by the Overlay or accepted as a documented gap.
_Avoid_: issue, bug (those mean defects in a tool)
