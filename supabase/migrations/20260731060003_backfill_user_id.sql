-- Backfill for rows created before ownership was tracked.
--
-- Audit performed 2026-07-31 (change: secure-data-ownership, tasks 1.1-1.4):
-- exactly one account exists in auth.users, and every existing row in both
-- tables already belongs to it. On a fresh/empty database these statements
-- are no-ops (there are no null-owner rows to match).
--
-- If this ever runs against a database with more than one account's data
-- already present, STOP: a single-owner backfill is not valid there and
-- this migration must be revised first.

update public.cycles
   set user_id = '047eaff5-1e29-448c-b06b-250f8b80cb93'
 where user_id is null;

update public.workout_sessions
   set user_id = '047eaff5-1e29-448c-b06b-250f8b80cb93'
 where user_id is null;
