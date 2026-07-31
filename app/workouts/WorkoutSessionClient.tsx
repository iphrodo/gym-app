"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { upsertWorkoutSession } from '../../lib/data/workoutSessions';
import WorkoutView from '../../components/WorkoutView';
import { WorkoutSession } from '../../types';

interface WorkoutSessionClientProps {
  initialSession: WorkoutSession;
}

export default function WorkoutSessionClient({ initialSession }: WorkoutSessionClientProps) {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState(initialSession);

  const updateSessionDate = (date: string) => {
    setActiveSession(prev => ({ ...prev, date }));
  };

  const updateExerciseValues = (exerciseName: string, field: 'weight' | 'reps' | 'comment', value: string) => {
    setActiveSession(prev => ({
      ...prev,
      data: prev.data.map(item => (item.name === exerciseName ? { ...item, [field]: value } : item)),
    }));
  };

  const handleSave = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      alert("Supabase connection is missing — no save was attempted.");
      return;
    }

    const result = await upsertWorkoutSession(supabase, activeSession);
    if (!result.ok) {
      console.error(result.error);
      alert("Error saving to database!");
      return;
    }

    alert("Workout saved!");
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <WorkoutView
      activeSession={activeSession}
      onCancel={handleCancel}
      onSave={handleSave}
      onUpdateDate={updateSessionDate}
      onUpdateExercise={updateExerciseValues}
    />
  );
}
