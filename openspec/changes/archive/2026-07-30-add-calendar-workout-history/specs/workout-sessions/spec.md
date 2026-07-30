## MODIFIED Requirements

### Requirement: Edit a Past Workout Session
A user SHALL be able to reopen and modify a previously saved workout session from the home dashboard, cycle detail view, statistics view, or calendar view.

#### Scenario: Edit from history
- **WHEN** the user clicks the edit action on a past session (in recent-workouts cards, cycle history list, stats table, or a marked day in the calendar view)
- **THEN** the workout view opens pre-filled with that session's existing date and exercise data, and saving upserts the same session id
