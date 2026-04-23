"use client";

import React from 'react';
import { TrainingCycle, WorkoutSession } from '../types';

interface StatsViewProps {
  cycle: TrainingCycle;
  history: WorkoutSession[];
  onBack: () => void;
  onEditSession: (session: WorkoutSession) => void;
}

export default function StatsView({ cycle, history, onBack, onEditSession }: StatsViewProps) {
  // Aggregate data: Exercise Name -> list of { date: string, weight: number }
  const exerciseStats: Record<string, { date: string, weight: number, session: WorkoutSession }[]> = {};

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
        exerciseStats[ex.name].push({ date: session.date, weight: parseFloat(ex.weight), session });
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
            ← Back
          </button>
          <div className="text-center">
             <h2 className="font-black text-zinc-900">Statistics</h2>
             <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{cycle.name}</p>
          </div>
          <div className="w-16"></div>
        </header>

        {Object.keys(exerciseStats).length === 0 ? (
          <div className="p-6 bg-white rounded-[2.5rem] border border-zinc-100 text-center text-zinc-500 font-medium shadow-sm">
            No results recorded for statistics yet.
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
                       Max {maxW} kg
                     </span>
                  </div>
                  
                  {/* Chart view */}
                  <div className="relative h-32 w-full mb-4 pb-2">
                     <div className="absolute bottom-2 w-full border-b-2 border-zinc-100"></div>
                     <svg className="absolute inset-0 w-full h-full overflow-visible">
                        {/* Lines */}
                        {dataList.map((d, i) => {
                          if (i === dataList.length - 1) return null;
                          const N = dataList.length;
                          const getX = (idx: number) => N === 1 ? 50 : 5 + (idx / (N-1)) * 90;
                          const getY = (val: number) => {
                             const p = maxW === minW ? 50 : ((val - minW) / (maxW - minW)) * 100;
                             return 100 - (15 + p * 0.7);
                          };
                          
                          return (
                             <line 
                               key={`line-${i}`}
                               x1={`${getX(i)}%`} y1={`${getY(d.weight)}%`}
                               x2={`${getX(i+1)}%`} y2={`${getY(dataList[i+1].weight)}%`}
                               className="stroke-zinc-900 opacity-30"
                               strokeWidth="3"
                               strokeLinecap="round"
                             />
                          );
                        })}
                        {/* Points */}
                        {dataList.map((d, i) => {
                          const N = dataList.length;
                          const x = N === 1 ? 50 : 5 + (i / (N-1)) * 90;
                          const p = maxW === minW ? 50 : ((d.weight - minW) / (maxW - minW)) * 100;
                          const y = 100 - (15 + p * 0.7);
                          
                          return (
                             <circle 
                               key={`pt-${i}`}
                               cx={`${x}%`} cy={`${y}%`}
                               r="5"
                               className="fill-white stroke-zinc-900 transition-all duration-300 pointer-events-none"
                               strokeWidth="3"
                             />
                          );
                       })}
                     </svg>
                     
                     {/* Tooltips */}
                     {dataList.map((d, i) => {
                        const N = dataList.length;
                        const x = N === 1 ? 50 : 5 + (i / (N-1)) * 90;
                        const p = maxW === minW ? 50 : ((d.weight - minW) / (maxW - minW)) * 100;
                        const y = 100 - (15 + p * 0.7);
                        return (
                           <div 
                             key={`tooltip-${i}`}
                             className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                             style={{ left: `${x}%`, top: `${y}%` }}
                           >
                             <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                               {d.weight} kg
                             </div>
                             {/* Hover effect for the point */}
                             <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-zinc-900 transition-all scale-50 group-hover:scale-100 opacity-20 pointer-events-none"></div>
                           </div>
                        );
                     })}
                  </div>
                  
                  {/* Table view */}
                  <div className="space-y-1.5 mt-6">
                     {dataList.slice().reverse().slice(0, 3).map((d, i) => (
                       <div key={i} className="flex justify-between items-center bg-zinc-50 px-4 py-2.5 rounded-xl text-sm">
                         <span className="text-zinc-500 font-medium text-xs">{d.date}</span>
                         <span className="font-black text-zinc-900">{d.weight} kg</span>
                         <button
                            onClick={() => onEditSession(d.session)}
                            className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-colors"
                            aria-label="Edit workout"
                            title="Edit workout"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
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
