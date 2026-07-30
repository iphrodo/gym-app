## 1. State machine changes

- [x] 1.1 Add `previousView` state (`'home' | 'cycle' | 'stats'`, default `'cycle'`) in `app/page.tsx`
- [x] 1.2 Set `previousView` from the current `view` in `prepareNewWorkout` and `prepareEditWorkout` before switching to `'workout'`
- [x] 1.3 Update `onCancel` (workout view) to `setView(previousView)` instead of `setView('cycle')`
- [x] 1.4 Update `saveWorkout`'s post-save `setView('cycle')` to `setView(previousView)`

## 2. Tests

- [x] 2.1 Add a test (or extract+test a pure helper for the previousView transition logic) covering: editing from Home then Cancel returns to Home; editing from Cycle detail then Cancel returns to Cycle; editing from Stats then Cancel returns to Stats
- [x] 2.2 Run `npm test` and confirm the full suite passes

## 3. Spec sync

- [x] 3.1 Run `/opsx:sync` (or equivalent) to merge the `workout-sessions` delta spec into `openspec/specs/workout-sessions/spec.md` once implementation is verified
