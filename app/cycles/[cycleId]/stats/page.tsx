import { notFound } from 'next/navigation';
import { requireUser } from '../../../../lib/requireUser';
import { listCycles } from '../../../../lib/data/cycles';
import { listWorkoutSessions } from '../../../../lib/data/workoutSessions';
import StatsView from '../../../../components/StatsView';

interface StatsPageProps {
  params: Promise<{ cycleId: string }>;
}

export default async function StatsPage({ params }: StatsPageProps) {
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

  return <StatsView cycle={cycle} history={cycleHistory} />;
}
