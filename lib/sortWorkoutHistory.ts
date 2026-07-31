import { WorkoutSession } from '../types';

export function sortHistoryNewestFirst(history: WorkoutSession[]): WorkoutSession[] {
  return history
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
