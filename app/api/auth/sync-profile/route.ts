// app/api/auth/sync-profile/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

type Body = { userId: string; email?: string | null; full_name?: string | null };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { userId, email, full_name } = body;
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const upsertObj: any = { id: userId };
    if (email) upsertObj.email = email;
    if (full_name) upsertObj.full_name = full_name;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(upsertObj, { onConflict: 'id' });

    if (error) {
      console.error('sync-profile upsert error', error);
      return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data?.[0] ?? null }, { status: 200 });
  } catch (err: any) {
    console.error('sync-profile exception', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
