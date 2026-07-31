import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import AuthView from './AuthView';

const signInWithPassword = vi.fn();
const signUp = vi.fn();
const signOut = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
      signUp: (...args: unknown[]) => signUp(...args),
      signOut: (...args: unknown[]) => signOut(...args),
    },
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AuthView', () => {
  it('submits the entered credentials on login', async () => {
    signInWithPassword.mockResolvedValue({ error: null });

    render(<AuthView />);

    fireEvent.change(screen.getByPlaceholderText('athlete@example.com'), { target: { value: 'me@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({ email: 'me@example.com', password: 'secret1' });
    });
  });

  it('returns to the requested screen after a successful login', async () => {
    signInWithPassword.mockResolvedValue({ error: null });

    render(<AuthView redirectTo="/cycles/c1" />);

    fireEvent.change(screen.getByPlaceholderText('athlete@example.com'), { target: { value: 'me@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/cycles/c1');
    });
    expect(refresh).toHaveBeenCalled();
  });

  it('submits the entered credentials on sign-up and shows an in-app success message', async () => {
    signUp.mockResolvedValue({ error: null });

    render(<AuthView />);

    fireEvent.click(screen.getByText('Sign up'));
    fireEvent.change(screen.getByPlaceholderText('athlete@example.com'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({ email: 'new@example.com', password: 'secret1' });
    });
    expect(await screen.findByText('Success! You are now logged in.')).toBeInTheDocument();
  });

  it('preserves the entered email when toggling between login and sign-up', () => {
    render(<AuthView />);

    fireEvent.change(screen.getByPlaceholderText('athlete@example.com'), { target: { value: 'keep-me@example.com' } });
    fireEvent.click(screen.getByText('Sign up'));

    expect(screen.getByPlaceholderText('athlete@example.com')).toHaveValue('keep-me@example.com');

    fireEvent.click(screen.getByText('Log in'));
    expect(screen.getByPlaceholderText('athlete@example.com')).toHaveValue('keep-me@example.com');
  });

  it('surfaces the error within the form and stays on the form when login is rejected, preserving the entered email', async () => {
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } });

    render(<AuthView />);

    fireEvent.change(screen.getByPlaceholderText('athlete@example.com'), { target: { value: 'me@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('athlete@example.com')).toHaveValue('me@example.com');
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });
});
