import { describe, it, expect } from 'vitest';
import { resolveWorkoutOrigin } from './workoutOrigin';

describe('resolveWorkoutOrigin', () => {
  it('returns home when the workout was opened from the home dashboard', () => {
    expect(resolveWorkoutOrigin('home')).toBe('home');
  });

  it('returns cycle when the workout was opened from the cycle detail view', () => {
    expect(resolveWorkoutOrigin('cycle')).toBe('cycle');
  });

  it('returns stats when the workout was opened from the stats view', () => {
    expect(resolveWorkoutOrigin('stats')).toBe('stats');
  });

  it('falls back to cycle for view states that cannot open a workout', () => {
    expect(resolveWorkoutOrigin('new_cycle')).toBe('cycle');
    expect(resolveWorkoutOrigin('edit_cycle')).toBe('cycle');
    expect(resolveWorkoutOrigin('workout')).toBe('cycle');
  });
});
