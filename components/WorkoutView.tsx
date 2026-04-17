"use client";

import React from 'react';
import { WorkoutSession } from '../types';

interface WorkoutViewProps {
  activeSession: WorkoutSession;
  onCancel: () => void;
  onSave: () => void;
  onUpdateDate: (date: string) => void;
  onUpdateWeight: (exerciseName: string, weight: string) => void;
}

export default function WorkoutView({ 
  activeSession, 
  onCancel, 
  onSave, 
  onUpdateDate, 
  onUpdateWeight 
}: WorkoutViewProps) {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button onClick={onCancel} className="text-zinc-400 font-bold hover:text-zinc-900">
            ← Скасувати
          </button>
          <div className="text-center">
            <h2 className="font-black text-zinc-900">День {activeSession.dayNumber}</h2>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{activeSession.dayLabel}</p>
          </div>
          <div className="w-20"></div>
        </header>

        <div className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-zinc-100 mb-6 focus-within:ring-2 focus-within:ring-zinc-900 transition-all">
          <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-2">Дата тренування</label>
          <input 
            type="date"
            value={activeSession.date}
            onChange={(e) => onUpdateDate(e.target.value)}
            className="w-full bg-zinc-50 py-3 px-4 rounded-xl outline-none font-bold text-zinc-900"
          />
        </div>

        <div className="space-y-4">
          {activeSession.data.map((exercise, index) => (
            <div key={index} className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-zinc-100 focus-within:ring-2 focus-within:ring-zinc-900 transition-all">
              <h3 className="font-bold text-zinc-800 mb-4">{exercise.name}</h3>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input 
                    type="number"
                    inputMode="decimal"
                    value={exercise.weight}
                    onChange={(e) => onUpdateWeight(exercise.name, e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none font-black text-xl"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">кг</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onSave}
          className="w-full mt-10 bg-zinc-900 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-zinc-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all duration-300"
        >
          Зберегти результати
        </button>
      </div>
    </main>
  );
}
