 import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
 
type Body = { ownerId: string; name: string; slug: string; tagline?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { ownerId, name, slug, tagline } = body;
    if (!ownerId || !name || !slug) return NextResponse.json({ error: 'ownerId, name and slug required' }, { status: 400 });

    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from('companies')
      .insert({ owner_id: ownerId, name, slug, tagline: tagline ?? null, created_at: now, updated_at: now })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, company: data }, { status: 200 });
  } catch (err: any) {
    console.error('company.create error', err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
