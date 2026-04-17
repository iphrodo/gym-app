"use client";

import React, { useState, useEffect } from 'react';
import { TrainingCycle, WorkoutSession, DayTemplate } from '../types';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<'home' | 'cycle' | 'new_cycle' | 'edit_cycle' | 'workout' | 'stats'>('home');
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [cycles, setCycles] = useState<TrainingCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  // --- Persistence Logic ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('gym-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedCycles = localStorage.getItem('gym-cycles');
    if (savedCycles) {
      setCycles(JSON.parse(savedCycles));
    } else {
      setCycles([DEFAULT_CYCLE]);
      localStorage.setItem('gym-cycles', JSON.stringify([DEFAULT_CYCLE]));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gym-history', JSON.stringify(history));
      localStorage.setItem('gym-cycles', JSON.stringify(cycles));
    }
  }, [history, cycles, isLoaded]);

  if (!isLoaded) return null; // Avoid hydration mismatch

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

  const updateWeight = (exerciseName: string, weight: string) => {
    if (!activeSession) return;
    const updatedData = activeSession.data.map(item => 
      item.name === exerciseName ? { ...item, weight } : item
    );
    setActiveSession({ ...activeSession, data: updatedData });
  };

  const updateSessionDate = (date: string) => {
    if (!activeSession) return;
    setActiveSession({ ...activeSession, date });
  }

  const saveWorkout = () => {
    if (!activeSession) return;
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

  const createOrUpdateCycle = (newCycle: TrainingCycle) => {
    const existingIndex = cycles.findIndex(c => c.id === newCycle.id);
    if (existingIndex >= 0) {
       const newCycles = [...cycles];
       newCycles[existingIndex] = newCycle;
       setCycles(newCycles);
       setView('cycle');
    } else {
       setCycles([...cycles.map(c => ({...c, isActive: false})), newCycle]);
       setView('home');
    }
  };

  const deleteCycle = (id: string) => {
    setCycles(cycles.filter(c => c.id !== id));
    setHistory(history.filter(h => h.cycleId !== id)); // clean up history
    if (selectedCycleId === id) {
      setView('home');
      setSelectedCycleId(null);
    }
  };

  const deleteWorkoutSession = (sessionId: string) => {
    setHistory(history.filter(h => h.id !== sessionId));
  };

  // --- Render Views ---

  if (view === 'home') {
    return (
      <HomeView 
        cycles={cycles} 
        onSelectCycle={(id) => { setSelectedCycleId(id); setView('cycle'); }} 
        onNewCycle={() => setView('new_cycle')} 
        onDeleteCycle={deleteCycle}
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
        onUpdateWeight={updateWeight} 
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