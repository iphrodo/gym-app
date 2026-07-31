## 1. Types and value handling

- [ ] 1.1 Change `ExerciseSet` in [types/index.ts](types/index.ts) to `weight: string; reps: string; comment: string`, all required
- [ ] 1.2 Add `createdAt: string` to `TrainingCycle` and `WorkoutSession`
- [ ] 1.3 Create `lib/exerciseValues.ts` with a weight parser returning `number | null` and a normaliser that fills missing `reps`/`comment` with `""`
- [ ] 1.4 Fix the resulting type errors at every construction site (`prepareNewWorkout`, `DEFAULT_CYCLE`, `CycleFormView.handleSave`)

## 2. Database

- [ ] 2.1 Write a migration adding `created_at timestamptz` (nullable) to `cycles` and `workout_sessions`
- [ ] 2.2 Backfill `created_at` from the legacy numeric id where it parses as a millisecond timestamp, falling back to `now()`
- [ ] 2.3 Set `created_at` to `NOT NULL DEFAULT now()` once the backfill is verified to leave no nulls
- [ ] 2.4 Apply the migration and confirm the existing client still loads and saves

## 3. Stop the cycle form mutating app state

- [ ] 3.1 Deep-copy `initialCycle.templates` with `structuredClone` when seeding form state in [CycleFormView.tsx](components/CycleFormView.tsx)
- [ ] 3.2 Replace the day-label update (line ~81) with an immutable update
- [ ] 3.3 Replace the exercise-text update (line ~99) with an immutable update
- [ ] 3.4 Replace the exercise-remove (line ~108) and exercise-add (line ~120) mutations with immutable updates
- [ ] 3.5 Verify manually: edit a cycle's name, day label, and exercises, leave without saving, and confirm the cycle is unchanged on reopening

## 4. Surface load failures

- [ ] 4.1 Inspect `cyclesError` and `historyError` in the fetch effect in [app/page.tsx](app/page.tsx) instead of discarding them
- [ ] 4.2 Add a load-error state with a retry action, shown instead of the dashboard when either query fails
- [ ] 4.3 Ensure `isLoaded` is not set on a failed fetch, and that a failed cycles query does not trigger default-cycle seeding
- [ ] 4.4 Verify an empty result set is still treated as a new account rather than an error

## 5. Stop local state diverging from the database

- [ ] 5.1 Move the local history update in `saveWorkout` to run only after a successful upsert, keeping the user in the workout view on failure
- [ ] 5.2 Check the delete result in `deleteCycle` and only remove from local state on success
- [ ] 5.3 Check the delete result in `deleteWorkoutSession` and only remove from local state on success
- [ ] 5.4 Verify each failure path surfaces a message and leaves the UI matching the database

## 6. Record identity and ordering

- [ ] 6.1 Replace `Date.now().toString()` id generation with `crypto.randomUUID()` for new cycles and sessions
- [ ] 6.2 Change the tiebreak in [lib/sortWorkoutHistory.ts](lib/sortWorkoutHistory.ts) from `Number(id)` to `createdAt`, and update its existing tests
- [ ] 6.3 Compute "days in cycle" in [CycleView.tsx](components/CycleView.tsx) from the chronologically earliest session date, not from `cycleHistory[0].id`
- [ ] 6.4 Return zero elapsed days for a cycle with no sessions
- [ ] 6.5 Verify ordering is correct in history containing both legacy numeric ids and new UUIDs

## 7. Workout input fields

- [ ] 7.1 Replace `<input type="textarea">` in [WorkoutView.tsx](components/WorkoutView.tsx) with a real `<textarea>`
- [ ] 7.2 Confirm reps and comment render as controlled inputs with `""` on a brand-new session, with no React controlled/uncontrolled warning in the console
- [ ] 7.3 Surface invalid weight entry as field state rather than storing an unparseable value
- [ ] 7.4 Filter non-finite weights in [StatsView.tsx](components/StatsView.tsx) so chart coordinates can never be computed from `NaN`

## 8. Verification

- [ ] 8.1 Run `npx tsc --noEmit` and `npm run lint` clean
- [ ] 8.2 Run `npm test` — update the sort tests for the new tiebreak and confirm all pass
- [ ] 8.3 Manual pass: edit-and-cancel a cycle, save a workout with the network offline, delete with the network offline, open a legacy session and re-save it, and view stats for an exercise with a blank weight
