## MODIFIED Requirements

### Requirement: Edit Cycle
A user SHALL be able to edit an existing cycle's name and day templates. Edits SHALL be held in the form and applied to the app's data only on save.

#### Scenario: Save edits
- **WHEN** the user opens an existing cycle for editing, changes its name and/or day templates, and saves
- **THEN** the cycle is upserted with the same id, its `isActive` flag is preserved, and the app returns to the cycle detail view

#### Scenario: Add or remove a day
- **WHEN** the user clicks "Add day" or "Delete day" (available whenever more than one day exists) while editing a cycle
- **THEN** the day template list gains or loses that entry before save

#### Scenario: Add or remove an exercise
- **WHEN** the user clicks "Add exercise" or the "×" button next to an exercise row within a day
- **THEN** that day's exercise list gains or loses that entry before save

#### Scenario: Abandoning an edit discards it
- **WHEN** the user edits a cycle's name, day labels, or exercises and then leaves the form without saving
- **THEN** the cycle is unchanged everywhere in the app, including after navigating back into it

#### Scenario: Editing does not disturb other cycles
- **WHEN** the user edits one cycle's day templates
- **THEN** no other cycle's templates are altered, whether or not the edit is saved

### Requirement: Cycle Detail Dashboard
The app SHALL show, for a selected cycle, its workout count, elapsed days, day templates (to start a workout), and reverse-chronological workout history.

#### Scenario: Viewing an active cycle with history
- **WHEN** the user opens a cycle that has logged workout sessions
- **THEN** the detail view shows the total session count, days elapsed since the earliest session, each day template as a "Start" action, and past sessions newest-first with per-session completion count ("N / total exercises logged")

#### Scenario: Elapsed days uses the earliest session
- **WHEN** a cycle's sessions are held in an arbitrary order
- **THEN** elapsed days is measured from the chronologically earliest session, not from whichever session happens to be first in the list

#### Scenario: Cycle with no history
- **WHEN** the user opens a cycle that has no logged sessions
- **THEN** the elapsed-days figure reads zero rather than a value derived from an absent record
