# App Navigation Specification

## Purpose

Make every screen in the app addressable by URL, so that links, bookmarks, refresh, and the browser's back and forward buttons all work, and so that access control and missing records resolve predictably at the route level.

## Requirements

### Requirement: Every Screen Has a URL
Each distinct screen SHALL be reachable at its own URL, and loading that URL directly SHALL render that screen.

#### Scenario: Deep link to a cycle
- **WHEN** a signed-in user opens the URL for a specific cycle directly
- **THEN** that cycle's detail screen renders, without first passing through the home dashboard

#### Scenario: Refresh preserves location
- **WHEN** a user refreshes the browser on any screen
- **THEN** the same screen is re-rendered, not the home dashboard

#### Scenario: Distinct addresses
- **WHEN** the user navigates between the home dashboard, calendar, a cycle, that cycle's statistics, cycle creation, cycle editing, and a workout
- **THEN** each screen has a distinct URL that reflects what is being shown

### Requirement: Browser History Navigation
Browser back and forward SHALL move between visited screens in the order they were visited.

#### Scenario: Back returns to the previous screen
- **WHEN** the user opens a workout from the calendar and presses the browser back button
- **THEN** the calendar is shown again

#### Scenario: Back from a workout opened elsewhere
- **WHEN** the user opens a workout from the home dashboard, the cycle detail view, or the statistics view, and presses back
- **THEN** the screen they came from is shown, without the app tracking an origin value itself

#### Scenario: Forward after going back
- **WHEN** the user presses back and then forward
- **THEN** the screen they left is shown again

### Requirement: Unauthenticated Access Is Redirected
A request for any screen requiring a session SHALL be redirected to the sign-in screen when no valid session is present, before any user data is fetched.

#### Scenario: Signed-out user opens a deep link
- **WHEN** a signed-out visitor opens the URL of a cycle or workout
- **THEN** they are redirected to the sign-in screen and no workout data is fetched or sent to the browser

#### Scenario: Return to the requested screen after signing in
- **WHEN** a visitor is redirected to sign in from a specific URL and then authenticates successfully
- **THEN** they arrive at the screen they originally requested

#### Scenario: Session expiry during use
- **WHEN** a user's session expires and they navigate to another screen
- **THEN** they are redirected to the sign-in screen rather than shown an empty or erroring screen

### Requirement: Unknown and Unauthorised Records Resolve Predictably
A URL naming a record that does not exist, or that belongs to another account, SHALL render a not-found result.

#### Scenario: Nonexistent cycle id
- **WHEN** a signed-in user opens a cycle URL whose id does not exist
- **THEN** a not-found screen is shown with a way back to the home dashboard, rather than a blank screen

#### Scenario: Another account's record
- **WHEN** a signed-in user opens the URL of a cycle or workout owned by a different account
- **THEN** a not-found screen is shown, and the response does not reveal that the record exists

#### Scenario: Malformed identifier
- **WHEN** a URL contains an identifier that cannot refer to a valid record
- **THEN** a not-found screen is shown rather than an unhandled error

### Requirement: Server-Rendered Data
Screens that display stored data SHALL fetch that data on the server and render it as part of the initial response.

#### Scenario: First paint includes content
- **WHEN** a signed-in user loads a screen showing cycles or workout history
- **THEN** the initial response contains that content, without a client-side sequence of session check followed by separate data requests

#### Scenario: Query logic stays on the server
- **WHEN** the browser bundle for any route is inspected
- **THEN** it contains no database query or column-mapping logic

### Requirement: Per-Route Loading and Error States
Each route SHALL present its own loading and error states, scoped to that route rather than replacing the whole app.

#### Scenario: Slow data on one route
- **WHEN** a route's data is still loading
- **THEN** a loading state is shown for that route while the surrounding layout stays visible and interactive

#### Scenario: Data failure on one route
- **WHEN** fetching a route's data fails
- **THEN** an error state with a retry action is shown for that route, rather than a full-screen failure

### Requirement: In-Progress Work Survives Incidental Navigation
An unsaved workout SHALL retain its entered values if the user navigates away and returns during the same session, and SHALL be discarded only when the user explicitly abandons it.

#### Scenario: Navigate away and back
- **WHEN** a user enters values into a workout, navigates to another screen, and returns to that workout
- **THEN** the entered values are still present

#### Scenario: Explicit cancel discards
- **WHEN** the user explicitly cancels an in-progress workout
- **THEN** the entered values are discarded and returning to that workout starts from the template's empty state

#### Scenario: Transient UI does not persist
- **WHEN** the user leaves a screen with a dialog or picker open and later returns to it
- **THEN** that transient element is closed rather than restored
