// app/api/company/sections/reorder/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
 

export async function POST(req: Request) {
  try {
    const { order } = await req.json(); // order = [{ id, order_index }, ...]
    if (!Array.isArray(order)) return NextResponse.json({ error: 'order array required' }, { status: 400 });

    // perform updates sequentially (small number of sections expected)
    for (const item of order) {
      await supabaseAdmin.from('company_sections').update({ order_index: item.order_index, updated_at: new Date().toISOString() }).eq('id', item.id);
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('sections.reorder exception', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
