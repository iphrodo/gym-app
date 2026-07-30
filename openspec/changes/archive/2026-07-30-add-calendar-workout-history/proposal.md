## Why

Right now the only way to see workout history is per-cycle chronological lists (`CycleView`) or the "3 most recent" cards on the home dashboard. There's no way to see, at a glance, which days across a month the user actually trained, or how many sessions happened in a given month — a calendar view makes that pattern visible in a way a list can't.

## What Changes

- Add a new "Calendar" view reachable from the home dashboard, showing a month grid (Mon–Sun) with a marker on every day that has at least one logged workout session, across all cycles.
- Show the month name/year and the count of workouts logged in that month directly above the grid.
- Add previous/next month navigation; default to the current month on open.
- Tapping a marked day opens that day's session(s) for editing (reusing the existing workout edit flow); if more than one session falls on the same date, show a small picker first.
- Mobile-first layout (the app is single-column, `max-w-md`, touch-first already) using the existing zinc/rounded-card visual language — no new color system.

## Capabilities

### New Capabilities
- `workout-calendar`: month-grid view of workout history — which days had a session, per-month workout count, month navigation, and drill-down into a day's session(s).

### Modified Capabilities
- `workout-sessions`: "Edit a Past Workout Session" gains the calendar view as an additional entry point.

## Impact

- New component, e.g. `components/CalendarView.tsx`.
- `app/page.tsx`: add a `'calendar'` view state, a nav entry point from `HomeView`, and pass `history` (all sessions, not cycle-scoped) into the new view.
- No new dependencies, no schema/DB changes — reuses `WorkoutSession.date` already stored per session.
