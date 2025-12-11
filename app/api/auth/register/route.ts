// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';
import { z } from 'zod';

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server error: SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
  }

  try {
    const body = BodySchema.parse(await req.json());
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      user_metadata: { name: body.name ?? null },
      email_confirm: true,
    });

    if (createErr) {
      return NextResponse.json({ error: createErr.message ?? createErr }, { status: 400 });
    }
    if (!created?.user?.id) throw new Error('No user id returned');

    const userRow = { id: created.user.id, email: created.user.email, name: created.user.user_metadata?.name ?? null, role: 'recruiter' };
    const { error: upsertErr } = await supabaseAdmin.from('users').upsert(userRow, { onConflict: 'id' });
    if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, id: created.user.id });
  } catch (err: any) {
    // surface the message for debugging (do not leak in production)
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 400 });
  }
}
