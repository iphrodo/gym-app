"use client";

import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { upsertCycle } from '../../../../lib/data/cycles';
import CycleFormView from '../../../../components/CycleFormView';
import { useMessages } from '../../../../components/ui/MessageProvider';
import { TrainingCycle } from '../../../../types';

interface EditCycleClientProps {
  cycle: TrainingCycle;
}

export default function EditCycleClient({ cycle }: EditCycleClientProps) {
  const router = useRouter();
  const { showMessage } = useMessages();

  const handleSaveCycle = async (updated: TrainingCycle) => {
    const result = await upsertCycle(supabase, updated);
    if (!result.ok) {
      console.error(result.error);
      showMessage('error', 'Error saving cycle to database!');
      return;
    }

    router.push(`/cycles/${updated.id}`);
    router.refresh();
  };

  return <CycleFormView initialCycle={cycle} backHref={`/cycles/${cycle.id}`} onSaveCycle={handleSaveCycle} />;
}
