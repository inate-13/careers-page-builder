// app/api/company/list/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

type Body = { ownerId: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { ownerId } = body;
    if (!ownerId) return NextResponse.json({ error: 'ownerId required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('id,name,slug,tagline,published,created_at')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, companies: data }, { status: 200 });
  } catch (err: any) {
    console.error('company.list error', err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
