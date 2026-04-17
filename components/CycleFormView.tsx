"use client";

import React, { useState } from 'react';
import { DayTemplate, TrainingCycle } from '../types';

interface CycleFormViewProps {
  initialCycle?: TrainingCycle;
  onBack: () => void;
  onSaveCycle: (cycle: TrainingCycle) => void;
}

export default function CycleFormView({ initialCycle, onBack, onSaveCycle }: CycleFormViewProps) {
  const isEditing = !!initialCycle;
  const [cycleName, setCycleName] = useState(initialCycle?.name || "");
  const [cycleDays, setCycleDays] = useState<DayTemplate[]>(
    initialCycle?.templates || [{ dayNumber: 1, label: "", exercises: [""] }]
  );

  const handleSave = () => {
    if (!cycleName) return alert("Введіть назву циклу");
    
    // Clean up empty lines
    const cleanedDays = cycleDays.map(d => ({
      ...d,
      exercises: d.exercises.filter(e => e.trim() !== "")
    }));
    
    const cycle: TrainingCycle = {
      id: initialCycle?.id || "cycle-" + Date.now(),
      name: cycleName,
      isActive: initialCycle ? initialCycle.isActive : true,
      templates: cleanedDays
    };

    onSaveCycle(cycle);
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-6 font-sans pb-24">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-zinc-400 font-bold hover:text-zinc-900">
            ← Назад
          </button>
          <h2 className="font-black text-zinc-900">{isEditing ? "Редагування циклу" : "Новий цикл"}</h2>
          <div className="w-16"></div>
        </header>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-zinc-100 focus-within:ring-2 focus-within:ring-zinc-900 transition-all">
            <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-2">Назва циклу</label>
            <input 
              type="text"
              value={cycleName}
              onChange={(e) => setCycleName(e.target.value)}
              placeholder="Напр., Силовий цикл Зима 2024"
              className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none font-bold text-zinc-900"
            />
          </div>

          {cycleDays.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-zinc-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-lg text-zinc-900">День {day.dayNumber}</h3>
                {cycleDays.length > 1 && (
                  <button 
                    onClick={() => setCycleDays(cycleDays.filter((_, i) => i !== dayIndex))}
                    className="text-red-500 font-bold text-xs uppercase tracking-wider bg-red-50 px-3 py-1.5 rounded-full"
                  >
                    Видалити день
                  </button>
                )}
              </div>

              <div className="mb-5">
                <label className="block text-[10px] uppercase font-black text-zinc-400 mb-2">Назва дня (опціонально)</label>
                <input 
                  type="text"
                  value={day.label}
                  onChange={(e) => {
                    const newDays = [...cycleDays];
                    newDays[dayIndex].label = e.target.value;
                    setCycleDays(newDays);
                  }}
                  placeholder="Напр., Спина і Біцепс"
                  className="w-full bg-zinc-50 py-3 px-4 rounded-xl outline-none text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-zinc-400 mb-2">Вправи</label>
                <div className="space-y-3">
                  {day.exercises.map((ex, exIndex) => (
                    <div key={exIndex} className="flex gap-2">
                      <input 
                        type="text"
                        value={ex}
                        onChange={(e) => {
                          const newDays = [...cycleDays];
                          newDays[dayIndex].exercises[exIndex] = e.target.value;
                          setCycleDays(newDays);
                        }}
                        placeholder={`Вправа ${exIndex + 1}`}
                        className="flex-1 bg-zinc-50 py-3 px-4 rounded-xl outline-none text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all"
                      />
                      <button 
                        onClick={() => {
                          const newDays = [...cycleDays];
                          newDays[dayIndex].exercises.splice(exIndex, 1);
                          setCycleDays(newDays);
                        }}
                        className="w-11 flex-shrink-0 bg-zinc-100 text-zinc-500 font-bold rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center text-xl pb-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newDays = [...cycleDays];
                      newDays[dayIndex].exercises.push("");
                      setCycleDays(newDays);
                    }}
                    className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-50 hover:border-zinc-400 hover:text-zinc-800 transition-all"
                  >
                    + Додати вправу
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={() => setCycleDays([...cycleDays, { dayNumber: cycleDays.length + 1, label: "", exercises: [""] }])}
            className="w-full py-5 border-2 border-dashed border-zinc-300 rounded-[2rem] text-zinc-400 font-bold hover:bg-zinc-100 hover:text-zinc-600 transition-all text-lg"
          >
            + Додати день
          </button>
        </div>

        <button 
          onClick={handleSave}
          className="w-full mt-8 bg-zinc-900 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-zinc-300 hover:bg-zinc-800 active:scale-95 transition-all"
        >
          {isEditing ? "Зберегти зміни" : "Створити цикл"}
        </button>
      </div>
    </main>
  );
}
