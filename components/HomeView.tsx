"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrainingCycle, WorkoutSession } from '../types';
import { supabase } from '../lib/supabaseClient';
import { sortHistoryNewestFirst } from '../lib/sortWorkoutHistory';
import { Screen } from './ui/Screen';
import Card from './ui/Card';
import IconButton from './ui/IconButton';
import ConfirmDialog from './ui/ConfirmDialog';
import { CalendarIcon, EditIcon, TrashIcon } from './ui/icons';

interface HomeViewProps {
  cycles: TrainingCycle[];
  history: WorkoutSession[];
  onDeleteCycle: (id: string) => void;
}

export default function HomeView({ cycles, history, onDeleteCycle }: HomeViewProps) {
  const router = useRouter();
  const recentHistory = sortHistoryNewestFirst(history).slice(0, 3);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteCycle = cycles.find(c => c.id === pendingDeleteId) ?? null;

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    // A hard navigation clears every Activity-preserved route so a
    // subsequently signed-in account can never see this account's data.
    window.location.assign('/login');
  };

  return (
    <Screen>
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tight">GymFlow</h1>
          <p className="text-card-muted-fg font-medium tracking-tight">Your workout journal</p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton href="/calendar" label="Open calendar" icon={<CalendarIcon />} className="surface-card border" />
          <button
            onClick={handleLogOut}
            className="text-[10px] font-black uppercase tracking-wider text-card-muted-fg surface-card border px-3 py-1.5 rounded-xl hover:text-page-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            Log out
          </button>
        </div>
      </header>

      {recentHistory.length > 0 && (
        <div className="mb-10">
          <h3 className="font-bold mb-4 px-2">Recent workouts</h3>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
            {recentHistory.map(session => (
              <Card key={session.id} variant="inverted" className="min-w-[85%] snap-center shadow-card-inverted-bg/20">
                <div className="flex justify-between items-center mb-4 border-b border-card-inverted-border pb-4">
                  <h4 className="font-black text-lg leading-tight w-1/2">{session.dayLabel}</h4>
                  <span className="text-[10px] font-black text-card-inverted-muted-fg bg-card-inverted-fg/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{session.date}</span>
                  <IconButton
                    href={`/workouts/${session.id}`}
                    label="Edit workout"
                    icon={<EditIcon />}
                    className="text-card-inverted-muted-fg hover:text-card-inverted-fg hover:bg-card-inverted-fg/10"
                  />
                </div>
                <div className="space-y-3">
                  {session.data.filter(d => d.weight).length > 0
                    ? session.data.filter(d => d.weight).map((ex, i) => (
                      <div key={i} className="flex justify-between items-center text-sm border-b border-card-inverted-fg/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-card-inverted-muted-fg truncate pr-4 text-xs font-bold leading-tight">{ex.name}</span>
                        <span className="font-black whitespace-nowrap bg-card-inverted-fg/10 px-2 py-1 rounded-lg">{ex.weight} kg</span>
                      </div>
                    ))
                    : <div className="text-card-inverted-muted-fg text-xs font-bold">No recorded exercises</div>
                  }
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h3 className="font-bold mb-4 px-2 mt-4">All cycles</h3>
      <div className="grid gap-4">
        {cycles.map((cycle) => (
          <Card
            key={cycle.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/cycles/${cycle.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(`/cycles/${cycle.id}`);
              }
            }}
            className="flex flex-col hover:border-card-muted-fg transition-all w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{cycle.name}</h2>
                {cycle.isActive && <span className="px-3 py-1 bg-success-muted-bg text-success-muted-fg text-[10px] font-black rounded-full uppercase">Active</span>}
              </div>
              <IconButton
                variant="danger"
                label="Delete cycle"
                icon={<TrashIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDeleteId(cycle.id);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-card-muted-fg font-medium">{cycle.templates.length} workout days</p>
              <span className="px-4 py-2 surface-muted rounded-2xl text-sm font-bold">
                Open
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Link
        href="/cycles/new"
        className="block text-center w-full mt-6 py-5 border-2 border-dashed border-card-border rounded-[2rem] text-card-muted-fg font-bold hover:bg-muted-bg transition-all text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        + New cycle
      </Link>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this cycle?"
        description={
          pendingDeleteCycle
            ? `"${pendingDeleteCycle.name}" and all of its workout history will be permanently removed.`
            : undefined
        }
        onConfirm={() => {
          if (pendingDeleteId) onDeleteCycle(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </Screen>
  );
}
