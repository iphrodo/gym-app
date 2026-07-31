"use client";

import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { upsertCycle } from '../../../../lib/data/cycles';
import CycleFormView from '../../../../components/CycleFormView';
import { TrainingCycle } from '../../../../types';

interface EditCycleClientProps {
  cycle: TrainingCycle;
}

export default function EditCycleClient({ cycle }: EditCycleClientProps) {
  const router = useRouter();

  const handleSaveCycle = async (updated: TrainingCycle) => {
    const result = await upsertCycle(supabase, updated);
    if (!result.ok) {
      console.error(result.error);
      alert("Error saving cycle to database!");
      return;
    }

    router.push(`/cycles/${updated.id}`);
    router.refresh();
  };

  return <CycleFormView initialCycle={cycle} backHref={`/cycles/${cycle.id}`} onSaveCycle={handleSaveCycle} />;
}
