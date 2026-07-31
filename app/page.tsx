"use client";

import React, { useEffect, useRef, useState } from 'react';
import { TrainingCycle, WorkoutSession, DayTemplate } from '../types';
import { useSupabaseSession } from '../lib/hooks/useSupabaseSession';
import { useCycles } from '../lib/hooks/useCycles';
import { useWorkoutHistory } from '../lib/hooks/useWorkoutHistory';
import { normalizeExerciseSet } from '../lib/exerciseValues';
import AuthView from '../components/AuthView';
import HomeView from '../components/HomeView';
import CycleView from '../components/CycleView';
import WorkoutView from '../components/WorkoutView';
import CycleFormView from '../components/CycleFormView';
import StatsView from '../components/StatsView';
import { resolveWorkoutOrigin, WorkoutOrigin } from '../lib/workoutOrigin';
import CalendarView from '../components/CalendarView';

// --- Main Component ---

export default function GymApp() {
  const [view, setView] = useState<'home' | 'cycle' | 'new_cycle' | 'edit_cycle' | 'workout' | 'stats' | 'calendar'>('home');
  const [previousView, setPreviousView] = useState<WorkoutOrigin>('cycle');
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  // Clear cached data on sign-out, token expiry, or session end from another
  // tab, so one account's data never lingers for the next. useSupabaseSession
  // invokes this from its auth-change subscription, not from render, so the
  // reset it points at is always the latest one via this ref.
  const resetOnSignOutRef = useRef<() => void>(() => {});
  const { client, session, loading: authLoading } = useSupabaseSession(() => resetOnSignOutRef.current());

  const cyclesState = useCycles(client, !!session);
  const historyState = useWorkoutHistory(client, !!session);

  useEffect(() => {
    resetOnSignOutRef.current = () => {
      cyclesState.reset();
      historyState.reset();
      setSelectedCycleId(null);
      setActiveSession(null);
      setView('home');
    };
  });

  if (authLoading) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans font-black text-zinc-400">Checking session...</div>;
  }

  if (!session) {
    return <AuthView />;
  }

  const loadError = cyclesState.error ?? historyState.error;

  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4 font-sans font-black text-zinc-400 text-center px-6">
        <p>{loadError}</p>
        <button
          onClick={() => {
            cyclesState.retry();
            historyState.retry();
          }}
          className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black"
        >
          Retry
        </button>
      </div>
    );
  }

  const isLoaded = cyclesState.status === 'loaded' && historyState.status === 'loaded';

  if (!isLoaded) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans font-black text-zinc-400">Loading data...</div>;
  }

  const cycles = cyclesState.cycles;
  const history = historyState.history;
  const selectedCycle = cycles.find(c => c.id === selectedCycleId);
  const cycleHistory = history.filter(h => h.cycleId === selectedCycleId);

  // --- Logic Handlers ---

  const prepareNewWorkout = (template: DayTemplate) => {
    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      cycleId: selectedCycleId!,
      date: new Date().toISOString().split('T')[0], // format: YYYY-MM-DD
      dayLabel: template.label || `Day ${template.dayNumber}`,
      dayNumber: template.dayNumber,
      data: template.exercises.map(name => normalizeExerciseSet({ name })),
      createdAt: new Date().toISOString()
    };
    setActiveSession(newSession);
    setPreviousView(resolveWorkoutOrigin(view));
    setView('workout');
  };

  const prepareEditWorkout = (session: WorkoutSession) => {
    setActiveSession(session);
    setPreviousView(resolveWorkoutOrigin(view));
    setView('workout');
  };

  const updateExerciseValues = (exerciseName: string, field: 'weight' | 'reps' | 'comment', value: string) => {
  if (!activeSession) return;

  const updatedData = activeSession.data.map(item =>
    // Thanks to square brackets [field], JavaScript understands
    // whether you're updating weight or reps
    item.name === exerciseName ? { ...item, [field]: value } : item
  );

  setActiveSession({ ...activeSession, data: updatedData });
};


  const updateSessionDate = (date: string) => {
    if (!activeSession) return;
    setActiveSession({ ...activeSession, date });
  }

  const saveWorkout = async () => {
    if (!activeSession) return;

    const result = await historyState.saveSession(activeSession);
    if (!result.ok) {
      console.error(result.error);
      return alert("Error saving to database!");
    }

    alert("Workout saved!");
    setView(previousView);
    setActiveSession(null);
  };

  const createOrUpdateCycle = async (newCycle: TrainingCycle) => {
    const isEditing = cycles.some(c => c.id === newCycle.id);

    const result = await cyclesState.saveCycle(newCycle);
    if (!result.ok) {
      console.error(result.error);
      return alert("Error saving cycle to database!");
    }

    if (result.value.deactivateOthersError) {
      console.error(result.value.deactivateOthersError);
      alert("Cycle created, but couldn't deactivate your other cycles — you may need to fix this manually.");
    }

    setView(isEditing ? 'cycle' : 'home');
  };

  const deleteCycle = async (id: string) => {
    const result = await cyclesState.removeCycle(id);
    if (!result.ok) {
      console.error(result.error);
      return alert("Error deleting cycle!");
    }

    historyState.removeSessionsForCycle(id); // clean up history
    if (selectedCycleId === id) {
      setView('home');
      setSelectedCycleId(null);
    }
  };

  const deleteWorkoutSession = async (sessionId: string) => {
    const result = await historyState.removeSession(sessionId);
    if (!result.ok) {
      console.error(result.error);
      return alert("Error deleting workout!");
    }
  };

  // --- Render Views ---

  if (view === 'home') {
    return (
      <HomeView
        cycles={cycles}
        history={history}
        onSelectCycle={(id) => { setSelectedCycleId(id); setView('cycle'); }}
        onNewCycle={() => setView('new_cycle')}
        onDeleteCycle={deleteCycle}
        onEditSession={prepareEditWorkout}
        onOpenCalendar={() => setView('calendar')}
      />
    );
  }

  if (view === 'calendar') {
    return (
      <CalendarView
        history={history}
        onEditSession={prepareEditWorkout}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'cycle' && selectedCycle) {
    return (
      <CycleView
        selectedCycle={selectedCycle}
        cycleHistory={cycleHistory}
        onBack={() => setView('home')}
        onStartWorkout={prepareNewWorkout}
        onDeleteSession={deleteWorkoutSession}
        onEditCycle={() => setView('edit_cycle')}
        onViewStats={() => setView('stats')}
        onEditSession={prepareEditWorkout}
      />
    );
  }

  if (view === 'edit_cycle' && selectedCycle) {
    return (
      <CycleFormView
        initialCycle={selectedCycle}
        onBack={() => setView('cycle')}
        onSaveCycle={createOrUpdateCycle}
      />
    );
  }

  if (view === 'stats' && selectedCycle) {
    return (
      <StatsView
        cycle={selectedCycle}
        history={cycleHistory}
        onBack={() => setView('cycle')}
        onEditSession={prepareEditWorkout}
      />
    );
  }

  if (view === 'workout' && activeSession) {
    return (
      <WorkoutView
        activeSession={activeSession}
        onCancel={() => { setView(previousView); setActiveSession(null); }}
        onSave={saveWorkout}
        onUpdateDate={updateSessionDate}
        onUpdateExercise={updateExerciseValues}
      />
    );
  }

  if (view === 'new_cycle') {
    return (
      <CycleFormView
        onBack={() => setView('home')}
        onSaveCycle={createOrUpdateCycle}
      />
    );
  }

  return null;
}
