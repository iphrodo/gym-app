"use client";

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { useGymData } from '../../../../../../lib/data/GymDataProvider';
import { normalizeExerciseSet } from '../../../../../../lib/exerciseValues';
import WorkoutSessionClient from '../../../../workouts/WorkoutSessionClient';
import { WorkoutSession } from '../../../../../../types';

interface NewWorkoutClientProps {
  cycleId: string;
  day?: string;
}

export default function NewWorkoutClient({ cycleId, day }: NewWorkoutClientProps) {
  const { cycles } = useGymData();

  const cycle = cycles.find(c => c.id === cycleId);
  if (!cycle) notFound();

  const dayNumber = Number(day);
  const template = cycle.templates.find(t => t.dayNumber === dayNumber);
  if (!template) notFound();

  const [newSession] = useState<WorkoutSession>(() => ({
    id: crypto.randomUUID(),
    cycleId: cycle.id,
    date: new Date().toISOString().split('T')[0],
    dayLabel: template.label || `Day ${template.dayNumber}`,
    dayNumber: template.dayNumber,
    data: template.exercises.map(name => normalizeExerciseSet({ name })),
    createdAt: new Date().toISOString(),
  }));

  return <WorkoutSessionClient initialSession={newSession} />;
}
