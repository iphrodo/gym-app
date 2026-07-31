## MODIFIED Requirements

### Requirement: Email/Password Sign In
A returning user SHALL be able to sign in with email and password.

#### Scenario: Successful login
- **WHEN** a user submits a registered email and correct password on the login form
- **THEN** `supabase.auth.signInWithPassword` succeeds and the app transitions to the home dashboard

#### Scenario: Failed login
- **WHEN** a user submits an email/password pair that Supabase rejects
- **THEN** the error message returned by Supabase is shown within the form, the user stays on the auth screen, and their entered email is preserved

### Requirement: Email/Password Sign Up
A new user SHALL be able to create an account with email and password.

#### Scenario: Successful registration
- **WHEN** a user toggles to "Create account", enters an email and a password of at least 6 characters, and submits
- **THEN** `supabase.auth.signUp` is called, an in-app success message is shown, and the user is signed in

#### Scenario: Failed registration
- **WHEN** `supabase.auth.signUp` returns an error (e.g. email already registered)
- **THEN** the error message is shown within the form and the user stays on the sign-up form with their entered email preserved

#### Scenario: Toggle between modes
- **WHEN** the user clicks the "Sign up"/"Log in" link at the bottom of the auth form
- **THEN** the form switches between login mode and registration mode without losing the entered email
