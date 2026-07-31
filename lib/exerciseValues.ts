import { ExerciseSet } from '../types';

export function parseWeight(weight: string): number | null {
  if (weight.trim() === '') return null;
  const value = Number(weight);
  return Number.isFinite(value) ? value : null;
}

export function normalizeExerciseSet(raw: Partial<ExerciseSet> & { name: string }): ExerciseSet {
  return {
    name: raw.name,
    weight: raw.weight ?? '',
    reps: raw.reps ?? '',
    comment: raw.comment ?? '',
  };
}
