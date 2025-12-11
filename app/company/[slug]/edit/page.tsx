// app/company/[slug]/edit/page.tsx
import React from 'react';
import nextDynamic from 'next/dynamic';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic'; 

// Import client component for browser logs
const ClientEdit = nextDynamic(() => import('./ClientEditShadcn'), { ssr: false });
 

export default async function EditPage({ params }: { params: { slug?: string } }) {
  // LOG 1: Raw params from Next.js
  console.log('SERVER-SIDE PARAMS:', params);
  console.log('SERVER-SIDE SLUG:', params?.slug);

  if (!params?.slug) {
    return <div className="p-20 text-center text-red-600 text-2xl">No slug in URL</div>;
  }

  const slug = params.slug.trim();

  // LOG 2: About to query Supabase
  console.log('QUERYING SUPABASE FOR SLUG:', slug);

  const { data: company, error } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single();

  // LOG 3: Result
  console.log('SUPABASE RESULT → company:', company ? `${company.name} (ID: ${company.id})` : null);
  console.log('SUPABASE ERROR:', error);

  if (!company) {
    return (
      <div className="p-20 text-center bg-red-50 rounded-xl">
        <h1 className="text-4xl font-bold text-red-700 mb-4">Company Not Found</h1>
        <p className="text-xl">Slug: <code className="bg-red-200 px-2">{slug}</code></p>
        <p className="mt-4">Check if the company was deleted or slug changed.</p>
      </div>
    );
  }

  const { data: sections } = await supabaseAdmin
    .from('company_sections')
    .select('*')
    .eq('company_id', company.id)
    // .order('order_index', { ascending: true });

  console.log('SECTIONS LOADED:', sections?.length ?? 0);

  return (
    <>
      {/* Remove this banner once confirmed working */}
      <div className="bg-green-100 text-green-800 p-4 text-center font-bold">
        SUCCESS: Loaded {company.name} • Slug: {slug} • Sections: {sections?.length}
      </div>
      <ClientEdit company={company} sections={sections ?? []} />
    </>
  );
}