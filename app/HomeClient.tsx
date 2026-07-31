"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { deleteCycle } from '../lib/data/cycles';
import HomeView from '../components/HomeView';
import { useMessages } from '../components/ui/MessageProvider';
import { TrainingCycle, WorkoutSession } from '../types';

interface HomeClientProps {
  initialCycles: TrainingCycle[];
  initialHistory: WorkoutSession[];
}

export default function HomeClient({ initialCycles, initialHistory }: HomeClientProps) {
  const [cycles, setCycles] = useState(initialCycles);
  const [history, setHistory] = useState(initialHistory);
  const { showMessage } = useMessages();

  const handleDeleteCycle = async (id: string) => {
    const result = await deleteCycle(supabase, id);
    if (!result.ok) {
      console.error(result.error);
      showMessage('error', 'Error deleting cycle!');
      return;
    }
    setCycles(prev => prev.filter(c => c.id !== id));
    setHistory(prev => prev.filter(h => h.cycleId !== id));
  };

  return <HomeView cycles={cycles} history={history} onDeleteCycle={handleDeleteCycle} />;
}
