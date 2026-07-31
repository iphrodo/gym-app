# Session Data Sharing Specification

## Purpose

Keep a signed-in user's cycles and workout history loaded once per session and consistent across every screen, so moving between screens is instant and a change made on one screen is visible everywhere else without a manual reload.

## Requirements

### Requirement: Single Load Per Session
The signed-in user's cycles and workout history SHALL be loaded from persistent storage once per session, not re-fetched on each navigation between already-loaded screens.

#### Scenario: Navigating after initial load
- **WHEN** a signed-in user's cycles and workout history have already been loaded and they navigate to another screen within the app (home, a cycle's detail, its edit form, its stats, the calendar, or a workout session)
- **THEN** that screen renders from the already-loaded data without issuing a new request for the user's cycles or workout history

#### Scenario: New session after sign-in
- **WHEN** a user signs in and the app has no previously loaded data for them
- **THEN** the app loads their cycles and workout history exactly once before any screen depending on that data renders

### Requirement: Mutations Are Visible Everywhere Immediately
When a cycle or workout session is created, updated, or deleted from any screen, every other currently-rendered screen that displays that data SHALL reflect the change immediately, without the user reloading or re-navigating.

#### Scenario: Deleting a session updates the dashboard and calendar
- **WHEN** the user deletes a workout session from a cycle's detail view
- **THEN** that session no longer appears in the home dashboard's counts or the calendar's marked days on the very next render, without a page reload

#### Scenario: Deleting a cycle updates the home dashboard
- **WHEN** the user deletes a cycle
- **THEN** the home dashboard's cycle list no longer includes it, and its workout history is no longer counted anywhere in the app, without a page reload

#### Scenario: Saving a cycle updates every screen showing it
- **WHEN** the user creates or edits a cycle and saves
- **THEN** the home dashboard, that cycle's detail view, and its stats view all reflect the saved name, day templates, and active status without a page reload

#### Scenario: Saving a workout session updates history everywhere
- **WHEN** the user saves a new or edited workout session
- **THEN** the cycle detail view's history, the calendar, and the stats view all reflect the saved session without a page reload

### Requirement: Unknown Record Still Resolves to Not Found
Navigating to a screen for a cycle or workout session id that does not exist in the loaded data SHALL still resolve to the app's not-found experience, matching current behavior at that URL.

#### Scenario: Unknown cycle id
- **WHEN** a signed-in user opens a URL for a cycle id that is not present in their loaded cycles
- **THEN** the not-found experience for that route renders, the same as before this change

#### Scenario: Unknown workout session id
- **WHEN** a signed-in user opens a URL for a workout session id that is not present in their loaded history
- **THEN** the not-found experience for that route renders, the same as before this change
