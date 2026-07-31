import { describe, it, expect } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { listWorkoutSessions, upsertWorkoutSession, deleteWorkoutSession } from './workoutSessions';
import { createFakeSupabaseClient } from './testSupabaseClient';
import { WorkoutSession } from '../../types';

function asClient(fake: ReturnType<typeof createFakeSupabaseClient>): SupabaseClient {
  return fake as unknown as SupabaseClient;
}

describe('listWorkoutSessions', () => {
  it('maps rows for the authenticated owner', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: {
        workout_sessions: {
          data: [
            {
              id: 's1',
              cycle_id: 'c1',
              date: '2026-07-01',
              day_label: 'Push',
              day_number: 1,
              data: [],
              user_id: 'owner-1',
              created_at: '2026-07-01T00:00:00.000Z',
            },
          ],
          error: null,
        },
      },
    });

    const result = await listWorkoutSessions(asClient(fake));

    expect(result).toEqual({
      ok: true,
      value: [
        { id: 's1', cycleId: 'c1', date: '2026-07-01', dayLabel: 'Push', dayNumber: 1, data: [], createdAt: '2026-07-01T00:00:00.000Z' },
      ],
    });
    expect(fake.builders.workout_sessions.calls).toContainEqual({ method: 'eq', args: ['user_id', 'owner-1'] });
  });

  it('returns an error result when the query fails', async () => {
    const queryError = new Error('network down');
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { workout_sessions: { data: null, error: queryError } },
    });

    const result = await listWorkoutSessions(asClient(fake));

    expect(result).toEqual({ ok: false, error: queryError });
  });

  it('fails closed without issuing a query when there is no authenticated user', async () => {
    const fake = createFakeSupabaseClient({ user: null, tableResults: {} });

    const result = await listWorkoutSessions(asClient(fake));

    expect(result.ok).toBe(false);
    expect(fake.fromCalls).toHaveLength(0);
  });
});

describe('upsertWorkoutSession', () => {
  const session: WorkoutSession = {
    id: 's1',
    cycleId: 'c1',
    date: '2026-07-01',
    dayLabel: 'Push',
    dayNumber: 1,
    data: [],
    createdAt: '2026-07-01T00:00:00.000Z',
  };

  it('injects the authenticated owner into the written row', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { workout_sessions: { data: null, error: null } },
    });

    const result = await upsertWorkoutSession(asClient(fake), session);

    expect(result).toEqual({ ok: true, value: undefined });
    expect(fake.builders.workout_sessions.calls).toContainEqual({
      method: 'upsert',
      args: [
        { id: 's1', cycle_id: 'c1', date: '2026-07-01', day_label: 'Push', day_number: 1, data: [], user_id: 'owner-1', created_at: '2026-07-01T00:00:00.000Z' },
      ],
    });
  });

  it('returns an error result when the write fails', async () => {
    const writeError = new Error('write failed');
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { workout_sessions: { data: null, error: writeError } },
    });

    const result = await upsertWorkoutSession(asClient(fake), session);

    expect(result).toEqual({ ok: false, error: writeError });
  });

  it('fails closed without writing when there is no authenticated user', async () => {
    const fake = createFakeSupabaseClient({ user: null, tableResults: {} });

    const result = await upsertWorkoutSession(asClient(fake), session);

    expect(result.ok).toBe(false);
    expect(fake.fromCalls).toHaveLength(0);
  });
});

describe('deleteWorkoutSession', () => {
  it('scopes the delete to both the record id and the owner', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { workout_sessions: { data: null, error: null } },
    });

    const result = await deleteWorkoutSession(asClient(fake), 's1');

    expect(result).toEqual({ ok: true, value: undefined });
    expect(fake.builders.workout_sessions.calls).toEqual([
      { method: 'delete', args: [] },
      { method: 'eq', args: ['id', 's1'] },
      { method: 'eq', args: ['user_id', 'owner-1'] },
    ]);
  });

  it('returns an error result when the delete fails', async () => {
    const writeError = new Error('delete failed');
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { workout_sessions: { data: null, error: writeError } },
    });

    const result = await deleteWorkoutSession(asClient(fake), 's1');

    expect(result).toEqual({ ok: false, error: writeError });
  });
});
