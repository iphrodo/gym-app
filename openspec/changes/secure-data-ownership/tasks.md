## 1. Audit the live database

- [x] 1.1 Check whether row-level security is currently enabled on `cycles` and `workout_sessions`, and record the result — it determines whether this change is an active exposure fix or hardening
- [x] 1.2 Count the rows in each table and establish how many distinct accounts they belong to
- [x] 1.3 Confirm the single-owner backfill in section 2 is valid; if more than one account has data, stop and revise this change before writing the backfill
- [x] 1.4 Record the target owner's account id for the backfill (do not hardcode a guessed value)

  Audit result (from `supabase/backups/full_backup_20260731_054632.sql`, matching the linked
  project `rbkpdlfhyhvriyrlmyxa` referenced in `.env.local`): RLS was already enabled on both
  tables with a single combined policy per table (`USING (auth.uid() = user_id)`, no explicit
  per-operation split). `user_id` already existed (nullable, no FK, no index, no NOT NULL).
  Exactly one account exists in `auth.users`; 1 row in `cycles` and 35 rows in
  `workout_sessions`, all owned by `047eaff5-1e29-448c-b06b-250f8b80cb93`. This is a hardening
  change, not an active exposure fix, and the single-owner backfill is valid.

## 2. Schema and policy migrations

- [x] 2.1 Create `supabase/migrations/` and add a README noting how migrations are applied (dashboard SQL editor, CLI-compatible naming)
- [x] 2.2 Write a migration adding `user_id uuid` to `cycles` and `workout_sessions` — nullable, `DEFAULT auth.uid()`, `REFERENCES auth.users(id) ON DELETE CASCADE`
- [x] 2.3 Add an index on `user_id` for both tables (every read now filters on it)
- [x] 2.4 Write the backfill migration assigning the owner established in task 1.4 to all rows where `user_id IS NULL`
- [x] 2.5 Write a migration setting `user_id` to `NOT NULL` on both tables
- [x] 2.6 Write a migration enabling row-level security and installing per-operation policies (SELECT, INSERT, UPDATE, DELETE) on both tables, with `WITH CHECK (auth.uid() = user_id)` on INSERT and UPDATE so ownership cannot be assigned or reassigned to another account
- [ ] 2.7 Verify the full migration sequence applies cleanly to an empty database and produces both tables with RLS enabled and four policies each

  Not run: no local Postgres/Docker available in this environment to spin up an empty database
  (`psql`/`docker` not installed; `npx supabase` CLI works but local dev requires Docker).

## 3. Apply migrations to the live database

- [x] 3.1 Apply migrations 2.2 and 2.3, then confirm the existing (unmodified) client still loads and saves correctly
- [x] 3.2 Apply the backfill (2.4) and verify zero rows have a null `user_id` in either table
- [x] 3.3 Apply the `NOT NULL` constraint (2.5)
- [x] 3.4 Apply RLS and policies (2.6), then confirm the existing client still loads and saves correctly — the column default covers writes, so no frontend deploy is required for this step
- [ ] 3.5 Confirm the exposure is closed: using a second account's token, attempt a direct REST read of the first account's rows and verify it returns nothing

  All 5 migrations applied via `npx supabase db push` against the linked project
  (`rbkpdlfhyhvriyrlmyxa`), user confirmed beforehand. Post-apply query verification: 0 rows
  with a null `user_id` in either table; `user_id` is `NOT NULL uuid` on both; FK constraints
  `cycles_user_id_fkey` / `workout_sessions_user_id_fkey` present; indexes
  `cycles_user_id_idx` / `workout_sessions_user_id_idx` present; RLS enabled with 4
  per-operation policies (SELECT/INSERT/UPDATE/DELETE) on each table. 3.5 needs a second real
  account's token, not available in this environment — left for manual QA.

## 4. Domain types and ownership guard

- [x] 4.1 Add `userId: string` as a required field to `TrainingCycle` and `WorkoutSession` in [types/index.ts](types/index.ts)
- [x] 4.2 Add a `requireUserId` helper that derives the id from the current session and returns null when unavailable
- [x] 4.3 Fix the resulting type errors at every site that constructs these objects (`prepareNewWorkout`, `CycleFormView.handleSave`, `DEFAULT_CYCLE`) so ownership is supplied at construction

## 5. Owner-scoped reads and writes

- [x] 5.1 Scope the `cycles` and `workout_sessions` fetches in [app/page.tsx](app/page.tsx) to the authenticated user, and map `user_id` into the domain objects
- [x] 5.2 Set `user_id` explicitly on the default-cycle insert, the cycle upsert, and the workout session upsert
- [x] 5.3 Replace the unbounded `update({is_active:false}).neq('id', ...)` with an owner-scoped update affecting only the signed-in user's other cycles
- [x] 5.4 Add the owner filter to the cycle delete and the workout session delete
- [x] 5.5 Make every read and write short-circuit through `requireUserId`, refusing the operation and surfacing a message rather than issuing an unscoped query

## 6. Clear cached data on session end

- [x] 6.1 Reset cycles, history, selected cycle, active session, and view state when `onAuthStateChange` reports a null session
- [ ] 6.2 Verify that logging out and logging in as a second account never shows the first account's data, including during the load interval

  Not run: requires a second live test account against the real Supabase project.

## 7. Verification

- [x] 7.1 Run `npx tsc --noEmit` and `npm run lint` clean
- [x] 7.2 Run `npm test` — confirm the existing lib tests still pass
- [ ] 7.3 Manually verify with two accounts: each sees only its own cycles and history, creating a cycle in one account does not deactivate cycles in the other, and deleting in one does not affect the other
- [ ] 7.4 Confirm the committed migrations, applied to a fresh empty database, reproduce the same isolation guarantees
