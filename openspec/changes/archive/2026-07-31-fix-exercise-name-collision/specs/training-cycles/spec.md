## MODIFIED Requirements

### Requirement: Create Cycle
A user SHALL be able to create a new training cycle with a name and one or more day templates, each with a label and an ordered list of exercises. A day template's exercise names SHALL be unique within that day, compared case-insensitively after trimming whitespace.

#### Scenario: Minimal valid cycle
- **WHEN** the user enters a cycle name, keeps the default single day, adds at least one exercise, and saves
- **THEN** a new cycle row is upserted to Supabase, the user's other cycles are marked inactive, the new cycle becomes active, and the app returns to the home dashboard

#### Scenario: Missing name
- **WHEN** the user attempts to save a cycle with no name entered
- **THEN** a validation message is shown against the name field, the field receives focus, and the cycle is not saved

#### Scenario: Empty exercise rows
- **WHEN** the user leaves blank exercise input rows in a day template
- **THEN** blank rows are stripped before saving so only non-empty exercise names persist

#### Scenario: Duplicate exercise name within a day
- **WHEN** the user attempts to save a cycle where a single day template has two or more exercise rows with the same name (case-insensitive, trimmed)
- **THEN** a validation message is shown against the duplicated exercise row, the affected field receives focus, and the cycle is not saved
