// app/api/company/publish/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { companyId, published } = (await req.json()) as { companyId?: string; published?: boolean };
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin.from('companies').update({ published: !!published, updated_at: now }).eq('id', companyId);
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('company.publish error', err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
