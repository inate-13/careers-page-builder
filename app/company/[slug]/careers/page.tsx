// app/[slug]/careers/page.tsx
import React from 'react';
import { supabaseAdmin } from '../../../lib/supabaseAdmin'; // Corrected relative import
import type { Metadata } from 'next';
import Link from 'next/link';
// CRITICAL FIX: Force dynamic rendering to ensure fresh 'published' status
export const dynamic = 'force-dynamic';

// --- (Rest of the component code, unchanged from the last excellent version, but repeated for completeness) ---

type Params = { slug: string };
type SearchParams = { q?: string; location?: string; job_type?: string };

// --- Simplified Type Definitions for safety ---
type Company = {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    primary_color?: string | null;
    accent_color?: string | null;
    culture_video_url?: string | null;
};

type Section = {
    id: string;
    type: string;
    title?: string | null;
    content?: string | null;
    media_url?: string | null;
    layout?: string | null;
    visible?: boolean;
};

type Job = {
    id: string;
    title: string;
    location: string;
    experience_level: string;
    employment_type: string;
    department: string;
    posted_days_ago?: number;
    salary_range?: string;
    work_policy?: string;
};

// --- Utility: Embeds YouTube video ---
function embedYouTube(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
        const u = new URL(url);
        if (u.hostname.includes('youtu.be')) {
            const id = u.pathname.slice(1);
            return `https://www.youtube.com/embed/${id}`;
        }
        if (u.hostname.includes('youtube.com')) {
            const v = u.searchParams.get('v');
            if (v) return `https://www.youtube.com/embed/${v}`;
        }
    } catch { }
    return null;
}

// --- Metadata Generation (Server Component) ---
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = params;
    const { data: company } = await supabaseAdmin.from('companies').select('name,tagline').eq('slug', slug).eq('published', true).maybeSingle();
    const title = company?.name ? `${company.name} — Careers` : 'Careers';
    const description = company?.tagline ?? 'Open roles at the company.';
    return { title, description };
}


