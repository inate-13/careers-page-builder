// app/api/company/update/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, company: companyPatch, sections } = body;
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

    const now = new Date().toISOString();
    const patch = { ...companyPatch, updated_at: now };

    // update company
    const { data: companyData, error: compErr } = await supabaseAdmin.from('companies').update(patch).eq('id', companyId).select().single();
    if (compErr) {
      console.error('company.update error', compErr);
      return NextResponse.json({ error: compErr.message ?? String(compErr) }, { status: 500 });
    }

    // If sections array provided, upsert them (existing id -> update; new id -> insert)
    if (Array.isArray(sections)) {
      for (const s of sections) {
        if (s.id && !s.id.startsWith('new-')) {
          const sPatch = { ...s, updated_at: now };
          await supabaseAdmin.from('company_sections').update(sPatch).eq('id', s.id);
        } else {
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
          await supabaseAdmin.from('company_sections').insert(ins);
        }
      }
    }

    // return fresh company & sections to client
    const { data: freshSections } = await supabaseAdmin.from('company_sections').select('*').eq('company_id', companyId).order('order_index', { ascending: true });
    return NextResponse.json({ success: true, company: companyData, sections: freshSections ?? [] }, { status: 200 });
  } catch (err: any) {
    console.error('company.update exception', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
