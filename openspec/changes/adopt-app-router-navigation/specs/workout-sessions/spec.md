## MODIFIED Requirements

### Requirement: Cancel an In-Progress Workout
A user SHALL be able to discard an in-progress (unsaved) workout entry, returning to the screen they came from via browser history rather than a remembered origin value.

#### Scenario: Cancel editing
- **WHEN** the user clicks "Cancel" while a workout session is open
- **THEN** no data is saved and the browser returns to the previously visited screen

#### Scenario: Cancel from any entry point
- **WHEN** the user opens an existing session for editing from the home dashboard, the cycle detail view, the statistics view, or the calendar, and cancels without saving
- **THEN** no data is saved and they return to whichever of those screens they came from, determined by browser history rather than by the app tracking an origin

#### Scenario: Cancelled work is not retained
- **WHEN** the user cancels an in-progress workout and later reopens the same day template
- **THEN** the workout starts from the template's empty state rather than restoring the cancelled entries

### Requirement: Save Workout Session
A user SHALL be able to save a workout session's logged data to persistent storage.

#### Scenario: Successful save
- **WHEN** the user clicks "Save results" on a workout with a configured Supabase connection
- **THEN** the session is upserted to the `workout_sessions` table, added to or replacing its entry in the displayed history, a confirmation is shown, and the browser returns to the previously visited screen

#### Scenario: Save fails
- **WHEN** the Supabase upsert for a workout session returns an error
- **THEN** an error is shown, the session is not added to the displayed history, and the user stays on the workout screen with their entered data intact so they can retry

#### Scenario: No Supabase connection configured
- **WHEN** `NEXT_PUBLIC_SUPABASE_URL` is not set and the user tries to save
- **THEN** a message explains the connection is missing and no save is attempted

### Requirement: Start a Workout from a Day Template
A user SHALL be able to start a new workout session from one of the selected cycle's day templates, at a URL identifying the cycle and the day.

#### Scenario: Start new session
- **WHEN** the user taps a day template ("Start") from the cycle detail view
- **THEN** a new session is prepared with today's date, the template's day number and label, and one entry per exercise in template order with empty weight

#### Scenario: New workout is addressable before it is saved
- **WHEN** a user is entering a workout that has not yet been saved
- **THEN** the URL identifies the cycle and the day template it was started from, and reloading that URL starts a fresh workout from that same template

### Requirement: Edit a Past Workout Session
A user SHALL be able to reopen and modify a previously saved workout session at a URL identifying that session, from the home dashboard, cycle detail view, statistics view, or calendar view.

#### Scenario: Edit from history
- **WHEN** the user clicks the edit action on a past session (in recent-workouts cards, cycle history list, stats table, or a marked day in the calendar view)
- **THEN** the workout screen opens at that session's own URL, pre-filled with its existing date and exercise data, and saving upserts the same session id

#### Scenario: Direct link to a session
- **WHEN** a user opens a saved session's URL directly
- **THEN** that session opens for editing, provided it belongs to them
