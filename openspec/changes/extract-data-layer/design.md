## Context

See proposal.md — Why.

One constraint dominates every decision below: this refactor exists largely to serve the change after it. `adopt-app-router-navigation` wants to fetch data in server components, which means the data layer must be callable from an environment where [lib/supabaseClient.ts](lib/supabaseClient.ts)'s browser singleton does not exist and where there is no React state at all. A data layer designed only for the current all-client architecture would have to be rewritten immediately.

The second constraint is that this is a pure refactor across every persistence path in the app, with no user-visible change intended. That is a shape with a poor risk profile — large blast radius, no new behavior to demonstrate it worked — which is why it is sequenced after the test harness rather than before.

## Goals / Non-Goals

**Goals:**

- One place per table where a rule about reading or writing it can be stated.
- Environment-agnostic: the same query functions run in the browser, a server component, or a route handler.
- Failure handling that a caller cannot skip by accident.
- Preserve every existing behavior exactly, including behaviors that are arguably wrong.

**Non-Goals:**

- Any behavior change. If a bug is found during extraction, it gets recorded and fixed in a separate change, not smuggled into a refactor where nobody can see it in the diff.
- Caching, background revalidation, or a query library — see the decision below.
- Moving anything server-side. This change makes that *possible*; it does not do it.
- Changing the database schema.

## Decisions

### Repositories take a client argument rather than importing the singleton

Every repository function's first parameter is a `SupabaseClient`. Nothing in `lib/data/` imports [lib/supabaseClient.ts](lib/supabaseClient.ts).

This is the decision the whole change hangs on. Importing the browser singleton is what currently welds persistence to a `"use client"` component; a server component importing that module gets a client built from browser assumptions with no access to the request's auth cookie. Passing the client in costs one parameter per call and is what lets the next change fetch server-side without touching `lib/data/` at all.

*Alternative rejected:* a `getClient()` factory that detects its environment. It hides the dependency, makes tests depend on ambient state, and environment detection in a framework that runs the same module in both places is a recurring source of subtle bugs.

### An explicit `Result<T>` rather than propagating `{ data, error }`

Repositories return a discriminated union that a caller must narrow before reaching the value.

The concrete failure this prevents is the one already in the codebase: [app/page.tsx:73](app/page.tsx#L73) destructures `cyclesError` and never reads it, and the compiler is content because an unused binding is legal. With a discriminated result, reading the data without handling the failure case is a type error. This is the mechanism that makes the "No Silent Failures" requirement structural rather than a thing reviewers must remember.

*Alternative rejected:* throwing on failure. Idiomatic, and it composes well with error boundaries — but it makes the failure path invisible at call sites, and the app's expected failures (offline saves) are ordinary control flow rather than exceptional.

### `userId` leaves the domain types; repositories inject ownership

`TrainingCycle` and `WorkoutSession` lose the `userId` field added in `secure-data-ownership`. Repositories resolve the owner and apply it to every query and write internally.

That field was added deliberately, with the trade-off recorded at the time: ownership is a persistence concern, but with no persistence layer to put it in, carrying it on the domain type was the only way to make omission a compile error. This change is where that debt is paid. The compile-time guarantee is not lost — it moves to the repository interface, where writes cannot be expressed without an owner.

This is the one part of the refactor that changes a type used across the app, so it is sequenced last among the extraction steps, after the repositories are in place and tested.

### Hooks over `useReducer`, and no query library

`useCycles` and `useWorkoutHistory` own loading, error, and mutation state, backed by reducers.

React Query is the obvious candidate and I am rejecting it for a specific reason rather than on principle: most of its value is cache coordination across many components and routes, and the routing change that would create that situation is the *next* change — which is also likely to move reads into server components, where a client-side cache is the wrong tool. Adopting it now means installing it against an architecture that is about to change, and plausibly removing it again.

Worth revisiting once `adopt-app-router-navigation` has settled and the read/write split between server and client is known. Recorded as an open question rather than a closed door.

### Mapping lives in one module per table, in both directions

Read mapping is currently written once per table in the fetch effect; write mapping is written inline at each upsert as an object literal. That is three places per table where a column name can be got wrong, and the failure mode is a silently dropped field rather than an error.

### Repository tests use hand-written doubles at the client interface

`add-component-test-harness` deferred Supabase testing because mocking a chained builder to test call sites that were about to move was not worth it. Now the interface is narrow and stable, and the doubles test something durable. MSW remains the more faithful option and is still worth considering here, since the repository is exactly the layer where wire-format fidelity matters — carried forward as an open question.

## Risks / Trade-offs

- **A behavior-preserving refactor with a large blast radius and nothing new to demonstrate** → The test harness lands first specifically for this. Extraction proceeds one table at a time, each with its tests passing before the next begins.
- **"Preserve existing behavior exactly" includes preserving oddities** — the optimistic-update ordering, the seed-on-empty flow, the deactivate-others write → Deliberate. Each gets a test capturing current behavior *before* it moves, so the test proves the move rather than encoding an improvement.
- **Passing a client to every function is more verbose at call sites** → Accepted. The verbosity is the dependency being visible, and it is what makes the next change cheap.
- **Removing `userId` from the domain types touches every construction site again**, shortly after the change that added it → Unavoidable given the ordering; adding it later would have meant shipping a security fix without a compile-time guarantee. Sequenced last here so it lands as one focused step.
- **The hooks may be short-lived if the next change moves reads to the server** → Known and accepted. They are thin over the repositories, which are the durable part; the repositories are deliberately where the effort goes.

## Migration Plan

Incremental, with the app working at every step:

1. Add `Result`, the mappers, and the cycles repository. Nothing calls them yet.
2. Test the cycles repository against a client double.
3. Move the cycle call sites in `app/page.tsx` to the repository, one at a time.
4. Repeat for workout sessions.
5. Introduce the hooks and move loading/error/mutation state out of the page component.
6. Remove `userId` from the domain types and move ownership injection inside the repositories.

Each step is independently revertible. There is no cutover point.

## Open Questions

- Whether to adopt React Query after the routing change settles, once the server/client read split is known.
- Whether repository tests should use MSW against PostgREST's wire format rather than hand-written client doubles. Affects test fidelity, not the design of the layer.
