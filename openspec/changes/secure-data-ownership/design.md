## Context

See proposal.md — Why. Two constraints shape everything below.

First, the client holds the Supabase **anon key**, which is public by design and shipped in the browser bundle. Anyone with that key can talk to the REST API directly, bypassing this app entirely. Client-side query filters are therefore a correctness measure, not a security boundary. **Row-level security is the only thing actually protecting the data.** Any design that fixes only the TypeScript side fixes nothing.

Second, the current database state is unknown from the repository. There are no migrations, so we cannot tell whether RLS is enabled on the live project. The plan must be correct whether RLS turns out to be already on (in which case this change makes it reviewable and adds defense in depth) or off (in which case this is an active exposure fix).

Structurally, all six Supabase call sites live inline in [app/page.tsx](app/page.tsx), and there is no data-access layer to hook into. Introducing one is change #4 in the refactor sequence; this change deliberately works within the existing inline structure so it can ship immediately and independently.

## Goals / Non-Goals

**Goals:**

- Isolation enforced by the database, expressed as committed SQL that a reviewer can read.
- Ownership that is a compile-time error to omit, not a convention to remember.
- A migration sequence that is safe to run against live data with real rows in it, with a fast rollback.
- Defense in depth: a client-side scoping bug and a policy bug should each be individually insufficient to leak data.

**Non-Goals:**

- Sharing, multi-user cycles, coaches, or any collaboration model. Ownership here is strictly one account per record.
- Introducing a repository/data-access abstraction — that is change #4, and folding it in here would make a security fix hard to review.
- Moving Supabase calls server-side. Worth doing later alongside the App Router work; RLS is the right protection either way.
- Auditing, soft deletes, or ownership transfer.

## Decisions

### Ownership is set in two independent places

The `user_id` column gets `DEFAULT auth.uid()` **and** the client sends `user_id` explicitly on every write.

Either mechanism alone would work. Both together mean a bug in one is covered by the other, and — importantly — the DB default makes the migration deployable *before* the client change, which is what allows RLS to be enabled early (see Migration Plan). The RLS `WITH CHECK` clause makes the client's value non-authoritative: if the client ever sends someone else's id, the write is rejected rather than trusted.

*Alternative rejected:* rely on `DEFAULT auth.uid()` alone and keep the client ignorant of ownership. Less code, but it leaves owner-scoped `DELETE`/`UPDATE` filters absent, so a policy misconfiguration becomes immediately exploitable, and nothing in the type system prevents reintroducing an unscoped query.

### `userId` becomes a required field on the domain types

`TrainingCycle` and `WorkoutSession` each gain `userId: string` (required, not optional).

This is the point of the change that has teeth: `prepareNewWorkout` and `CycleFormView.handleSave` construct these objects literally, so a missing owner becomes a type error at the exact places records are born. Making it optional would let every one of those sites silently omit it.

*Alternative rejected:* keep ownership out of the domain model and attach it only at the persistence boundary, on the theory that ownership is an infrastructure concern. Architecturally cleaner, and it is where we should end up — but it presumes the mapping layer from change #4. Doing it now means either building that layer here (too much for a security fix) or scattering the field-injection logic, which is worse than carrying the field.

### Per-operation RLS policies, not `FOR ALL`

Each table gets four explicit policies — SELECT, INSERT, UPDATE, DELETE — rather than one `FOR ALL`.

`UPDATE` needs both `USING` (which existing rows may be targeted) and `WITH CHECK` (what the row may look like afterwards). Writing them separately makes the asymmetry visible, and it is `WITH CHECK` on UPDATE that implements the "owner cannot be reassigned" requirement — a `FOR ALL` policy makes that easy to get wrong and impossible to spot in review.

### Migrations as plain timestamped SQL under `supabase/migrations/`

Files follow the Supabase CLI's naming convention so the CLI can adopt them later, but nothing in this change requires the CLI to be installed — the SQL can be pasted into the dashboard's SQL editor.

*Alternative rejected:* adopting the Supabase CLI now. It brings local-dev Docker, config, and a linked-project workflow. Worth doing, but it is tooling work bundled into a security fix, and it would delay shipping.

### Fail-closed via a single `requireUserId` guard

One helper derives the id from the session and returns `null` when absent; every read and write short-circuits on it. Today the render path already returns `<AuthView />` when there is no session, so this is belt-and-braces — but the guard is what keeps it true after change #5 moves navigation to real routes, where a handler can plausibly run before session resolution.

### Cache clearing hangs off the session transition, not the logout button

State is reset where `onAuthStateChange` reports a null session, not inside `HomeView`'s sign-out handler. Token expiry and sign-out from another tab both end a session without anyone clicking that button; hooking the transition covers all three.

## Risks / Trade-offs

- **Enabling RLS before rows have owners would make all existing data invisible to its owner** → Backfill and enforce `NOT NULL` *before* policies go on. The migration is split so this ordering is impossible to get wrong by running files in sequence.
- **Deploying the owner-scoped client before the column exists would break every query** → The DB default makes the migration independently deployable, so the schema ships first and the client change is purely additive on top. Verified by running the current client against the migrated database before deploying the new one.
- **We do not know how many accounts have data, so the backfill target is unknown** → The backfill is not written speculatively; the first task is to count distinct owners against the live database, and the migration is written to match what is actually there. If more than one account has data, the backfill cannot be a single assignment and this change needs revisiting before it lands.
- **`user_id` on the domain types is architecturally the wrong home for it** → Accepted deliberately, and unwound in change #4 when the mapping layer lands. Documented here so it is not mistaken for an endorsement.
- **`auth.uid()` returns null for service-role connections, so policies do not constrain server-side keys** → Correct and intended, but it means any future server-side code must apply its own scoping. Flagged for change #5.
- **Rollback of the policies is fast; rollback of `NOT NULL` is not** → Rollback strategy is to disable RLS only, leaving the column in place. Reverting the column would mean reintroducing the exposure, so it is not a rollback path we want.

## Migration Plan

Ordered so that each step is safe on its own and the client deploy is last:

1. **Audit.** Query the live database for RLS status on both tables and the count of distinct owners implied by existing data. This determines whether this is an exposure fix or a hardening change, and whether the single-owner backfill is valid.
2. **Add the column, nullable, with `DEFAULT auth.uid()`** and a foreign key to `auth.users(id) ON DELETE CASCADE`. Additive and safe — existing rows get null, new writes get an owner automatically.
3. **Backfill** existing rows with the owner established in step 1.
4. **Enforce `NOT NULL`** once the backfill is verified to leave zero nulls.
5. **Enable RLS and install policies.** At this point the DB default already ensures new rows are owned, so the *current* client keeps working without modification. This is the step that closes the exposure, and it does not wait on a frontend deploy.
6. **Deploy the client change** — explicit `user_id` on writes, owner filters on reads and deletes, the owner-scoped deactivation replacing `.neq()`, and cache clearing on sign-out.
7. **Verify** with a second test account: confirm each account sees only its own cycles and sessions, and that a direct REST call with account A's token cannot fetch account B's rows.

**Rollback:** `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` restores the previous behaviour immediately without data loss. The column and backfill are left in place; they are inert without policies and are needed again on re-apply.

## Open Questions

- Whether to adopt the Supabase CLI for migrations going forward, or keep applying SQL through the dashboard. Does not affect this change's SQL, only how it is run.
- Whether `workout_sessions.user_id` is strictly necessary given it could be derived through `cycle_id → cycles.user_id`. Denormalised here so its policy does not require a join, but the redundancy is worth revisiting if the schema grows.
