import { requireUser } from '../../../lib/requireUser';
import NewCycleClient from './NewCycleClient';

export default async function NewCyclePage() {
  await requireUser();
  return <NewCycleClient />;
}
