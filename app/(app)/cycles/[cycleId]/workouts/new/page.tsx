import NewWorkoutClient from './NewWorkoutClient';

interface NewWorkoutPageProps {
  params: Promise<{ cycleId: string }>;
  searchParams: Promise<{ day?: string }>;
}

export default async function NewWorkoutPage({ params, searchParams }: NewWorkoutPageProps) {
  const { cycleId } = await params;
  const { day } = await searchParams;
  return <NewWorkoutClient cycleId={cycleId} day={day} />;
}
