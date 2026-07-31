"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { TrainingCycle, WorkoutSession } from '../../types';
import {
  upsertCycle,
  deleteCycle as deleteCycleRequest,
  deactivateOtherCycles as deactivateOtherCyclesRequest,
} from './cycles';
import {
  upsertWorkoutSession,
  deleteWorkoutSession as deleteWorkoutSessionRequest,
} from './workoutSessions';
import { Result } from './result';

interface GymDataContextValue {
  cycles: TrainingCycle[];
  history: WorkoutSession[];
  saveCycle: (cycle: TrainingCycle) => Promise<Result<void>>;
  deleteCycle: (id: string) => Promise<Result<void>>;
  deactivateOtherCycles: (keepCycleId: string) => Promise<Result<void>>;
  saveWorkoutSession: (session: WorkoutSession) => Promise<Result<void>>;
  deleteWorkoutSession: (id: string) => Promise<Result<void>>;
}

const GymDataContext = createContext<GymDataContextValue | null>(null);

interface GymDataProviderProps {
  initialCycles: TrainingCycle[];
  initialHistory: WorkoutSession[];
  children: ReactNode;
}

export default function GymDataProvider({ initialCycles, initialHistory, children }: GymDataProviderProps) {
  const [cycles, setCycles] = useState(initialCycles);
  const [history, setHistory] = useState(initialHistory);

  const saveCycle = async (cycle: TrainingCycle) => {
    const result = await upsertCycle(supabase, cycle);
    if (result.ok) {
      setCycles(prev => {
        const exists = prev.some(c => c.id === cycle.id);
        return exists ? prev.map(c => (c.id === cycle.id ? cycle : c)) : [...prev, cycle];
      });
    }
    return result;
  };

  const deleteCycle = async (id: string) => {
    const result = await deleteCycleRequest(supabase, id);
    if (result.ok) {
      setCycles(prev => prev.filter(c => c.id !== id));
      setHistory(prev => prev.filter(h => h.cycleId !== id));
    }
    return result;
  };

  const deactivateOtherCycles = async (keepCycleId: string) => {
    const result = await deactivateOtherCyclesRequest(supabase, keepCycleId);
    if (result.ok) {
      setCycles(prev => prev.map(c => (c.id === keepCycleId ? c : { ...c, isActive: false })));
    }
    return result;
  };

  const saveWorkoutSession = async (session: WorkoutSession) => {
    const result = await upsertWorkoutSession(supabase, session);
    if (result.ok) {
      setHistory(prev => {
        const exists = prev.some(h => h.id === session.id);
        return exists ? prev.map(h => (h.id === session.id ? session : h)) : [...prev, session];
      });
    }
    return result;
  };

  const deleteWorkoutSession = async (id: string) => {
    const result = await deleteWorkoutSessionRequest(supabase, id);
    if (result.ok) {
      setHistory(prev => prev.filter(h => h.id !== id));
    }
    return result;
  };

  return (
    <GymDataContext.Provider
      value={{ cycles, history, saveCycle, deleteCycle, deactivateOtherCycles, saveWorkoutSession, deleteWorkoutSession }}
    >
      {children}
    </GymDataContext.Provider>
  );
}

export function useGymData() {
  const context = useContext(GymDataContext);
  if (!context) throw new Error('useGymData must be used within a GymDataProvider');
  return context;
}
