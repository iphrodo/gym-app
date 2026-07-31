## Purpose

Guarantee that every persisted record belongs to exactly one account, that a user can only ever read or modify their own data, and that this isolation is enforced by the database as reviewable, version-controlled policy rather than by client-side convention.

## ADDED Requirements

### Requirement: Record Ownership
Every persisted training cycle and workout session SHALL carry the id of the account that owns it, and that owner SHALL be immutable for the lifetime of the record.

#### Scenario: New cycle records its owner
- **WHEN** a user creates a training cycle
- **THEN** the stored cycle carries the authenticated user's id as its owner

#### Scenario: New workout session records its owner
- **WHEN** a user saves a workout session
- **THEN** the stored session carries the authenticated user's id as its owner

#### Scenario: Owner cannot be reassigned
- **WHEN** an update is attempted that would change an existing record's owner
- **THEN** the update is rejected and the record's owner is unchanged

### Requirement: Owner-Scoped Reads
Every query for cycles or workout sessions SHALL be constrained to the authenticated user's records, independently of any database-level protection.

#### Scenario: Loading data with other accounts present
- **WHEN** a signed-in user's cycles and workout history are fetched while other accounts' rows exist in the same tables
- **THEN** only rows owned by the signed-in user are returned and rendered

#### Scenario: Client scoping survives a permissive database
- **WHEN** the database would permit a broader result set than the signed-in user's own rows
- **THEN** the application's own query constraint still limits results to that user's rows

### Requirement: Owner-Scoped Writes
Every insert, update, and delete SHALL identify its target rows by owner in addition to any other filter, so that no statement can affect a row belonging to another account.

#### Scenario: Deleting a cycle
- **WHEN** a user deletes a training cycle
- **THEN** the delete matches on both the cycle id and the signed-in user's ownership, and no other account's cycle is removed

#### Scenario: Deleting a workout session
- **WHEN** a user deletes a workout session
- **THEN** the delete matches on both the session id and the signed-in user's ownership

#### Scenario: Bulk update stays within the account
- **WHEN** an operation updates multiple rows at once (such as deactivating a user's other cycles)
- **THEN** the statement is constrained by owner and cannot modify rows belonging to another account

#### Scenario: Attempting to write to another account's record
- **WHEN** a write targets a record id that exists but is owned by a different account
- **THEN** no rows are modified and the operation reports that it affected nothing

### Requirement: Database-Enforced Isolation
Row-level security policies SHALL restrict every table holding user data to its owner, and those policies SHALL live in the repository as version-controlled migrations.

#### Scenario: Policies are reviewable in the repository
- **WHEN** a reviewer inspects the repository
- **THEN** the schema and the row-level security policies for `cycles` and `workout_sessions` are present as migration files, without needing access to the hosted project

#### Scenario: Reproducing isolation in a fresh environment
- **WHEN** the committed migrations are applied to an empty database
- **THEN** the resulting database has both tables with ownership columns and row-level security enabled with owner-restricted read, insert, update, and delete policies

#### Scenario: Direct access bypassing the app
- **WHEN** a request presents one account's credentials and asks for a record owned by another account
- **THEN** the database returns no row, regardless of what the application requested

### Requirement: Fail Closed Without an Authenticated User
When the authenticated user's id is unavailable, the app SHALL NOT fall back to an unscoped read or write.

#### Scenario: Missing user id on read
- **WHEN** a data fetch is attempted while no authenticated user id is available
- **THEN** no unscoped query is issued and the app does not display stale or unowned data

#### Scenario: Missing user id on write
- **WHEN** a save or delete is attempted while no authenticated user id is available
- **THEN** the operation is refused, the user is told the action could not be completed, and nothing is written

### Requirement: Ownership Backfill for Existing Data
Existing rows created before ownership was tracked SHALL be assigned an owner before ownership becomes mandatory, so that no record is left permanently unreachable.

#### Scenario: Migration assigns owners to legacy rows
- **WHEN** the ownership migration runs against a database containing rows with no owner
- **THEN** those rows are assigned an owner and the ownership column is then constrained to reject null values

#### Scenario: No orphaned records remain
- **WHEN** the ownership migration completes
- **THEN** every row in `cycles` and `workout_sessions` has a non-null owner
