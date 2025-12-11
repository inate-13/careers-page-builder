// app/api/company/get/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get('companyId') || '';
    const slug = url.searchParams.get('slug') || '';

    if (!companyId && !slug) {
      return NextResponse.json({ error: 'companyId or slug required' }, { status: 400 });
    }

    let companyQuery = supabaseAdmin.from('companies').select('*').maybeSingle();
    if (companyId) {
      companyQuery = supabaseAdmin.from('companies').select('*').eq('id', companyId).maybeSingle();
    } else if (slug) {
      companyQuery = supabaseAdmin.from('companies').select('*').eq('slug', slug).maybeSingle();
    }

    const { data: company, error: compErr } = await companyQuery;
    if (compErr) {
      console.error('api/company/get company err', compErr);
      return NextResponse.json({ error: compErr.message ?? String(compErr) }, { status: 500 });
    }
    if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: sections, error: secErr } = await supabaseAdmin
      .from('company_sections')
      .select('*')
      .eq('company_id', company.id)
      .order('order_index', { ascending: true });

    if (secErr) {
      console.error('api/company/get sections err', secErr);
      // still return company even if sections query failed
    }

    return NextResponse.json({ company, sections: sections ?? [] }, { status: 200 });
  } catch (err: any) {
    console.error('api/company/get exception', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
