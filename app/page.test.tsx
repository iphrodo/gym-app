import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import GymApp from './page';

vi.mock('../lib/supabaseClient', () => {
  let cyclesCallCount = 0;
  const cyclesResponses = [
    // 1: initial list load
    {
      data: [
        { id: 'c1', name: 'Existing Cycle', is_active: true, templates: [], user_id: 'owner-1', created_at: '2026-01-01T00:00:00.000Z' },
      ],
      error: null,
    },
    // 2: the new cycle's primary write succeeds
    { data: null, error: null },
    // 3: the deactivate-others write fails
    { data: null, error: new Error('deactivate failed') },
  ];

  function builder(result: { data: unknown; error: unknown }) {
    return {
      select() { return this; },
      eq() { return this; },
      neq() { return this; },
      update() { return this; },
      upsert() { return this; },
      delete() { return this; },
      then(resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) {
        return Promise.resolve(result).then(resolve, reject);
      },
    };
  }

  return {
    supabase: {
      auth: {
        getSession: async () => ({ data: { session: { user: { id: 'owner-1' } } } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getUser: async () => ({ data: { user: { id: 'owner-1' } }, error: null }),
      },
      from(table: string) {
        if (table === 'cycles') {
          const result = cyclesResponses[Math.min(cyclesCallCount, cyclesResponses.length - 1)];
          cyclesCallCount += 1;
          return builder(result);
        }
        return builder({ data: [], error: null });
      },
    },
  };
});

afterEach(() => {
  cleanup();
});

describe('GymApp - deactivate-others failure surfacing', () => {
  it('alerts a distinct message when creating a cycle succeeds but deactivating the others fails', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<GymApp />);

    await waitFor(() => expect(screen.getByText('Existing Cycle')).toBeInTheDocument());

    fireEvent.click(screen.getByText('+ New cycle'));
    fireEvent.change(screen.getByPlaceholderText('E.g., Winter Power Cycle 2024'), { target: { value: 'New Cycle' } });
    fireEvent.click(screen.getByText('Create cycle'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "Cycle created, but couldn't deactivate your other cycles — you may need to fix this manually."
      )
    );

    alertSpy.mockRestore();
  });
});
