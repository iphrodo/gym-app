## MODIFIED Requirements

### Requirement: Single Active Cycle
At most one of a user's training cycles SHALL be marked active at a time. Activation state is per-account: marking one cycle active SHALL NOT affect any other account's cycles.

#### Scenario: Creating a new cycle deactivates the user's others
- **WHEN** a brand-new cycle (no existing id) is saved
- **THEN** every *other cycle owned by the same user* is updated to `is_active = false` and the new cycle is active

#### Scenario: Other accounts are unaffected
- **WHEN** a user saves a brand-new cycle while other accounts also have active cycles
- **THEN** those other accounts' cycles keep their existing active state

### Requirement: Default Cycle Seeding
On first login for an account with no cycles, the app SHALL create and persist a default starter cycle owned by that account, so the user has something to work with immediately.

#### Scenario: Empty account
- **WHEN** a logged-in user's owner-scoped `cycles` query returns zero rows
- **THEN** the app inserts the built-in default cycle ("Power Cycle v1", 3 day templates, active), owned by that user, into `cycles` and shows it

#### Scenario: Seeding does not leak across accounts
- **WHEN** a new account signs in for the first time while other accounts already have cycles
- **THEN** the new account is seeded with its own default cycle rather than seeing another account's cycles
