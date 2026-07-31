## Why

Since `adopt-app-router-navigation`, every route is its own Server Component that independently calls `requireUser()` and re-fetches cycles and workout history from Supabase on every navigation, and every route's client component keeps its own local copy of that data in `useState`. This makes navigation between screens noticeably slow (repeated auth + data round-trips on every click) and makes mutations invisible on other screens until a full reload — e.g. deleting a workout session from the cycle detail view does not remove it from the home dashboard or calendar until the user reloads. Both regressions were introduced by that migration and are user-visible today.

## What Changes

- Fetch the signed-in user's cycles and workout history from Supabase once per session, in a single route-group layout, instead of once per route.
- Share that data across all authenticated routes via client-side state (a single context), so navigating between screens is an in-memory transition with no repeated Supabase round-trips.
- Centralize the create/update/delete handlers for cycles and workout sessions in one place so a mutation made from any screen is reflected on every other screen immediately, without a manual refresh.
- Route-level `notFound()` checks for a missing cycle or workout session id move from the server page into the client component that reads the shared data (behavior at the URL is unchanged: an unknown id still renders the existing not-found boundary).
- No user-visible change to URLs, deep-linking, refresh behavior, or the authentication redirect — those are covered by the existing `app-navigation` and `authentication` specs and are not being modified.

## Capabilities

### New Capabilities
- `session-data-sharing`: the signed-in user's cycles and workout history are loaded once per session and kept consistent across every screen, so navigation is instant and a create/update/delete made on one screen is immediately reflected on every other screen without a reload.

### Modified Capabilities
(none — existing capabilities' requirements are unchanged; this change is about *how* data reaches each screen, not what any screen does or shows)

## Impact

- Affected code: `app/page.tsx`, `app/HomeClient.tsx`, `app/cycles/**`, `app/workouts/**`, `app/calendar/**` (moved under a new `app/(app)/` route group and simplified to stop fetching their own data), plus a new `app/(app)/layout.tsx` and a new shared client data provider under `lib/data/`.
- Not affected: `lib/data/cycles.ts`, `lib/data/workoutSessions.ts` (still the only code that talks to Supabase), `lib/requireUser.ts`, presentational `components/*View.tsx` (unchanged props contracts), `app/login/page.tsx`, and all route-level `loading.tsx`/`error.tsx`/`not-found` files.
- No database schema or dependency changes.
