import { SupabaseClient } from '@supabase/supabase-js';
import { TrainingCycle } from '../../types';
import { Result, ok, err } from './result';
import { cycleFromRow, cycleToRow } from './mappers';

async function resolveOwnerId(client: SupabaseClient): Promise<Result<string>> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return err(error ?? new Error('Not authenticated'));
  return ok(data.user.id);
}

export async function listCycles(client: SupabaseClient): Promise<Result<TrainingCycle[]>> {
  const owner = await resolveOwnerId(client);
  if (!owner.ok) return err(owner.error);

  const { data, error } = await client.from('cycles').select('*').eq('user_id', owner.value);
  if (error) return err(error);

  return ok((data ?? []).map(cycleFromRow));
}

export async function upsertCycle(client: SupabaseClient, cycle: TrainingCycle): Promise<Result<void>> {
  const owner = await resolveOwnerId(client);
  if (!owner.ok) return err(owner.error);

  const { error } = await client.from('cycles').upsert(cycleToRow(cycle, owner.value));
  if (error) return err(error);

  return ok(undefined);
}

export async function deactivateOtherCycles(client: SupabaseClient, keepCycleId: string): Promise<Result<void>> {
  const owner = await resolveOwnerId(client);
  if (!owner.ok) return err(owner.error);

  const { error } = await client
    .from('cycles')
    .update({ is_active: false })
    .eq('user_id', owner.value)
    .neq('id', keepCycleId);
  if (error) return err(error);

  return ok(undefined);
}

export async function deleteCycle(client: SupabaseClient, id: string): Promise<Result<void>> {
  const owner = await resolveOwnerId(client);
  if (!owner.ok) return err(owner.error);

  const { error } = await client.from('cycles').delete().eq('id', id).eq('user_id', owner.value);
  if (error) return err(error);

  return ok(undefined);
}
