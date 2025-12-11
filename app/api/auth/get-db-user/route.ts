// app/api/auth/get-db-user/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../lib/supabaseServer';
import type { DBUser } from '../../../types/db';

const Body = z.object({ id: z.string().uuid(), email: z.string().email().optional() });

export async function POST(req: Request) {
  try {
    const { id } = Body.parse(await req.json());
    const { data, error } = await supabaseAdmin.from('users').select().eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ user: null });
    return NextResponse.json({ user: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
