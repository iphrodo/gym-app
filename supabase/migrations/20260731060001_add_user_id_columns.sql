-- Add ownership column to cycles and workout_sessions.
-- Nullable for now: existing rows get null, new writes get an owner
-- automatically via the column default. Safe to run against live data.

alter table public.cycles
  add column if not exists user_id uuid default auth.uid();

alter table public.workout_sessions
  add column if not exists user_id uuid default auth.uid();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cycles_user_id_fkey'
  ) then
    alter table public.cycles
      add constraint cycles_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'workout_sessions_user_id_fkey'
  ) then
    alter table public.workout_sessions
      add constraint workout_sessions_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;
end $$;
