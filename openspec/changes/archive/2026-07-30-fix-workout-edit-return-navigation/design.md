## Context

See proposal.md - Why. `app/page.tsx` is a single view-router component holding `view: 'home' | 'cycle' | 'new_cycle' | 'edit_cycle' | 'workout' | 'stats'` and `selectedCycleId`. Entry into `'workout'` happens via `prepareNewWorkout` (from cycle detail, "Start") or `prepareEditWorkout` (from Home, Cycle detail, or Stats, via `onEditSession`). Only the cycle-detail entry point happens to set `selectedCycleId` as a side effect of prior navigation; Home and Stats never set it, so the current hardcoded `onCancel`/`saveWorkout` transition to `'cycle'` renders nothing when `selectedCycleId` doesn't resolve to a cycle.

## Goals / Non-Goals

**Goals:**
- Cancel and Save from the workout view return to whichever screen (`home`, `cycle`, or `stats`) the user actually opened it from.
- Eliminate the `return null` blank-screen fallthrough for this flow.

**Non-Goals:**
- Building a general-purpose navigation/history stack. Only the workout view's single "go back to where I came from" case is addressed.
- Changing Cancel/Save behavior for `new_cycle`/`edit_cycle` (`CycleFormView`), which already return to a well-defined, always-valid destination (`home` or `cycle`) and aren't reachable from Home/Stats.

## Decisions

- Add a `previousView: 'home' | 'cycle' | 'stats'` piece of state (default `'cycle'`, the only value that preserves current behavior for the "Start" entry point). Set it immediately before `setView('workout')` in both `prepareNewWorkout` and `prepareEditWorkout`, using the caller's current `view` at the moment of the call.
  - Alternative considered: pass the origin as an argument to `onEditSession`/`onStartWorkout` from each child view. Rejected — the origin is always "whatever `view` currently is" at the call site in `app/page.tsx`, so capturing it there avoids threading an extra prop through three components for no added clarity.
- `onCancel` and `saveWorkout` navigate to `previousView` instead of the literal `'cycle'`.
- No change needed to `selectedCycleId` handling for the Stats destination: `stats` view already requires `selectedCycle` to be set, and Stats is only reachable from Cycle detail (which sets `selectedCycleId`), so `selectedCycleId` is guaranteed valid whenever `previousView === 'stats'`.

## Risks / Trade-offs

- [Risk] If `previousView` is ever left stale (e.g., a future entry point into `'workout'` forgets to set it) → Mitigation: default it to `'cycle'`, the current behavior, and cover the three entry points with a manual test / the added scenarios in the spec delta.
