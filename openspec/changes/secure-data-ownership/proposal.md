## Why

The app has no concept of data ownership in its code. Every read is `select('*')` with no user filter, no write ever sets an owner, the domain types have no owner field, and one write is an unbounded mass-update across the whole table. Tenant isolation therefore rests entirely on Supabase RLS policies that do not exist in this repository — there is no `supabase/` directory, no migrations, and no SQL of any kind — so isolation cannot be reviewed, tested, or reproduced in a fresh project. Either RLS is enabled and the app works by luck, or it is not and every user can read and modify every other user's data. Neither state is acceptable, and we cannot currently tell which one we are in.

## What Changes

- Add per-user ownership to the domain model: cycles and workout sessions each carry the id of the account that owns them.
- Scope every read to the authenticated user, so a query cannot return another account's rows even if RLS were misconfigured.
- Set the owner explicitly on every insert and upsert rather than relying on an unseen database default.
- **BREAKING (data):** replace the unbounded `update({ is_active: false }).neq('id', ...)` deactivation with an owner-scoped update. Today this statement targets every row in the table; under a misconfigured database it deactivates other users' cycles.
- Commit the database schema and row-level security policies to the repository as versioned migrations, so isolation is reviewable in code review and reproducible in a new environment.
- Verify the live project's RLS state against those committed policies and repair it if it diverges.
- Clear cached cycle and workout data on sign-out, so one account's data never remains in memory across a user switch on a shared device.
- Fail closed: if the authenticated user id is unavailable, read and write operations do not fall back to unscoped queries.

## Capabilities

### New Capabilities

- `data-ownership`: Every persisted record belongs to exactly one account; reads and writes are scoped to the authenticated user, ownership rules are enforced in the database as committed policy, and cached data is cleared on sign-out.

### Modified Capabilities

- `training-cycles`: The "Single Active Cycle" requirement currently deactivates *every other cycle in the table*. It must deactivate only the signed-in user's other cycles.
- `authentication`: Signing out must additionally discard locally cached cycles and workout history, not just end the Supabase session.

## Impact

- **Code:** [app/page.tsx](app/page.tsx) (all six Supabase call sites, the fetch effect, and the sign-out path), [types/index.ts](types/index.ts) (owner field on `TrainingCycle` and `WorkoutSession`), [components/HomeView.tsx](components/HomeView.tsx) (sign-out handler).
- **Database:** new `supabase/migrations/` directory holding the `cycles` and `workout_sessions` schema plus RLS policies. Existing rows need an ownership backfill before the owner column can be made non-nullable.
- **Live environment:** the running Supabase project may require an RLS repair. If RLS is currently off, this change is a live data-exposure fix and should ship ahead of everything else in the refactor sequence.
- **Dependencies:** none added. Migrations are plain SQL; adopting the Supabase CLI for applying them is a decision for design.md.
- **Deliberately out of scope:** routing, the data-layer extraction, the design system, and the separate P0 correctness bugs (form state mutation, swallowed fetch errors, `reps`/`weight` typing) — those are later changes in the refactor sequence.
