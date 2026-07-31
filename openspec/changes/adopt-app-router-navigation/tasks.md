## 1. Verify conventions before writing code

- [ ] 1.1 Re-read `node_modules/next/dist/docs/01-app/` for `proxy`, async request APIs, and Cache Components — do not follow external Supabase/Next auth guides, which specify the deprecated `middleware`
- [ ] 1.2 Confirm the `proxy` convention, its Node-only runtime, and the renamed config flags
- [ ] 1.3 Confirm `params` and `searchParams` are promises and must be awaited

## 2. Cookie-backed sessions

- [ ] 2.1 Add `@supabase/ssr`
- [ ] 2.2 Split [lib/supabaseClient.ts](lib/supabaseClient.ts) into a browser client and a server client sharing cookie storage
- [ ] 2.3 Add `proxy.ts` at the project root exporting a function named `proxy`, handling session refresh and the unauthenticated redirect
- [ ] 2.4 Preserve the originally requested URL through the sign-in redirect and return there afterwards
- [ ] 2.5 Update sign-out to clear session cookies
- [ ] 2.6 Checkpoint: the existing SPA still works end to end on cookie-backed sessions, before any routes exist
- [ ] 2.7 Note the forced sign-out in the release notes

## 3. Cache Components

- [ ] 3.1 Enable `cacheComponents` in [next.config.ts](next.config.ts)
- [ ] 3.2 Confirm the existing app still behaves with it enabled
- [ ] 3.3 Reset transient UI (the calendar's session picker, delete confirmations) in `useLayoutEffect` cleanup so it does not reappear on return
- [ ] 3.4 Confirm preserved route state is cleared on sign-out, so a preserved screen cannot show a previous account's data

## 4. Routes without dynamic params

- [ ] 4.1 Reduce [app/page.tsx](app/page.tsx) to the home route, fetching cycles and recent history on the server
- [ ] 4.2 Add `/calendar`
- [ ] 4.3 Add `/cycles/new`
- [ ] 4.4 Convert `onOpenCalendar` and `onNewCycle` to links

## 5. Cycle routes

- [ ] 5.1 Add `/cycles/[cycleId]` fetching the cycle and its history on the server, awaiting `params`
- [ ] 5.2 Add `/cycles/[cycleId]/edit`
- [ ] 5.3 Add `/cycles/[cycleId]/stats`
- [ ] 5.4 Convert `onSelectCycle`, `onEditCycle`, `onViewStats`, and `onBack` to links
- [ ] 5.5 Return not-found for an unknown cycle id, an id owned by another account, and a malformed id

## 6. Workout routes

- [ ] 6.1 Add `/cycles/[cycleId]/workouts/new` reading the day template from `searchParams`
- [ ] 6.2 Add `/workouts/[sessionId]` for editing a saved session
- [ ] 6.3 Convert `onStartWorkout` and `onEditSession` to links across all four entry points
- [ ] 6.4 Change save and cancel to return through browser history rather than a stored origin
- [ ] 6.5 Return not-found for an unknown or unauthorised session id

## 7. Delete the emulated router

- [ ] 7.1 Remove the `view` and `previousView` state from `app/page.tsx`
- [ ] 7.2 Delete [lib/workoutOrigin.ts](lib/workoutOrigin.ts) and [lib/workoutOrigin.test.ts](lib/workoutOrigin.test.ts)
- [ ] 7.3 Confirm no component still receives a navigation callback that a link should handle
- [ ] 7.4 Confirm the remaining callback props are genuine mutations only

## 8. Boundaries

- [ ] 8.1 Add `loading.tsx` per route segment, replacing the app-wide "Loading data..." state
- [ ] 8.2 Add `error.tsx` per route segment with a retry action
- [ ] 8.3 Add `not-found.tsx` with a way back to the home dashboard
- [ ] 8.4 Remove the app-wide "Checking session..." state, now handled by the server-side redirect

## 9. Verification

- [ ] 9.1 Update component tests for the new prop interfaces — links replacing navigation callbacks
- [ ] 9.2 Run `npm test`, `npx tsc --noEmit`, and `npm run lint` clean
- [ ] 9.3 Verify deep links, refresh, back, and forward on every route
- [ ] 9.4 Verify a signed-out visitor opening a deep link is redirected, signs in, and lands on the originally requested screen
- [ ] 9.5 Verify a second account gets not-found — not a permission error — for the first account's cycle and workout URLs
- [ ] 9.6 Verify an in-progress workout survives navigating away and back, and is discarded on explicit cancel
- [ ] 9.7 Verify signing out and back in as another account shows no preserved data from the first
- [ ] 9.8 Confirm the browser bundle contains no query or column-mapping logic
- [ ] 9.9 Confirm first paint includes rendered content rather than a client-side loading sequence
