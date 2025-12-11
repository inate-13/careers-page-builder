// app/api/company/sections/bulk-upsert/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyId: string = body.companyId;
    const sections: any[] = Array.isArray(body.sections) ? body.sections : [];
    const deletedIds: string[] = Array.isArray(body.deletedIds) ? body.deletedIds : [];

    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

    const now = new Date().toISOString();

    // 1) Delete requested IDs (if any)
    if (deletedIds.length > 0) {
      const { error: delErr } = await supabaseAdmin.from('company_sections').delete().in('id', deletedIds);
      if (delErr) {
        console.error('bulk-upsert delete error', delErr);
        // continue — don't fail the entire operation, but report
      }
    }

    // 2) Upsert: for each section, if id starts with 'new-' -> insert, else update
    for (const s of sections) {
      if (!s) continue;
      if (typeof s.id === 'string' && s.id.startsWith('new-')) {
        const ins = {
          company_id: companyId,
          type: s.type ?? 'default',
          title: s.title ?? null,
          content: s.content ?? null,
          media_url: s.media_url ?? null,
          layout: s.layout ?? null,
          visible: s.visible ?? true,
          order_index: s.order_index ?? 0,
          created_at: now,
          updated_at: now,
        };
        const { error: insErr } = await supabaseAdmin.from('company_sections').insert(ins);
        if (insErr) console.error('bulk-upsert insert err', insErr);
      } else if (s.id) {
        const patch = {
          type: s.type ?? 'default',
          title: s.title ?? null,
          content: s.content ?? null,
          media_url: s.media_url ?? null,
          layout: s.layout ?? null,
          visible: s.visible ?? true,
          order_index: s.order_index ?? 0,
          updated_at: now,
        };
        const { error: upErr } = await supabaseAdmin.from('company_sections').update(patch).eq('id', s.id);
        if (upErr) console.error('bulk-upsert update err', upErr);
      }
    }

    // 3) Return authoritative sections ordered by order_index
    const { data: freshSections, error: fetchErr } = await supabaseAdmin.from('company_sections').select('*').eq('company_id', companyId).order('order_index', { ascending: true });
    if (fetchErr) {
      console.error('bulk-upsert fetch err', fetchErr);
      return NextResponse.json({ error: fetchErr.message ?? String(fetchErr) }, { status: 500 });
    }

    return NextResponse.json({ success: true, sections: freshSections ?? [] }, { status: 200 });
  } catch (err: any) {
    console.error('bulk-upsert exception', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
