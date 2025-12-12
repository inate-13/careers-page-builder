// app/company/[slug]/preview/page.tsx
import React from 'react';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { SectionRenderer } from '../../../components/SectionRenderer';
import { CompanyHeader } from '../../../components/CompanyHeader';
import { Briefcase, MapPin, Clock, Filter } from 'lucide-react';

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
    .select('id, title, location, experience_level, employment_type, department, posted_days_ago, salary_range, work_policy')
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
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-2">Open Vacancies</h2>
              <p className="text-slate-500 text-lg">Sample of roles appearing on your page</p>
            </div>
            <div className="hidden md:block text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              Showing {(jobs ?? []).length} roles
            </div>
          </div>

          {/* Preview Note */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-10 mx-auto max-w-4xl opacity-90 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Filter className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  Filters are disabled in preview mode. All active jobs are shown below.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {(jobs ?? []).length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-white">
                <p className="text-slate-400 font-bold">No active jobs found for preview.</p>
              </div>
            ) : (jobs ?? []).map((job: any) => (
              <div key={job.id} className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col md:flex-row gap-6 cursor-default relative overflow-hidden">

                <div className="flex-1 min-w-0"> {/* content wrapper */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate pr-4">{job.title}</h3>
                    {job.posted_days_ago !== undefined && (
                      <span className="text-xs font-semibold text-slate-400 whitespace-nowrap hidden md:block">{job.posted_days_ago === 0 ? 'New' : `${job.posted_days_ago}d ago`}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500 font-medium mb-4">
                    <div className="flex items-center gap-1.5"><Briefcase size={15} className="text-slate-400" /> {job.department}</div>
                    <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
                    <div className="flex items-center gap-1.5"><MapPin size={15} className="text-slate-400" /> {job.location}</div>
                    <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
                    <div className="flex items-center gap-1.5"><Clock size={15} className="text-slate-400" /> {job.employment_type}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.salary_range && <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-md border border-green-100/50">{job.salary_range}</span>}
                    {job.work_policy && <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100/50">{job.work_policy}</span>}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 gap-4 mt-2 md:mt-0">
                  {job.posted_days_ago !== undefined && (
                    <span className="text-xs font-semibold text-slate-400 md:hidden">{job.posted_days_ago === 0 ? 'New' : `${job.posted_days_ago}d ago`}</span>
                  )}
                  <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg font-bold text-sm transition-all bg-slate-900 text-white shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap ml-auto md:ml-0" style={{ backgroundColor: accentColor }}>
                    Apply
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
