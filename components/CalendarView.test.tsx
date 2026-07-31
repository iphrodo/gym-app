import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import CalendarView from './CalendarView';
import { WorkoutSession } from '../types';

const push = vi.fn();

vi.mock('../lib/calendarMonth', async () => {
  const actual = await vi.importActual<typeof import('../lib/calendarMonth')>('../lib/calendarMonth');
  return {
    ...actual,
    todayDateKey: () => '2026-01-15',
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function buildSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'session-1',
    cycleId: 'cycle-1',
    date: '2026-01-10',
    dayLabel: 'Push day',
    dayNumber: 1,
    data: [],
    createdAt: '2026-01-10T00:00:00.000Z',
    ...overrides,
  };
}

describe('CalendarView', () => {
  it('makes days with workouts actionable and leaves days without workouts inert', () => {
    const history = [buildSession({ date: '2026-01-10' })];
    render(<CalendarView history={history} />);

    const dayWithWorkout = screen.getByRole('button', { name: '10' });
    const dayWithoutWorkout = screen.getByRole('button', { name: '5' });

    expect(dayWithWorkout).toBeEnabled();
    expect(dayWithoutWorkout).toBeDisabled();
  });

  it('moves across the year boundary when navigating to the previous month', () => {
    render(<CalendarView history={[]} />);

    expect(screen.getByText('January 2026')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Previous month'));

    expect(screen.getByText('December 2025')).toBeInTheDocument();
  });

  it('navigates directly to the workout when a day has a single session', () => {
    const history = [buildSession({ date: '2026-01-10' })];
    render(<CalendarView history={history} />);

    fireEvent.click(screen.getByRole('button', { name: '10' }));

    expect(push).toHaveBeenCalledWith('/workouts/session-1');
  });

  it('opens the picker when clicking a day with several sessions', () => {
    const history = [
      buildSession({ id: 's1', date: '2026-01-10', dayLabel: 'Push day' }),
      buildSession({ id: 's2', date: '2026-01-10', dayLabel: 'Pull day' }),
    ];
    render(<CalendarView history={history} />);

    fireEvent.click(screen.getByRole('button', { name: '10' }));

    expect(screen.getByText('2026-01-10')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    const pullLink = screen.getByText('Pull day').closest('a');
    expect(pullLink).toHaveAttribute('href', '/workouts/s2');
  });
});
