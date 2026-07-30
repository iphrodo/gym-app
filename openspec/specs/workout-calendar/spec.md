# Workout Calendar Specification

## Purpose

Give a user a month-by-month calendar view of every day they logged a workout, across all training cycles, with a per-month workout count and quick access back into any logged day.

## Requirements

### Requirement: Open Calendar from Home Dashboard
The home dashboard SHALL provide an entry point that opens the calendar view.

#### Scenario: Open calendar
- **WHEN** the user taps the calendar entry point on the home dashboard
- **THEN** the calendar view opens showing the current month

### Requirement: Month Grid of Workout Days
The calendar view SHALL render the displayed month as a day grid and mark every day that has at least one logged workout session, aggregated across all training cycles.

#### Scenario: Day with a workout
- **WHEN** the displayed month contains a date with one or more sessions in history
- **THEN** that day's cell is visually marked as a workout day

#### Scenario: Day without a workout
- **WHEN** the displayed month contains a date with no sessions in history
- **THEN** that day's cell is rendered unmarked

#### Scenario: Today's date
- **WHEN** the displayed month includes the current calendar date
- **THEN** that day's cell is visually distinguished as "today", independent of whether it is also marked as a workout day

### Requirement: Per-Month Workout Count
The calendar view SHALL show, next to the displayed month's name, the total number of workout sessions logged in that month across all cycles.

#### Scenario: Month with sessions
- **WHEN** the displayed month has one or more logged sessions
- **THEN** the header shows the month name, year, and the count of sessions that fall within that month

#### Scenario: Month with no sessions
- **WHEN** the displayed month has zero logged sessions
- **THEN** the header shows the month name and year with a count of 0

### Requirement: Month Navigation
The user SHALL be able to move the calendar view to the previous or next month.

#### Scenario: Navigate to previous month
- **WHEN** the user taps the "previous month" control
- **THEN** the grid, header count, and marked days update to reflect the prior month

#### Scenario: Navigate to next month
- **WHEN** the user taps the "next month" control
- **THEN** the grid, header count, and marked days update to reflect the following month

#### Scenario: Default month on open
- **WHEN** the calendar view is opened
- **THEN** it defaults to the month containing today's date

### Requirement: Drill Into a Workout Day
Tapping a marked day SHALL let the user reopen the workout session(s) logged on that date for editing.

#### Scenario: Single session on the tapped day
- **WHEN** the user taps a marked day that has exactly one logged session
- **THEN** the workout view opens pre-filled with that session's data, matching the existing edit-session behavior

#### Scenario: Multiple sessions on the tapped day
- **WHEN** the user taps a marked day that has more than one logged session
- **THEN** a picker lists each session on that day (e.g. by day label) so the user can choose which one to open for editing

#### Scenario: Unmarked day tapped
- **WHEN** the user taps a day with no logged session
- **THEN** nothing opens

### Requirement: Return to Home Dashboard
The user SHALL be able to leave the calendar view and return to the home dashboard.

#### Scenario: Back navigation
- **WHEN** the user taps the calendar view's back control
- **THEN** the view returns to the home dashboard
