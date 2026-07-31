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
  onUpdateExercise: (name: string, field: 'weight' | 'reps' | 'comment', value: string) => void;
}

export default function WorkoutView({
  activeSession,
  onCancel,
  onSave,
  onUpdateDate,
  onUpdateExercise
}: WorkoutViewProps) {
  const [invalidWeightDrafts, setInvalidWeightDrafts] = useState<Record<string, string>>({});

  const handleWeightChange = (exerciseName: string, rawValue: string) => {
    const val = rawValue.replace(',', '.');
    if (val.trim() === '' || parseWeight(val) !== null) {
      setInvalidWeightDrafts(prev => {
        if (!(exerciseName in prev)) return prev;
        const rest = { ...prev };
        delete rest[exerciseName];
        return rest;
      });
      onUpdateExercise(exerciseName, 'weight', val);
    } else {
      setInvalidWeightDrafts(prev => ({ ...prev, [exerciseName]: val }));
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
                  value={invalidWeightDrafts[exercise.name] ?? exercise.weight}
                  onChange={(e) => handleWeightChange(exercise.name, e.target.value)}
                  placeholder="0.0"
                  aria-label={`${exercise.name} weight`}
                  aria-invalid={exercise.name in invalidWeightDrafts}
                  className={`${fieldInputClassName(exercise.name in invalidWeightDrafts)} text-xl`}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-card-muted-fg font-bold">kg</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={exercise.reps}
                  onChange={(e) => onUpdateExercise(exercise.name, 'reps', e.target.value)}
                  placeholder="Num of reps"
                  aria-label={`${exercise.name} reps`}
                  className={`${fieldInputClassName()} text-xl`}
                />
              </div>
            </div>
            <div className="flex mt-4">
              <textarea
                value={exercise.comment}
                onChange={(e) => onUpdateExercise(exercise.name, 'comment', e.target.value)}
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
