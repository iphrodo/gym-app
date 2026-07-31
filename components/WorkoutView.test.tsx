import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import WorkoutView from './WorkoutView';
import { WorkoutSession } from '../types';

// The real values for the two Tailwind classes under test (zinc-50 / zinc-900).
// `.bg-zinc-50` also sets a matching text color as a deliberately illegible
// baseline, so `.text-zinc-900` is what has to win for the input to be readable.
const ZINC_INPUT_COLORS_CSS = `
  .bg-zinc-50 { background-color: #fafafa; color: #fafafa; }
  .text-zinc-900 { color: #18181b; }
`;

beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = ZINC_INPUT_COLORS_CSS;
  document.head.appendChild(style);
});

afterEach(() => {
  cleanup();
});

function buildSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'session-1',
    cycleId: 'cycle-1',
    date: '2026-07-01',
    dayLabel: 'Push day',
    dayNumber: 1,
    data: [{ name: 'Bench press', weight: '', reps: '', comment: '' }],
    userId: 'user-1',
    createdAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

function noop() {}

describe('WorkoutView', () => {
  it('renders the header, date field, and exercise rows', () => {
    const session = buildSession({
      dayNumber: 3,
      dayLabel: 'Leg day',
      data: [{ name: 'Squat', weight: '100', reps: '5', comment: '' }],
    });

    render(
      <WorkoutView
        activeSession={session}
        onCancel={noop}
        onSave={noop}
        onUpdateDate={noop}
        onUpdateExercise={noop}
      />
    );

    expect(screen.getByText('Day 3')).toBeInTheDocument();
    expect(screen.getByText('Leg day')).toBeInTheDocument();
    expect(screen.getByLabelText('Workout date')).toHaveValue('2026-07-01');
    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('renders entered text so it is visible against the input background', () => {
    const session = buildSession({
      data: [{ name: 'Bench press', weight: '80', reps: '', comment: '' }],
    });

    render(
      <WorkoutView
        activeSession={session}
        onCancel={noop}
        onSave={noop}
        onUpdateDate={noop}
        onUpdateExercise={noop}
      />
    );

    const weightInput = screen.getByDisplayValue('80');
    const style = getComputedStyle(weightInput);

    expect(style.color).not.toBe(style.backgroundColor);
  });

  it('calls the update handler when weight, reps, and comment are edited', () => {
    const onUpdateExercise = vi.fn();
    const session = buildSession({
      data: [{ name: 'Bench press', weight: '', reps: '', comment: '' }],
    });

    render(
      <WorkoutView
        activeSession={session}
        onCancel={noop}
        onSave={noop}
        onUpdateDate={noop}
        onUpdateExercise={onUpdateExercise}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '5' } });
    expect(onUpdateExercise).toHaveBeenCalledWith('Bench press', 'weight', '5');

    fireEvent.change(screen.getByPlaceholderText('Num of reps'), { target: { value: '8' } });
    expect(onUpdateExercise).toHaveBeenCalledWith('Bench press', 'reps', '8');

    fireEvent.change(screen.getByPlaceholderText('Comment'), { target: { value: 'felt good' } });
    expect(onUpdateExercise).toHaveBeenCalledWith('Bench press', 'comment', 'felt good');
  });

  it('normalises a comma decimal in the weight field to a dot', () => {
    const onUpdateExercise = vi.fn();
    const session = buildSession({
      data: [{ name: 'Bench press', weight: '', reps: '', comment: '' }],
    });

    render(
      <WorkoutView
        activeSession={session}
        onCancel={noop}
        onSave={noop}
        onUpdateDate={noop}
        onUpdateExercise={onUpdateExercise}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '82,5' } });

    expect(onUpdateExercise).toHaveBeenCalledWith('Bench press', 'weight', '82.5');
  });

  it('logs no controlled/uncontrolled input warning for a brand-new session', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const session = buildSession({
      data: [{ name: 'Bench press', weight: '', reps: '', comment: '' }],
    });

    render(
      <WorkoutView
        activeSession={session}
        onCancel={noop}
        onSave={noop}
        onUpdateDate={noop}
        onUpdateExercise={noop}
      />
    );

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('accepts multiple lines in the comment field', () => {
    const onUpdateExercise = vi.fn();
    const session = buildSession({
      data: [{ name: 'Bench press', weight: '', reps: '', comment: '' }],
    });

    render(
      <WorkoutView
        activeSession={session}
        onCancel={noop}
        onSave={noop}
        onUpdateDate={noop}
        onUpdateExercise={onUpdateExercise}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Comment'), { target: { value: 'line one\nline two' } });

    expect(onUpdateExercise).toHaveBeenCalledWith('Bench press', 'comment', 'line one\nline two');
  });
});
