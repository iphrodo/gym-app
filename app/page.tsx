"use client";

import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { TrainingCycle, WorkoutSession, DayTemplate } from '../types';
import { supabase } from '../lib/supabaseClient';
import { requireUserId } from '../lib/auth';
import { normalizeExerciseSet } from '../lib/exerciseValues';
import AuthView from '../components/AuthView';
import HomeView from '../components/HomeView';
import CycleView from '../components/CycleView';
import WorkoutView from '../components/WorkoutView';
import CycleFormView from '../components/CycleFormView';
import StatsView from '../components/StatsView';
import { resolveWorkoutOrigin, WorkoutOrigin } from '../lib/workoutOrigin';
import CalendarView from '../components/CalendarView';

const DEFAULT_CYCLE_TEMPLATE: Omit<TrainingCycle, 'userId' | 'createdAt'> = {
  id: "cycle-2024-v1",
  name: "Power Cycle v1",
  isActive: true,
  templates: [
    { 
      dayNumber: 1, 
      label: "Back & Triceps", 
      exercises: ["Lat Pulldown", "Reverse Flyes", "Shrugs", "Close-Grip Bench", "Triceps Machine"] 
    },
    { 
      dayNumber: 2, 
      label: "Chest & Biceps", 
      exercises: ["Bench Press", "Incline Bench", "Dumbbell Flyes", "Barbell Curls", "Dumbbell Curls"] 
    },
    { 
      dayNumber: 3, 
      label: "Legs & Shoulders", 
      exercises: ["Leg Press", "Leg Extensions", "Leg Curls", "Dumbbell Shoulder Press", "Abs"] 
    }
  ]
};

// --- Main Component ---

