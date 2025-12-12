// app/api/company/update/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, company: companyPatch, sections } = body;
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

    const now = new Date().toISOString();

    // 1. Update Company Info (if provided)
    let companyData = null;
    if (companyPatch) { // Only update if patch exists
      const patch = { ...companyPatch, updated_at: now };
      const { data, error: compErr } = await supabaseAdmin
        .from('companies')
        .update(patch)
        .eq('id', companyId)
        .select()
        .single();

      if (compErr) {
        console.error('company.update error', compErr);
        return NextResponse.json({ error: compErr.message ?? String(compErr) }, { status: 500 });
      }
      companyData = data;
    }

    // 2. Handle Sections (if provided)
    if (Array.isArray(sections)) {
      // A. Get existing sections to find deletions
      const { data: existingSections } = await supabaseAdmin
        .from('company_sections')
        .select('id')
        .eq('company_id', companyId);

      const incomingIds = new Set(sections.filter(s => s.id && !s.id.startsWith('new-')).map(s => s.id));
      const toDelete = existingSections?.filter(s => !incomingIds.has(s.id)).map(s => s.id) ?? [];

      // B. Delete missing sections
      if (toDelete.length > 0) {
        await supabaseAdmin.from('company_sections').delete().in('id', toDelete);
      }

      // C. Upsert (Update or Insert) current sections
      for (const s of sections) {
        const payload = {
          company_id: companyId,
          type: s.type ?? 'default',
          title: s.title ?? null,
          content: s.content ?? null,
          media_url: s.media_url ?? null,
          layout: s.layout ?? null,
          visible: s.visible ?? true,
          order_index: s.order_index ?? 0,
          updated_at: now,
        };

        if (s.id && !s.id.startsWith('new-')) {
          // Update
          await supabaseAdmin.from('company_sections').update(payload).eq('id', s.id);
        } else {
          // Insert
          await supabaseAdmin.from('company_sections').insert({ ...payload, created_at: now });
        }
      }
    }

    // 3. Revalidate & Return Fresh Data
    try {
      revalidatePath(`/company/[slug]/edit`); // Revalidate all edit pages (wildcard doesn't work perfectly but helps)
      // If we knew the slug, we could do exact paths. Let's try to query it if possible or just rely on 'company' object if we have it
      if (companyData && companyData.slug) {
        revalidatePath(`/${companyData.slug}/edit`);
        revalidatePath(`/${companyData.slug}/preview`);
        revalidatePath(`/${companyData.slug}/careers`);
      }
    } catch (e) {
      console.error('Revalidation error', e);
    }

    // Fetch fresh state to return
    const { data: freshCompany } = await supabaseAdmin.from('companies').select('*').eq('id', companyId).single();
    const { data: freshSections } = await supabaseAdmin
      .from('company_sections')
      .select('*')
      .eq('company_id', companyId)
      .order('order_index', { ascending: true });

    return NextResponse.json({ success: true, company: freshCompany, sections: freshSections ?? [] }, { status: 200 });

  } catch (err: any) {
    console.error('company.update exception', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
