import { notFound } from 'next/navigation';
import { requireUser } from '../../../lib/requireUser';
import { listCycles } from '../../../lib/data/cycles';
import { listWorkoutSessions } from '../../../lib/data/workoutSessions';
import CycleDetailClient from './CycleDetailClient';

interface CyclePageProps {
  params: Promise<{ cycleId: string }>;
}

export default async function CyclePage({ params }: CyclePageProps) {
  const { cycleId } = await params;
  const { supabase } = await requireUser();

  const [cyclesResult, historyResult] = await Promise.all([
    listCycles(supabase),
    listWorkoutSessions(supabase),
  ]);

  if (!cyclesResult.ok) throw new Error("Couldn't load your cycles.");
  if (!historyResult.ok) throw new Error("Couldn't load your workout history.");

  const cycle = cyclesResult.value.find(c => c.id === cycleId);
  if (!cycle) notFound();

  const cycleHistory = historyResult.value.filter(h => h.cycleId === cycleId);

  return <CycleDetailClient cycle={cycle} initialCycleHistory={cycleHistory} />;
}
