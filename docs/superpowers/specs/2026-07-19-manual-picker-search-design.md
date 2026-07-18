# Manual Picker Search Recovery

## Problem

When Manual Picker is the configured Play behavior, the picker can remain on “Searching streams” indefinitely. Instant Play is not in scope and must keep its current behavior.

## Design

Manual Picker will remain progressive: the first usable partial pipeline result makes the source list available immediately, while slower providers may continue settling in the background.

The loading path will also be bounded. Add-on discovery and stream-pipeline work must reach a terminal UI state within the picker’s existing wait window. If usable partial results exist, Harbor will keep them visible. If none exist, Harbor will stop the searching presentation and show the existing empty/error and retry controls.

The fix will be applied at the asynchronous boundary that fails to settle, rather than changing stream ranking, stream selection, or Instant Play.

## Error Handling

- A stalled provider must not keep Manual Picker in its searching presentation forever.
- Successful providers remain usable when another provider stalls or fails.
- Refresh starts a fresh bounded search.
- Existing abort behavior remains intact when leaving the picker or starting a new search.

## Testing

Regression coverage will reproduce a provider/discovery operation that never settles and assert that Manual Picker reaches a terminal state within the configured bound. Coverage will also verify that partial results become usable without waiting for every provider and that Instant Play behavior is unchanged.

## Scope

This change does not modify player source switching, ranking policy, debrid selection, or automatic playback behavior.
