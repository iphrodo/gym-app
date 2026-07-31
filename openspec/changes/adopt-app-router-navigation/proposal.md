## Why

The entire app is one client component switching on a `view` string. Nothing has a URL. You cannot link to a cycle, bookmark the calendar, or press the browser back button — and a refresh always lands you back on the home dashboard, discarding whatever you were doing. The `previousView` state and [lib/workoutOrigin.ts](lib/workoutOrigin.ts) exist solely to hand-roll a back button, and the git history shows two separate bug fixes for that emulation getting it wrong.

Because every screen is `"use client"`, there is also no server rendering at all: the browser downloads the app, then checks the session, then fetches cycles, then fetches history — four sequential round trips before any content appears.

## What Changes

- Give every screen a real route: home, calendar, cycle detail, new/edit cycle, stats, and workouts.
- Move data reads into server components, using the repositories from `extract-data-layer` with a server-side Supabase client. This collapses the load waterfall and stops shipping query logic to the browser.
- **BREAKING (auth):** move session storage from browser storage to cookies via `@supabase/ssr`, so the session can be read on the server. Existing sessions do not carry over — every user is signed out once on deploy and must log in again.
- Add a `proxy.ts` for session refresh and for redirecting unauthenticated requests. Note this is `proxy`, not `middleware`: the `middleware` filename and named export are deprecated in this Next version, and `proxy` runs only on the Node.js runtime.
- Delete the view-router state, `previousView`, and [lib/workoutOrigin.ts](lib/workoutOrigin.ts). Returning from a workout becomes browser history rather than a remembered origin value.
- Enable Cache Components, so an in-progress workout survives navigating away and back instead of being discarded.
- Add loading and error boundaries per route, replacing the app-wide "Loading data..." and "Checking session..." full-screen states.
- Handle unknown or unauthorised ids with a proper not-found route, rather than the current silent fall-through that renders `null`.

## Capabilities

### New Capabilities

- `app-navigation`: Every screen is addressable by URL, deep links and refresh work, browser back and forward behave correctly, and unauthenticated or unknown routes resolve predictably.

### Modified Capabilities

- `workout-sessions`: cancelling or saving a workout returns via browser history rather than a remembered `previousView`; the four origin-specific scenarios collapse into one history-based rule, and an in-progress workout now survives incidental navigation.
- `authentication`: the session gate moves from a client-side render branch to a server-side redirect, and sessions are cookie-backed.

## Impact

- **Dependencies:** adds `@supabase/ssr`. Required to read the session on the server; the current client stores sessions in browser storage, which a server component cannot see.
- **New files:** route segments under `app/`, a `proxy.ts` at the project root, per-route `loading.tsx` and `error.tsx`, and a `not-found.tsx`.
- **Changed files:** [app/page.tsx](app/page.tsx) shrinks to a home route; every component in [components/](components/) loses its navigation callback props in favour of links; [lib/supabaseClient.ts](lib/supabaseClient.ts) splits into browser and server clients; [next.config.ts](next.config.ts) enables Cache Components.
- **Deleted:** [lib/workoutOrigin.ts](lib/workoutOrigin.ts) and [lib/workoutOrigin.test.ts](lib/workoutOrigin.test.ts) — the concept they implement no longer exists.
- **Sequencing:** requires `extract-data-layer` first, since server components cannot call persistence code that is welded to a browser client. Assumes `add-component-test-harness` is in place, because every component's prop interface changes.
- **Deliberately out of scope:** Server Actions for mutations. Writes continue to go through the client-side repositories; moving them is a separate decision recorded in design.md.
