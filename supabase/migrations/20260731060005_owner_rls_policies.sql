-- Row-level security: each table gets four explicit per-operation
-- policies rather than one FOR ALL, so the INSERT/UPDATE WITH CHECK
-- (which blocks assigning or reassigning ownership to another account)
-- is visible in review rather than implied.
--
-- Superseded combined policies (if present from earlier, pre-migration
-- setup) are dropped first.

alter table public.cycles enable row level security;
alter table public.workout_sessions enable row level security;

drop policy if exists "Users can access their own cycles" on public.cycles;
drop policy if exists "Users can access their own sessions" on public.workout_sessions;

drop policy if exists "cycles_select_own" on public.cycles;
create policy "cycles_select_own" on public.cycles
  for select
  using (auth.uid() = user_id);

drop policy if exists "cycles_insert_own" on public.cycles;
create policy "cycles_insert_own" on public.cycles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "cycles_update_own" on public.cycles;
create policy "cycles_update_own" on public.cycles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cycles_delete_own" on public.cycles;
create policy "cycles_delete_own" on public.cycles
  for delete
  using (auth.uid() = user_id);

drop policy if exists "workout_sessions_select_own" on public.workout_sessions;
create policy "workout_sessions_select_own" on public.workout_sessions
  for select
  using (auth.uid() = user_id);

drop policy if exists "workout_sessions_insert_own" on public.workout_sessions;
create policy "workout_sessions_insert_own" on public.workout_sessions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "workout_sessions_update_own" on public.workout_sessions;
create policy "workout_sessions_update_own" on public.workout_sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "workout_sessions_delete_own" on public.workout_sessions;
create policy "workout_sessions_delete_own" on public.workout_sessions
  for delete
  using (auth.uid() = user_id);
