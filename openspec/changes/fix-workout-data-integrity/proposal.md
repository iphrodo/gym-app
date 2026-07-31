## Why

A cluster of defects lets the app silently lose or corrupt user data. Editing a cycle mutates the app's state in place before saving, so "Cancel" keeps the edits. Failed loads and failed deletes are swallowed entirely, leaving the UI showing data the database does not have. The `reps` field is typed as a number but holds a string. And the workout id doubles as a timestamp, so a cosmetic change to id generation would silently break the "days in cycle" figure. None of these are visible as crashes — they surface as wrong numbers and vanished edits, which is why they have survived.

## What Changes

- Cycle editing works on a copy, so abandoning the form discards the edits instead of applying them.
- Failed initial loads are surfaced and retryable, rather than rendering an empty app that looks like a new account.
- Failed writes and deletes no longer leave the UI out of sync with the database: local state is only updated once the write succeeds.
- `ExerciseSet` field types match what is actually stored, and non-numeric weights no longer reach the chart maths as `NaN`.
- Exercise inputs are controlled from first render, fixing React's controlled/uncontrolled warning on new sessions.
- The comment field becomes a real multi-line `<textarea>`. It is currently `<input type="textarea">`, which is not a valid type and silently degrades to a single-line text input.
- **BREAKING (data):** new records get collision-free ids instead of `Date.now()`, and a `created_at` column becomes the source of truth for record age.
- "Days in cycle" is computed from session dates instead of by reinterpreting a record's id as a timestamp — which also fixes it reading an unsorted array's first element rather than the earliest session.

## Capabilities

### New Capabilities

- `data-persistence`: How the app behaves when reads and writes fail — failures are surfaced, never silent, and local state never diverges from what was actually persisted.

### Modified Capabilities

- `workout-sessions`: exercise values gain defined types and validation; the comment field becomes multi-line; the save-failure path and the recent-workouts ordering tiebreak change.
- `training-cycles`: cancelling an edit must discard changes; cycle duration is derived from session dates rather than from a record id.

## Impact

- **Code:** [components/CycleFormView.tsx](components/CycleFormView.tsx) (all four nested-mutation sites), [app/page.tsx](app/page.tsx) (fetch effect, save/delete handlers, id generation), [components/WorkoutView.tsx](components/WorkoutView.tsx) (input types), [components/CycleView.tsx](components/CycleView.tsx) (duration), [types/index.ts](types/index.ts), [lib/sortWorkoutHistory.ts](lib/sortWorkoutHistory.ts) (the `Number(id)` tiebreak stops working once ids are not numeric).
- **Database:** a migration adding `created_at` to `cycles` and `workout_sessions`. Existing numeric ids are left as-is; only new records use the new scheme.
- **Sequencing:** depends on `secure-data-ownership` landing first, since both touch the same handlers in `app/page.tsx`. Assumes no test harness yet — that is the next change — so verification here is manual and type-level.
- **Deliberately out of scope:** replacing `alert()`/`confirm()` with real UI. This change guarantees failures are *surfaced*; the presentation mechanism stays as-is and is replaced in `establish-design-system`.
