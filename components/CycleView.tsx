"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { TrainingCycle, WorkoutSession } from '../types';
import { sortHistoryNewestFirst } from '../lib/sortWorkoutHistory';
import { Screen, ScreenHeader } from './ui/Screen';
import Card from './ui/Card';
import IconButton from './ui/IconButton';
import ConfirmDialog from './ui/ConfirmDialog';
import { EditIcon, TrashIcon } from './ui/icons';

interface CycleViewProps {
  selectedCycle: TrainingCycle;
  cycleHistory: WorkoutSession[];
  onDeleteSession: (sessionId: string) => void;
}

export default function CycleView({ selectedCycle, cycleHistory, onDeleteSession }: CycleViewProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const earliestSessionTime = cycleHistory.length > 0
    ? Math.min(...cycleHistory.map(s => new Date(s.date).getTime()))
    : null;
  const duration = earliestSessionTime !== null
    ? Math.ceil(Math.abs(new Date().getTime() - earliestSessionTime) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Screen>
      <ScreenHeader
        left={
          <Link href="/" className="text-card-muted-fg font-bold hover:text-page-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">
            ← All
          </Link>
        }
        right={
          <>
            <Link href={`/cycles/${selectedCycle.id}/stats`} className="text-xs font-black uppercase tracking-wider surface-card border-2 shadow-sm px-4 py-2 rounded-xl hover:border-card-muted-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
              📊 Statistics
            </Link>
            <Link href={`/cycles/${selectedCycle.id}/edit`} className="text-xs font-black uppercase tracking-wider surface-muted px-4 py-2 rounded-xl hover:opacity-80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
              Edit
            </Link>
          </>
        }
      />

      <Card as="section">
        <h2 className="text-2xl font-black mb-6">{selectedCycle.name}</h2>

        <div className="flex gap-3 mb-8">
          <div className="flex-1 surface-muted p-4 rounded-3xl border">
            <span className="block text-[10px] uppercase tracking-wider text-muted-muted-fg font-black mb-1">Workouts</span>
            <span className="text-2xl font-black">{cycleHistory.length}</span>
          </div>
          <div className="flex-1 surface-muted p-4 rounded-3xl border">
            <span className="block text-[10px] uppercase tracking-wider text-muted-muted-fg font-black mb-1">Days in cycle</span>
            <span className="text-2xl font-black">{duration}</span>
          </div>
        </div>

        <h3 className="font-bold mb-4 px-2">Cycle program</h3>
        <div className="grid gap-3 mb-8">
          {selectedCycle.templates.map((template) => (
            <Link
              key={template.dayNumber}
              href={`/cycles/${selectedCycle.id}/workouts/new?day=${template.dayNumber}`}
              className="group flex items-center justify-between p-5 surface-muted border rounded-3xl transition-all duration-300 hover:bg-[var(--card-inverted-bg)] hover:text-[var(--card-inverted-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <div className="text-left w-full pl-2">
                <span className="block text-[10px] font-black uppercase text-muted-muted-fg mb-1">Day {template.dayNumber}</span>
                <span className="text-lg font-bold">{template.label || 'Untitled'}</span>
              </div>
              <div className="h-10 px-4 text-xs tracking-wider uppercase rounded-full surface-card flex items-center justify-center shadow-sm font-black transition-colors">
                Start
              </div>
            </Link>
          ))}
        </div>

        {cycleHistory.length > 0 && (
          <>
            <h3 className="font-bold mb-4 px-2">Workout history</h3>
            <div className="grid gap-3">
              {sortHistoryNewestFirst(cycleHistory).map(session => (
                <div key={session.id} className="p-5 surface-muted rounded-3xl border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sm">{session.dayLabel}</span>
                      <span className="text-xs font-bold text-muted-muted-fg">• {session.date}</span>
                    </div>
                    <p className="text-xs font-medium text-muted-muted-fg">Exercises completed: {session.data.filter(d => d.weight).length} / {session.data.length}</p>
                  </div>
                  <div className="flex items-center">
                    <IconButton href={`/workouts/${session.id}`} label="Edit workout" icon={<EditIcon />} />
                    <IconButton
                      variant="danger"
                      label="Delete workout"
                      icon={<TrashIcon size={18} />}
                      className="ml-1"
                      onClick={() => setPendingDeleteId(session.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this workout?"
        description="This workout will be permanently removed from history."
        onConfirm={() => {
          if (pendingDeleteId) onDeleteSession(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </Screen>
  );
}
