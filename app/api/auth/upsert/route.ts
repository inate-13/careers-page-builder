// app/api/auth/upsert/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../lib/supabaseServer';
import type { DBUser } from '../../../types/db';

const BodySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    // default role = recruiter; admin can be set manually in DB or via admin-only endpoint
    const payload = {
      id: body.id,
      email: body.email,
      name: body.name ?? null,
      role: 'recruiter',
    };

    const { data, error } = await supabaseAdmin
      .from<DBUser>('users')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ user: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
