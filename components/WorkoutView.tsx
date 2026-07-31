"use client";

import React, { useState } from 'react';
import { WorkoutSession } from '../types';
import { parseWeight } from '../lib/exerciseValues';
import { Screen, ScreenHeader } from './ui/Screen';
import Card from './ui/Card';
import Button from './ui/Button';
import Field, { fieldInputClassName } from './ui/Field';

interface WorkoutViewProps {
  activeSession: WorkoutSession;
  onCancel: () => void;
  onSave: () => void;
  onUpdateDate: (date: string) => void;
  onUpdateExercise: (index: number, field: 'weight' | 'reps' | 'comment', value: string) => void;
}

export default function WorkoutView({
  activeSession,
  onCancel,
  onSave,
  onUpdateDate,
  onUpdateExercise
}: WorkoutViewProps) {
  const [invalidWeightDrafts, setInvalidWeightDrafts] = useState<Record<number, string>>({});

  const handleWeightChange = (index: number, rawValue: string) => {
    const val = rawValue.replace(',', '.');
    if (val.trim() === '' || parseWeight(val) !== null) {
      setInvalidWeightDrafts(prev => {
        if (!(index in prev)) return prev;
        const rest = { ...prev };
        delete rest[index];
        return rest;
      });
      onUpdateExercise(index, 'weight', val);
    } else {
      setInvalidWeightDrafts(prev => ({ ...prev, [index]: val }));
    }
  };

  return (
    <Screen>
      <ScreenHeader
        left={
          <button onClick={onCancel} className="text-card-muted-fg font-bold hover:text-page-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">
            ← Cancel
          </button>
        }
        title={`Day ${activeSession.dayNumber}`}
        subtitle={activeSession.dayLabel}
      />

      <Card rounded="md" interactive className="mb-6">
        <Field label="Workout date" htmlFor="workout-date">
          <input
            id="workout-date"
            type="date"
            value={activeSession.date}
            onChange={(e) => onUpdateDate(e.target.value)}
            className={fieldInputClassName()}
          />
        </Field>
      </Card>

      <div className="space-y-4">
        {activeSession.data.map((exercise, index) => (
          <Card key={index} rounded="md" interactive>
            <h3 className="font-bold mb-4">{exercise.name}</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={invalidWeightDrafts[index] ?? exercise.weight}
                  onChange={(e) => handleWeightChange(index, e.target.value)}
                  placeholder="0.0"
                  aria-label={`${exercise.name} weight`}
                  aria-invalid={index in invalidWeightDrafts}
                  className={`${fieldInputClassName(index in invalidWeightDrafts)} text-xl`}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-card-muted-fg font-bold">kg</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={exercise.reps}
                  onChange={(e) => onUpdateExercise(index, 'reps', e.target.value)}
                  placeholder="Num of reps"
                  aria-label={`${exercise.name} reps`}
                  className={`${fieldInputClassName()} text-xl`}
                />
              </div>
            </div>
            <div className="flex mt-4">
              <textarea
                value={exercise.comment}
                onChange={(e) => onUpdateExercise(index, 'comment', e.target.value)}
                placeholder="Comment"
                aria-label={`${exercise.name} comment`}
                className={`${fieldInputClassName()} text-xl`}
              />
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={onSave} className="w-full mt-10 shadow-card-inverted-bg/20 hover:-translate-y-1 hover:shadow-2xl">
        Save results
      </Button>
    </Screen>
  );
}
