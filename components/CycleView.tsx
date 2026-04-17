"use client";

import React from 'react';
import { TrainingCycle, WorkoutSession, DayTemplate } from '../types';

interface CycleViewProps {
  selectedCycle: TrainingCycle;
  cycleHistory: WorkoutSession[];
  onBack: () => void;
  onStartWorkout: (template: DayTemplate) => void;
  onDeleteSession: (sessionId: string) => void;
  onEditCycle: () => void;
  onViewStats: () => void;
  onEditSession: (session: WorkoutSession) => void;
}

export default function CycleView({ selectedCycle, cycleHistory, onBack, onStartWorkout, onDeleteSession, onEditCycle, onViewStats, onEditSession }: CycleViewProps) {
  const duration = cycleHistory.length > 0 
    ? Math.ceil(Math.abs(new Date().getTime() - new Date(Number(cycleHistory[0].id)).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <main className="min-h-screen bg-zinc-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-zinc-400 font-bold hover:text-zinc-900">
            ← Всі
          </button>
          <div className="flex gap-2">
            <button onClick={onViewStats} className="text-xs font-black uppercase tracking-wider text-zinc-900 bg-white border-2 border-zinc-100 shadow-sm px-4 py-2 rounded-xl hover:border-zinc-300 transition-colors">
              📊 Статистика
            </button>
            <button onClick={onEditCycle} className="text-xs font-black uppercase tracking-wider text-zinc-900 bg-zinc-100 px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors">
              Редагувати
            </button>
          </div>
        </header>

        <section className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100">
          <h2 className="text-2xl font-black text-zinc-800 mb-6">{selectedCycle.name}</h2>

          <div className="flex gap-3 mb-8">
            <div className="flex-1 bg-zinc-50 p-4 rounded-3xl border border-zinc-100">
              <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-black mb-1">Тренувань</span>
              <span className="text-2xl font-black text-zinc-900">{cycleHistory.length}</span>
            </div>
            <div className="flex-1 bg-zinc-50 p-4 rounded-3xl border border-zinc-100">
              <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-black mb-1">Днів у циклі</span>
              <span className="text-2xl font-black text-zinc-900">{duration}</span>
            </div>
          </div>

          <h3 className="font-bold text-zinc-800 mb-4 px-2">Програма циклу</h3>
          <div className="grid gap-3 mb-8">
            {selectedCycle.templates.map((template) => (
              <button
                key={template.dayNumber}
                onClick={() => onStartWorkout(template)}
                className="group flex items-center justify-between p-5 bg-zinc-50 border border-zinc-100 rounded-3xl hover:bg-zinc-900 hover:text-white transition-all duration-300"
              >
                <div className="text-left w-full pl-2">
                  <span className="block text-[10px] font-black uppercase opacity-50 mb-1">День {template.dayNumber}</span>
                  <span className="text-lg font-bold">{template.label || 'Без назви'}</span>
                </div>
                <div className="h-10 px-4 text-xs tracking-wider uppercase rounded-full bg-white group-hover:bg-zinc-800 flex items-center justify-center shadow-sm font-black text-zinc-900 group-hover:text-white transition-colors">
                  Почати
                </div>
              </button>
            ))}
          </div>

          {cycleHistory.length > 0 && (
            <>
              <h3 className="font-bold text-zinc-800 mb-4 px-2">Історія тренувань</h3>
              <div className="grid gap-3">
                {cycleHistory.slice().reverse().map(session => (
                  <div key={session.id} className="p-5 bg-zinc-50 rounded-3xl border border-zinc-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm text-zinc-800">{session.dayLabel}</span>
                        <span className="text-xs font-bold text-zinc-400">• {session.date}</span>
                      </div>
                      <p className="text-xs font-medium text-zinc-500">Вправ виконано: {session.data.filter(d => d.weight).length} / {session.data.length}</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => onEditSession(session)}
                        className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-colors"
                        aria-label="Редагувати тренування"
                        title="Редагувати тренування"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Дійсно видалити це тренування з історії?")) {
                            onDeleteSession(session.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors ml-1"
                        aria-label="Видалити тренування"
                        title="Видалити тренування"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
