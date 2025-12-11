import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json();
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

    // Deletion cascades sections/jobs (schema must have ON DELETE CASCADE)
    const { error } = await supabaseAdmin.from('companies').delete().eq('id', companyId);
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('company.delete error', err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
