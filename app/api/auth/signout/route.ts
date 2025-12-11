// app/api/auth/signout/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

/**
 * Simple server route to sign out (useful if you want a server-side endpoint).
 * For client-side sign-out call supabase.auth.signOut() directly.
 */
export async function POST(_req: NextRequest) {
  // This will clear the session client-side as well if called from client with fetch.
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
