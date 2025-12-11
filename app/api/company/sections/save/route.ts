// app/api/company/save/route.ts
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, company, sections } = body as any;

    if (!companyId) return new Response(JSON.stringify({ error: 'companyId required' }), { status: 400 });

    // update companies
    const { error: compErr } = await supabaseAdmin.from('companies').update(company).eq('id', companyId);
    if (compErr) throw compErr;

    // sections array: upsert by company_id + id (server-side, safe)
    if (Array.isArray(sections)) {
      for (const s of sections) {
        if (s.id) {
          await supabaseAdmin.from('company_sections').update({
            title: s.title ?? null,
            content: s.content ?? null,
            media_url: s.media_url ?? null,
            order_index: s.order_index ?? null,
            visible: s.visible ?? true,
            type: s.type ?? 'custom_text',
            updated_at: new Date().toISOString()
          }).eq('id', s.id);
        } else {
          await supabaseAdmin.from('company_sections').insert({
            company_id: companyId,
            type: s.type ?? 'custom_text',
            title: s.title ?? null,
            content: s.content ?? null,
            media_url: s.media_url ?? null,
            order_index: s.order_index ?? 999,
            visible: s.visible ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error('API save error', err);
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500 });
  }
}
