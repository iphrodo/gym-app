"use client";

import React from 'react';
import { WorkoutSession } from '../types';

interface WorkoutViewProps {
  activeSession: WorkoutSession;
  onCancel: () => void;
  onSave: () => void;
  onUpdateDate: (date: string) => void;
  onUpdateExercise: (name: string, field: 'weight' | 'reps' | 'comment', value: string) => void;
}

export default function WorkoutView({ 
  activeSession, 
  onCancel, 
  onSave, 
  onUpdateDate, 
  onUpdateExercise 
}: WorkoutViewProps) {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button onClick={onCancel} className="text-zinc-400 font-bold hover:text-zinc-900">
            ← Cancel
          </button>
          <div className="text-center">
            <h2 className="font-black text-zinc-900">Day {activeSession.dayNumber}</h2>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{activeSession.dayLabel}</p>
          </div>
          <div className="w-20"></div>
        </header>

        <div className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-zinc-100 mb-6 focus-within:ring-2 focus-within:ring-zinc-900 transition-all">
          <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-2">Workout date</label>
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
                <div className="relative">
                  <input 
                    type="text"            
                    inputMode="decimal"    
                    value={exercise.weight}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      onUpdateExercise(exercise.name, 'weight', val);
                    }}
                    placeholder="0.0"
                    className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none font-black text-xl"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">kg</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={exercise.reps}
                    onChange={(e) => onUpdateExercise(exercise.name, 'reps', e.target.value)}
                    placeholder="Num of reps"
                    className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none font-black text-xl"
                  />
                </div>
              </div>
              <div className="flex mt-4">
                  <input
                    type="textarea"
                    value={exercise.comment}
                    onChange={(e) => onUpdateExercise(exercise.name, 'comment', e.target.value)}
                    placeholder="Comment"
                    className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none font-black text-xl"
                  />
                </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onSave}
          className="w-full mt-10 bg-zinc-900 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-zinc-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all duration-300"
        >
          Save results
        </button>
      </div>
    </main>
  );
}
