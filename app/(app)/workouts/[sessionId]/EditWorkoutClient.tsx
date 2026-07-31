"use client";

import { notFound } from 'next/navigation';
import { useGymData } from '../../../../lib/data/GymDataProvider';
import WorkoutSessionClient from '../WorkoutSessionClient';

interface EditWorkoutClientProps {
  sessionId: string;
}

export default function EditWorkoutClient({ sessionId }: EditWorkoutClientProps) {
  const { history } = useGymData();

  const session = history.find(s => s.id === sessionId);
  if (!session) notFound();

  return <WorkoutSessionClient initialSession={session} />;
}
