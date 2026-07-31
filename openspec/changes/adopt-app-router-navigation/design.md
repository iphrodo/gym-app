## Context

See proposal.md — Why.

This project runs a Next version whose conventions differ from what is widely documented elsewhere, and three of those differences shape this design directly. They were verified against `node_modules/next/dist/docs/`, per [AGENTS.md](AGENTS.md), not assumed:

- **`middleware` is deprecated and renamed to `proxy`.** The filename, the named export, and config flags all change (`skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`). `proxy` runs on the Node.js runtime only; the edge runtime is not supported there. Nearly every published Supabase-with-Next auth guide says `middleware.ts`, and following one would produce a deprecated setup.
- **Async request APIs are async-only.** Synchronous access was removed in this major version, so `params` and `searchParams` arrive as promises and `cookies()` must be awaited.
- **`fetch` is not cached by default**, and caching is opt-in via Cache Components and the `use cache` directive — the inverse of the older model.

The other governing constraint is that Supabase sessions currently live in browser storage. A server component cannot read that. Server-side rendering of user data is impossible until session storage moves to cookies, which is why an auth migration is bundled into what is otherwise a routing change.

## Goals / Non-Goals

**Goals:**

- A URL per screen, with back, forward, refresh, and deep links all working.
- Data fetched on the server, collapsing the four-step client waterfall.
- Access control enforced before user data is fetched, not by a client-side render branch.
- Delete the hand-rolled back button rather than fixing it a third time.

**Non-Goals:**

- Server Actions for mutations. See below.
- Visual change. Components keep their markup; only their props and data source change. Restyling is the next change.
- Offline support or a service worker, despite the manifest suggesting a PWA.
- Changing the database, the repositories, or any query.

## Decisions

### Route shape

```
/                              home: cycle list + recent workouts
/calendar                      calendar
/cycles/new                    create cycle
/cycles/[cycleId]              cycle detail
/cycles/[cycleId]/edit         edit cycle
/cycles/[cycleId]/stats        statistics
/cycles/[cycleId]/workouts/new?day=N   new workout from a day template
/workouts/[sessionId]          edit a saved workout
```

A new workout is addressed by cycle plus day template rather than by a record id, because it has no id until it is saved. The alternative — writing a draft row on "Start" so it has an id — puts an unsaved workout in the history table and needs cleanup for abandoned drafts. Encoding the template in the URL keeps the write on save, where it is now.

Note that `searchParams` is a promise in this version, so reading `day` is an `await`.

### `proxy.ts`, not `middleware.ts`

Session refresh and the unauthenticated redirect live in a root `proxy.ts` exporting a function named `proxy`. This is the current convention; `middleware` is deprecated. Because `proxy` is Node-only, none of the edge-runtime constraints that shape the usual Supabase middleware examples apply.

The redirect is deliberately *also* enforced in the server components that read data. `proxy` is routing-level and matcher-driven, so a matcher mistake would silently expose a route; the data-fetch layer refusing to run without a session is what makes that a failure rather than a leak.

### Cookie-backed sessions via `@supabase/ssr`, accepting a forced sign-out

[lib/supabaseClient.ts](lib/supabaseClient.ts) splits into a browser client and a server client, both from `@supabase/ssr`, sharing cookie-based session storage.

The consequence is unavoidable and worth stating plainly: **existing sessions live in browser storage and will not be migrated, so every user is signed out once when this deploys.** For a personal app this is a minor annoyance; the alternative is a bridging step that reads the old storage and re-establishes the session as cookies, which is more machinery than the problem deserves here. It must be called out in release notes rather than discovered.

### Reads move to the server; writes stay on the client

Server components call the repositories with a server client. Mutations continue to run in client components with the browser client.

Moving writes to Server Actions is the more idiomatic end state, and the repositories from `extract-data-layer` already take a client argument, so they would work unchanged. Rejected *for this change* on blast radius: it would mean reworking every mutation path and its error handling at the same time as every route and the auth mechanism. Security does not motivate doing it now — RLS is what protects the data, and it applies identically to a client-side write.

