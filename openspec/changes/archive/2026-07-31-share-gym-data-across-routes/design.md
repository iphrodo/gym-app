## Context

Every route under `app/` (`app/page.tsx`, `app/cycles/[cycleId]/page.tsx`, `.../edit/page.tsx`, `.../stats/page.tsx`, `.../workouts/new/page.tsx`, `app/workouts/[sessionId]/page.tsx`, `app/calendar/page.tsx`) is an `async` Server Component that independently calls `requireUser()` (`lib/requireUser.ts`) and `listCycles`/`listWorkoutSessions` (`lib/data/cycles.ts`, `lib/data/workoutSessions.ts`) on every navigation, then hands the result as props to a route-local `"use client"` component (`HomeClient`, `CycleDetailClient`, `EditCycleClient`, `NewCycleClient`, `WorkoutSessionClient`) which copies it into its own `useState`. See proposal.md - Why.

`app/login/page.tsx` must stay outside the authenticated data-loading path (it renders for signed-out visitors). Next's `(name)` route groups change directory nesting without changing the URL, which lets us introduce one shared loading point without touching any route's path.

## Goals / Non-Goals

**Goals:**
- Load cycles + workout history once per session, at one place, before any authenticated screen renders.
- Make that data and its mutation operations available to every authenticated route through one shared client-side store.
- Preserve every existing URL, `loading.tsx`/`error.tsx`/`not-found` boundary, and the server-side auth redirect from `authentication` spec.

**Non-Goals:**
- No change to the Supabase schema, RLS policies, or the `lib/data/*` query/mutation functions themselves.
- No introduction of a caching/query library (React Query, SWR) — the existing `useState`-based pattern is kept, just lifted to one shared location instead of duplicated per route.
- No change to any domain requirement (cycle CRUD rules, workout session rules, stats aggregation) — only where the data lives and how many times it's fetched.

## Decisions

### 1. One route group, one fetch, one provider
Move `app/page.tsx`, `app/HomeClient.tsx`, `app/cycles/**`, `app/workouts/**`, `app/calendar/**` under a new `app/(app)/` route group. Add `app/(app)/layout.tsx` as the single `async` Server Component that calls `requireUser()` + `listCycles` + `listWorkoutSessions` (including the default-cycle-seeding logic currently in `app/page.tsx`) and wraps `children` in a new client provider, `lib/data/GymDataProvider.tsx`, seeded with the fetch result.

Alternative considered: keep per-route fetching but add Next's Data Cache (`unstable_cache`/`fetch` cache + `revalidateTag`) so repeated fetches are served from cache. Rejected because mutations here go straight from client components to Supabase (not through Server Actions), so there is no server-side mutation point to call `revalidateTag` from — the client would still need its own state update, making a second, parallel caching layer redundant complexity for no benefit over just sharing client state directly.

### 2. Client context owns the data and the mutations
`GymDataProvider` holds `cycles`/`history` in `useState` and exposes `saveCycle`, `deleteCycle`, `deactivateOtherCycles`, `saveWorkoutSession`, `deleteWorkoutSession` — each calling the existing `lib/data/*` function and then updating shared state on success (mirroring the success/failure handling already required by the `data-persistence` spec). `useGymData()` is the consumption hook.

This replaces the near-identical `handleDeleteCycle`/`handleSaveCycle`/`handleSave`/etc. logic duplicated today in `HomeClient`, `CycleDetailClient`, `EditCycleClient`, `NewCycleClient`, `WorkoutSessionClient` with one implementation, which is also what makes cross-screen visibility (this change's core requirement) automatic rather than something each screen has to separately get right.

### 3. `notFound()` moves into the client component
Route `page.tsx` files become thin: resolve params (and `searchParams` where used), pass ids down, no longer fetch or validate against Supabase. The id-not-found check (`cycles.find(...)`, `history.find(...)`) moves into the corresponding client component, which calls `notFound()` from `next/navigation` when the id isn't present in shared state. `notFound()` throws a special error that the nearest `not-found`/`error` boundary catches during render regardless of whether the throw happens in a server or client component, so the existing per-route `not-found` boundaries keep working unchanged.

### 4. Drop `router.refresh()` after mutations
`EditCycleClient` and `NewCycleClient` currently call `router.refresh()` after a save, which forces the destination route's Server Component to re-fetch — exactly the round-trip this change removes. Once the shared provider's state already reflects the save, `refresh()` is no longer needed and is removed.

## Risks / Trade-offs

- **[Risk]** Route group restructuring (`git mv` of several directories) touches every route's file path and could break relative imports. → Mitigation: import paths are updated alongside the move in the same commit/step; `npm run build` type-checks all of them before this is considered done.
- **[Risk]** Moving `notFound()` from server to client changes *when* the check happens (after first client render instead of before any HTML is sent), which could flash content before the not-found boundary takes over. → Mitigation: the check runs during the client component's initial render (not in an effect), so it throws before that component's own output is committed, matching the synchronous-check pattern `notFound()` is designed for.
- **[Risk]** Centralizing mutations in one provider means a mistake there affects every screen at once, instead of being isolated to one route. → Mitigation: the provider is a thin pass-through to the already-tested `lib/data/cycles.ts`/`lib/data/workoutSessions.ts` functions plus the same state-update-on-success pattern each screen already implements today; behavior per mutation is unchanged, only its location.

## Migration Plan

This is an in-place refactor of existing authenticated routes with no data migration. Land it as a single change (route group move + provider + route simplification together, since the routes only compile against the provider once it exists). Rollback is a plain revert — no schema or persisted-data changes are involved.
