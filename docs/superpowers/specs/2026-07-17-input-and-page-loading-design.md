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
Data:  idle -> loading -> ready | error
```

Route loading begins for every navigation entry point: direct navigation,
Back/Forward, and deep links. A global loader appears only after 150–250 ms, so
quick transitions do not flash. It ends when the view's chunk has loaded and a
page shell has mounted. A failed chunk load renders a route-specific error with
a retry action.

The mounted page then starts its own data request and renders a layout-matched
skeleton. Data always settles as ready or error. Requests are abortable where
the underlying client supports it; otherwise stale results are ignored with a
request generation. A slow request is not treated as failed: it surfaces a
non-terminal “taking longer than expected” state with retry and cancel actions.

## Navigation concurrency and retention

Selecting the current destination is ignored while it is loading or mounted.
Selecting another destination supersedes the first transition, cancels its
request where possible, and makes its result ineligible to update the UI.

Back, Forward, and deep-link navigations use the same transition coordinator.

Top-level pages retain successfully loaded data and their scroll position while
they remain in the navigation cache. Returning to one restores the saved scroll
position and data. An explicit reload/retry replaces the retained data. Hidden
cached pages are marked both `inert` and `aria-hidden`; they cannot receive
focus or pointer interaction. Their active-only timers, subscriptions, and media
work must pause or clean up when `active` becomes false.

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
leave a white screen. The loading overlay uses `aria-busy`; errors are announced
once through an appropriate live region without announcing fast transitions.

After a successful transition, focus moves to the page heading or page-defined
initial target. Back restores the prior logical focus when it remains valid,
otherwise the page heading. Motion respects `prefers-reduced-motion`.

## Verification

Automated coverage will demonstrate keyboard guarding for native focus,
text inputs, custom editors, IME composition, repeats, and modal priority.
Navigation coverage will demonstrate rapid replacement of a pending route,
duplicate-destination suppression, Back/Forward/deep-link coordination, chunk
failure/retry, data failure/retry/cancel, stale-result rejection, focus
restoration, and scroll retention. Page tests cover active/inactive lifecycle
cleanup. Type checking and the repository validation commands run before
completion.
