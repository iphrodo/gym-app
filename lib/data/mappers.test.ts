import { describe, it, expect } from 'vitest';
import { cycleFromRow, cycleToRow, workoutSessionFromRow, workoutSessionToRow } from './mappers';
import { TrainingCycle, WorkoutSession } from '../../types';

describe('cycleFromRow', () => {
  it('maps snake_case columns to the camelCase domain shape', () => {
    const cycle = cycleFromRow({
      id: 'c1',
      name: 'Power Cycle',
      is_active: true,
      templates: [{ dayNumber: 1, label: 'Push', exercises: ['Bench'] }],
      user_id: 'u1',
      created_at: '2026-01-01T00:00:00.000Z',
    });

    expect(cycle).toEqual({
      id: 'c1',
      name: 'Power Cycle',
      isActive: true,
      templates: [{ dayNumber: 1, label: 'Push', exercises: ['Bench'] }],
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('defaults a missing templates jsonb column to an empty array', () => {
    const cycle = cycleFromRow({
      id: 'c1',
      name: 'Power Cycle',
      is_active: true,
      templates: null,
      user_id: 'u1',
      created_at: '2026-01-01T00:00:00.000Z',
    });

    expect(cycle.templates).toEqual([]);
  });
});

describe('cycleToRow', () => {
  it('maps the domain shape to snake_case columns, injecting the owner', () => {
    const cycle: TrainingCycle = {
      id: 'c1',
      name: 'Power Cycle',
      isActive: true,
      templates: [],
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    expect(cycleToRow(cycle, 'owner-1')).toEqual({
      id: 'c1',
      name: 'Power Cycle',
      is_active: true,
      templates: [],
      user_id: 'owner-1',
      created_at: '2026-01-01T00:00:00.000Z',
    });
  });
});

describe('workoutSessionFromRow', () => {
  it('maps snake_case columns to the camelCase domain shape', () => {
    const session = workoutSessionFromRow({
      id: 's1',
      cycle_id: 'c1',
      date: '2026-07-01',
      day_label: 'Push',
      day_number: 1,
      data: [{ name: 'Bench', weight: '80', reps: '5', comment: '' }],
      user_id: 'u1',
      created_at: '2026-07-01T00:00:00.000Z',
    });

    expect(session).toEqual({
      id: 's1',
      cycleId: 'c1',
      date: '2026-07-01',
      dayLabel: 'Push',
      dayNumber: 1,
      data: [{ name: 'Bench', weight: '80', reps: '5', comment: '' }],
      createdAt: '2026-07-01T00:00:00.000Z',
    });
  });

  it('defaults a missing data jsonb column to an empty array', () => {
    const session = workoutSessionFromRow({
      id: 's1',
      cycle_id: 'c1',
      date: '2026-07-01',
      day_label: 'Push',
      day_number: 1,
      data: null,
      user_id: 'u1',
      created_at: '2026-07-01T00:00:00.000Z',
    });

    expect(session.data).toEqual([]);
  });

  it('normalises exercise sets with missing optional fields', () => {
    const session = workoutSessionFromRow({
      id: 's1',
      cycle_id: 'c1',
      date: '2026-07-01',
      day_label: 'Push',
      day_number: 1,
      data: [{ name: 'Bench' } as never],
      user_id: 'u1',
      created_at: '2026-07-01T00:00:00.000Z',
    });

    expect(session.data).toEqual([{ name: 'Bench', weight: '', reps: '', comment: '' }]);
  });
});

describe('workoutSessionToRow', () => {
  it('maps the domain shape to snake_case columns, injecting the owner', () => {
    const session: WorkoutSession = {
      id: 's1',
      cycleId: 'c1',
      date: '2026-07-01',
      dayLabel: 'Push',
      dayNumber: 1,
      data: [{ name: 'Bench', weight: '80', reps: '5', comment: '' }],
      createdAt: '2026-07-01T00:00:00.000Z',
    };

    expect(workoutSessionToRow(session, 'owner-1')).toEqual({
      id: 's1',
      cycle_id: 'c1',
      date: '2026-07-01',
      day_label: 'Push',
      day_number: 1,
      data: [{ name: 'Bench', weight: '80', reps: '5', comment: '' }],
      user_id: 'owner-1',
      created_at: '2026-07-01T00:00:00.000Z',
    });
  });
});
