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

    // 1) Delete requested IDs
    if (deletedIds.length > 0) {
      const { error: delErr } = await supabaseAdmin.from('company_sections').delete().in('id', deletedIds);
      if (delErr) {
        console.error('bulk-upsert delete error', delErr);
        // return error so caller knows deletion failed (RLS or FK may block)
        return NextResponse.json({ error: 'Failed to delete sections', details: delErr }, { status: 500 });
      }
    }

    // 2) Process sections sequentially (small number expected)
    const insertErrors: any[] = [];
    const updateErrors: any[] = [];

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
        const { data: inserted, error: insErr } = await supabaseAdmin.from('company_sections').insert(ins).select().single();
        if (insErr) {
          console.error('bulk-upsert insert err', insErr, 'payload:', ins);
          insertErrors.push({ error: insErr, payload: ins });
        }
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
        const { data: updated, error: upErr } = await supabaseAdmin.from('company_sections').update(patch).eq('id', s.id).select().single();
        if (upErr) {
          console.error('bulk-upsert update err', upErr, 'id:', s.id, 'patch:', patch);
          updateErrors.push({ error: upErr, id: s.id, patch });
        }
      }
    }

    if (insertErrors.length || updateErrors.length) {
      return NextResponse.json({ error: 'Some inserts/updates failed', insertErrors, updateErrors }, { status: 500 });
    }

    // 3) Return authoritative sections
    const { data: freshSections, error: fetchErr } = await supabaseAdmin
      .from('company_sections')
      .select('*')
      .eq('company_id', companyId)
      .order('order_index', { ascending: true });

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
