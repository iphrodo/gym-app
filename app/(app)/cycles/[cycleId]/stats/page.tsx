import StatsClient from './StatsClient';

interface StatsPageProps {
  params: Promise<{ cycleId: string }>;
}

export default async function StatsPage({ params }: StatsPageProps) {
  const { cycleId } = await params;
  return <StatsClient cycleId={cycleId} />;
}
