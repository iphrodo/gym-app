import { describe, it, expect } from 'vitest';
import { sortHistoryNewestFirst } from './sortWorkoutHistory';
import { WorkoutSession } from '../types';

function session(id: string, date: string): WorkoutSession {
  return { id, cycleId: 'c1', date, dayLabel: 'Day', dayNumber: 1, data: [], userId: 'u1' };
}

describe('sortHistoryNewestFirst', () => {
  it('sorts sessions newest date first regardless of input order', () => {
    const history = [
      session('1', '2026-07-19'),
      session('2', '2026-07-28'),
      session('3', '2026-07-22'),
      session('4', '2026-07-17'),
    ];

    const sorted = sortHistoryNewestFirst(history);

    expect(sorted.map(s => s.date)).toEqual([
      '2026-07-28',
      '2026-07-22',
      '2026-07-19',
      '2026-07-17',
    ]);
  });

  it('breaks ties on the same date by descending id', () => {
    const history = [
      session('100', '2026-07-19'),
      session('200', '2026-07-19'),
    ];

    const sorted = sortHistoryNewestFirst(history);

    expect(sorted.map(s => s.id)).toEqual(['200', '100']);
  });

  it('does not mutate the input array', () => {
    const history = [session('1', '2026-07-19'), session('2', '2026-07-28')];
    const original = [...history];

    sortHistoryNewestFirst(history);

    expect(history).toEqual(original);
  });
});
