// server: app/api/company/sections/update/route.ts
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sectionId, patch } = await req.json();
    if (!sectionId || !patch) return NextResponse.json({ error: 'sectionId and patch required' }, { status: 400 });

    const updated = { ...patch, updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin.from('company_sections').update(updated).eq('id', sectionId).select().single();
    if (error) {
      console.error('sections.update error', error);
      return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 });
    }
    return NextResponse.json({ success: true, section: data }, { status: 200 });
  } catch (err: any) {
    console.error('sections.update exception', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
