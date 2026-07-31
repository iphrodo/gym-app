import { describe, it, expect } from 'vitest';
import { buildCalendarMonth } from './calendarMonth';
import { WorkoutSession } from '../types';

function session(id: string, date: string): WorkoutSession {
  return { id, cycleId: 'c1', date, dayLabel: 'Day', dayNumber: 1, data: [], userId: 'u1' };
}

function flatten(weeks: ReturnType<typeof buildCalendarMonth>['weeks']) {
  return weeks.flat();
}

describe('buildCalendarMonth', () => {
  it('marks days with sessions and leaves the rest unmarked', () => {
    const history = [session('1', '2026-07-05'), session('2', '2026-07-19'), session('3', '2026-07-19')];

    const month = buildCalendarMonth(2026, 6, history, '2026-07-01'); // July 2026

    const days = flatten(month.weeks).filter(d => d.inMonth);
    const marked = days.filter(d => d.sessions.length > 0);

    expect(marked.map(d => d.date)).toEqual(['2026-07-05', '2026-07-19']);
    expect(days.find(d => d.date === '2026-07-19')?.sessions).toHaveLength(2);
    expect(month.workoutCount).toBe(3);
    expect(month.monthLabel).toBe('July 2026');
  });

  it('reports zero workouts for a month with no sessions', () => {
    const month = buildCalendarMonth(2026, 6, [], '2026-07-01');

    expect(month.workoutCount).toBe(0);
    expect(flatten(month.weeks).every(d => d.sessions.length === 0)).toBe(true);
  });

  it('handles the December to January year boundary padding', () => {
    const month = buildCalendarMonth(2025, 11, [], '2025-12-01'); // December 2025

    const firstWeek = month.weeks[0];
    const leadingPadding = firstWeek.filter(d => !d.inMonth);
    // Dec 1, 2025 is a Monday, so no leading padding is needed.
    expect(leadingPadding).toHaveLength(0);

    const lastWeek = month.weeks[month.weeks.length - 1];
    const trailingPadding = lastWeek.filter(d => !d.inMonth);
    expect(trailingPadding.every(d => d.date.startsWith('2026-01'))).toBe(true);
  });

  it('handles a leap-year February', () => {
    const month = buildCalendarMonth(2024, 1, [], '2024-02-01'); // February 2024 (leap year)

    const inMonthDays = flatten(month.weeks).filter(d => d.inMonth);
    expect(inMonthDays).toHaveLength(29);
    expect(inMonthDays[inMonthDays.length - 1].date).toBe('2024-02-29');
  });

  it('marks today only within the displayed month', () => {
    const month = buildCalendarMonth(2026, 6, [], '2026-07-15');

    const today = flatten(month.weeks).find(d => d.isToday);
    expect(today?.date).toBe('2026-07-15');
    expect(today?.inMonth).toBe(true);
  });
});
