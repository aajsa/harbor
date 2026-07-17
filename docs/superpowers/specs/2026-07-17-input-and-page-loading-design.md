# Input and primary-page loading design

## Scope

Fix two reliability issues on the primary Harbor views: keyboard shortcuts must not
interfere with text entry or inactive windows, and route/data loading must never
look like a frozen or blank page. The work stays on one branch and does not
migrate the application to a new router.

Primary views are the top-level destinations reachable from the application
navigation: Home, Movies, Shows, Live, Library, Kids, Anime, Discover, Addons,
Calendar, Queue, Settings, and Downloads.

## State model

Navigation and data loading remain separate state machines:

```
Route: idle -> loadingChunk -> mounted | routeError
Data:  idle -> loading -> ready | error | canceled
```

Route loading begins for every navigation entry point: direct navigation,
Back/Forward, and deep links. A global loader appears only after 150–250 ms, so
quick transitions do not flash. It ends when the view's chunk has loaded and a
page shell has mounted. A failed chunk load renders a route-specific error with
a retry action.

The mounted page then starts its own data request and renders a layout-matched
skeleton. Data always settles as ready, error, or canceled; cancellation renders
“Loading canceled” with an explicit resume action rather than a blank page.
Requests are abortable where the underlying client supports it; otherwise stale
results are ignored with a request generation. Retrying first aborts or
invalidates the outstanding generation, then starts a fresh request. A slow
request is not treated as failed: it surfaces a non-terminal “taking longer than
expected” state with retry and cancel actions.

A chunk failure first offers a normal retry. Since a failed dynamic import can
remain cached as a rejected promise, the route error also offers a window/app
reload as the recovery fallback when retry does not resolve it.

## Navigation concurrency and retention

Selecting the current destination is ignored while it is loading or mounted.
Selecting another destination supersedes the first transition, cancels its
request where possible, and makes its result ineligible to update the UI.

Back, Forward, and deep-link navigations use the same transition coordinator.

Top-level pages retain successfully loaded data and their scroll position while
they remain in a bounded navigation cache. The cache retains the current page
plus at most five inactive primary pages, evicting the least-recently-used
inactive page when the limit is exceeded. Eviction runs complete cleanup of
timers, subscriptions, media work, and portals. Returning to a retained page
restores its data and scroll position. An explicit reload/retry replaces the
retained data.

Before a cached page becomes hidden, focus moves to the incoming page or safe
application chrome, and any modal or portal owned by that page closes. The page
is then marked both `inert` and `aria-hidden`; it cannot receive focus or pointer
interaction. Its active-only timers, subscriptions, and media work pause or
clean up when `active` becomes false.

## Keyboard event policy

All application-wide keyboard shortcuts use one guard before handling an event.
The guard rejects events when the Tauri/browser window is not focused, when the
event is composing (`isComposing`) or comes from an IME, and when the target is
an input, textarea, select, contenteditable element, or a custom editor
(`textbox`, `searchbox`, `combobox`, and editor-marked elements).

Handlers opt in to repeat handling only where holding a key is intended; all
one-shot actions ignore `event.repeat`. Modal handlers run before navigation
shortcuts, so an open modal owns Escape, arrows, and activation keys according
to its local behavior.

## Error handling and accessibility

Route chunk failures and page-data failures are rendered differently. A final
React error boundary catches unexpected rendering errors so no primary page can
leave a white screen. `aria-busy` belongs on the content region being updated,
not the loader itself; errors are announced once through an appropriate live
region without announcing fast transitions.

After a successful transition, restoration follows a fixed order: mount the
shell, restore saved scroll, then focus the page-defined initial target or
heading using `focus({ preventScroll: true })`. Back restores the prior logical
focus when it remains valid, otherwise the page heading. Motion respects
`prefers-reduced-motion`.

The loading layer blocks interaction with the changing content region but does
not cover primary navigation. This preserves the ability to choose a different
destination, which supersedes and cancels the current transition.

## Verification

Automated coverage will demonstrate keyboard guarding for native focus,
text inputs, custom editors, IME composition, repeats, and modal priority.
Navigation coverage will demonstrate rapid replacement of a pending route,
duplicate-destination suppression, Back/Forward/deep-link coordination, chunk
failure/retry, data failure/retry/cancel, stale-result rejection, focus
restoration, and scroll retention. Page tests cover active/inactive lifecycle
cleanup. Type checking and the repository validation commands run before
completion.
