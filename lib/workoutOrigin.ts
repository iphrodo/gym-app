export type ViewName = 'home' | 'cycle' | 'new_cycle' | 'edit_cycle' | 'workout' | 'stats' | 'calendar';
export type WorkoutOrigin = 'home' | 'cycle' | 'stats' | 'calendar';

export function resolveWorkoutOrigin(currentView: ViewName): WorkoutOrigin {
  if (currentView === 'home' || currentView === 'cycle' || currentView === 'stats' || currentView === 'calendar') {
    return currentView;
  }
  return 'cycle';
}
