## 1. Workout session editing (index-based addressing)

- [x] 1.1 Change `onUpdateExercise` in `components/WorkoutView.tsx` to accept and pass the array index instead of `exercise.name`
- [x] 1.2 Key `invalidWeightDrafts` in `components/WorkoutView.tsx` by index instead of `exercise.name`
- [x] 1.3 Change `updateExerciseValues` in `app/workouts/WorkoutSessionClient.tsx` to update `prev.data[index]` instead of matching `item.name === exerciseName`

## 2. Duplicate exercise name prevention on cycle save

- [x] 2.1 In `components/CycleFormView.tsx`, on save, check each day template for exercise names that collide case-insensitively after trimming
- [x] 2.2 Surface a validation message against the duplicated row, focus it, and block save, matching the existing "Missing name" validation pattern

## 3. Verification

- [x] 3.1 Manually verify: create/edit a cycle with two identically-named exercises in one day is rejected with a validation message
- [x] 3.2 Manually verify: open a workout session, edit one exercise's weight, confirm no other exercise's stored values change
- [x] 3.3 Manually verify: home dashboard "Recent workouts" card reflects the edited value correctly after save