// --- Main Page Component (Server Component) ---
export default async function CareersPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
    const { slug } = params;
    const { q, location, job_type } = searchParams ?? {};

    // 1. Fetch published company and sections
    const { data: company, error: compErr } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .eq('published', true) // Critical: only show if explicitly published
        .maybeSingle();

    if (compErr || !company) {
        // IMPROVEMENT: Friendly 404/Draft page if not published or found
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-10">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">404 - Careers Page Not Found</h1>
                    <p className="text-gray-600">The requested careers page does not exist or has not been published yet.</p>
                </div>
            </div>
        );
    }

    const { data: sections } = await supabaseAdmin
        .from('company_sections')
        .select('*')
        .eq('company_id', company.id)
        .eq('visible', true) // Only show visible sections
        .order('order_index', { ascending: true });

    // 2. Fetch Jobs (placeholder - assuming a separate jobs table and query)
    let jobQuery = supabaseAdmin
        .from('jobs')
        .select('id, title, location, experience_level, employment_type, department, posted_days_ago, salary_range, work_policy')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

    // Apply Filters
    if (q) {
        jobQuery = jobQuery.ilike('title', `%${q}%`);
    }
    if (location) {
        jobQuery = jobQuery.ilike('location', `%${location}%`);
    }
    if (job_type) {
        jobQuery = jobQuery.eq('employment_type', job_type);
    }

    const { data: jobs } = await jobQuery;

    // 3. Dynamic Theming Logic (CSS Variables)
    // Fallback colors for safety
    const primaryColor = company.primary_color ?? '#0ea5e9'; // Tailwind sky-600
    const accentColor = company.accent_color ?? '#7c3aed'; // Tailwind violet-600

    const themeStyles = {
        '--color-primary': primaryColor,
        '--color-accent': accentColor,
    } as React.CSSProperties;

    // --- Render Component ---

    return (
        // Apply dynamic styles to the root container
        <div
            className="min-h-screen bg-gray-50 font-sans"
            style={themeStyles}
        >
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        {company.logo_url && <img src={company.logo_url} alt={`${company.name} Logo`} className="h-10 w-auto object-contain" />}
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>{company.name} Careers</h1>
                    </div>
                    <Link href="#jobs" passHref legacyBehavior>
                        <button className="px-4 py-2 text-sm rounded-full text-white font-medium transition-colors hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>
                            View Jobs ({jobs?.length ?? 0})
                        </button>
                    </Link>
                </div>
            </header>

            {/* Banner */}
            {company.banner_url && (
                <div className="relative h-72 w-full overflow-hidden">
                    <img src={company.banner_url} alt="Company Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                        <h2 className="text-5xl font-extrabold text-white text-center [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] mb-2">Join {company.name}</h2>
                        {company.tagline && <p className="text-xl text-white/90 font-medium text-center">{company.tagline}</p>}
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 gap-10">

                {/* Dynamic Sections */}
                {(sections ?? []).map((s: Section) => {
                    if (!s.visible || (!s.title && !s.content && !s.media_url && s.type !== 'jobs' && s.type !== 'culture_video')) return null;

                    // Special case: Culture Video
                    if (s.type === 'culture_video') {
                        const embedSrc = embedYouTube(company.culture_video_url);
                        return (
                            <section key={s.id} className="bg-white p-8 rounded-2xl shadow-xl">
                                <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-primary)' }}>{s.title ?? 'Our Culture Video'}</h2>
                                {embedSrc ? (
                                    <div className="relative w-full max-w-4xl mx-auto overflow-hidden" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
                                        <iframe
                                            src={embedSrc}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title="Culture Video"
                                            className="absolute top-0 left-0 w-full h-full rounded-lg border-none"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500">Culture video link is missing or invalid in the editor.</p>
                                )}
                            </section>
                        );
                    }

                    // General Content Sections
                    return (
                        <section key={s.id} className="bg-white p-8 rounded-2xl shadow-xl">
                            {s.title && <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>{s.title}</h2>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                {s.content && (
                                    <div className={`text-gray-700 leading-relaxed ${s.media_url ? '' : 'md:col-span-2'}`} dangerouslySetInnerHTML={{ __html: s.content ?? '' }} />
                                )}
                                {s.media_url && (
                                    <div className={s.content ? '' : 'md:col-span-2'}>
                                        <img src={s.media_url} alt={s.title ?? 'Section Image'} className="rounded-lg max-h-[400px] object-cover w-full shadow-lg" />
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })}

                {/* Jobs List Section */}
                <section id="jobs" className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--color-primary)' }}>Current Openings</h2>

                    {/* Job Search/Filter Form */}
                    <form className="flex flex-col sm:flex-row gap-3 pb-6 border-b border-gray-200">
                        <input
                            name="q"
                            type="text"
                            placeholder="Search roles or teams..."
                            defaultValue={q}
                            className="flex-grow border rounded-full px-5 py-3 text-lg focus:ring-2 focus:border-transparent"
                            style={{ borderColor: 'var(--color-accent)', boxShadow: `0 0 0 2px var(--color-accent, #7c3aed)` }}
                        />
                        {/* More filters can be added here */}
                        <button type="submit" className="px-6 py-3 text-lg text-white rounded-full font-semibold transition-colors hover:opacity-90 min-w-[120px]"
                            style={{ backgroundColor: 'var(--color-primary)' }}>
                            Search
                        </button>
                    </form>

                    {/* Jobs List */}
                    <div className="space-y-4">
                        {(jobs as Job[] ?? []).length === 0 ? (
                            <div className="text-center py-10 text-xl text-gray-500 border border-dashed rounded-lg">
                                No open roles currently match your search.
                            </div>
                        ) : (
                            (jobs as Job[]).map((job) => (
                                <article
                                    key={job.id}
                                    className="bg-gray-50 p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between border-l-4 transition-all hover:shadow-xl"
                                    style={{ borderColor: 'var(--color-accent)' }}
                                >
                                    <div>
                                        <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>{job.title}</h3>
                                        <div className="text-base text-gray-600 space-x-3">
                                            <span>{job.location}</span>
                                            <span className='text-gray-400'>•</span>
                                            <span>{job.employment_type}</span>
                                            <span className='text-gray-400'>•</span>
                                            <span>{job.experience_level}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-2">Department: {job.department}</div>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-2">
                                        <div className="text-sm text-gray-500">Posted {job.posted_days_ago ?? 0} days ago</div>
                                        {job.salary_range && <div className="text-sm font-medium text-gray-700">{job.salary_range}</div>}
                                        <div className="flex gap-2">
                                            {job.work_policy && <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-600">{job.work_policy}</span>}
                                        </div>
                                        <a href="#" className="inline-block px-5 py-2 rounded-full text-white font-medium transition-colors hover:opacity-90 mt-1"
                                            style={{ backgroundColor: 'var(--color-accent)' }}
                                        >
                                            Apply Now
                                        </a>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Career page built with Next.js and Supabase.
                    </p>
                </div>
            </footer>
        </div>
    );
}