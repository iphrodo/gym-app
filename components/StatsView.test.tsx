import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import StatsView from './StatsView';
import { TrainingCycle, WorkoutSession } from '../types';

afterEach(() => {
  cleanup();
});

function buildCycle(overrides: Partial<TrainingCycle> = {}): TrainingCycle {
  return {
    id: 'cycle-1',
    name: 'Winter Power Cycle',
    isActive: true,
    templates: [{ dayNumber: 1, label: 'Push', exercises: ['Bench press', 'Squat'] }],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function buildSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'session-1',
    cycleId: 'cycle-1',
    date: '2026-07-01',
    dayLabel: 'Push',
    dayNumber: 1,
    data: [],
    createdAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('StatsView', () => {
  it('links back to the cycle and to each session for editing', () => {
    const cycle = buildCycle();
    const history = [buildSession({ data: [{ name: 'Bench press', weight: '80', reps: '5', comment: '' }] })];

    render(<StatsView cycle={cycle} history={history} />);

    expect(screen.getByRole('link', { name: '← Back' })).toHaveAttribute('href', '/cycles/cycle-1');
    expect(screen.getByLabelText('Edit workout')).toHaveAttribute('href', '/workouts/session-1');
  });

  it('excludes exercises with no recorded weight', () => {
    const cycle = buildCycle();
    const history = [
      buildSession({
        data: [
          { name: 'Bench press', weight: '80', reps: '5', comment: '' },
          { name: 'Squat', weight: '', reps: '5', comment: '' },
        ],
      }),
    ];

    render(<StatsView cycle={cycle} history={history} />);

    expect(screen.getByText('Bench press')).toBeInTheDocument();
    expect(screen.queryByText('Squat')).not.toBeInTheDocument();
  });

  it('never lets a non-numeric weight reach chart coordinates', () => {
    const cycle = buildCycle();
    const history = [
      buildSession({
        data: [
          { name: 'Bench press', weight: '80', reps: '5', comment: '' },
        ],
      }),
      buildSession({
        id: 'session-2',
        date: '2026-07-08',
        data: [
          { name: 'Bench press', weight: 'not-a-number', reps: '5', comment: '' },
        ],
      }),
    ];

    render(<StatsView cycle={cycle} history={history} />);

    const svg = document.querySelector('svg');
    const circles = svg?.querySelectorAll('circle') ?? [];
    expect(circles).toHaveLength(1);
    circles.forEach(circle => {
      expect(circle.getAttribute('cx')).not.toMatch(/NaN/);
      expect(circle.getAttribute('cy')).not.toMatch(/NaN/);
    });
    expect(screen.getByText('Max 80 kg')).toBeInTheDocument();
  });

  it('renders the empty state when nothing qualifies', () => {
    const cycle = buildCycle();
    render(<StatsView cycle={cycle} history={[]} />);

    expect(screen.getByText('No results recorded for statistics yet.')).toBeInTheDocument();
  });
});
