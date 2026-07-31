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

  it('submits the entered credentials on sign-up', async () => {
    signUp.mockResolvedValue({ error: null });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AuthView />);

    fireEvent.click(screen.getByText('Sign up'));
    fireEvent.change(screen.getByPlaceholderText('athlete@example.com'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({ email: 'new@example.com', password: 'secret1' });
    });
    alertSpy.mockRestore();
  });

  it('preserves the entered email when toggling between login and sign-up', () => {
    render(<AuthView />);

    fireEvent.change(screen.getByPlaceholderText('athlete@example.com'), { target: { value: 'keep-me@example.com' } });
    fireEvent.click(screen.getByText('Sign up'));

    expect(screen.getByPlaceholderText('athlete@example.com')).toHaveValue('keep-me@example.com');

    fireEvent.click(screen.getByText('Log in'));
    expect(screen.getByPlaceholderText('athlete@example.com')).toHaveValue('keep-me@example.com');
  });

  it('surfaces the error and stays on the form when login is rejected', async () => {
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AuthView />);

    fireEvent.change(screen.getByPlaceholderText('athlete@example.com'), { target: { value: 'me@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Login error: Invalid credentials');
    });
    expect(screen.getByPlaceholderText('athlete@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();

    alertSpy.mockRestore();
  });
});
