import { notFound } from 'next/navigation';
import { requireUser } from '../../../lib/requireUser';
import { listWorkoutSessions } from '../../../lib/data/workoutSessions';
import WorkoutSessionClient from '../WorkoutSessionClient';

interface EditWorkoutPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { sessionId } = await params;
  const { supabase } = await requireUser();

  const historyResult = await listWorkoutSessions(supabase);
  if (!historyResult.ok) throw new Error("Couldn't load your workout history.");

  const session = historyResult.value.find(s => s.id === sessionId);
  if (!session) notFound();

  return <WorkoutSessionClient initialSession={session} />;
}
