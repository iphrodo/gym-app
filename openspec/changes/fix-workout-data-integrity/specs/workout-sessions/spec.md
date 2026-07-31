## MODIFIED Requirements

### Requirement: Log Exercise Results
While a workout session is open, the user SHALL be able to enter weight, reps, and a free-text multi-line comment for each exercise, and change the session date. Every exercise field SHALL be a controlled input from first render, and stored values SHALL match their declared types.

#### Scenario: Enter weight with comma decimal
- **WHEN** the user types a weight using a comma as the decimal separator (e.g. "82,5")
- **THEN** the comma is normalized to a period before being stored (e.g. "82.5")

#### Scenario: Change session date
- **WHEN** the user picks a different date in the workout's date field
- **THEN** the session's date updates accordingly before save

#### Scenario: Fields are controlled on a brand-new session
- **WHEN** a session is started from a day template, so no reps or comment has been entered yet
- **THEN** the reps and comment inputs render as controlled inputs with empty values, and typing into them does not produce a controlled/uncontrolled transition

#### Scenario: Multi-line comment
- **WHEN** the user enters a comment containing line breaks
- **THEN** the field accepts and preserves multiple lines, and redisplays them on reopening the session

#### Scenario: Non-numeric weight is rejected before it is stored
- **WHEN** the user enters a weight that is not a valid number
- **THEN** the value is not accepted into the session's stored data, and the user can see the field is invalid

#### Scenario: Cleared field
- **WHEN** the user clears a weight or reps field entirely
- **THEN** the field is stored as empty rather than as an invalid number, and the exercise counts as not logged

### Requirement: Save Workout Session
A user SHALL be able to save a workout session's logged data to persistent storage.

#### Scenario: Successful save
- **WHEN** the user clicks "Save results" on a workout with a configured Supabase connection
- **THEN** the session is upserted to the `workout_sessions` table, added to or replacing its entry in local history, a confirmation is shown, and the view returns to the screen the workout was opened from

#### Scenario: Save fails
- **WHEN** the Supabase upsert for a workout session returns an error
- **THEN** an error is shown, the session is not added to local history, and the user stays in the workout view with their entered data intact so they can retry

#### Scenario: No Supabase connection configured
- **WHEN** `NEXT_PUBLIC_SUPABASE_URL` is not set and the user tries to save
- **THEN** a message explains the connection is missing and no save is attempted

### Requirement: Recent Workouts on Home Dashboard
The home dashboard SHALL show the user's most recent workout sessions across all cycles, with completed exercise weights.

#### Scenario: Recent sessions shown
- **WHEN** the user has at least one saved workout session
- **THEN** the home dashboard shows up to the 3 most recent sessions, each listing exercises that have a recorded weight, or a "No recorded exercises" note if none do

#### Scenario: Sessions sharing a date
- **WHEN** two or more sessions have the same date
- **THEN** they are ordered by creation time, newest first, without depending on the format of their identifiers

#### Scenario: Mixed old and new identifier formats
- **WHEN** history contains both records created under the previous numeric-id scheme and records created under the new scheme
- **THEN** ordering remains stable and correct across both
