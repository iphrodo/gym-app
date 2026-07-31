"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { Screen } from './ui/Screen';
import Card from './ui/Card';
import Button from './ui/Button';
import Field, { fieldInputClassName } from './ui/Field';

interface AuthViewProps {
  redirectTo?: string;
}

export default function AuthView({ redirectTo = '/' }: AuthViewProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage(error.message);
      } else {
        router.replace(redirectTo);
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setErrorMessage(error.message);
      else setSuccessMessage('Success! You are now logged in.');
    }
    setLoading(false);
  };

  return (
    <Screen className="flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-black tracking-tight mb-2">GymFlow</h1>
          <p className="pb-6 border-b-2 border-card-border w-16 mx-auto"></p>
          <h2 className="text-2xl font-bold mt-8">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
        </header>

        <form onSubmit={handleAuth}>
          <Card className="flex flex-col gap-6">
            {errorMessage && (
              <p role="alert" className="text-sm font-bold text-danger">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p role="status" className="text-sm font-bold text-success">
                {successMessage}
              </p>
            )}

            <Field label="Email" htmlFor="auth-email">
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="athlete@example.com"
                className={fieldInputClassName()}
              />
            </Field>

            <Field label="Password" htmlFor="auth-password">
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className={fieldInputClassName()}
              />
            </Field>

            <Button type="submit" disabled={loading} className="w-full mt-4 text-lg">
              {loading ? "Processing..." : (isLogin ? "Log in" : "Continue")}
            </Button>
          </Card>
        </form>

        <p className="text-center mt-8 text-card-muted-fg font-medium text-sm">
          {isLogin ? "First time here?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-black text-page-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </Screen>
  );
}