Recorded as an open question, to be taken up once routing has settled.

### Enable Cache Components

Set `cacheComponents: true`.

Without it, this change would introduce a regression: real URLs mean users navigate more, and today's single-component app keeps in-progress workout state in memory that would now be destroyed on every route change. With Cache Components, Next preserves state and DOM across navigation using React's `<Activity>` — pages are hidden rather than unmounted — so a half-entered workout survives navigating away and back.

That preservation is also a hazard. It retains up to 3 routes, so anything transient must be reset explicitly: dialogs and pickers close in a `useLayoutEffect` cleanup, and cached data must be cleared on sign-out or a preserved screen could show the previous account's data after a user switch. Both are specified as requirements rather than left to discovery.

`unstable_instant` can be exported from a route to guarantee instant client-side navigation; worth applying to the home and cycle routes if navigation feels slow, but not a requirement.

### Navigation callbacks become links

Components currently take `onBack`, `onSelectCycle`, `onViewStats`, `onOpenCalendar`, and similar. These become `Link`s or router calls. `onEditSession` and `onStartWorkout` become links too. What remains as callbacks are genuine mutations: `onSaveCycle`, `onDeleteCycle`, `onDeleteSession`.

This is why the test harness must land first: every component's prop interface changes at once.

### `lib/workoutOrigin.ts` is deleted, not adapted

It exists only to remember which screen a workout was opened from, so Cancel can return there. That is what browser history does. The `previousView` state and both of the bug fixes in the git history that patched this emulation go away with it, along with its test file. The four origin-specific scenarios in the `workout-sessions` spec collapse into one history-based rule.

## Risks / Trade-offs

- **Every user is signed out on deploy** → Unavoidable given the storage move; the mitigation is announcing it, not engineering around it.
- **This change touches routing, auth, rendering model, and every component's props at once** → The largest change in the sequence by some margin. It is sequenced after the test harness and the data-layer extraction precisely so neither of those is happening simultaneously. If it needs splitting, the natural seam is landing cookie-based auth and `proxy.ts` first, with the SPA shell intact, then the routes.
- **Cache Components changes caching semantics app-wide, not just navigation state** → Enabled for a specific benefit; the app has little cached data of its own, so the surface is small. If it proves disruptive it can be disabled independently, at the cost of losing draft preservation.
- **State preserved across up to 3 routes can outlive a sign-out** → Called out as an explicit requirement in both the `app-navigation` and `authentication` deltas rather than left as an implementation detail, because the failure mode is showing one account's data to another.
- **Following any published Supabase/Next auth guide will produce a deprecated `middleware.ts`** → The single most likely way to get this change wrong. Verify against `node_modules/next/dist/docs/` rather than external sources.
- **`not-found` for another account's record must not leak existence** → Specified as a requirement; the repositories already scope by owner, so a missing row and an unauthorised row are indistinguishable by construction.

## Migration Plan

1. Add `@supabase/ssr`; split the client into browser and server variants.
2. Add `proxy.ts` for session refresh and redirects. At this point the SPA still works, now with cookie-backed sessions — an independently verifiable checkpoint.
3. Enable Cache Components and confirm the existing app still behaves.
4. Add routes one screen at a time, starting with home and calendar (no dynamic params), then the cycle routes, then workouts.
5. Convert navigation props to links per component as its route lands.
6. Delete the view-router state, `previousView`, and `lib/workoutOrigin.ts` once nothing references them.
7. Add `loading.tsx`, `error.tsx`, and `not-found.tsx` per segment.

Steps 1–3 are reversible on their own. From step 4 the app is in a mixed state, so those steps should land together.

## Open Questions

- Whether to move mutations to Server Actions once routing has settled. The repositories already support it.
- Whether to apply `unstable_instant` to the home and cycle routes, decided by how navigation actually feels rather than in advance.
- Whether the manifest's PWA framing should be taken seriously enough to add offline support. Out of scope here, but real URLs are a prerequisite for it.
