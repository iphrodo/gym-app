## Why

Editing a workout session from the home dashboard or the stats view, then clicking Cancel (or Save) without setting the cycle up first, drops the user on a blank screen: `app/page.tsx` hardcodes "return to cycle detail" as the destination, but `selectedCycleId` is only set when navigating in through the cycle detail view. When it isn't set, the render guard for the cycle view fails and the app falls through to `return null`. Separately, "always land on cycle detail" is also the wrong destination on its own terms — a user editing from Home or Stats expects to land back where they were, not get redirected into a cycle screen they didn't ask to open.

## What Changes

- The workout edit screen (opened via "Start" or via editing a past session from Home, Cycle detail, or Stats) tracks which screen it was opened from.
- Cancelling or saving a workout session returns the user to that originating screen (Home, Cycle detail, or Stats) instead of unconditionally jumping to cycle detail.
- Fixes the blank-screen bug: since the return destination no longer depends on `selectedCycleId` being set as a side effect of prior navigation, editing from Home or Stats can no longer land on an invalid/unrendered view.

## Capabilities

### Modified Capabilities
- `workout-sessions`: "Cancel an In-Progress Workout" and the "Successful save" scenario under "Save Workout Session" change from "the view returns to the cycle detail screen" to "the view returns to the screen the workout was opened from."

## Impact

- `app/page.tsx`: view-router state machine — add tracking of the originating view for the `workout` view; update `onCancel`/`saveWorkout` transitions.
- `components/HomeView.tsx`, `components/CycleView.tsx`, `components/StatsView.tsx`: no prop changes expected (they already just call `onEditSession`/`onStartWorkout`); the origin is captured internally in `app/page.tsx`.
- `openspec/specs/workout-sessions/spec.md`: requirement text updates for Cancel and Save scenarios.
