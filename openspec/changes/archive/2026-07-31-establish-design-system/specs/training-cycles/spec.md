## MODIFIED Requirements

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

### Requirement: Delete Cycle
A user SHALL be able to delete a training cycle, which also removes its associated workout history.

#### Scenario: Confirm and delete
- **WHEN** the user confirms the in-app deletion dialog for a cycle, which states that its workout history will also be removed
- **THEN** the cycle row is deleted from Supabase, all workout sessions referencing that cycle id are removed from the displayed history, and if that cycle was open the view returns to the home dashboard

#### Scenario: Cancel deletion
- **WHEN** the user dismisses the deletion dialog by cancelling, pressing Escape, or clicking outside it
- **THEN** the cycle and its history are left unchanged
