## MODIFIED Requirements

### Requirement: Save Workout Session
A user SHALL be able to save a workout session's logged data to persistent storage.

#### Scenario: Successful save
- **WHEN** the user clicks "Save results" on a workout with a configured Supabase connection
- **THEN** the session is upserted to the `workout_sessions` table, added to or replacing its entry in local history, a confirmation alert is shown, and the view returns to the screen the workout was opened from

#### Scenario: Save fails
- **WHEN** the Supabase upsert for a workout session returns an error
- **THEN** an error alert is shown and the session is not added to local history

#### Scenario: No Supabase connection configured
- **WHEN** `NEXT_PUBLIC_SUPABASE_URL` is not set and the user tries to save
- **THEN** an alert explains the connection is missing and no save is attempted

### Requirement: Cancel an In-Progress Workout
A user SHALL be able to discard an in-progress (unsaved) workout entry.

#### Scenario: Cancel editing
- **WHEN** the user clicks "Cancel" while a workout session is open
- **THEN** no data is saved and the view returns to the screen the workout was opened from

#### Scenario: Cancel editing started from the home dashboard
- **WHEN** the user opens an existing session for editing from the home dashboard's recent workouts and clicks "Cancel" without saving
- **THEN** no data is saved and the view returns to the home dashboard, not a blank screen or an unrelated cycle

#### Scenario: Cancel editing started from the stats view
- **WHEN** the user opens an existing session for editing from the stats table and clicks "Cancel" without saving
- **THEN** no data is saved and the view returns to the stats view for that cycle
