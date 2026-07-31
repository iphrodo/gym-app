import { notFound } from 'next/navigation';
import { requireUser } from '../../../../../lib/requireUser';
import { listCycles } from '../../../../../lib/data/cycles';
import { normalizeExerciseSet } from '../../../../../lib/exerciseValues';
import WorkoutSessionClient from '../../../../workouts/WorkoutSessionClient';
import { WorkoutSession } from '../../../../../types';

interface NewWorkoutPageProps {
  params: Promise<{ cycleId: string }>;
  searchParams: Promise<{ day?: string }>;
}

export default async function NewWorkoutPage({ params, searchParams }: NewWorkoutPageProps) {
  const { cycleId } = await params;
  const { day } = await searchParams;
  const { supabase } = await requireUser();

  const cyclesResult = await listCycles(supabase);
  if (!cyclesResult.ok) throw new Error("Couldn't load your cycles.");

  const cycle = cyclesResult.value.find(c => c.id === cycleId);
  if (!cycle) notFound();

  const dayNumber = Number(day);
  const template = cycle.templates.find(t => t.dayNumber === dayNumber);
  if (!template) notFound();

  const newSession: WorkoutSession = {
    id: crypto.randomUUID(),
    cycleId: cycle.id,
    date: new Date().toISOString().split('T')[0],
    dayLabel: template.label || `Day ${template.dayNumber}`,
    dayNumber: template.dayNumber,
    data: template.exercises.map(name => normalizeExerciseSet({ name })),
    createdAt: new Date().toISOString(),
  };

  return <WorkoutSessionClient initialSession={newSession} />;
}
