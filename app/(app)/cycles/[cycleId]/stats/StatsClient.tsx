"use client";

import { notFound } from 'next/navigation';
import { useGymData } from '../../../../../lib/data/GymDataProvider';
import StatsView from '../../../../../components/StatsView';

interface StatsClientProps {
  cycleId: string;
}

export default function StatsClient({ cycleId }: StatsClientProps) {
  const { cycles, history } = useGymData();

  const cycle = cycles.find(c => c.id === cycleId);
  if (!cycle) notFound();

  const cycleHistory = history.filter(h => h.cycleId === cycleId);

  return <StatsView cycle={cycle} history={cycleHistory} />;
}
