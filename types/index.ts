export interface DayTemplate {
  dayNumber: number;
  label: string;
  exercises: string[];
}

export interface TrainingCycle {
  id: string;
  name: string;
  isActive: boolean;
  templates: DayTemplate[];
  userId: string;
  createdAt: string;
}

export interface ExerciseSet {
  name: string;
  weight: string;
  reps: string;
  comment: string;
}

export interface WorkoutSession {
  id: string;
  cycleId: string;
  date: string; // format: YYYY-MM-DD
  dayLabel: string;
  dayNumber: number;
  data: ExerciseSet[];
  userId: string;
  createdAt: string;
}
