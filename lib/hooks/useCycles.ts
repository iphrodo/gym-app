import { useCallback, useEffect, useReducer, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { TrainingCycle } from '../../types';
import { Result, ok } from '../data/result';
import { listCycles, upsertCycle, deactivateOtherCycles, deleteCycle } from '../data/cycles';

const DEFAULT_CYCLE_TEMPLATE: Omit<TrainingCycle, 'createdAt'> = {
  id: 'cycle-2024-v1',
  name: 'Power Cycle v1',
  isActive: true,
  templates: [
    {
      dayNumber: 1,
      label: 'Back & Triceps',
      exercises: ['Lat Pulldown', 'Reverse Flyes', 'Shrugs', 'Close-Grip Bench', 'Triceps Machine'],
    },
    {
      dayNumber: 2,
      label: 'Chest & Biceps',
      exercises: ['Bench Press', 'Incline Bench', 'Dumbbell Flyes', 'Barbell Curls', 'Dumbbell Curls'],
    },
    {
      dayNumber: 3,
      label: 'Legs & Shoulders',
      exercises: ['Leg Press', 'Leg Extensions', 'Leg Curls', 'Dumbbell Shoulder Press', 'Abs'],
    },
  ],
};

export type CyclesStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface CyclesState {
  cycles: TrainingCycle[];
  status: CyclesStatus;
  error: string | null;
}

const initialState: CyclesState = { cycles: [], status: 'idle', error: null };

type CyclesAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; cycles: TrainingCycle[] }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'SET_CYCLES'; cycles: TrainingCycle[] }
  | { type: 'RESET' };

function reducer(state: CyclesState, action: CyclesAction): CyclesState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { cycles: action.cycles, status: 'loaded', error: null };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.message };
    case 'SET_CYCLES':
      return { ...state, cycles: action.cycles };
    case 'RESET':
      return initialState;
  }
}

export function useCycles(client: SupabaseClient, enabled: boolean) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      dispatch({ type: 'LOAD_START' });

      const listResult = await listCycles(client);
      if (cancelled) return;
      if (!listResult.ok) {
        dispatch({ type: 'LOAD_ERROR', message: "Couldn't load your cycles." });
        return;
      }

      if (listResult.value.length > 0) {
        dispatch({ type: 'LOAD_SUCCESS', cycles: listResult.value });
        return;
      }

      const defaultCycle: TrainingCycle = { ...DEFAULT_CYCLE_TEMPLATE, createdAt: new Date().toISOString() };
      const seedResult = await upsertCycle(client, defaultCycle);
      if (cancelled) return;
      if (!seedResult.ok) {
        dispatch({ type: 'LOAD_ERROR', message: "Couldn't set up your account." });
        return;
      }
      dispatch({ type: 'LOAD_SUCCESS', cycles: [defaultCycle] });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [client, enabled, retryToken]);

  const retry = useCallback(() => setRetryToken(t => t + 1), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const saveCycle = useCallback(
    async (cycle: TrainingCycle): Promise<Result<{ deactivateOthersError?: unknown }>> => {
      const result = await upsertCycle(client, cycle);
      if (!result.ok) return result;

      const existingIndex = state.cycles.findIndex(c => c.id === cycle.id);
      if (existingIndex >= 0) {
        const newCycles = [...state.cycles];
        newCycles[existingIndex] = cycle;
        dispatch({ type: 'SET_CYCLES', cycles: newCycles });
        return ok({});
      }

      // The new cycle is already saved at this point, so the optimistic
      // local update stays even if the deactivate-others write below fails —
      // reverting it would show the new cycle as gone when it isn't.
      dispatch({ type: 'SET_CYCLES', cycles: [...state.cycles.map(c => ({ ...c, isActive: false })), cycle] });

      const deactivateResult = await deactivateOtherCycles(client, cycle.id);
      if (!deactivateResult.ok) {
        return ok({ deactivateOthersError: deactivateResult.error });
      }
      return ok({});
    },
    [client, state.cycles]
  );

  const removeCycle = useCallback(
    async (id: string): Promise<Result<void>> => {
      const result = await deleteCycle(client, id);
      if (!result.ok) return result;
      dispatch({ type: 'SET_CYCLES', cycles: state.cycles.filter(c => c.id !== id) });
      return ok(undefined);
    },
    [client, state.cycles]
  );

  return {
    cycles: state.cycles,
    status: state.status,
    error: state.error,
    retry,
    reset,
    saveCycle,
    removeCycle,
  };
}
