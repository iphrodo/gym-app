import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import CycleFormView from './CycleFormView';
import { TrainingCycle } from '../types';

afterEach(() => {
  cleanup();
});

function buildCycle(overrides: Partial<TrainingCycle> = {}): TrainingCycle {
  return {
    id: 'cycle-1',
    name: 'Winter Power Cycle',
    isActive: true,
    templates: [
      { dayNumber: 1, label: 'Push', exercises: ['Bench press', 'Overhead press'] },
      { dayNumber: 2, label: 'Pull', exercises: ['Deadlift'] },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function noop() {}

describe('CycleFormView', () => {
  it('links back to the given backHref', () => {
    render(<CycleFormView backHref="/cycles/cycle-1" onSaveCycle={noop} />);

    expect(screen.getByRole('link', { name: '← Back' })).toHaveAttribute('href', '/cycles/cycle-1');
  });

  it('adds a new day when "+ Add day" is clicked', () => {
    render(<CycleFormView backHref="/" onSaveCycle={noop} />);

    expect(screen.queryByText('Day 2')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('+ Add day'));

    expect(screen.getByText('Day 2')).toBeInTheDocument();
  });

  it('removes a day when "Delete day" is clicked', () => {
    const cycle = buildCycle();
    render(<CycleFormView initialCycle={cycle} backHref="/" onSaveCycle={noop} />);

    expect(screen.getAllByText(/^Day \d$/)).toHaveLength(2);
    fireEvent.click(screen.getAllByText('Delete day')[0]);

    expect(screen.getAllByText(/^Day \d$/)).toHaveLength(1);
  });

  it('adds and removes exercise rows within a day', () => {
    const cycle = buildCycle({
      templates: [{ dayNumber: 1, label: 'Push', exercises: ['Bench press'] }],
    });
    render(<CycleFormView initialCycle={cycle} backHref="/" onSaveCycle={noop} />);

    expect(screen.getAllByPlaceholderText(/^Exercise \d/)).toHaveLength(1);

    fireEvent.click(screen.getByText('+ Add exercise'));
    expect(screen.getAllByPlaceholderText(/^Exercise \d/)).toHaveLength(2);

    fireEvent.click(screen.getByLabelText('Remove exercise 2'));
    expect(screen.getAllByPlaceholderText(/^Exercise \d/)).toHaveLength(1);
  });

  it('refuses to save without a cycle name', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const onSaveCycle = vi.fn();
    render(<CycleFormView backHref="/" onSaveCycle={onSaveCycle} />);

    fireEvent.click(screen.getByText('Create cycle'));

    expect(alertSpy).toHaveBeenCalledWith('Enter cycle name');
    expect(onSaveCycle).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('strips blank exercise rows on save', () => {
    const onSaveCycle = vi.fn();
    const cycle = buildCycle({
      templates: [{ dayNumber: 1, label: 'Push', exercises: ['Bench press', ''] }],
    });
    render(<CycleFormView initialCycle={cycle} backHref="/" onSaveCycle={onSaveCycle} />);

    fireEvent.click(screen.getByText('Save changes'));

    expect(onSaveCycle).toHaveBeenCalledWith(
      expect.objectContaining({
        templates: [expect.objectContaining({ exercises: ['Bench press'] })],
      })
    );
  });

  it('leaves the passed-in cycle object unmutated when the form is edited then abandoned', () => {
    const cycle = buildCycle();
    const original = JSON.parse(JSON.stringify(cycle));

    render(<CycleFormView initialCycle={cycle} backHref="/" onSaveCycle={noop} />);

    fireEvent.change(screen.getByDisplayValue('Push'), { target: { value: 'Changed label' } });
    fireEvent.change(screen.getByDisplayValue('Bench press'), { target: { value: 'Changed exercise' } });
    fireEvent.click(screen.getAllByText('+ Add exercise')[0]);
    fireEvent.click(screen.getByText('+ Add day'));

    expect(cycle).toEqual(original);
  });
});
