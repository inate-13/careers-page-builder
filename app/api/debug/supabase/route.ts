// app/api/debug/supabase/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function GET() {
  try {
    // simple read query using admin client; safe read-only check
    const { data, error } = await supabaseAdmin.from('companies').select('id,slug,name').limit(1);
    if (error) {
      console.error('[debug] supabaseAdmin query error', error);
      return NextResponse.json({ ok: false, error: error.message ?? String(error) }, { status: 500 });
    }
    return NextResponse.json({ ok: true, sample: data ?? [] }, { status: 200 });
  } catch (err: any) {
    console.error('[debug] exception', err);
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
