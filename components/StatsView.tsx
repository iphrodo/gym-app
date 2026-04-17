"use client";

import React from 'react';
import { TrainingCycle, WorkoutSession } from '../types';

interface StatsViewProps {
  cycle: TrainingCycle;
  history: WorkoutSession[];
  onBack: () => void;
}

export default function StatsView({ cycle, history, onBack }: StatsViewProps) {
  // Aggregate data: Exercise Name -> list of { date: string, weight: number }
  const exerciseStats: Record<string, { date: string, weight: number }[]> = {};

  // Find all unique exercises registered in the cycle template
  const cycleExercises = new Set<string>();
  cycle.templates.forEach(t => t.exercises.forEach(e => cycleExercises.add(e)));

  // If we also want to display exercises mapped historically that are no longer in template
  history.forEach(session => {
    session.data.forEach(ex => {
       if (ex.weight) {
         cycleExercises.add(ex.name);
       }
    });
  });

  cycleExercises.forEach(name => {
    exerciseStats[name] = [];
  });

  // Sort history ascending to have correct temporal chart
  const sortedHistory = [...history].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedHistory.forEach(session => {
    session.data.forEach(ex => {
      if (ex.weight && exerciseStats[ex.name]) {
        exerciseStats[ex.name].push({ date: session.date, weight: parseFloat(ex.weight) });
      }
    });
  });

  // Remove exercises with no data
  Object.keys(exerciseStats).forEach(name => {
    if (exerciseStats[name].length === 0) delete exerciseStats[name];
  });

  return (
    <main className="min-h-screen bg-zinc-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-zinc-400 font-bold hover:text-zinc-900">
            ← Назад
          </button>
          <div className="text-center">
             <h2 className="font-black text-zinc-900">Статистика</h2>
             <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{cycle.name}</p>
          </div>
          <div className="w-16"></div>
        </header>

        {Object.keys(exerciseStats).length === 0 ? (
          <div className="p-6 bg-white rounded-[2.5rem] border border-zinc-100 text-center text-zinc-500 font-medium shadow-sm">
            Ще немає записаних результатів для статистики.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(exerciseStats).map(([name, dataList]) => {
              const weights = dataList.map(d => d.weight);
              const maxW = Math.max(...weights);
              const minW = Math.max(0, Math.min(...weights) - 10); // buffer for bottom
              return (
                <div key={name} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-100">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="font-bold text-zinc-800 leading-tight">{name}</h3>
                     <span className="text-[10px] uppercase font-black tracking-wider text-green-600 bg-green-50 px-3 py-1 rounded-full">
                       Макс {maxW} кг
                     </span>
                  </div>
                  
                  {/* Chart view */}
                  <div className="relative h-32 w-full flex items-end justify-between gap-1 mb-4 pb-2">
                     <div className="absolute bottom-0 w-full border-b-2 border-zinc-100 -z-10"></div>
                     {dataList.map((d, i) => {
                       const percentage = maxW === minW ? 50 : ((d.weight - minW) / (maxW - minW)) * 100;
                       return (
                         <div key={i} className="flex flex-col items-center flex-1 group">
                           <div className="w-full relative flex justify-center items-end" style={{ height: '100px' }}>
                             <div 
                               className="w-full bg-zinc-900 rounded-t-lg transition-all duration-300 opacity-30 group-hover:opacity-100 min-h-[10%]"
                               style={{ height: `${Math.max(10, percentage)}%` }}
                             >
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                  {d.weight} кг
                                </div>
                             </div>
                           </div>
                         </div>
                       )
                     })}
                  </div>
                  
                  {/* Table view */}
                  <div className="space-y-1.5 mt-6">
                     {dataList.slice().reverse().slice(0, 3).map((d, i) => (
                       <div key={i} className="flex justify-between items-center bg-zinc-50 px-4 py-2.5 rounded-xl text-sm">
                         <span className="text-zinc-500 font-medium text-xs">{d.date}</span>
                         <span className="font-black text-zinc-900">{d.weight} кг</span>
                       </div>
                     ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
