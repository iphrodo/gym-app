export type ViewName = 'home' | 'cycle' | 'new_cycle' | 'edit_cycle' | 'workout' | 'stats';
export type WorkoutOrigin = 'home' | 'cycle' | 'stats';

export function resolveWorkoutOrigin(currentView: ViewName): WorkoutOrigin {
  if (currentView === 'home' || currentView === 'cycle' || currentView === 'stats') {
    return currentView;
  }
  return 'cycle';
}
