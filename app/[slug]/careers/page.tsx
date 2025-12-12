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

type Job = {
  id: string;
  title: string;
  location: string;
  experience_level: string;
  employment_type: string;
  department: string;
  created_at: string;
  is_active: boolean;
  company_id: string;
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

  const { data: allJobs } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // --- Filtering Logic ---
  const jobs = (allJobs as Job[] ?? []).filter(job => {
    const matchesQ = !query || job.title.toLowerCase().includes(query) || job.department.toLowerCase().includes(query);
    const matchesLoc = !filterLoc || job.location === filterLoc;
    const matchesDept = !filterDept || job.department === filterDept;
    const matchesType = !filterType || job.employment_type === filterType;
    return matchesQ && matchesLoc && matchesDept && matchesType;
  });

  const locations = Array.from(new Set((allJobs as Job[] ?? []).map(j => j.location))).sort();
  const departments = Array.from(new Set((allJobs as Job[] ?? []).map(j => j.department))).sort();

  const primaryColor = company.primary_color ?? '#0f172a';
  const accentColor = company.accent_color ?? '#3b82f6';

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
          </div>

          {(allJobs ?? []).length === 0 ? (
            // CASE: No Jobs in Database at all
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📭</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No open positions right now</h3>
              <p className="text-slate-500 max-w-md mx-auto">We don't have any active job listings at the moment, but please check back soon!</p>
            </div>
          ) : (
            <>
              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 sticky top-4 z-40">
                <form className="grid md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 relative group">
                    <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                      name="q"
                      defaultValue={query}
                      placeholder="Search roles..."
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="md:col-span-3 relative">
                    <select name="location" defaultValue={filterLoc} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-sm appearance-none outline-none cursor-pointer">
                      <option value="">Any Location</option>
                      {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <MapPin className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                  </div>

                  <div className="md:col-span-3 relative">
                    <select name="department" defaultValue={filterDept} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-sm appearance-none outline-none cursor-pointer">
                      <option value="">Any Department</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <Briefcase className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                  </div>

                  <button
                    type="submit"
                    className="md:col-span-2 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Filter size={18} />
                    Filter
                  </button>
                </form>
              </div>

              {/* Job Cards */}
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🧐</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">No roles match your filters</h3>
                    <p className="text-slate-500">Try adjusting your search criteria or view all jobs.</p>
                    <a href={`/${slug}/careers`} className="text-indigo-600 font-bold mt-4 inline-block hover:underline">Clear all filters</a>
                  </div>
                ) : (
                  jobs.map(job => (
                    <div key={job.id} className="group bg-white p-6 md:p-8 rounded-3xl border border-slate-200 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: accentColor }} />

                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors mb-3">{job.title}</h3>
                        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-500 font-medium">
                          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full"><Briefcase size={16} className="text-slate-400" /> {job.department}</div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full"><MapPin size={16} className="text-slate-400" /> {job.location}</div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full"><Clock size={16} className="text-slate-400" /> {job.employment_type}</div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span
                          className="inline-flex items-center justify-center px-8 py-3 rounded-full font-bold transition-all bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white"
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