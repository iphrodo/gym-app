## 1. Shared data provider

- [x] 1.1 Create `lib/data/GymDataProvider.tsx` (`"use client"`): context holding `cycles: TrainingCycle[]` and `history: WorkoutSession[]` state, seeded from `initialCycles`/`initialHistory` props.
- [x] 1.2 Add `saveCycle`, `deleteCycle`, `deactivateOtherCycles` methods wrapping `lib/data/cycles.ts` functions, updating state only on success (per `data-persistence` spec's existing rule).
- [x] 1.3 Add `saveWorkoutSession`, `deleteWorkoutSession` methods wrapping `lib/data/workoutSessions.ts` functions, same success-only state update.
- [x] 1.4 Export a `useGymData()` hook that throws a clear error if used outside the provider.

## 2. Route group and single fetch point

- [x] 2.1 Create `app/(app)/layout.tsx`: call `requireUser()`, then `listCycles`/`listWorkoutSessions` in parallel, throwing on failure exactly as `app/page.tsx` does today.
- [x] 2.2 Move the default-cycle-seeding logic (currently in `app/page.tsx`) into this layout, so it runs once per session before any screen renders.
- [x] 2.3 Wrap `children` in `GymDataProvider` with the fetched data.
- [x] 2.4 `git mv` `app/page.tsx`, `app/HomeClient.tsx`, `app/cycles/`, `app/workouts/`, `app/calendar/` into `app/(app)/...`, preserving relative structure; leave `app/login/page.tsx`, `app/layout.tsx`, `app/not-found.tsx`, `app/error.tsx`, `app/loading.tsx` in place.
- [x] 2.5 Fix relative import paths in every moved file (one extra directory level from the new group).

## 3. Simplify route pages and client components

- [x] 3.1 `app/(app)/page.tsx`: drop all data fetching; render `HomeClient` with no data props. `HomeClient` reads `useGymData()` and calls `deleteCycle` for its delete handler.
- [x] 3.2 `app/(app)/cycles/[cycleId]/page.tsx`: only `await params` and pass `cycleId` to `CycleDetailClient`. `CycleDetailClient` reads `cycles`/`history` from `useGymData()`, does the `find()` + `notFound()` check, and calls `deleteWorkoutSession` for its delete handler.
- [x] 3.3 `app/(app)/cycles/[cycleId]/edit/page.tsx`: only pass `cycleId`. `EditCycleClient` looks up the cycle via `useGymData()`, calls `notFound()` if absent, calls `saveCycle` on submit, and drops its `router.refresh()` call.
- [x] 3.4 `app/(app)/cycles/[cycleId]/stats/page.tsx`: only pass `cycleId`; wrap `StatsView` in a new thin client component that resolves the cycle + its history from `useGymData()` and calls `notFound()` if the cycle is absent.
- [x] 3.5 `app/(app)/cycles/[cycleId]/workouts/new/page.tsx`: only pass `cycleId` and the `day` search param; move the cycle/template lookup and new-`WorkoutSession` construction into a thin client wrapper around `WorkoutSessionClient`, calling `notFound()` if the cycle or day template is absent.
- [x] 3.6 `app/(app)/cycles/new/page.tsx`: keep as-is (only `requireUser()` call moves to the layout, so this becomes just a passthrough to `NewCycleClient`). `NewCycleClient` calls `saveCycle` + `deactivateOtherCycles` from `useGymData()` and drops its `router.refresh()` call.
- [x] 3.7 `app/(app)/workouts/[sessionId]/page.tsx`: only pass `sessionId`. `WorkoutSessionClient` resolves the session via `useGymData()`, calls `notFound()` if absent, and calls `saveWorkoutSession` on save.
- [x] 3.8 `app/(app)/calendar/page.tsx`: drop fetching; wrap `CalendarView` in a thin client component (or make it read context directly) that pulls `history` from `useGymData()`.

## 4. Tests and verification

- [x] 4.1 Update any test that renders a `*Client.tsx` component with `initial*` props directly (e.g. equivalents of `HomeView.test.tsx`, `CycleView.test.tsx`) to instead wrap the component under test in `GymDataProvider`.
- [x] 4.2 Run `npm run build` to confirm the route group move, import path fixes, and type-checking all succeed.
- [x] 4.3 Run `npm test` and fix any failures from the provider/prop changes.
- [x] 4.4 Manually verify (dev server): sign in, confirm one initial load, then navigate home → cycle detail → edit → save → back to home, and to calendar/stats, confirming no reload/spinner between routes and that a delete/edit is reflected immediately on every other screen.
- [x] 4.5 Manually verify an unknown cycle id and an unknown workout session id both still render their route's not-found boundary.
