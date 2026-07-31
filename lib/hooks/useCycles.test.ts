import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, renderHook, waitFor, act } from '@testing-library/react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useCycles } from './useCycles';
import { createFakeSupabaseClient, FakeSupabaseClient } from '../data/testSupabaseClient';
import { TrainingCycle } from '../../types';

afterEach(() => {
  cleanup();
});

function asClient(fake: FakeSupabaseClient): SupabaseClient {
  return fake as unknown as SupabaseClient;
}

function cycleRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'c1',
    name: 'Power Cycle',
    is_active: true,
    templates: [],
    user_id: 'owner-1',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('useCycles - loading', () => {
  it('loads existing cycles for the account', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: [cycleRow()], error: null } },
    });

    const { result } = renderHook(() => useCycles(asClient(fake), true));

    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('loaded'));
    expect(result.current.cycles).toEqual([
      { id: 'c1', name: 'Power Cycle', isActive: true, templates: [], createdAt: '2026-01-01T00:00:00.000Z' },
    ]);
  });

  it('reports an error when the fetch fails', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: null, error: new Error('down') } },
    });

    const { result } = renderHook(() => useCycles(asClient(fake), true));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe("Couldn't load your cycles.");
  });

  it('seeds a default cycle when the account has none', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: [], error: null } },
    });

    const { result } = renderHook(() => useCycles(asClient(fake), true));

    await waitFor(() => expect(result.current.status).toBe('loaded'));
    expect(result.current.cycles).toHaveLength(1);
    expect(result.current.cycles[0].name).toBe('Power Cycle v1');
    expect(fake.builders.cycles.calls.some(c => c.method === 'upsert')).toBe(true);
  });

  it('reports an error when seeding the default cycle fails', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: {
        // First call is the initial (empty) list; second is the seed upsert.
        cycles: [
          { data: [], error: null },
          { data: null, error: new Error('seed failed') },
        ],
      },
    });

    const { result } = renderHook(() => useCycles(asClient(fake), true));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe("Couldn't set up your account.");
  });

  it('does not fetch while disabled, and retry triggers a refetch', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { cycles: { data: [cycleRow()], error: null } },
    });

    const { result, rerender } = renderHook(({ enabled }) => useCycles(asClient(fake), enabled), {
      initialProps: { enabled: false },
    });

    expect(result.current.status).toBe('idle');
    expect(fake.fromCalls).toHaveLength(0);

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.status).toBe('loaded'));
    expect(fake.fromCalls).toHaveLength(1);

    act(() => result.current.retry());
    await waitFor(() => expect(fake.fromCalls).toHaveLength(2));
  });
});

describe('useCycles - mutations', () => {
  const existingCycle: TrainingCycle = {
    id: 'c1',
    name: 'Power Cycle',
    isActive: true,
    templates: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  async function loadedHook(cycles: TrainingCycle[]) {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: {
        cycles: {
          data: cycles.map(c => ({ id: c.id, name: c.name, is_active: c.isActive, templates: c.templates, user_id: 'owner-1', created_at: c.createdAt })),
          error: null,
        },
      },
    });
    const rendered = renderHook(() => useCycles(asClient(fake), true));
    await waitFor(() => expect(rendered.result.current.status).toBe('loaded'));
    return { fake, ...rendered };
  }

  it('replaces the cycle in place when editing an existing one', async () => {
    const { result } = await loadedHook([existingCycle]);
    const edited: TrainingCycle = { ...existingCycle, name: 'Renamed Cycle' };

    await act(async () => {
      await result.current.saveCycle(edited);
    });

    expect(result.current.cycles).toEqual([edited]);
  });

  it('optimistically deactivates other cycles and awaits the deactivate-others write when creating a new one', async () => {
    const { result, fake } = await loadedHook([existingCycle]);
    const newCycle: TrainingCycle = { id: 'c2', name: 'New Cycle', isActive: true, templates: [], createdAt: '2026-02-01T00:00:00.000Z' };

    let saveResult;
    await act(async () => {
      saveResult = await result.current.saveCycle(newCycle);
    });

    expect(saveResult).toEqual({ ok: true, value: {} });
    expect(result.current.cycles).toEqual([{ ...existingCycle, isActive: false }, newCycle]);
    expect(fake.builders.cycles.calls).toContainEqual({ method: 'neq', args: ['id', 'c2'] });
  });

  it('keeps the optimistic update and reports the failure when the deactivate-others write fails', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: {
        cycles: [
          // initial list load
          { data: [{ id: 'c1', name: 'Power Cycle', is_active: true, templates: [], user_id: 'owner-1', created_at: '2026-01-01T00:00:00.000Z' }], error: null },
          // upsertCycle (the primary write) succeeds
          { data: null, error: null },
          // deactivateOtherCycles fails
          { data: null, error: new Error('deactivate failed') },
        ],
      },
    });
    const { result } = renderHook(() => useCycles(asClient(fake), true));
    await waitFor(() => expect(result.current.status).toBe('loaded'));

    const newCycle: TrainingCycle = { id: 'c2', name: 'New Cycle', isActive: true, templates: [], createdAt: '2026-02-01T00:00:00.000Z' };

    let saveResult;
    await act(async () => {
      saveResult = await result.current.saveCycle(newCycle);
    });

    expect(saveResult).toEqual({ ok: true, value: { deactivateOthersError: expect.any(Error) } });
    expect(result.current.cycles).toEqual([{ ...existingCycle, isActive: false }, newCycle]);
  });

  it('removes a cycle locally only after the delete succeeds', async () => {
    const { result } = await loadedHook([existingCycle]);

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.removeCycle('c1');
    });

    expect(deleteResult).toEqual({ ok: true, value: undefined });
    expect(result.current.cycles).toEqual([]);
  });
});
