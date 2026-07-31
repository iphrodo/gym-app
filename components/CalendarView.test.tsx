import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import CalendarView from './CalendarView';
import { WorkoutSession } from '../types';

vi.mock('../lib/calendarMonth', async () => {
  const actual = await vi.importActual<typeof import('../lib/calendarMonth')>('../lib/calendarMonth');
  return {
    ...actual,
    todayDateKey: () => '2026-01-15',
  };
});

afterEach(() => {
  cleanup();
});

function buildSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'session-1',
    cycleId: 'cycle-1',
    date: '2026-01-10',
    dayLabel: 'Push day',
    dayNumber: 1,
    data: [],
    userId: 'user-1',
    createdAt: '2026-01-10T00:00:00.000Z',
    ...overrides,
  };
}

function noop() {}

describe('CalendarView', () => {
  it('makes days with workouts actionable and leaves days without workouts inert', () => {
    const history = [buildSession({ date: '2026-01-10' })];
    render(<CalendarView history={history} onEditSession={noop} onBack={noop} />);

    const dayWithWorkout = screen.getByRole('button', { name: '10' });
    const dayWithoutWorkout = screen.getByRole('button', { name: '5' });

    expect(dayWithWorkout).toBeEnabled();
    expect(dayWithoutWorkout).toBeDisabled();
  });

  it('moves across the year boundary when navigating to the previous month', () => {
    render(<CalendarView history={[]} onEditSession={noop} onBack={noop} />);

    expect(screen.getByText('January 2026')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Previous month'));

    expect(screen.getByText('December 2025')).toBeInTheDocument();
  });

  it('opens the picker when clicking a day with several sessions', () => {
    const history = [
      buildSession({ id: 's1', date: '2026-01-10', dayLabel: 'Push day' }),
      buildSession({ id: 's2', date: '2026-01-10', dayLabel: 'Pull day' }),
    ];
    const onEditSession = vi.fn();
    render(<CalendarView history={history} onEditSession={onEditSession} onBack={noop} />);

    fireEvent.click(screen.getByRole('button', { name: '10' }));

    expect(screen.getByText('2026-01-10')).toBeInTheDocument();
    expect(screen.getByText('Push day')).toBeInTheDocument();
    expect(screen.getByText('Pull day')).toBeInTheDocument();
    expect(onEditSession).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Pull day'));
    expect(onEditSession).toHaveBeenCalledWith(history[1]);
  });
});
