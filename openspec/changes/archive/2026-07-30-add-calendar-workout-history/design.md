## Context

See proposal.md - Why/What Changes. Relevant existing shape:
- `app/page.tsx` holds all `WorkoutSession[]` history (unfiltered by cycle) and is the only place that knows every cycle's sessions plus the view-router state (`view: 'home' | 'cycle' | ... `).
- `WorkoutSession.date` is a plain `YYYY-MM-DD` string (no time, no timezone) written by `new Date().toISOString().split('T')[0]` in `prepareNewWorkout` - comparisons should stay string/date-part based to avoid timezone shifts from parsing into a `Date` and back.
- Edit entry points elsewhere (`HomeView`, `CycleView`, `StatsView`) all call the same `onEditSession(session)` → `prepareEditWorkout` → `setView('workout')` path in `app/page.tsx`. The calendar view should plug into that same path rather than inventing a new one.

## Goals / Non-Goals

**Goals:**
- Reuse the existing view-router pattern (`app/page.tsx` state machine) rather than introducing routing.
- Keep all date grouping/matching on the `YYYY-MM-DD` string form, no `Date` round-tripping across timezones.
- Match existing visual language (zinc palette, rounded cards, `max-w-md` mobile-first) with no new design tokens.

**Non-Goals:**
- No per-cycle filter on the calendar (confirmed: all cycles combined).
- No new DB schema, indices, or queries - the calendar is a client-side view over the `history` already loaded into `app/page.tsx`.
- No multi-month/year overview screen - single month at a time.

## Decisions

- **New view value `'calendar'`** added to the existing union in `app/page.tsx`, alongside a `selectedCalendarDate` piece of state only if the multi-session picker needs it (see below). Consistent with how `'stats'`/`'new_cycle'` were added previously - no new state-management library.
- **`CalendarView` receives the full `history` array** (not cycle-scoped), plus `onEditSession` and `onBack`, mirroring the props shape of `HomeView`/`StatsView`.
- **Month grouping done in the component with a small pure helper** (e.g. `groupSessionsByDate(history)` returning `Map<string /* YYYY-MM-DD */, WorkoutSession[]>`), analogous to the existing `lib/sortWorkoutHistory.ts` extraction pattern - keep it in `lib/` so it stays testable with the vitest setup already added on `main`.
- **Grid built by calendar-month math, not a date library**: compute first-of-month weekday and days-in-month with plain `Date` UTC-safe integer math (year/month numbers only, never parsing the stored date strings through `new Date(string)`), padding leading/trailing cells to fill full weeks. No new dependency (`date-fns`, etc.) for a single month grid.
- **Week starts Monday**, matching the proposal's "Mon–Sun" framing and typical non-US calendar conventions; this is a one-line constant if it needs to change later.
- **Same-day multiple sessions**: local component state `pendingDateKey: string | null` drives an inline small picker (list of sessions for that date, day label + cycle) rendered as a lightweight sheet/list rather than a new view-router state, since it's a transient in-view choice, not a navigable screen.
- **Entry point**: a calendar icon/button added to `HomeView`'s header (next to "Log out"), calling a new `onOpenCalendar` prop wired to `setView('calendar')` in `app/page.tsx` - avoids restructuring `HomeView`'s existing header layout.

## Risks / Trade-offs

- [Manual calendar-grid math is easy to get subtly wrong around month/year boundaries] → Cover it with a small set of unit tests in `lib/` (e.g. Jan/Dec boundary, leap-year February) using the existing vitest setup.
- [Grouping by raw date string assumes `WorkoutSession.date` is always well-formed `YYYY-MM-DD`] → Already guaranteed by the single write path (`prepareNewWorkout`/date input in `WorkoutView`); no new validation needed since this matches existing app-wide assumptions (e.g. `sortWorkoutHistory.ts`).
- [Many sessions in one month could make the per-day markers cramped on small screens] → A single dot/badge per day (not per-session detail) keeps cells simple; the picker only appears on tap, not inline.
