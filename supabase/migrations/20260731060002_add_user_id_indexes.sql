-- Every read is now filtered by owner, so index the column.

create index if not exists cycles_user_id_idx
  on public.cycles (user_id);

create index if not exists workout_sessions_user_id_idx
  on public.workout_sessions (user_id);
