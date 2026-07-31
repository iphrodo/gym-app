"use client";

import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { upsertCycle, deactivateOtherCycles } from '../../../lib/data/cycles';
import CycleFormView from '../../../components/CycleFormView';
import { useMessages } from '../../../components/ui/MessageProvider';
import { TrainingCycle } from '../../../types';

export default function NewCycleClient() {
  const router = useRouter();
  const { showMessage } = useMessages();

  const handleSaveCycle = async (cycle: TrainingCycle) => {
    const result = await upsertCycle(supabase, cycle);
    if (!result.ok) {
      console.error(result.error);
      showMessage('error', 'Error saving cycle to database!');
      return;
    }

    const deactivateResult = await deactivateOtherCycles(supabase, cycle.id);
    if (!deactivateResult.ok) {
      console.error(deactivateResult.error);
      showMessage('error', "Cycle created, but couldn't deactivate your other cycles — you may need to fix this manually.");
    }

    router.push('/');
    router.refresh();
  };

  return <CycleFormView backHref="/" onSaveCycle={handleSaveCycle} />;
}
