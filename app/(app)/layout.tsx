import { ReactNode } from 'react';
import { requireUser } from '../../lib/requireUser';
import { listCycles, upsertCycle } from '../../lib/data/cycles';
import { listWorkoutSessions } from '../../lib/data/workoutSessions';
import GymDataProvider from '../../lib/data/GymDataProvider';
import { TrainingCycle } from '../../types';

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

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { supabase } = await requireUser();

  const [cyclesResult, historyResult] = await Promise.all([
    listCycles(supabase),
    listWorkoutSessions(supabase),
  ]);

  if (!cyclesResult.ok) throw new Error("Couldn't load your cycles.");
  if (!historyResult.ok) throw new Error("Couldn't load your workout history.");

  let cycles = cyclesResult.value;
  if (cycles.length === 0) {
    const defaultCycle: TrainingCycle = { ...DEFAULT_CYCLE_TEMPLATE, createdAt: new Date().toISOString() };
    const seedResult = await upsertCycle(supabase, defaultCycle);
    if (!seedResult.ok) throw new Error("Couldn't set up your account.");
    cycles = [defaultCycle];
  }

  return (
    <GymDataProvider initialCycles={cycles} initialHistory={historyResult.value}>
      {children}
    </GymDataProvider>
  );
}
