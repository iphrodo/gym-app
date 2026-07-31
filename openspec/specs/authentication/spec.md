# Authentication Specification

## Purpose
Gate access to the app behind a Supabase-backed account, so workout data is private to each logged-in user.

## Requirements

### Requirement: Session Gate
The app SHALL determine on the server whether a request has a valid session, redirecting unauthenticated requests to the authentication screen before any user data is fetched, and rendering data screens only for authenticated requests.

#### Scenario: No session on load
- **WHEN** a visitor without a valid session requests any data screen
- **THEN** the server redirects them to the authentication screen, and no workout data is fetched or included in the response

#### Scenario: Session established
- **WHEN** a visitor signs in successfully
- **THEN** they are taken to the screen they originally requested, or the home dashboard if they requested none, with its data rendered on the server

#### Scenario: Session stored in cookies
- **WHEN** a session is created
- **THEN** it is stored such that both the server and the browser can read it, so a server-rendered screen and a client interaction agree on who is signed in

#### Scenario: Session refresh
- **WHEN** a request arrives with a session that is valid but near expiry
- **THEN** the session is refreshed as part of handling that request, without interrupting the user

### Requirement: Email/Password Sign In
A returning user SHALL be able to sign in with email and password.

#### Scenario: Successful login
- **WHEN** a user submits a registered email and correct password on the login form
- **THEN** `supabase.auth.signInWithPassword` succeeds and the app transitions to the home dashboard

#### Scenario: Failed login
- **WHEN** a user submits an email/password pair that Supabase rejects
- **THEN** an alert shows the error message returned by Supabase and the user stays on the auth screen

### Requirement: Email/Password Sign Up
A new user SHALL be able to create an account with email and password.

#### Scenario: Successful registration
- **WHEN** a user toggles to "Create account", enters an email and a password of at least 6 characters, and submits
- **THEN** `supabase.auth.signUp` is called, a success alert is shown, and the user is signed in

#### Scenario: Failed registration
- **WHEN** `supabase.auth.signUp` returns an error (e.g. email already registered)
- **THEN** an alert shows the error message and the user stays on the sign-up form

#### Scenario: Toggle between modes
- **WHEN** the user clicks the "Sign up"/"Log in" link at the bottom of the auth form
- **THEN** the form switches between login mode and registration mode without losing the entered email

### Requirement: Sign Out
A logged-in user SHALL be able to end their session from the home dashboard, and signing out SHALL discard the locally cached data belonging to that session.

#### Scenario: Log out
- **WHEN** the user clicks "Log out" on the home dashboard
- **THEN** the session is ended, its cookies are cleared, and the user is returned to the authentication screen

#### Scenario: Cached data is discarded
- **WHEN** the session ends, whether by an explicit log out or by the session being reported as absent
- **THEN** cached cycles, workout history, and any in-progress workout are cleared, including any state preserved across route navigation

#### Scenario: Switching accounts on a shared device
- **WHEN** one user logs out and a different account logs in on the same device
- **THEN** the second user never sees the first user's cycles or workout history, including on screens the first user had visited

#### Scenario: Signed-out user presses back
- **WHEN** a user signs out and then presses the browser back button to a screen they had visited
- **THEN** they are redirected to the authentication screen rather than shown the previous account's rendered data
