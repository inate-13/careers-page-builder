// app/company/[slug]/preview/page.tsx
import React from 'react';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { SectionRenderer } from '../../../components/SectionRenderer';
import { CompanyHeader } from '../../../components/CompanyHeader';
import { Briefcase, MapPin, Clock, Search, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching

export default async function PreviewPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const { data: company, error: compErr } = await supabaseAdmin.from('companies').select('*').eq('slug', slug).maybeSingle();

  if (!company) return <div className="p-10 text-center text-red-500 font-bold">Company not found via slug '{slug}'</div>;

  const { data: sections } = await supabaseAdmin
    .from('company_sections')
    .select('*')
    .eq('company_id', company.id)
    .order('order_index', { ascending: true });

  const { data: jobs } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false });

  const primaryColor = company.primary_color ?? '#0f172a';
  const accentColor = company.accent_color ?? '#3b82f6';

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden relative">

      {/* Floating Preview Badge */}
      <div className="fixed bottom-6 right-6 z-50 bg-green-900 text-green-200 px-5 py-3 rounded-full shadow-[0_0_20px_5px_rgba(34,197,94,0.7)] text-sm font-bold flex items-center gap-2 animate-bounce border border-green-700">
        <span className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
        Live Preview Mode
      </div>

      {/* Reusable Header Component */}
      <CompanyHeader company={company} />

      {/* --- SECTIONS --- */}
      <div className="flex flex-col">
        {(sections ?? []).filter((s: any) => s.visible !== false).map((section: any) => (
          <SectionRenderer key={section.id} section={section} primaryColor={primaryColor} />
        ))}
      </div>

      {/* --- JOBS PREVIEW --- */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Open Vacancies</h2>
            <p className="text-slate-500 text-lg">Sample of roles appearing on your page</p>
          </div>

          {/* Filter Bar Visual Mock */}
          <div className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 opacity-75 pointer-events-none">
            <div className="grid md:grid-cols-12 gap-4">
              <div className="md:col-span-4 relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <div className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl text-sm border border-transparent">Search roles...</div>
              </div>
              <div className="md:col-span-3 relative">
                <div className="w-full pl-4 py-3 bg-slate-50 rounded-xl text-sm border border-transparent">Location</div>
              </div>
              <div className="md:col-span-3 relative">
                <div className="w-full pl-4 py-3 bg-slate-50 rounded-xl text-sm border border-transparent">Department</div>
              </div>
              <div className="md:col-span-2 flex items-center justify-center bg-slate-900 text-white font-bold rounded-xl text-sm">
                Filter
              </div>
            </div>
          </div>

          <div className="space-y-4 opacity-80 mix-blend-multiply select-none">
            {(jobs ?? []).length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl">
                <p className="text-slate-400 font-bold">No active jobs found for preview.</p>
              </div>
            ) : (jobs ?? []).map((job: any) => (
              <div key={job.id} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 grayscale-[0.0]">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{job.title}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full"><Briefcase size={16} /> {job.department}</div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full"><MapPin size={16} /> {job.location}</div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full"><Clock size={16} /> {job.employment_type}</div>
                  </div>
                </div>
                <span className="px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-400 font-bold text-sm">Apply Now</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
