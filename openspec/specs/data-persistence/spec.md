# Data Persistence Specification

## Purpose

Define how the app behaves when persistence fails, so that a failed read or write is always visible to the user and local state never claims something was saved when it was not.

## Requirements

### Requirement: Failed Initial Load Is Surfaced
When loading a signed-in user's data fails, the app SHALL say so and offer a retry, rather than presenting an empty or partial dataset as if it were complete.

#### Scenario: Cycle fetch fails
- **WHEN** the query for the user's cycles returns an error
- **THEN** an error state is shown with a retry action, and the app does not proceed to the home dashboard or seed a default cycle

#### Scenario: History fetch fails
- **WHEN** the cycles query succeeds but the workout history query returns an error
- **THEN** an error state is shown with a retry action rather than a dashboard reporting zero workouts

#### Scenario: Retry after a transient failure
- **WHEN** the user triggers retry from the error state and the queries then succeed
- **THEN** the app loads normally with the fetched data

#### Scenario: An empty account is not an error
- **WHEN** both queries succeed and return zero rows for a new account
- **THEN** the app treats this as an empty account and seeds the default cycle, not as a failure

### Requirement: Local State Follows Successful Writes Only
Local state SHALL be updated to reflect a create, update, or delete only after that operation is confirmed to have succeeded.

#### Scenario: Failed workout save
- **WHEN** saving a workout session returns an error
- **THEN** an error is shown, the session is not added to or replaced in local history, and the user remains in the workout view with their entered data intact

#### Scenario: Failed cycle delete
- **WHEN** deleting a cycle returns an error
- **THEN** an error is shown and the cycle remains in the displayed list, matching the database

#### Scenario: Failed workout session delete
- **WHEN** deleting a workout session returns an error
- **THEN** an error is shown and the session remains in the displayed history

#### Scenario: Successful delete removes the record locally
- **WHEN** a delete succeeds
- **THEN** the record is removed from local state and does not reappear on reload

### Requirement: No Silent Failures
Every persistence operation SHALL either succeed or report its failure to the user. No error path may be discarded without being surfaced.

#### Scenario: Error result is inspected
- **WHEN** any read or write to persistent storage returns an error result
- **THEN** that result is inspected and communicated to the user, rather than being ignored

### Requirement: Collision-Free Record Identity
Records SHALL be identified by a value that is unique regardless of creation timing, and SHALL NOT encode any other meaning that the application reads back.

#### Scenario: Two records created in the same instant
- **WHEN** two records are created within the same millisecond
- **THEN** they receive different identifiers and neither overwrites the other

#### Scenario: Record age is not derived from the identifier
- **WHEN** the app needs to know when a record was created
- **THEN** it reads a dedicated creation timestamp, and no behavior depends on parsing the identifier

#### Scenario: Existing records keep their identifiers
- **WHEN** records created under the previous scheme are loaded
- **THEN** they continue to load, display, and save correctly under their existing identifiers
