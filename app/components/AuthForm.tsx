// components/AuthForm.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { showToast } from '../components/ui/Toast';
import { useRouter } from 'next/navigation';
 
import Link from 'next/link';
import { useUser } from '../hooks/useUser';

 

export default function AuthForm({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function syncProfileOnServer(userId: string, emailVal?: string, fullName?: string) {
    try {
      await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: emailVal ?? null, full_name: fullName ?? null }),
      });
    } catch (err) {
      console.error('sync-profile failed', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password } );
        if (error) throw error;
        showToast('Signup successful — check your email if confirmation is enabled', 'success');
        router.push('/login');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const user = data?.user;
        if (user) {
          const fullName = (user.user_metadata as any)?.full_name ?? name ?? null;
          await syncProfileOnServer(user.id, user.email ?? email, fullName);
        }
        showToast('Signed in', 'success');
        router.push('/dashboard');
      }
    } catch (err: any) {
      showToast(err?.message ?? 'Auth error', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">{mode === 'signup' ? 'Create account' : 'Sign in'}</h2>

      {mode === 'signup' && (
        <>
          <label className="block text-sm mb-1">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
            className="w-full border rounded px-3 py-2 mb-3"
          />
        </>
      )}

      <label className="block text-sm mb-1">Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
        className="w-full border rounded px-3 py-2 mb-3"
      />

      <label className="block text-sm mb-1">Password</label>
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        required
        minLength={6}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded"
      >
        {loading ? 'Working…' : mode === 'signup' ? 'Sign up' : 'Sign in'}
      </button>
    </form>
  );
}
