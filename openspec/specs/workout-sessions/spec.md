# Workout Sessions Specification

## Purpose
Let a user log and later revise what they actually did in a workout — date, and per-exercise weight, reps, and comment — against a cycle's day templates.

## Requirements

### Requirement: Start a Workout from a Day Template
A user SHALL be able to start a new workout session from one of the selected cycle's day templates.

#### Scenario: Start new session
- **WHEN** the user taps a day template ("Start") from the cycle detail view
- **THEN** a new session is prepared with today's date, the template's day number and label, and one entry per exercise in template order with empty weight

### Requirement: Log Exercise Results
While a workout session is open, the user SHALL be able to enter weight, reps, and a free-text comment for each exercise, and change the session date.

#### Scenario: Enter weight with comma decimal
- **WHEN** the user types a weight using a comma as the decimal separator (e.g. "82,5")
- **THEN** the comma is normalized to a period before being stored (e.g. "82.5")

#### Scenario: Change session date
- **WHEN** the user picks a different date in the workout's date field
- **THEN** the session's date updates accordingly before save

### Requirement: Save Workout Session
A user SHALL be able to save a workout session's logged data to persistent storage.

#### Scenario: Successful save
- **WHEN** the user clicks "Save results" on a workout with a configured Supabase connection
- **THEN** the session is upserted to the `workout_sessions` table, added to or replacing its entry in local history, a confirmation alert is shown, and the view returns to the cycle detail screen

#### Scenario: Save fails
- **WHEN** the Supabase upsert for a workout session returns an error
- **THEN** an error alert is shown and the session is not added to local history

#### Scenario: No Supabase connection configured
- **WHEN** `NEXT_PUBLIC_SUPABASE_URL` is not set and the user tries to save
- **THEN** an alert explains the connection is missing and no save is attempted

### Requirement: Edit a Past Workout Session
A user SHALL be able to reopen and modify a previously saved workout session from the home dashboard, cycle detail view, statistics view, or calendar view.

#### Scenario: Edit from history
- **WHEN** the user clicks the edit action on a past session (in recent-workouts cards, cycle history list, stats table, or a marked day in the calendar view)
- **THEN** the workout view opens pre-filled with that session's existing date and exercise data, and saving upserts the same session id

### Requirement: Delete a Workout Session
A user SHALL be able to permanently remove a workout session from a cycle's history.

#### Scenario: Confirm and delete
- **WHEN** the user confirms the "delete this workout from history" prompt on a session in the cycle detail view
- **THEN** the session is deleted from Supabase and removed from local history

#### Scenario: Cancel deletion
- **WHEN** the user dismisses the delete confirmation prompt
- **THEN** the session remains in history unchanged

### Requirement: Cancel an In-Progress Workout
A user SHALL be able to discard an in-progress (unsaved) workout entry.

#### Scenario: Cancel editing
- **WHEN** the user clicks "Cancel" while a workout session is open
- **THEN** no data is saved and the view returns to the cycle detail screen

### Requirement: Recent Workouts on Home Dashboard
The home dashboard SHALL show the user's most recent workout sessions across all cycles, with completed exercise weights.

#### Scenario: Recent sessions shown
- **WHEN** the user has at least one saved workout session
- **THEN** the home dashboard shows up to the 3 most recent sessions (sorted by date, then by id descending), each listing exercises that have a recorded weight, or a "No recorded exercises" note if none do
