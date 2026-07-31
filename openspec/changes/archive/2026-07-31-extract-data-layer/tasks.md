## 1. Capture current behavior before moving it

- [x] 1.1 Write tests recording the existing seed-on-empty flow, the deactivate-others write, and the optimistic-update ordering, so the refactor is proven against current behavior rather than intended behavior
- [x] 1.2 Record any bug found while reading the code in a follow-up change; do not fix it here

## 2. Foundations

- [x] 2.1 Add `lib/data/result.ts` with a discriminated `Result<T>` that cannot be unwrapped without narrowing the failure case
- [x] 2.2 Add `lib/data/mappers.ts` with row↔domain mapping for both tables, in both directions
- [x] 2.3 Add unit tests for the mappers, including a row missing optional jsonb fields



## 3. Cycles repository

- [x] 3.1 Add `lib/data/cycles.ts` taking a `SupabaseClient` as its first parameter, exposing list, upsert, deactivate-others, and delete
- [x] 3.2 Apply owner scoping to every query inside the repository
- [x] 3.3 Test the repository against a hand-written client double, covering success and failure for each operation
- [x] 3.4 Move the cycle call sites in [app/page.tsx](app/page.tsx) to the repository one at a time, confirming the app works after each
- [x] 3.5 Confirm the cycle behaviors from task 1.1 still pass unchanged



## 4. Workout sessions repository

- [x] 4.1 Add `lib/data/workoutSessions.ts` with the same shape, exposing list, upsert, and delete
- [x] 4.2 Apply owner scoping to every query inside the repository
- [x] 4.3 Test against a client double, covering success and failure for each operation
- [x] 4.4 Move the workout session call sites in `app/page.tsx` to the repository
- [x] 4.5 Confirm the session behaviors from task 1.1 still pass unchanged



## 5. Hooks

- [x] 5.1 Add `useCycles` owning loading, error, and mutation state for cycles, backed by a reducer
- [x] 5.2 Add `useWorkoutHistory` with the same responsibilities for sessions
- [x] 5.3 Move loading, error, and optimistic-update state out of `app/page.tsx` into the hooks
- [x] 5.4 Test the hooks' loading, success, failure, and retry transitions
- [x] 5.5 Confirm `app/page.tsx` no longer imports the Supabase client or references any column name



## 6. Unwind the ownership trade-off

- [x] 6.1 Move owner resolution and injection inside the repositories
- [x] 6.2 Remove `userId` from `TrainingCycle` and `WorkoutSession` in [types/index.ts](types/index.ts)
- [x] 6.3 Confirm the repository interface still makes it impossible to express a write without an owner
- [x] 6.4 Fix the resulting type errors at construction sites, which should now be simpler rather than more complex



## 7. Verification

- [x] 7.1 Run `npm test`, `npx tsc --noEmit`, and `npm run lint` clean
- [x] 7.2 Confirm no spec under `openspec/specs/` needed editing — if one did, behavior changed and the refactor went wrong
- [x] 7.3 Manual two-account pass confirming ownership isolation still holds after the ownership logic moved
- [x] 7.4 Confirm nothing under `lib/data/` imports [lib/supabaseClient.ts](lib/supabaseClient.ts), so the layer stays callable from a server environment