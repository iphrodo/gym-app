import { describe, it, expect } from 'vitest';
import { sortHistoryNewestFirst } from './sortWorkoutHistory';
import { WorkoutSession } from '../types';

function session(id: string, date: string, createdAt: string = date): WorkoutSession {
  return { id, cycleId: 'c1', date, dayLabel: 'Day', dayNumber: 1, data: [], userId: 'u1', createdAt };
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

  it('breaks ties on the same date by descending createdAt', () => {
    const history = [
      session('100', '2026-07-19', '2026-07-19T08:00:00.000Z'),
      session('200', '2026-07-19', '2026-07-19T09:00:00.000Z'),
    ];

    const sorted = sortHistoryNewestFirst(history);

    expect(sorted.map(s => s.id)).toEqual(['200', '100']);
  });

  it('breaks ties correctly across legacy numeric ids and new UUIDs', () => {
    const history = [
      session('1753000000000', '2026-07-19', '2026-07-19T08:00:00.000Z'),
      session('a1b2c3d4-e5f6-47a8-9bcd-1234567890ab', '2026-07-19', '2026-07-19T09:00:00.000Z'),
    ];

    const sorted = sortHistoryNewestFirst(history);

    expect(sorted.map(s => s.id)).toEqual([
      'a1b2c3d4-e5f6-47a8-9bcd-1234567890ab',
      '1753000000000',
    ]);
  });

  it('does not mutate the input array', () => {
    const history = [session('1', '2026-07-19'), session('2', '2026-07-28')];
    const original = [...history];

    sortHistoryNewestFirst(history);

    expect(history).toEqual(original);
  });
});
