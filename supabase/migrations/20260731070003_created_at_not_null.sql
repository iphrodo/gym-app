-- Enforce created_at now that the backfill (previous migration) has left
-- zero rows with a null created_at. New rows default to the write time.

alter table public.cycles
  alter column created_at set default now(),
  alter column created_at set not null;

alter table public.workout_sessions
  alter column created_at set default now(),
  alter column created_at set not null;
