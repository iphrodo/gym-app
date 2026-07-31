"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { DayTemplate, TrainingCycle } from '../types';
import { Screen, ScreenHeader } from './ui/Screen';
import Card from './ui/Card';
import Button from './ui/Button';
import Field, { fieldInputClassName } from './ui/Field';

interface CycleFormViewProps {
  initialCycle?: TrainingCycle;
  backHref: string;
  onSaveCycle: (cycle: TrainingCycle) => void;
}

export default function CycleFormView({ initialCycle, backHref, onSaveCycle }: CycleFormViewProps) {
  const isEditing = !!initialCycle;
  const [cycleName, setCycleName] = useState(initialCycle?.name || "");
  const [cycleDays, setCycleDays] = useState<DayTemplate[]>(
    initialCycle ? structuredClone(initialCycle.templates) : [{ dayNumber: 1, label: "", exercises: [""] }]
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!cycleName) {
      setNameError('Enter a cycle name');
      nameInputRef.current?.focus();
      return;
    }

    // Clean up empty lines
    const cleanedDays = cycleDays.map(d => ({
      ...d,
      exercises: d.exercises.filter(e => e.trim() !== "")
    }));

    const cycle: TrainingCycle = {
      id: initialCycle?.id || "cycle-" + crypto.randomUUID(),
      name: cycleName,
      isActive: initialCycle ? initialCycle.isActive : true,
      templates: cleanedDays,
      createdAt: initialCycle?.createdAt || new Date().toISOString()
    };

    onSaveCycle(cycle);
  };

  return (
    <Screen className="pb-24">
      <ScreenHeader
        left={
          <Link href={backHref} className="text-card-muted-fg font-bold hover:text-page-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">
            ← Back
          </Link>
        }
        title={isEditing ? "Edit cycle" : "New cycle"}
      />

      <div className="space-y-6">
        <Card rounded="md" interactive>
          <Field label="Cycle name" htmlFor="cycle-name" error={nameError ?? undefined}>
            <input
              ref={nameInputRef}
              id="cycle-name"
              type="text"
              value={cycleName}
              onChange={(e) => {
                setCycleName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="E.g., Winter Power Cycle 2024"
              className={fieldInputClassName(!!nameError)}
            />
          </Field>
        </Card>

        {cycleDays.map((day, dayIndex) => (
          <Card key={dayIndex} rounded="md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg">Day {day.dayNumber}</h3>
              {cycleDays.length > 1 && (
                <button
                  onClick={() => setCycleDays(cycleDays.filter((_, i) => i !== dayIndex))}
                  className="text-danger-muted-fg font-bold text-xs uppercase tracking-wider bg-danger-muted-bg px-3 py-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  Delete day
                </button>
              )}
            </div>

            <div className="mb-5">
              <Field label="Day name (optional)" htmlFor={`day-name-${dayIndex}`}>
                <input
                  id={`day-name-${dayIndex}`}
                  type="text"
                  value={day.label}
                  onChange={(e) => {
                    const newDays = [...cycleDays];
                    newDays[dayIndex].label = e.target.value;
                    setCycleDays(newDays);
                  }}
                  placeholder="E.g., Back and Biceps"
                  className={`${fieldInputClassName()} py-3 px-4 rounded-xl text-sm`}
                />
              </Field>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-card-muted-fg mb-2">Exercises</label>
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
                      placeholder={`Exercise ${exIndex + 1}`}
                      aria-label={`Exercise ${exIndex + 1}`}
                      className={`flex-1 ${fieldInputClassName()} py-3 px-4 rounded-xl text-sm`}
                    />
                    <button
                      onClick={() => {
                        const newDays = [...cycleDays];
                        newDays[dayIndex].exercises.splice(exIndex, 1);
                        setCycleDays(newDays);
                      }}
                      aria-label={`Remove exercise ${exIndex + 1}`}
                      className="w-11 flex-shrink-0 surface-muted font-bold rounded-xl hover:bg-danger-muted-bg hover:text-danger-muted-fg transition-colors flex items-center justify-center text-xl pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
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
                  className="w-full py-4 border-2 border-dashed border-card-border rounded-xl text-sm font-bold text-card-muted-fg hover:bg-muted-bg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  + Add exercise
                </button>
              </div>
            </div>
          </Card>
        ))}

        <button
          onClick={() => setCycleDays([...cycleDays, { dayNumber: cycleDays.length + 1, label: "", exercises: [""] }])}
          className="w-full py-5 border-2 border-dashed border-card-border rounded-[2rem] text-card-muted-fg font-bold hover:bg-muted-bg transition-all text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          + Add day
        </button>
      </div>

      <Button onClick={handleSave} className="w-full mt-8">
        {isEditing ? "Save changes" : "Create cycle"}
      </Button>
    </Screen>
  );
}
