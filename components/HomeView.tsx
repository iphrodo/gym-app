import React from 'react';
import { TrainingCycle, WorkoutSession } from '../types';
import { supabase } from '../lib/supabaseClient';

interface HomeViewProps {
  cycles: TrainingCycle[];
  history: WorkoutSession[];
  onSelectCycle: (id: string) => void;
  onNewCycle: () => void;
  onDeleteCycle: (id: string) => void;
}

export default function HomeView({ cycles, history, onSelectCycle, onNewCycle, onDeleteCycle }: HomeViewProps) {
  const recentHistory = history
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || Number(b.id) - Number(a.id))
    .slice(0, 3);
  return (
    <main className="min-h-screen bg-zinc-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight">GymFlow</h1>
            <p className="text-zinc-500 font-medium tracking-tight">Твій тренувальний щоденник</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-[10px] font-black uppercase tracking-wider text-zinc-500 bg-white border border-zinc-200 px-3 py-1.5 rounded-xl hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            Вийти
          </button>
        </header>

        {recentHistory.length > 0 && (
          <div className="mb-10">
            <h3 className="font-bold text-zinc-800 mb-4 px-2">Останні тренування</h3>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
              {recentHistory.map(session => (
                <div key={session.id} className="min-w-[85%] snap-center bg-zinc-900 text-white p-6 rounded-[2.5rem] shadow-xl shadow-zinc-900/20">
                  <div className="flex justify-between items-baseline mb-4 border-b border-white/10 pb-4">
                    <h4 className="font-black text-lg leading-tight w-2/3">{session.dayLabel}</h4>
                    <span className="text-[10px] font-black text-zinc-400 bg-white/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{session.date}</span>
                  </div>
                  <div className="space-y-3">
                    {session.data.filter(d => d.weight).length > 0 
                      ? session.data.filter(d => d.weight).map((ex, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <span className="text-zinc-400 truncate pr-4 text-xs font-bold leading-tight">{ex.name}</span>
                          <span className="font-black text-white whitespace-nowrap bg-white/10 px-2 py-1 rounded-lg">{ex.weight} кг</span>
                        </div>
                      ))
                      : <div className="text-zinc-500 text-xs font-bold">Немає записаних вправ</div>
                    }
                  </div>
                </div>
              ))}
            </div>
            
            {/* Minimal inline CSS to hide scrollbar while keeping functionality */}
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-scrollbar {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
              }
            `}</style>
          </div>
        )}

        <h3 className="font-bold text-zinc-800 mb-4 px-2 mt-4">Всі цикли</h3>
        <div className="grid gap-4">
          {cycles.map((cycle) => (
            <div
              key={cycle.id}
              className="flex flex-col bg-white p-6 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 hover:border-zinc-300 transition-all w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-zinc-800">{cycle.name}</h2>
                  {cycle.isActive && <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">Активний</span>}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Ви дійсно хочете видалити цей цикл та всю його історію тренувань?")) {
                      onDeleteCycle(cycle.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                  aria-label="Видалити цикл"
                  title="Видалити цикл"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500 font-medium">{cycle.templates.length} тренувальних днів</p>
                <button 
                  onClick={() => onSelectCycle(cycle.id)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-2xl text-sm font-bold transition-colors"
                >
                  Відкрити
                </button>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onNewCycle}
          className="w-full mt-6 py-5 border-2 border-dashed border-zinc-300 rounded-[2rem] text-zinc-400 font-bold hover:bg-zinc-100 hover:text-zinc-600 transition-all text-lg"
        >
          + Новий цикл
        </button>
      </div>
    </main>
  );
}
