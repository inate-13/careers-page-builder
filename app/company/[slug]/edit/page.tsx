// app/company/[slug]/edit/page.tsx
import React from 'react';
import nextDynamic from 'next/dynamic';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Import client component for browser logs
const EditClient = nextDynamic(() => import('./ClientEditShadcn'), { ssr: false });
 

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  // Server-side minimal fetch as fallback (client will fetch authoritative copy)
  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  const { data: sections } = company
    ? await supabaseAdmin.from('company_sections').select('*').eq('company_id', company.id).order('order_index', { ascending: true })
    : { data: [] };

  if (!company) {
    return <div className="p-6 text-red-600">Company not found</div>;
  }

  // Provide fallback to client. Client will still run a fresh GET on mount.
  return <EditClient initialSlug={slug} fallbackCompany={company} fallbackSections={sections ?? []} />;
}
