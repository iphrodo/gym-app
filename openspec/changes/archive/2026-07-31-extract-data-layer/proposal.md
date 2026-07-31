## Why

All persistence lives inline in [app/page.tsx](app/page.tsx): six Supabase call sites, the snake_case↔camelCase mapping, ownership scoping, error handling, and optimistic state updates, interleaved with view-routing state in a single 300-plus-line client component. Every one of the correctness and security fixes in the preceding changes had to be applied at each call site individually, because there is no single place where a rule about reading or writing data can be stated once.

This also blocks what comes next. `adopt-app-router-navigation` needs to fetch data from server components, and it cannot: the calls are welded to a `"use client"` component and to a browser-only client singleton. Extracting the data layer first means that change is purely about navigation.

## What Changes

- Introduce repository modules — one per table — owning all queries, the column mapping, and owner scoping for that table.
- Repositories receive a Supabase client as an argument instead of importing the browser singleton, so the same functions can run in a server component, a route handler, or the browser.
- Replace the ad-hoc `{ data, error }` handling at each call site with a single explicit result type, so a caller cannot ignore a failure by forgetting to destructure `error`.
- Move column mapping into one place per table, replacing the mapping duplicated between the read path and each write literal.
- Introduce hooks that own loading, error, and mutation state for cycles and workout history, so `app/page.tsx` stops holding raw persistence state.
- Remove `userId` from the domain types, injecting ownership inside the repositories instead — unwinding the deliberate trade-off recorded in `secure-data-ownership`.
- Add tests at the repository and hook boundary, which is the seam `add-component-test-harness` deliberately deferred.

## Capabilities

No capabilities change. This is a behavior-preserving refactor: every observable behavior is already specified under `training-cycles`, `workout-sessions`, `data-ownership`, and `data-persistence`, and this change must leave all of them exactly as they are. The change declares `skip_specs: true`.

The existing specs are the acceptance criteria — if any of them would need editing, the refactor has changed behavior and has gone wrong.

## Impact

- **New files:** `lib/data/cycles.ts`, `lib/data/workoutSessions.ts`, `lib/data/result.ts`, `lib/data/mappers.ts`, and hooks under `lib/hooks/`.
- **Changed files:** [app/page.tsx](app/page.tsx) — all six Supabase call sites removed, along with the mapping and optimistic-update logic; [types/index.ts](types/index.ts) — `userId` removed from the domain types; [lib/supabaseClient.ts](lib/supabaseClient.ts) — becomes one of several possible clients rather than the only one.
- **Dependencies:** none added. `@supabase/ssr` is deliberately deferred to `adopt-app-router-navigation`, which is where a server-side client is actually needed.
- **Risk profile:** touches every persistence path in the app with no user-visible change intended, so the preceding test harness is the safety net. This change should not land without it.
- **Sequencing:** after `add-component-test-harness`, before `adopt-app-router-navigation`.
