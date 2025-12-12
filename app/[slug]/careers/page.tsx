// app/[slug]/careers/page.tsx
import React from 'react';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionRenderer } from '../../components/SectionRenderer';
import { CompanyHeader } from '../../components/CompanyHeader';
import { MapPin, Briefcase, Clock, Search, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching

type Params = { slug: string };
type SearchParams = { q?: string; location?: string; department?: string; type?: string };

// Including potential extra fields for robustness, even if not always populated
type Job = {
  id: string;
  title: string;
  location: string;
  experience_level: string;
  employment_type: string;
  department: string;
  created_at: string;
  company_id: string;
  salary_range?: string;
  work_policy?: string;
  posted_days_ago?: number;
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = params;
  const { data: company } = await supabaseAdmin.from('companies').select('name,tagline').eq('slug', slug).eq('published', true).maybeSingle();
  return {
    title: company?.name ? `${company.name} — Careers` : 'Careers',
    description: company?.tagline ?? 'Join our team!',
  };
}

export default async function CareersPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = params;
  const query = searchParams.q?.toLowerCase() || '';
  const filterLoc = searchParams.location || '';
  const filterDept = searchParams.department || '';
  const filterType = searchParams.type || '';

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <h1 className="text-6xl font-black text-slate-200 mb-4">404</h1>
          <p className="text-xl text-slate-600 font-medium">Careers page not found.</p>
        </div>
      </div>
    );
  }

  const { data: sections } = await supabaseAdmin
    .from('company_sections')
    .select('*')
    .eq('company_id', company.id)
    .eq('visible', true)
    .order('order_index', { ascending: true });

  let jobQuery = supabaseAdmin
    .from('jobs')
    .select('id, title, location, experience_level, employment_type, department, posted_days_ago, salary_range, work_policy')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false });

  if (query) {
    jobQuery = jobQuery.ilike('title', `%${query}%`);
  }
  if (filterLoc) {
    jobQuery = jobQuery.ilike('location', `%${filterLoc}%`);
  }
  if (filterDept) {
    jobQuery = jobQuery.ilike('department', `%${filterDept}%`);
  }
  if (filterType) {
    jobQuery = jobQuery.eq('employment_type', filterType);
  }

  const { data: jobs } = await jobQuery;

  // Fetch distinct filters (locations, departments) from ALL jobs for the dropdowns
  const { data: filterData } = await supabaseAdmin
    .from('jobs')
    .select('location, department')
    .eq('company_id', company.id);

  const locations = Array.from(new Set((filterData ?? []).map((j: any) => j.location))).sort();
  const departments = Array.from(new Set((filterData ?? []).map((j: any) => j.department))).sort();

  const primaryColor = company.primary_color ?? '#0f172a';
  const accentColor = company.accent_color ?? '#3b82f6';

  const safeJobs = jobs ?? [];
  const hasFilters = !!query || !!filterLoc || !!filterDept || !!filterType;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">

      {/* Reusable Header Component (Banner, Logo, Title) */}
      <CompanyHeader company={company} />

      {/* --- SECTIONS --- */}
      <div className="flex flex-col">
        {(sections ?? []).map(section => (
          <SectionRenderer key={section.id} section={section} primaryColor={primaryColor} />
        ))}
      </div>

      {/* --- JOBS SECTION --- */}
      <section id="open-positions" className="py-24 bg-slate-50 border-t border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-2">Open Vacancies</h2>
              <p className="text-slate-500 text-lg">Detailed list of open roles at {company.name}</p>
            </div>
            <div className="hidden md:block text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              Showing {safeJobs.length} {safeJobs.length === 1 ? 'role' : 'roles'}
            </div>
          </div>

          {!hasFilters && safeJobs.length === 0 ? (
            // CASE: No Jobs in Database at all (and no filters applied)
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📭</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No open positions right now</h3>
              <p className="text-slate-500 max-w-md mx-auto">We don't have any active job listings at the moment, but please check back soon!</p>
            </div>
          ) : (
            <>
              {/* Filter Bar - Responsive Grid */}
              <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 sticky top-4 z-40">
                <form className="flex flex-col lg:flex-row gap-4">
                  <div className="relative group flex-grow lg:flex-[2]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                      name="q"
                      defaultValue={query}
                      placeholder="Search roles..."
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="relative flex-grow lg:flex-1">
                    <select name="location" defaultValue={filterLoc} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-sm appearance-none outline-none cursor-pointer text-slate-700">
                      <option value="">Any Location</option>
                      {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>

                  <div className="relative flex-grow lg:flex-1">
                    <select name="department" defaultValue={filterDept} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-sm appearance-none outline-none cursor-pointer text-slate-700">
                      <option value="">Any Department</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>

                  <button
                    type="submit"
                    className="w-full lg:w-auto px-8 py-3 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Filter size={18} />
                    Filter
                  </button>
                </form>
              </div>

              {/* Job Cards - Row Layout */}
              <div className="space-y-4">
                {safeJobs.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🧐</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">No roles match your filters</h3>
                    <p className="text-slate-500">Try adjusting your search criteria or view all jobs.</p>
                    <a href={`/${slug}/careers`} className="text-indigo-600 font-bold mt-4 inline-block hover:underline">Clear all filters</a>
                  </div>
                ) : (
                  safeJobs.map(job => (
                    <div key={job.id} className="group bg-white p-6 md:p-8 rounded-3xl border border-slate-200 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: accentColor }} />

                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500 font-medium mb-4">
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50"><Briefcase size={14} className="text-slate-400" /> {job.department}</span>
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50"><MapPin size={14} className="text-slate-400" /> {job.location}</span>
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50"><Clock size={14} className="text-slate-400" /> {job.employment_type}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.salary_range && <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-md border border-green-100/50">{job.salary_range}</span>}
                          {job.work_policy && <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100/50">{job.work_policy}</span>}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-start md:items-end justify-center gap-2 mt-2 md:mt-0 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                        {job.posted_days_ago !== undefined && (
                          <span className="text-xs font-semibold text-slate-400 mb-1">{job.posted_days_ago === 0 ? 'New' : `${job.posted_days_ago}d ago`}</span>
                        )}
                        <span
                          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg font-bold transition-all text-white shadow-md hover:shadow-lg active:scale-95 w-full md:w-auto text-sm"
                          style={{ backgroundColor: accentColor }}
                        >
                          Apply Now
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm font-medium">
          <p>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <p className="flex items-center gap-2">Built with Inate Platform</p>
        </div>
      </footer>
    </div>
  );
}