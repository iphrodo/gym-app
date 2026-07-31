# Training Cycles Specification

## Purpose
Let a user define and manage the multi-day workout programs ("training cycles") they follow, each made of ordered day templates listing the exercises for that day.

## Requirements

### Requirement: Default Cycle Seeding
On first login for an account with no cycles, the app SHALL create and persist a default starter cycle owned by that account, so the user has something to work with immediately.

#### Scenario: Empty account
- **WHEN** a logged-in user's owner-scoped `cycles` query returns zero rows
- **THEN** the app inserts the built-in default cycle ("Power Cycle v1", 3 day templates, active), owned by that user, into `cycles` and shows it

#### Scenario: Seeding does not leak across accounts
- **WHEN** a new account signs in for the first time while other accounts already have cycles
- **THEN** the new account is seeded with its own default cycle rather than seeing another account's cycles

### Requirement: Create Cycle
A user SHALL be able to create a new training cycle with a name and one or more day templates, each with a label and an ordered list of exercises.

#### Scenario: Minimal valid cycle
- **WHEN** the user enters a cycle name, keeps the default single day, adds at least one exercise, and saves
- **THEN** a new cycle row is upserted to Supabase, the user's other cycles are marked inactive, the new cycle becomes active, and the app returns to the home dashboard

#### Scenario: Missing name
- **WHEN** the user attempts to save a cycle with no name entered
- **THEN** a validation message is shown against the name field, the field receives focus, and the cycle is not saved

#### Scenario: Empty exercise rows
- **WHEN** the user leaves blank exercise input rows in a day template
- **THEN** blank rows are stripped before saving so only non-empty exercise names persist

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

### Requirement: Single Active Cycle
At most one of a user's training cycles SHALL be marked active at a time. Activation state is per-account: marking one cycle active SHALL NOT affect any other account's cycles.

#### Scenario: Creating a new cycle deactivates the user's others
- **WHEN** a brand-new cycle (no existing id) is saved
- **THEN** every *other cycle owned by the same user* is updated to `is_active = false` and the new cycle is active

#### Scenario: Other accounts are unaffected
- **WHEN** a user saves a brand-new cycle while other accounts also have active cycles
- **THEN** those other accounts' cycles keep their existing active state

### Requirement: Delete Cycle
A user SHALL be able to delete a training cycle, which also removes its associated workout history.

#### Scenario: Confirm and delete
- **WHEN** the user confirms the in-app deletion dialog for a cycle, which states that its workout history will also be removed
- **THEN** the cycle row is deleted from Supabase, all workout sessions referencing that cycle id are removed from the displayed history, and if that cycle was open the view returns to the home dashboard

#### Scenario: Cancel deletion
- **WHEN** the user dismisses the deletion dialog by cancelling, pressing Escape, or clicking outside it
- **THEN** the cycle and its history are left unchanged

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

### Requirement: Home Dashboard Cycle List
The home dashboard SHALL list all of the user's training cycles with their active status, day count, and entry points to open, create, or delete a cycle.

#### Scenario: Viewing cycles list
- **WHEN** the user is on the home dashboard
- **THEN** every cycle is listed with its name, an "Active" badge if `isActive` is true, its number of workout days, and "Open"/delete controls; a "+ New cycle" action is always available
