import { DayTemplate, ExerciseSet, TrainingCycle, WorkoutSession } from '../../types';
import { normalizeExerciseSet } from '../exerciseValues';

export interface CycleRow {
  id: string;
  name: string;
  is_active: boolean;
  templates: DayTemplate[] | null;
  user_id: string;
  created_at: string;
}

export function cycleFromRow(row: CycleRow): TrainingCycle {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    templates: row.templates ?? [],
    createdAt: row.created_at,
  };
}

export function cycleToRow(cycle: TrainingCycle, ownerId: string): CycleRow {
  return {
    id: cycle.id,
    name: cycle.name,
    is_active: cycle.isActive,
    templates: cycle.templates,
    user_id: ownerId,
    created_at: cycle.createdAt,
  };
}

export interface WorkoutSessionRow {
  id: string;
  cycle_id: string;
  date: string;
  day_label: string;
  day_number: number;
  data: ExerciseSet[] | null;
  user_id: string;
  created_at: string;
}

export function workoutSessionFromRow(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: row.id,
    cycleId: row.cycle_id,
    date: row.date,
    dayLabel: row.day_label,
    dayNumber: row.day_number,
    data: (row.data ?? []).map(normalizeExerciseSet),
    createdAt: row.created_at,
  };
}

export function workoutSessionToRow(session: WorkoutSession, ownerId: string): WorkoutSessionRow {
  return {
    id: session.id,
    cycle_id: session.cycleId,
    date: session.date,
    day_label: session.dayLabel,
    day_number: session.dayNumber,
    data: session.data,
    user_id: ownerId,
    created_at: session.createdAt,
  };
}
