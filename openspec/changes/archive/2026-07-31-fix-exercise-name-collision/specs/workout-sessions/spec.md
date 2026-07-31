## MODIFIED Requirements

### Requirement: Log Exercise Results
While a workout session is open, the user SHALL be able to enter weight, reps, and a free-text multi-line comment for each exercise, and change the session date. Every exercise field SHALL be a controlled input from first render, and stored values SHALL match their declared types. Each exercise entry in the session's data SHALL be edited and stored independently of every other entry, regardless of whether two or more entries share the same exercise name.

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

#### Scenario: Editing one exercise does not affect another sharing its name
- **WHEN** a session's data contains two or more exercise entries with the identical name, and the user edits the weight, reps, or comment of one of them
- **THEN** only that entry's field changes; every other entry, including ones sharing the same name, keeps its previously stored values
