-- Enforce ownership now that the backfill (previous migration) has left
-- zero rows with a null user_id.

alter table public.cycles
  alter column user_id set not null;

alter table public.workout_sessions
  alter column user_id set not null;
