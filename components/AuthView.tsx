"use client";

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Помилка входу: " + error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert("Помилка реєстрації: " + error.message);
      else alert('Успішно! Тепер ви увійшли.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-black text-zinc-900 tracking-tight mb-2">GymFlow</h1>
          <p className="text-zinc-500 font-medium tracking-tight mt-2 pb-6 border-b-2 border-zinc-200 w-16 mx-auto"></p>
          <h2 className="text-2xl font-bold mt-8 text-zinc-800">
            {isLogin ? "З поверненням" : "Створити акаунт"}
          </h2>
        </header>

        <form onSubmit={handleAuth} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col gap-6">
          <div>
            <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-2">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="athlete@example.com"
              className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none font-bold text-zinc-900 border border-transparent focus:border-zinc-300 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-2">Пароль</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none font-bold text-zinc-900 border border-transparent focus:border-zinc-300 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-zinc-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-zinc-300 hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Опрацювання..." : (isLogin ? "Увійти" : "Продовжити")}
          </button>
        </form>

        <p className="text-center mt-8 text-zinc-500 font-medium text-sm">
          {isLogin ? "Вперше тут?" : "Вже маєте акаунт?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-black text-zinc-900 hover:underline"
          >
            {isLogin ? "Зареєструватись" : "Увійти"}
          </button>
        </p>
      </div>
    </main>
  );
}
