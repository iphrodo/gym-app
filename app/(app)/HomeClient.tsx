"use client";

import { useGymData } from '../../lib/data/GymDataProvider';
import HomeView from '../../components/HomeView';
import { useMessages } from '../../components/ui/MessageProvider';

export default function HomeClient() {
  const { cycles, history, deleteCycle } = useGymData();
  const { showMessage } = useMessages();

  const handleDeleteCycle = async (id: string) => {
    const result = await deleteCycle(id);
    if (!result.ok) {
      console.error(result.error);
      showMessage('error', 'Error deleting cycle!');
    }
  };

  return <HomeView cycles={cycles} history={history} onDeleteCycle={handleDeleteCycle} />;
}
