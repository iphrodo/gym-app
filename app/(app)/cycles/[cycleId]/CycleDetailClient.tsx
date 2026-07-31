"use client";

import { notFound } from 'next/navigation';
import { useGymData } from '../../../../lib/data/GymDataProvider';
import CycleView from '../../../../components/CycleView';
import { useMessages } from '../../../../components/ui/MessageProvider';

interface CycleDetailClientProps {
  cycleId: string;
}

export default function CycleDetailClient({ cycleId }: CycleDetailClientProps) {
  const { cycles, history, deleteWorkoutSession } = useGymData();
  const { showMessage } = useMessages();

  const cycle = cycles.find(c => c.id === cycleId);
  if (!cycle) notFound();

  const cycleHistory = history.filter(h => h.cycleId === cycleId);

  const handleDeleteSession = async (sessionId: string) => {
    const result = await deleteWorkoutSession(sessionId);
    if (!result.ok) {
      console.error(result.error);
      showMessage('error', 'Error deleting workout!');
    }
  };

  return <CycleView selectedCycle={cycle} cycleHistory={cycleHistory} onDeleteSession={handleDeleteSession} />;
}
