import EditWorkoutClient from './EditWorkoutClient';

interface EditWorkoutPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { sessionId } = await params;
  return <EditWorkoutClient sessionId={sessionId} />;
}
