// server: app/api/company/sections/delete/route.ts
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

// app/api/company/sections/delete/route.ts
import { NextResponse } from 'next/server';
 

export async function POST(req: Request) {
  try {
    const { sectionId } = await req.json();
    if (!sectionId) return NextResponse.json({ error: 'sectionId required' }, { status: 400 });

    const { error } = await supabaseAdmin.from('company_sections').delete().eq('id', sectionId);
    if (error) {
      console.error('sections.delete error', error);
      return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('sections.delete exception', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

