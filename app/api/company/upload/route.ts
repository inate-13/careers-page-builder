// app/api/company/upload/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '.../../lib/supabaseAdmin';

export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
  try {
    // Quick sanity: ensure service key is available at runtime
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[upload] MISSING SUPABASE_SERVICE_ROLE_KEY in process.env');
      return NextResponse.json({ error: 'Server misconfiguration: missing service role key' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const companyId = formData.get('companyId') as string | null;
    const folder = (formData.get('folder') as string | null) ?? 'uploads';

    if (!file || !companyId) {
      console.error('[upload] missing file or companyId', { hasFile: !!file, companyId });
      return NextResponse.json({ error: 'file and companyId are required' }, { status: 400 });
    }

    // convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = (file.name?.split('.').pop() ?? 'bin').replace(/[^a-z0-9]/gi, '');
    const path = `${companyId}/${folder}/${Date.now()}.${ext}`;

    // Upload using admin client (service role)
    const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
      .from('company-assets')
      .upload(path, buffer, { contentType: file.type || 'application/octet-stream', upsert: true, cacheControl: '3600' });

    if (uploadErr) {
      // return full error message so we can tell whether it's storage RLS or something else
      console.error('[upload] storage.upload error', uploadErr);
      return NextResponse.json({ statusCode: uploadErr.status ?? 500, error: uploadErr.message ?? String(uploadErr) }, { status: 500 });
    }

    const { data: urlData, error: urlErr } = supabaseAdmin.storage.from('company-assets').getPublicUrl(uploadData.path);
    if (urlErr) {
      console.error('[upload] getPublicUrl error', urlErr);
      return NextResponse.json({ statusCode: urlErr.status ?? 500, error: urlErr.message ?? String(urlErr) }, { status: 500 });
    }

    const publicUrl = (urlData as any)?.publicUrl ?? null;
    return NextResponse.json({ success: true, publicUrl }, { status: 200 });
  } catch (err: any) {
    console.error('[upload] exception', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
