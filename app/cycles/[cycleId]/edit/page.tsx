import { notFound } from 'next/navigation';
import { requireUser } from '../../../../lib/requireUser';
import { listCycles } from '../../../../lib/data/cycles';
import EditCycleClient from './EditCycleClient';

interface EditCyclePageProps {
  params: Promise<{ cycleId: string }>;
}

export default async function EditCyclePage({ params }: EditCyclePageProps) {
  const { cycleId } = await params;
  const { supabase } = await requireUser();

  const cyclesResult = await listCycles(supabase);
  if (!cyclesResult.ok) throw new Error("Couldn't load your cycles.");

  const cycle = cyclesResult.value.find(c => c.id === cycleId);
  if (!cycle) notFound();

  return <EditCycleClient cycle={cycle} />;
}
