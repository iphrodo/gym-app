import EditCycleClient from './EditCycleClient';

interface EditCyclePageProps {
  params: Promise<{ cycleId: string }>;
}

export default async function EditCyclePage({ params }: EditCyclePageProps) {
  const { cycleId } = await params;
  return <EditCycleClient cycleId={cycleId} />;
}
