"use client";

import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { TrainingCycle, WorkoutSession, DayTemplate } from '../types';
import { supabase } from '../lib/supabaseClient';
import AuthView from '../components/AuthView';
import HomeView from '../components/HomeView';
import CycleView from '../components/CycleView';
import WorkoutView from '../components/WorkoutView';
import CycleFormView from '../components/CycleFormView';
import StatsView from '../components/StatsView';

const DEFAULT_CYCLE: TrainingCycle = {
  id: "cycle-2024-v1",
  name: "Силовий цикл v1",
  isActive: true,
  templates: [
    { 
      dayNumber: 1, 
      label: "Спина та Тріцепс", 
      exercises: ["Тяга блока до грудей", "Розведення рук назад", "Шраги", "Вузький жим", "Тріцепс тренажер"] 
    },
    { 
      dayNumber: 2, 
      label: "Груди та Біцепс", 
      exercises: ["Жим штанги лежачи", "Жим в нахилі", "Розводка", "Штанга на біцепс", "Гантелі на біцепс"] 
    },
    { 
      dayNumber: 3, 
      label: "Ноги та Плечі", 
      exercises: ["Жим ногами", "Квадріцепс тренажер", "Біцепс стегна", "Гантелі на плечі", "Прес"] 
    }
  ]
};

// --- Main Component ---

export default function GymApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<'home' | 'cycle' | 'new_cycle' | 'edit_cycle' | 'workout' | 'stats'>('home');
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
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Persistence Logic ---
  useEffect(() => {
    const fetchData = async () => {
      if (!session) return; // Do not fetch unless user is logged in
      
      const { data: cyclesData, error: cyclesError } = await supabase.from('cycles').select('*');
      if (cyclesData && cyclesData.length > 0) {
        setCycles(cyclesData.map(c => ({
          id: c.id,
          name: c.name,
          isActive: c.is_active,
          templates: c.templates
        })));
      } else {
        await supabase.from('cycles').insert([{
           id: DEFAULT_CYCLE.id,
           name: DEFAULT_CYCLE.name,
           is_active: DEFAULT_CYCLE.isActive,
           templates: DEFAULT_CYCLE.templates
        }]);
        setCycles([DEFAULT_CYCLE]);
      }

      const { data: historyData, error: historyError } = await supabase.from('workout_sessions').select('*');
      if (historyData) {
        setHistory(historyData.map(h => ({
          id: h.id,
          cycleId: h.cycle_id,
          date: h.date,
          dayLabel: h.day_label,
          dayNumber: h.day_number,
          data: h.data
        })));
      }

      setIsLoaded(true);
    };

    if (session) fetchData();
  }, [session]);

  if (authLoading) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans font-black text-zinc-400">Перевірка сесії...</div>;
  }

  if (!session) {
    return <AuthView />;
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans font-black text-zinc-400">Завантаження даних...</div>;
  }

  const selectedCycle = cycles.find(c => c.id === selectedCycleId);
  const cycleHistory = history.filter(h => h.cycleId === selectedCycleId);

  // --- Logic Handlers ---

  const prepareNewWorkout = (template: DayTemplate) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      cycleId: selectedCycleId!,
      date: new Date().toISOString().split('T')[0], // format: YYYY-MM-DD
      dayLabel: template.label || `День ${template.dayNumber}`,
      dayNumber: template.dayNumber,
      data: template.exercises.map(name => ({ name, weight: "" }))
    };
    setActiveSession(newSession);
    setView('workout');
  };

  const prepareEditWorkout = (session: WorkoutSession) => {
    setActiveSession(session);
    setView('workout');
  };

  const updateExerciseValues = (exerciseName: string, field: 'weight' | 'reps' | 'comment', value: string) => {
  if (!activeSession) return;
  
  const updatedData = activeSession.data.map(item => 
    // Завдяки квадратним дужкам [field], JavaScript сам зрозуміє
    // чи ви оновлюєте вагу, чи повторення
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return alert("Не додано підключення Supabase");

    const { error } = await supabase.from('workout_sessions').upsert({
       id: activeSession.id,
       cycle_id: activeSession.cycleId,
       date: activeSession.date,
       day_label: activeSession.dayLabel,
       day_number: activeSession.dayNumber,
       data: activeSession.data
    });
    
    if (error) {
       console.error(error);
       return alert("Помилка збереження в базу даних!");
    }

    const existingIndex = history.findIndex(h => h.id === activeSession.id);
    if (existingIndex >= 0) {
      const newHistory = [...history];
      newHistory[existingIndex] = activeSession;
      setHistory(newHistory);
    } else {
      setHistory([...history, activeSession]);
    }
    alert("Тренування збережено!");
    setView('cycle');
    setActiveSession(null);
  };

  const createOrUpdateCycle = async (newCycle: TrainingCycle) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return alert("Не додано підключення Supabase");

    const { error } = await supabase.from('cycles').upsert({
      id: newCycle.id,
      name: newCycle.name,
      is_active: newCycle.isActive,
      templates: newCycle.templates
    });

    if (error) {
       console.error(error);
       return alert("Помилка збереження циклу в базу!");
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
       await supabase.from('cycles').update({ is_active: false }).neq('id', newCycle.id);
    }
  };

  const deleteCycle = async (id: string) => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await supabase.from('cycles').delete().eq('id', id);
    }
    setCycles(cycles.filter(c => c.id !== id));
    setHistory(history.filter(h => h.cycleId !== id)); // clean up history
    if (selectedCycleId === id) {
      setView('home');
      setSelectedCycleId(null);
    }
  };

  const deleteWorkoutSession = async (sessionId: string) => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await supabase.from('workout_sessions').delete().eq('id', sessionId);
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
        onCancel={() => { setView('cycle'); setActiveSession(null); }} 
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