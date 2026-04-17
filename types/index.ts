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
}

export interface ExerciseSet {
  name: string;
  weight: string;
}

export interface WorkoutSession {
  id: string; // timestamp
  cycleId: string;
  date: string; // format: YYYY-MM-DD
  dayLabel: string;
  dayNumber: number;
  data: ExerciseSet[];
}
