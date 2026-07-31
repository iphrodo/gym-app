import CycleDetailClient from './CycleDetailClient';

interface CyclePageProps {
  params: Promise<{ cycleId: string }>;
}

export default async function CyclePage({ params }: CyclePageProps) {
  const { cycleId } = await params;
  return <CycleDetailClient cycleId={cycleId} />;
}
