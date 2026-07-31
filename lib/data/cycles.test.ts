import { describe, it, expect } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { listCycles, upsertCycle, deactivateOtherCycles, deleteCycle } from './cycles';
import { createFakeSupabaseClient } from './testSupabaseClient';
import { TrainingCycle } from '../../types';

function asClient(fake: ReturnType<typeof createFakeSupabaseClient>): SupabaseClient {
  return fake as unknown as SupabaseClient;
}

describe('listCycles', () => {
  it('maps rows for the authenticated owner', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: {
        cycles: {
          data: [
            { id: 'c1', name: 'Power Cycle', is_active: true, templates: [], user_id: 'owner-1', created_at: '2026-01-01T00:00:00.000Z' },
          ],
          error: null,
        },
      },
    });

    const result = await listCycles(asClient(fake));

    expect(result).toEqual({
      ok: true,
      value: [{ id: 'c1', name: 'Power Cycle', isActive: true, templates: [], createdAt: '2026-01-01T00:00:00.000Z' }],
    });
    expect(fake.builders.cycles.calls).toContainEqual({ method: 'eq', args: ['user_id', 'owner-1'] });
  });

  it('returns an error result when the query fails', async () => {
    const queryError = new Error('network down');
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: null, error: queryError } },
    });

    const result = await listCycles(asClient(fake));

    expect(result).toEqual({ ok: false, error: queryError });
  });

  it('fails closed without issuing a query when there is no authenticated user', async () => {
    const fake = createFakeSupabaseClient({ user: null, tableResults: {} });

    const result = await listCycles(asClient(fake));

    expect(result.ok).toBe(false);
    expect(fake.fromCalls).toHaveLength(0);
  });
});

describe('upsertCycle', () => {
  const cycle: TrainingCycle = {
    id: 'c1',
    name: 'Power Cycle',
    isActive: true,
    templates: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('injects the authenticated owner into the written row', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: null, error: null } },
    });

    const result = await upsertCycle(asClient(fake), cycle);

    expect(result).toEqual({ ok: true, value: undefined });
    expect(fake.builders.cycles.calls).toContainEqual({
      method: 'upsert',
      args: [{ id: 'c1', name: 'Power Cycle', is_active: true, templates: [], user_id: 'owner-1', created_at: '2026-01-01T00:00:00.000Z' }],
    });
  });

  it('returns an error result when the write fails', async () => {
    const writeError = new Error('write failed');
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: null, error: writeError } },
    });

    const result = await upsertCycle(asClient(fake), cycle);

    expect(result).toEqual({ ok: false, error: writeError });
  });

  it('fails closed without writing when there is no authenticated user', async () => {
    const fake = createFakeSupabaseClient({ user: null, tableResults: {} });

    const result = await upsertCycle(asClient(fake), cycle);

    expect(result.ok).toBe(false);
    expect(fake.fromCalls).toHaveLength(0);
  });
});

describe('deactivateOtherCycles', () => {
  it('scopes the bulk update to the owner and excludes the kept cycle', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: null, error: null } },
    });

    const result = await deactivateOtherCycles(asClient(fake), 'keep-me');

    expect(result).toEqual({ ok: true, value: undefined });
    expect(fake.builders.cycles.calls).toEqual([
      { method: 'update', args: [{ is_active: false }] },
      { method: 'eq', args: ['user_id', 'owner-1'] },
      { method: 'neq', args: ['id', 'keep-me'] },
    ]);
  });

  it('returns an error result when the update fails', async () => {
    const writeError = new Error('write failed');
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: null, error: writeError } },
    });

    const result = await deactivateOtherCycles(asClient(fake), 'keep-me');

    expect(result).toEqual({ ok: false, error: writeError });
  });
});

describe('deleteCycle', () => {
  it('scopes the delete to both the record id and the owner', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: null, error: null } },
    });

    const result = await deleteCycle(asClient(fake), 'c1');

    expect(result).toEqual({ ok: true, value: undefined });
    expect(fake.builders.cycles.calls).toEqual([
      { method: 'delete', args: [] },
      { method: 'eq', args: ['id', 'c1'] },
      { method: 'eq', args: ['user_id', 'owner-1'] },
    ]);
  });

  it('returns an error result when the delete fails', async () => {
    const writeError = new Error('delete failed');
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: null, error: writeError } },
    });

    const result = await deleteCycle(asClient(fake), 'c1');

    expect(result).toEqual({ ok: false, error: writeError });
  });
});
