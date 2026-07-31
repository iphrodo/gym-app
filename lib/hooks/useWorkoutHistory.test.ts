import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, renderHook, waitFor, act } from '@testing-library/react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useWorkoutHistory } from './useWorkoutHistory';
import { createFakeSupabaseClient, FakeSupabaseClient } from '../data/testSupabaseClient';
import { WorkoutSession } from '../../types';

afterEach(() => {
  cleanup();
});

function asClient(fake: FakeSupabaseClient): SupabaseClient {
  return fake as unknown as SupabaseClient;
}

function sessionRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 's1',
    cycle_id: 'c1',
    date: '2026-07-01',
    day_label: 'Push',
    day_number: 1,
    data: [],
    user_id: 'owner-1',
    created_at: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('useWorkoutHistory - loading', () => {
  it('loads existing history for the account', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { workout_sessions: { data: [sessionRow()], error: null } },
    });

    const { result } = renderHook(() => useWorkoutHistory(asClient(fake), true));

    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('loaded'));
    expect(result.current.history).toEqual([
      { id: 's1', cycleId: 'c1', date: '2026-07-01', dayLabel: 'Push', dayNumber: 1, data: [], createdAt: '2026-07-01T00:00:00.000Z' },
    ]);
  });

  it('reports an error when the fetch fails', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { workout_sessions: { data: null, error: new Error('down') } },
    });

    const { result } = renderHook(() => useWorkoutHistory(asClient(fake), true));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe("Couldn't load your workout history.");
  });

  it('does not fetch while disabled, and retry triggers a refetch', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { workout_sessions: { data: [sessionRow()], error: null } },
    });

    const { result, rerender } = renderHook(({ enabled }) => useWorkoutHistory(asClient(fake), enabled), {
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

describe('useWorkoutHistory - mutations', () => {
  const existingSession: WorkoutSession = {
    id: 's1',
    cycleId: 'c1',
    date: '2026-07-01',
    dayLabel: 'Push',
    dayNumber: 1,
    data: [],
    createdAt: '2026-07-01T00:00:00.000Z',
  };

  async function loadedHook(sessions: WorkoutSession[]) {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: {
        workout_sessions: {
          data: sessions.map(s => ({
            id: s.id,
            cycle_id: s.cycleId,
            date: s.date,
            day_label: s.dayLabel,
            day_number: s.dayNumber,
            data: s.data,
            user_id: 'owner-1',
            created_at: s.createdAt,
          })),
          error: null,
        },
      },
    });
    const rendered = renderHook(() => useWorkoutHistory(asClient(fake), true));
    await waitFor(() => expect(rendered.result.current.status).toBe('loaded'));
    return { fake, ...rendered };
  }

  it('does not update local history until the save succeeds', async () => {
    const fake = createFakeSupabaseClient({
      user: { id: 'owner-1' },
      tableResults: { workout_sessions: [{ data: [], error: null }, { data: null, error: new Error('write failed') }] },
    });
    const { result } = renderHook(() => useWorkoutHistory(asClient(fake), true));
    await waitFor(() => expect(result.current.status).toBe('loaded'));

    let saveResult;
    await act(async () => {
      saveResult = await result.current.saveSession(existingSession);
    });

    expect(saveResult).toEqual({ ok: false, error: expect.any(Error) });
    expect(result.current.history).toEqual([]);
  });

  it('replaces the session in place when editing an existing one', async () => {
    const { result } = await loadedHook([existingSession]);
    const edited: WorkoutSession = { ...existingSession, dayLabel: 'Renamed' };

    await act(async () => {
      await result.current.saveSession(edited);
    });

    expect(result.current.history).toEqual([edited]);
  });

  it('appends a new session after a successful save', async () => {
    const { result } = await loadedHook([]);
    const newSession: WorkoutSession = { ...existingSession, id: 's2' };

    await act(async () => {
      await result.current.saveSession(newSession);
    });

    expect(result.current.history).toEqual([newSession]);
  });

  it('removes a session locally only after the delete succeeds', async () => {
    const { result } = await loadedHook([existingSession]);

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.removeSession('s1');
    });

    expect(deleteResult).toEqual({ ok: true, value: undefined });
    expect(result.current.history).toEqual([]);
  });

  it('removes sessions for a cycle locally, without a network call', async () => {
    const { result, fake } = await loadedHook([existingSession, { ...existingSession, id: 's2', cycleId: 'c2' }]);
    const callsBefore = fake.fromCalls.length;

    act(() => result.current.removeSessionsForCycle('c1'));

    expect(result.current.history).toEqual([{ ...existingSession, id: 's2', cycleId: 'c2' }]);
    expect(fake.fromCalls).toHaveLength(callsBefore);
  });
});
