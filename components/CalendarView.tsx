"use client";

import React, { useLayoutEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkoutSession } from '../types';
import { buildCalendarMonth, todayDateKey } from '../lib/calendarMonth';

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
    <main className="min-h-screen bg-zinc-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Link href="/" className="text-zinc-400 font-bold hover:text-zinc-900">
            ← Back
          </Link>
          <h2 className="font-black text-zinc-900">Calendar</h2>
          <div className="w-16"></div>
        </header>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-colors"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div className="text-center">
              <h3 className="font-black text-zinc-900 leading-tight">{calendarMonth.monthLabel}</h3>
              <p className="text-[10px] uppercase font-black tracking-wider text-zinc-500">
                {calendarMonth.workoutCount} workout{calendarMonth.workoutCount === 1 ? '' : 's'}
              </p>
            </div>
            <button
              onClick={goToNextMonth}
              className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-colors"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAY_LABELS.map(label => (
              <div key={label} className="text-center text-[10px] font-black uppercase text-zinc-400 tracking-wider">
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
                    'aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-colors',
                    hasWorkout
                      ? 'bg-zinc-900 text-white hover:bg-zinc-700 cursor-pointer'
                      : `cursor-default ${!dayCell.inMonth ? 'text-zinc-300' : 'text-zinc-700'}`,
                    dayCell.isToday && !hasWorkout ? 'ring-2 ring-zinc-900' : '',
                    dayCell.isToday && hasWorkout ? 'ring-2 ring-offset-2 ring-zinc-900' : '',
                  ].join(' ')}
                >
                  {dayCell.day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {pendingDateKey && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50"
          onClick={() => setPendingDateKey(null)}
        >
          <div
            className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h4 className="font-black text-zinc-900 mb-4">{pendingDateKey}</h4>
            <div className="space-y-2">
              {pendingSessions.map(session => (
                <Link
                  key={session.id}
                  href={`/workouts/${session.id}`}
                  className="w-full flex items-center justify-between bg-zinc-50 hover:bg-zinc-100 px-4 py-3 rounded-2xl text-left transition-colors"
                >
                  <span className="font-bold text-zinc-800 text-sm">{session.dayLabel}</span>
                  <span className="text-zinc-400 text-xs">→</span>
                </Link>
              ))}
            </div>
            <button
              onClick={() => setPendingDateKey(null)}
              className="w-full mt-4 py-2.5 text-zinc-400 font-bold text-sm hover:text-zinc-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
