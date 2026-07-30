## 1. Calendar month helper

- [x] 1.1 Add `lib/calendarMonth.ts` with a pure helper that, given a year/month and the full `WorkoutSession[]` history, returns the Mon-Sun-padded grid of dates for that month plus a `Map<string, WorkoutSession[]>` keyed by `YYYY-MM-DD`, built via integer year/month math (no `new Date(dateString)` parsing).
- [x] 1.2 Add `lib/calendarMonth.test.ts` covering: a month with mixed marked/unmarked days, a month with zero sessions, the January/December year-boundary case, and a leap-year February.

## 2. CalendarView component

- [x] 2.1 Create `components/CalendarView.tsx` accepting `history: WorkoutSession[]`, `onEditSession: (session: WorkoutSession) => void`, `onBack: () => void`, defaulting to the current month.
- [x] 2.2 Render the month/year header with the previous/next navigation controls and the computed workout count for the displayed month, styled with the existing zinc/rounded-card visual language and `max-w-md` mobile-first layout.
- [x] 2.3 Render the 7-column day grid (Mon-Sun) using the helper from 1.1, marking days with sessions and visually distinguishing today's date.
- [x] 2.4 Wire day taps: single session on that date calls `onEditSession` directly; multiple sessions show an inline picker (day label + cycle) that calls `onEditSession` on selection; unmarked days are no-ops.
- [x] 2.5 Add a back control that calls `onBack`.



## 3. Wire into app/page.tsx and HomeView

- [x] 3.1 Add `'calendar'` to the `view` union in `app/page.tsx` and render `CalendarView` with the full `history`, `prepareEditWorkout`, and a handler returning to `'home'`.
- [x] 3.2 Add a calendar entry-point button to `HomeView`'s header (near "Log out") and an `onOpenCalendar` prop threaded from `app/page.tsx` to `setView('calendar')`.



## 4. Verification

- [x] 4.1 Run `npm run lint` and the vitest suite (`npm test` or equivalent) to confirm the new helper and existing tests pass.