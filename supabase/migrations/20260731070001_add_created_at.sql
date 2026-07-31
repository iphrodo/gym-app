-- Add created_at to cycles and workout_sessions.
--
-- Nullable for now: backfilled from the legacy numeric id (the previous
-- id scheme was `Date.now().toString()`, so it doubles as a creation
-- timestamp for old rows) in the next migration, then made NOT NULL.

alter table public.cycles
  add column if not exists created_at timestamptz;

alter table public.workout_sessions
  add column if not exists created_at timestamptz;
