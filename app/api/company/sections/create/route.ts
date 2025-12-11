// app/api/company/sections/create/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyId = body.companyId;
    const section = body.section;
    if (!companyId || !section) return NextResponse.json({ error: 'companyId and section required' }, { status: 400 });

    const now = new Date().toISOString();
    const payload = {
      company_id: companyId,
      type: section.type ?? 'default',
      title: section.title ?? null,
      content: section.content ?? null,
      media_url: section.media_url ?? null,
      layout: section.layout ?? null,
      visible: section.visible ?? true,
      order_index: section.order_index ?? 0,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabaseAdmin.from('company_sections').insert(payload).select().single();
    if (error) {
      console.error('sections.create error', error);
      return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 });
    }
    return NextResponse.json({ success: true, section: data }, { status: 200 });
  } catch (err: any) {
    console.error('sections.create exception', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
