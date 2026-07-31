"use client";

import { notFound, useRouter } from 'next/navigation';
import { useGymData } from '../../../../../lib/data/GymDataProvider';
import CycleFormView from '../../../../../components/CycleFormView';
import { useMessages } from '../../../../../components/ui/MessageProvider';
import { TrainingCycle } from '../../../../../types';

interface EditCycleClientProps {
  cycleId: string;
}

export default function EditCycleClient({ cycleId }: EditCycleClientProps) {
  const { cycles, saveCycle } = useGymData();
  const router = useRouter();
  const { showMessage } = useMessages();

  const cycle = cycles.find(c => c.id === cycleId);
  if (!cycle) notFound();

  const handleSaveCycle = async (updated: TrainingCycle) => {
    const result = await saveCycle(updated);
    if (!result.ok) {
      console.error(result.error);
      showMessage('error', 'Error saving cycle to database!');
      return;
    }

    router.push(`/cycles/${updated.id}`);
  };

  return <CycleFormView initialCycle={cycle} backHref={`/cycles/${cycle.id}`} onSaveCycle={handleSaveCycle} />;
}
