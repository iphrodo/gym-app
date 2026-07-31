## Why

Exercise entries within a workout session are edited and displayed by matching on `exercise.name` instead of a stable position/id, and nothing stops a day template from having two exercises with the same name. When a day template has (or ever had) a duplicate exercise name, editing one exercise's weight/reps/comment silently overwrites every other row sharing that name. This is reproducible today: a user edited a workout and the home dashboard afterward showed wrong/zeroed weights for exercises that previously had real values, because the save path collapsed distinct rows into one.

## What Changes

- Workout session editing (`WorkoutView.tsx`, `WorkoutSessionClient.tsx`) addresses each exercise entry by its position in the session's `data` array instead of by `name`, so entries with identical names no longer cross-contaminate on edit or save.
- Cycle editing (`CycleFormView.tsx`) rejects/prevents a day template from having two exercises with the same name (case-insensitive, trimmed) within the same day, closing the bug at its source for newly created/edited cycles.
- No change to cross-session statistics aggregation (`StatsView.tsx` continues to group history by exercise name across sessions) — only the within-session/within-day addressing changes.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `workout-sessions`: exercise entries in an open session must be read, edited, and saved independently of one another regardless of whether they share a `name` with another entry in the same session.
- `training-cycles`: a day template's exercise list must not contain duplicate names (case-insensitive, trimmed) when the cycle is saved.

## Impact

- `types/index.ts` — no field changes needed; fix is behavioral (index-based addressing), not a schema change.
- `components/WorkoutView.tsx` — exercise inputs keyed/dispatched by array index instead of `exercise.name`.
- `app/workouts/WorkoutSessionClient.tsx` — `updateExerciseValues` updates by index instead of matching `item.name === exerciseName`.
- `components/CycleFormView.tsx` — add duplicate-name validation when adding/editing/saving a day's exercises.
- No database migration; existing rows with duplicate exercise names in already-saved cycles/sessions are not backfilled by this change.
