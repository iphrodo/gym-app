## MODIFIED Requirements

### Requirement: Sign Out
A logged-in user SHALL be able to end their session from the home dashboard, and signing out SHALL discard the locally cached data belonging to that session.

#### Scenario: Log out
- **WHEN** the user clicks "Log out" on the home dashboard
- **THEN** `supabase.auth.signOut()` is called and the app returns to the auth screen

#### Scenario: Cached data is discarded
- **WHEN** the session ends, whether by an explicit log out or by the session being reported as absent
- **THEN** the cycles, workout history, selected cycle, and any in-progress workout held in memory are cleared

#### Scenario: Switching accounts on a shared device
- **WHEN** one user logs out and a different account logs in on the same device
- **THEN** the second user never sees the first user's cycles or workout history, including during the interval before the new account's data has finished loading
