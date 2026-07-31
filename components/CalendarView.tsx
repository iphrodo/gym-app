"use client";

import { useLayoutEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkoutSession } from '../types';
import { buildCalendarMonth, todayDateKey } from '../lib/calendarMonth';
import { Screen, ScreenHeader } from './ui/Screen';
import Card from './ui/Card';
import IconButton from './ui/IconButton';
import { ChevronLeftIcon, ChevronRightIcon } from './ui/icons';

interface CalendarViewProps {
  history: WorkoutSession[];
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarView({ history }: CalendarViewProps) {
  const router = useRouter();
  const todayKey = todayDateKey();
  const [todayYear, todayMonthNum] = todayKey.split('-').map(Number);
  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonthNum - 1); // 0-indexed
  const [pendingDateKey, setPendingDateKey] = useState<string | null>(null);

  // Cache Components preserves this route's state and DOM across
  // navigation; without this cleanup the picker would reappear open on return.
  useLayoutEffect(() => () => setPendingDateKey(null), []);

  const calendarMonth = useMemo(
    () => buildCalendarMonth(year, month, history, todayKey),
    [year, month, history, todayKey]
  );

  const goToPreviousMonth = () => {
    setPendingDateKey(null);
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    setPendingDateKey(null);
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayClick = (date: string, sessions: WorkoutSession[]) => {
    if (sessions.length === 0) return;
    if (sessions.length === 1) {
      router.push(`/workouts/${sessions[0].id}`);
      return;
    }
    setPendingDateKey(date);
  };

  const pendingSessions = pendingDateKey
    ? calendarMonth.weeks.flat().find(d => d.date === pendingDateKey)?.sessions ?? []
    : [];

  return (
    <Screen>
      <ScreenHeader
        left={
          <Link href="/" className="text-card-muted-fg font-bold hover:text-page-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">
            ← Back
          </Link>
        }
        title="Calendar"
      />

      <Card>
        <div className="flex items-center justify-between mb-6">
          <IconButton onClick={goToPreviousMonth} label="Previous month" icon={<ChevronLeftIcon />} />
          <div className="text-center">
            <h3 className="font-black leading-tight">{calendarMonth.monthLabel}</h3>
            <p className="text-[10px] uppercase font-black tracking-wider text-card-muted-fg">
              {calendarMonth.workoutCount} workout{calendarMonth.workoutCount === 1 ? '' : 's'}
            </p>
          </div>
          <IconButton onClick={goToNextMonth} label="Next month" icon={<ChevronRightIcon />} />
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAY_LABELS.map(label => (
            <div key={label} className="text-center text-[10px] font-black uppercase text-card-muted-fg tracking-wider">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarMonth.weeks.flat().map(dayCell => {
            const hasWorkout = dayCell.sessions.length > 0;
            return (
              <button
                key={dayCell.date}
                onClick={() => handleDayClick(dayCell.date, dayCell.sessions)}
                disabled={!hasWorkout}
                className={[
                  'aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                  hasWorkout
                    ? 'surface-card-inverted hover:opacity-80 cursor-pointer'
                    : `cursor-default ${!dayCell.inMonth ? 'text-card-border' : 'text-card-muted-fg'}`,
                  dayCell.isToday && !hasWorkout ? 'ring-2 ring-focus-ring' : '',
                  dayCell.isToday && hasWorkout ? 'ring-2 ring-offset-2 ring-focus-ring' : '',
                ].join(' ')}
              >
                {dayCell.day}
              </button>
            );
          })}
        </div>
      </Card>

      {pendingDateKey && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50"
          onClick={() => setPendingDateKey(null)}
        >
          <Card rounded="md" className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h4 className="font-black mb-4">{pendingDateKey}</h4>
            <div className="space-y-2">
              {pendingSessions.map(session => (
                <Link
                  key={session.id}
                  href={`/workouts/${session.id}`}
                  className="w-full flex items-center justify-between surface-muted hover:opacity-80 px-4 py-3 rounded-2xl text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <span className="font-bold text-sm">{session.dayLabel}</span>
                  <span className="text-muted-muted-fg text-xs">→</span>
                </Link>
              ))}
            </div>
            <button
              onClick={() => setPendingDateKey(null)}
              className="w-full mt-4 py-2.5 text-card-muted-fg font-bold text-sm hover:text-card-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
            >
              Cancel
            </button>
          </Card>
        </div>
      )}
    </Screen>
  );
}
