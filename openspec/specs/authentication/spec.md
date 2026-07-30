# Authentication Specification

## Purpose
Gate access to the app behind a Supabase-backed account, so workout data is private to each logged-in user.

## Requirements

### Requirement: Session Gate
The app SHALL show the authentication screen for any visitor without an active Supabase session, and SHALL show the app's data views only once a session exists.

#### Scenario: No session on load
- **WHEN** the app loads and `supabase.auth.getSession()` resolves with no session
- **THEN** the auth screen is shown instead of any workout data

#### Scenario: Session established
- **WHEN** `supabase.auth.onAuthStateChange` reports a session (sign-in or restored session)
- **THEN** the app fetches cycles and workout history and shows the home dashboard

#### Scenario: Checking session
- **WHEN** the initial `getSession()` call has not yet resolved
- **THEN** a loading indicator is shown instead of the auth screen or app data

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
A logged-in user SHALL be able to end their session from the home dashboard.

#### Scenario: Log out
- **WHEN** the user clicks "Log out" on the home dashboard
- **THEN** `supabase.auth.signOut()` is called and the app returns to the auth screen
