// components/NavBar.tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabaseClient';
import { showToast } from '../components/ui/Toast';
 
import React, { useEffect, useState } from 'react';
export default function NavBar() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDisplayName(null);
      return;
    }
    const metaName = (user.user_metadata as any)?.full_name ?? null;
    setDisplayName(metaName ?? user.email ?? null);
  }, [user]);

  async function signOut() {
    try {
      await supabase.auth.signOut();
      showToast('Signed out', 'success');
      router.push('/login');
    } catch (err: any) {
      showToast(err?.message ?? 'Sign out failed', 'error');
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          {user ? (
            <Link href="/dashboard" className="inline-flex items-center gap-3">
              {/* <div className="w-8 h-8 rounded bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold">CB</div> */}
              <span className="font-semibold">CareersBuilder</span>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <nav>
          {loading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" 
              className="px-3 py-2 rounded hover:bg-slate-100"
              >Dashboard</Link>

                            <button onClick={signOut} className="px-3 py-2 bg-red-600 text-slate-100 rounded">Logout</button>

              {displayName && <div className="text-sm text-slate-700 hidden sm:block bg-gradient-to-br from-gray-500 to-slate-600 text-black px-3 py-1 rounded">{displayName}</div>}

            </div>

          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-3 py-2 rounded hover:bg-slate-100">Login</Link>
              <Link href="/signup" className="px-3 py-2 bg-sky-600 text-white rounded">Sign up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
