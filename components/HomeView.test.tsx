import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import HomeView from './HomeView';
import { TrainingCycle, WorkoutSession } from '../types';

const signOut = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: (...args: unknown[]) => signOut(...args),
    },
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
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
    dayLabel: 'Push day',
    dayNumber: 1,
    data: [],
    createdAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

function noop() {}

describe('HomeView', () => {
  it('renders cycles with active badges and day counts', () => {
    const cycles = [
      buildCycle({ id: 'c1', name: 'Active cycle', isActive: true }),
      buildCycle({ id: 'c2', name: 'Inactive cycle', isActive: false, templates: [{ dayNumber: 1, label: 'Full body', exercises: [] }] }),
    ];

    render(<HomeView cycles={cycles} history={[]} onDeleteCycle={noop} />);

    const activeCard = screen.getByText('Active cycle').parentElement!.parentElement!.parentElement!;
    expect(within(activeCard).getByText('Active')).toBeInTheDocument();
    expect(within(activeCard).getByText('2 workout days')).toBeInTheDocument();

    const inactiveCard = screen.getByText('Inactive cycle').parentElement!.parentElement!.parentElement!;
    expect(within(inactiveCard).queryByText('Active')).not.toBeInTheDocument();
    expect(within(inactiveCard).getByText('1 workout days')).toBeInTheDocument();
  });

  it('links each cycle to its detail route', () => {
    const cycles = [buildCycle({ id: 'c1' })];
    render(<HomeView cycles={cycles} history={[]} onDeleteCycle={noop} />);

    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '/cycles/c1');
    expect(screen.getByRole('link', { name: '+ New cycle' })).toHaveAttribute('href', '/cycles/new');
    expect(screen.getByRole('link', { name: 'Open calendar' })).toHaveAttribute('href', '/calendar');
  });

  it('shows only exercises with a recorded weight in recent workouts', () => {
    const history = [
      buildSession({
        data: [
          { name: 'Bench press', weight: '80', reps: '5', comment: '' },
          { name: 'Overhead press', weight: '', reps: '5', comment: '' },
        ],
      }),
    ];

    render(<HomeView cycles={[]} history={history} onDeleteCycle={noop} />);

    expect(screen.getByText('Bench press')).toBeInTheDocument();
    expect(screen.queryByText('Overhead press')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Edit workout')).toHaveAttribute('href', '/workouts/session-1');
  });

  it('prompts for confirmation before deleting a cycle', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onDeleteCycle = vi.fn();
    const cycles = [buildCycle({ id: 'c1' })];

    render(<HomeView cycles={cycles} history={[]} onDeleteCycle={onDeleteCycle} />);

    fireEvent.click(screen.getByLabelText('Delete cycle'));

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDeleteCycle).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    fireEvent.click(screen.getByLabelText('Delete cycle'));
    expect(onDeleteCycle).toHaveBeenCalledWith('c1');

    confirmSpy.mockRestore();
  });

  it('signs out and navigates to the sign-in screen when logging out', async () => {
    const assignSpy = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign: assignSpy });
    signOut.mockResolvedValue({ error: null });

    render(<HomeView cycles={[]} history={[]} onDeleteCycle={noop} />);

    fireEvent.click(screen.getByText('Log out'));

    await vi.waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(assignSpy).toHaveBeenCalledWith('/login');
    });

    vi.unstubAllGlobals();
  });
});
