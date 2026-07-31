import { useCallback, useEffect, useReducer, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { WorkoutSession } from '../../types';
import { Result, ok } from '../data/result';
import { listWorkoutSessions, upsertWorkoutSession, deleteWorkoutSession } from '../data/workoutSessions';

export type WorkoutHistoryStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface WorkoutHistoryState {
  history: WorkoutSession[];
  status: WorkoutHistoryStatus;
  error: string | null;
}

const initialState: WorkoutHistoryState = { history: [], status: 'idle', error: null };

type WorkoutHistoryAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; history: WorkoutSession[] }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'SET_HISTORY'; history: WorkoutSession[] }
  | { type: 'RESET' };

function reducer(state: WorkoutHistoryState, action: WorkoutHistoryAction): WorkoutHistoryState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { history: action.history, status: 'loaded', error: null };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.message };
    case 'SET_HISTORY':
      return { ...state, history: action.history };
    case 'RESET':
      return initialState;
  }
}

export function useWorkoutHistory(client: SupabaseClient, enabled: boolean) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      dispatch({ type: 'LOAD_START' });

      const result = await listWorkoutSessions(client);
      if (cancelled) return;
      if (!result.ok) {
        dispatch({ type: 'LOAD_ERROR', message: "Couldn't load your workout history." });
        return;
      }
      dispatch({ type: 'LOAD_SUCCESS', history: result.value });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [client, enabled, retryToken]);

  const retry = useCallback(() => setRetryToken(t => t + 1), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const saveSession = useCallback(
    async (session: WorkoutSession): Promise<Result<void>> => {
      const result = await upsertWorkoutSession(client, session);
      if (!result.ok) return result;

      const existingIndex = state.history.findIndex(h => h.id === session.id);
      if (existingIndex >= 0) {
        const newHistory = [...state.history];
        newHistory[existingIndex] = session;
        dispatch({ type: 'SET_HISTORY', history: newHistory });
      } else {
        dispatch({ type: 'SET_HISTORY', history: [...state.history, session] });
      }
      return ok(undefined);
    },
    [client, state.history]
  );

  const removeSession = useCallback(
    async (id: string): Promise<Result<void>> => {
      const result = await deleteWorkoutSession(client, id);
      if (!result.ok) return result;
      dispatch({ type: 'SET_HISTORY', history: state.history.filter(h => h.id !== id) });
      return ok(undefined);
    },
    [client, state.history]
  );

  const removeSessionsForCycle = useCallback(
    (cycleId: string) => {
      dispatch({ type: 'SET_HISTORY', history: state.history.filter(h => h.cycleId !== cycleId) });
    },
    [state.history]
  );

  return {
    history: state.history,
    status: state.status,
    error: state.error,
    retry,
    reset,
    saveSession,
    removeSession,
    removeSessionsForCycle,
  };
}
