import { SupabaseClient } from '@supabase/supabase-js';
import { WorkoutSession } from '../../types';
import { Result, ok, err } from './result';
import { workoutSessionFromRow, workoutSessionToRow } from './mappers';

async function resolveOwnerId(client: SupabaseClient): Promise<Result<string>> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return err(error ?? new Error('Not authenticated'));
  return ok(data.user.id);
}

export async function listWorkoutSessions(client: SupabaseClient): Promise<Result<WorkoutSession[]>> {
  const owner = await resolveOwnerId(client);
  if (!owner.ok) return err(owner.error);

  const { data, error } = await client.from('workout_sessions').select('*').eq('user_id', owner.value);
  if (error) return err(error);

  return ok((data ?? []).map(workoutSessionFromRow));
}

export async function upsertWorkoutSession(client: SupabaseClient, session: WorkoutSession): Promise<Result<void>> {
  const owner = await resolveOwnerId(client);
  if (!owner.ok) return err(owner.error);

  const { error } = await client.from('workout_sessions').upsert(workoutSessionToRow(session, owner.value));
  if (error) return err(error);

  return ok(undefined);
}

export async function deleteWorkoutSession(client: SupabaseClient, id: string): Promise<Result<void>> {
  const owner = await resolveOwnerId(client);
  if (!owner.ok) return err(owner.error);

  const { error } = await client.from('workout_sessions').delete().eq('id', id).eq('user_id', owner.value);
  if (error) return err(error);

  return ok(undefined);
}