export default function GymApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [view, setView] = useState<'home' | 'cycle' | 'new_cycle' | 'edit_cycle' | 'workout' | 'stats' | 'calendar'>('home');
  const [previousView, setPreviousView] = useState<WorkoutOrigin>('cycle');
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [cycles, setCycles] = useState<TrainingCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  // --- Auth Session Logic ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Clear cached data on sign-out, token expiry, or session end from
        // another tab, so one account's data never lingers for the next.
        setCycles([]);
        setHistory([]);
        setSelectedCycleId(null);
        setActiveSession(null);
        setIsLoaded(false);
        setLoadError(null);
        setView('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Persistence Logic ---
  useEffect(() => {
    const fetchData = async () => {
      const userId = requireUserId(session);
      if (!userId) return;

      setLoadError(null);

      const { data: cyclesData, error: cyclesError } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', userId);
      if (cyclesError) {
        console.error(cyclesError);
        setLoadError("Couldn't load your cycles.");
        return;
      }

      if (cyclesData && cyclesData.length > 0) {
        setCycles(cyclesData.map(c => ({
          id: c.id,
          name: c.name,
          isActive: c.is_active,
          templates: c.templates,
          userId: c.user_id,
          createdAt: c.created_at
        })));
      } else {
        const defaultCycle: TrainingCycle = { ...DEFAULT_CYCLE_TEMPLATE, userId, createdAt: new Date().toISOString() };
        const { error: insertError } = await supabase.from('cycles').insert([{
           id: defaultCycle.id,
           name: defaultCycle.name,
           is_active: defaultCycle.isActive,
           templates: defaultCycle.templates,
           user_id: userId,
           created_at: defaultCycle.createdAt
        }]);
        if (insertError) {
          console.error(insertError);
          setLoadError("Couldn't set up your account.");
          return;
        }
        setCycles([defaultCycle]);
      }

      const { data: historyData, error: historyError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId);
      if (historyError) {
        console.error(historyError);
        setLoadError("Couldn't load your workout history.");
        return;
      }

      setHistory((historyData || []).map(h => ({
        id: h.id,
        cycleId: h.cycle_id,
        date: h.date,
        dayLabel: h.day_label,
        dayNumber: h.day_number,
        data: (h.data as WorkoutSession['data']).map(normalizeExerciseSet),
        userId: h.user_id,
        createdAt: h.created_at
      })));

      setIsLoaded(true);
    };

    if (session) fetchData();
  }, [session, retryCount]);

  if (authLoading) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans font-black text-zinc-400">Checking session...</div>;
  }

  if (!session) {
    return <AuthView />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4 font-sans font-black text-zinc-400 text-center px-6">
        <p>{loadError}</p>
        <button
          onClick={() => setRetryCount(c => c + 1)}
          className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans font-black text-zinc-400">Loading data...</div>;
  }

  const selectedCycle = cycles.find(c => c.id === selectedCycleId);
  const cycleHistory = history.filter(h => h.cycleId === selectedCycleId);

  // --- Logic Handlers ---

  const prepareNewWorkout = (template: DayTemplate) => {
    const userId = requireUserId(session);
    if (!userId) return alert("Your session has expired. Please log in again.");

    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      cycleId: selectedCycleId!,
      date: new Date().toISOString().split('T')[0], // format: YYYY-MM-DD
      dayLabel: template.label || `Day ${template.dayNumber}`,
      dayNumber: template.dayNumber,
      data: template.exercises.map(name => normalizeExerciseSet({ name })),
      userId,
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

    // Fallback error guard if not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return alert("Supabase connection not added");

    const userId = requireUserId(session);
    if (!userId) return alert("Your session has expired. Please log in again.");

    const { error } = await supabase.from('workout_sessions').upsert({
       id: activeSession.id,
       cycle_id: activeSession.cycleId,
       date: activeSession.date,
       day_label: activeSession.dayLabel,
       day_number: activeSession.dayNumber,
       data: activeSession.data,
       user_id: userId,
       created_at: activeSession.createdAt
    });

    if (error) {
       console.error(error);
       return alert("Error saving to database!");
    }

    const existingIndex = history.findIndex(h => h.id === activeSession.id);
    if (existingIndex >= 0) {
      const newHistory = [...history];
      newHistory[existingIndex] = activeSession;
      setHistory(newHistory);
    } else {
      setHistory([...history, activeSession]);
    }
    alert("Workout saved!");
    setView(previousView);
    setActiveSession(null);
  };

  const createOrUpdateCycle = async (newCycle: TrainingCycle) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return alert("Supabase connection not added");

    const userId = requireUserId(session);
    if (!userId) return alert("Your session has expired. Please log in again.");

    const { error } = await supabase.from('cycles').upsert({
      id: newCycle.id,
      name: newCycle.name,
      is_active: newCycle.isActive,
      templates: newCycle.templates,
      user_id: userId,
      created_at: newCycle.createdAt
    });

    if (error) {
       console.error(error);
       return alert("Error saving cycle to database!");
    }

    const existingIndex = cycles.findIndex(c => c.id === newCycle.id);
    if (existingIndex >= 0) {
       const newCycles = [...cycles];
       newCycles[existingIndex] = newCycle;
       setCycles(newCycles);
       setView('cycle');
    } else {
       setCycles([...cycles.map(c => ({...c, isActive: false})), newCycle]);
       setView('home');
       await supabase.from('cycles').update({ is_active: false }).eq('user_id', userId).neq('id', newCycle.id);
    }
  };

  const deleteCycle = async (id: string) => {
    const userId = requireUserId(session);
    if (!userId) return alert("Your session has expired. Please log in again.");

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { error } = await supabase.from('cycles').delete().eq('id', id).eq('user_id', userId);
      if (error) {
        console.error(error);
        return alert("Error deleting cycle!");
      }
    }
    setCycles(cycles.filter(c => c.id !== id));
    setHistory(history.filter(h => h.cycleId !== id)); // clean up history
    if (selectedCycleId === id) {
      setView('home');
      setSelectedCycleId(null);
    }
  };

  const deleteWorkoutSession = async (sessionId: string) => {
    const userId = requireUserId(session);
    if (!userId) return alert("Your session has expired. Please log in again.");

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId).eq('user_id', userId);
      if (error) {
        console.error(error);
        return alert("Error deleting workout!");
      }
    }
    setHistory(history.filter(h => h.id !== sessionId));
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
        userId={session.user.id}
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
        userId={session.user.id}
        onBack={() => setView('home')}
        onSaveCycle={createOrUpdateCycle}
      />
    );
  }

  return null;
}