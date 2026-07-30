import { WorkoutSession } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  day: number;
  inMonth: boolean;
  isToday: boolean;
  sessions: WorkoutSession[];
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-indexed
  monthLabel: string; // e.g. "July 2026"
  workoutCount: number;
  weeks: CalendarDay[][];
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

// 0 = Monday ... 6 = Sunday
function mondayIndexedWeekday(year: number, month: number, day: number): number {
  const jsWeekday = new Date(Date.UTC(year, month, day)).getUTCDay(); // 0 = Sunday
  return (jsWeekday + 6) % 7;
}

function groupSessionsByDate(history: WorkoutSession[]): Map<string, WorkoutSession[]> {
  const map = new Map<string, WorkoutSession[]>();
  for (const session of history) {
    const existing = map.get(session.date);
    if (existing) {
      existing.push(session);
    } else {
      map.set(session.date, [session]);
    }
  }
  return map;
}

export function todayDateKey(): string {
  const now = new Date();
  return toDateKey(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function buildCalendarMonth(
  year: number,
  month: number,
  history: WorkoutSession[],
  todayKey: string = todayDateKey()
): CalendarMonth {
  const sessionsByDate = groupSessionsByDate(history);
  const totalDays = daysInMonth(year, month);
  const leadingPadding = mondayIndexedWeekday(year, month, 1);
  const trailingPadding = (7 - ((leadingPadding + totalDays) % 7)) % 7;

  const days: CalendarDay[] = [];

  for (let i = 0; i < leadingPadding; i++) {
    const prevMonthDay = new Date(Date.UTC(year, month, 1 - (leadingPadding - i)));
    const date = toDateKey(prevMonthDay.getUTCFullYear(), prevMonthDay.getUTCMonth(), prevMonthDay.getUTCDate());
    days.push({ date, day: prevMonthDay.getUTCDate(), inMonth: false, isToday: false, sessions: [] });
  }

  let workoutCount = 0;
  for (let day = 1; day <= totalDays; day++) {
    const date = toDateKey(year, month, day);
    const sessions = sessionsByDate.get(date) ?? [];
    workoutCount += sessions.length;
    days.push({ date, day, inMonth: true, isToday: date === todayKey, sessions });
  }

  for (let i = 0; i < trailingPadding; i++) {
    const nextMonthDay = new Date(Date.UTC(year, month + 1, 1 + i));
    const date = toDateKey(nextMonthDay.getUTCFullYear(), nextMonthDay.getUTCMonth(), nextMonthDay.getUTCDate());
    days.push({ date, day: nextMonthDay.getUTCDate(), inMonth: false, isToday: false, sessions: [] });
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return {
    year,
    month,
    monthLabel: `${MONTH_NAMES[month]} ${year}`,
    workoutCount,
    weeks,
  };
}
