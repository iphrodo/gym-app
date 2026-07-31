import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import CycleView from './CycleView';
import { TrainingCycle, WorkoutSession } from '../types';

afterEach(() => {
  cleanup();
});

function buildCycle(overrides: Partial<TrainingCycle> = {}): TrainingCycle {
  return {
    id: 'cycle-1',
    name: 'Winter Power Cycle',
    isActive: true,
    templates: [
      { dayNumber: 1, label: 'Push', exercises: ['Bench press'] },
      { dayNumber: 2, label: 'Pull', exercises: ['Deadlift'] },
    ],
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
    data: [
      { name: 'Bench press', weight: '80', reps: '5', comment: '' },
      { name: 'Overhead press', weight: '', reps: '5', comment: '' },
    ],
    createdAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

function noop() {}

describe('CycleView', () => {
  it('renders day templates as start links', () => {
    const cycle = buildCycle();
    render(<CycleView selectedCycle={cycle} cycleHistory={[]} onDeleteSession={noop} />);

    const startLinks = screen.getAllByRole('link', { name: /Start$/ });
    expect(startLinks).toHaveLength(2);
    expect(within(startLinks[0]).getByText('Push')).toBeInTheDocument();
    expect(startLinks[0]).toHaveAttribute('href', '/cycles/cycle-1/workouts/new?day=1');
    expect(within(startLinks[1]).getByText('Pull')).toBeInTheDocument();
    expect(startLinks[1]).toHaveAttribute('href', '/cycles/cycle-1/workouts/new?day=2');
  });

  it('links to stats, edit, and back routes', () => {
    const cycle = buildCycle();
    render(<CycleView selectedCycle={cycle} cycleHistory={[]} onDeleteSession={noop} />);

    expect(screen.getByRole('link', { name: '← All' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Statistics/ })).toHaveAttribute('href', '/cycles/cycle-1/stats');
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/cycles/cycle-1/edit');
  });

  it('renders history newest-first with correct completion counts', () => {
    const cycle = buildCycle();
    const history = [
      buildSession({ id: 's-old', date: '2026-06-01', dayLabel: 'Push day', data: [{ name: 'a', weight: '10', reps: '', comment: '' }] }),
      buildSession({ id: 's-new', date: '2026-07-15', dayLabel: 'Pull day', data: [
        { name: 'a', weight: '10', reps: '', comment: '' },
        { name: 'b', weight: '', reps: '', comment: '' },
      ] }),
    ];

    render(<CycleView selectedCycle={cycle} cycleHistory={history} onDeleteSession={noop} />);

    const dayLabels = screen.getAllByText(/day$/i).map(el => el.textContent);
    expect(dayLabels).toEqual(['Pull day', 'Push day']);

    const counts = screen.getAllByText(/Exercises completed:/);
    expect(counts[0]).toHaveTextContent('Exercises completed: 1 / 2');
    expect(counts[1]).toHaveTextContent('Exercises completed: 1 / 1');

    const editLinks = screen.getAllByLabelText('Edit workout');
    expect(editLinks[0]).toHaveAttribute('href', '/workouts/s-new');
    expect(editLinks[1]).toHaveAttribute('href', '/workouts/s-old');
  });

  it('reads zero elapsed days for a cycle with no sessions', () => {
    const cycle = buildCycle();
    render(<CycleView selectedCycle={cycle} cycleHistory={[]} onDeleteSession={noop} />);

    expect(screen.getByText('Days in cycle').nextElementSibling).toHaveTextContent('0');
  });
});
