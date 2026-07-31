"use client";

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { deleteWorkoutSession } from '../../../lib/data/workoutSessions';
import CycleView from '../../../components/CycleView';
import { TrainingCycle, WorkoutSession } from '../../../types';

interface CycleDetailClientProps {
  cycle: TrainingCycle;
  initialCycleHistory: WorkoutSession[];
}

export default function CycleDetailClient({ cycle, initialCycleHistory }: CycleDetailClientProps) {
  const [cycleHistory, setCycleHistory] = useState(initialCycleHistory);

  const handleDeleteSession = async (sessionId: string) => {
    const result = await deleteWorkoutSession(supabase, sessionId);
    if (!result.ok) {
      console.error(result.error);
      alert("Error deleting workout!");
      return;
    }
    setCycleHistory(prev => prev.filter(h => h.id !== sessionId));
  };

  return <CycleView selectedCycle={cycle} cycleHistory={cycleHistory} onDeleteSession={handleDeleteSession} />;
}
