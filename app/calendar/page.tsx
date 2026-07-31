import { requireUser } from '../../lib/requireUser';
import { listWorkoutSessions } from '../../lib/data/workoutSessions';
import CalendarView from '../../components/CalendarView';

export default async function CalendarPage() {
  const { supabase } = await requireUser();

  const historyResult = await listWorkoutSessions(supabase);
  if (!historyResult.ok) throw new Error("Couldn't load your workout history.");

  return <CalendarView history={historyResult.value} />;
}
