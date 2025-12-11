// app/[slug]/careers/page.tsx
import React from 'react';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Params = { slug: string };
type SearchParams = { q?: string; location?: string; job_type?: string };

type Company = { id: string; name: string; slug: string; tagline?: string | null; logo_url?: string | null; banner_url?: string | null; primary_color?: string | null; accent_color?: string | null; culture_video_url?: string | null; published?: boolean };
type Section = { id: string; type: string; title?: string | null; content?: string | null; media_url?: string | null; layout?: string | null; visible?: boolean };
type Job = { id: string; title: string; location: string; experience_level: string; employment_type: string; department: string };

function embedYouTube(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;
  } catch {}
  return null;
}

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

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-xl text-gray-600">This careers page is not published yet.</p>
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

  const { data: jobs } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const primaryColor = company.primary_color ?? '#0ea5e9';
  const accentColor = company.accent_color ?? '#7c3aed';

  const themeStyles = { '--color-primary': primaryColor, '--color-accent': accentColor } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-gray-50 font-sans" style={themeStyles}>
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {company.logo_url && <img src={company.logo_url} alt="Logo" className="h-12 w-auto" />}
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{company.name} Careers</h1>
          </div>
          <Link href="#jobs">
            <button className="px-6 py-3 rounded-full text-white font-semibold" style={{ backgroundColor: 'var(--color-primary)' }}>
              View Jobs ({jobs?.length ?? 0})
            </button>
          </Link>
        </div>
      </header>

      {company.banner_url && (
        <div className="relative h-96 w-full">
          <img src={company.banner_url} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="text-white p-10">
              <h2 className="text-5xl font-extrabold mb-3">Join {company.name}</h2>
              {company.tagline && <p className="text-2xl opacity-90">{company.tagline}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {sections?.map((s) => {
          if (s.type === 'culture_video' && company.culture_video_url) {
            const embed = embedYouTube(company.culture_video_url);
            if (!embed) return null;
            return (
              <section key={s.id} className="bg-white p-10 rounded-2xl shadow-xl">
                <h2 className="text-4xl font-bold text-center mb-8" style={{ color: 'var(--color-primary)' }}>{s.title || 'Our Culture'}</h2>
                <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <iframe src={embed} allowFullScreen className="w-full h-full"></iframe>
                </div>
              </section>
            );
          }

          if (['about_us', 'life_at_company', 'custom_text'].includes(s.type)) {
            return (
              <section key={s.id} className="bg-white p-10 rounded-2xl shadow-xl">
                {s.title && <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>{s.title}</h2>}
                <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: s.content || '' }} />
                {s.media_url && <img src={s.media_url} alt={s.title} className="mt-8 rounded-xl shadow-lg w-full" />}
              </section>
            );
          }

          if (s.type === 'benefits' && s.layout) {
            let benefits = [];
            try { benefits = JSON.parse(s.layout); } catch {}
            return (
              <section key={s.id} className="bg-white p-10 rounded-2xl shadow-xl">
                <h2 className="text-4xl font-bold text-center mb-10" style={{ color: 'var(--color-primary)' }}>{s.title || 'Benefits'}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {benefits.map((b: any, i: number) => (
                    <div key={i} className="p-6 border rounded-xl text-center">
                      <div className="text-4xl mb-3">{b.icon || 'Star'}</div>
                      <h3 className="font-bold text-lg">{b.title}</h3>
                      <p className="text-gray-600 mt-2">{b.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          return null;
        })}

        <section id="jobs" className="bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="text-4xl font-bold text-center mb-10" style={{ color: 'var(--color-primary)' }}>Open Positions</h2>
          {(!jobs || jobs.length === 0) ? (
            <p className="text-center text-xl text-gray-500 py-10">No open roles at the moment. Check back soon!</p>
          ) : (
            <div className="space-y-6">
              {jobs.map((job: Job) => (
                <div key={job.id} className="p-8 border-2 rounded-xl hover:shadow-xl transition-shadow" style={{ borderColor: 'var(--color-accent)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{job.title}</h3>
                      <p className="text-gray-600 mt-2">{job.location} • {job.employment_type}</p>
                    </div>
                    <a href="#" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:opacity-90">
                      Apply Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="bg-gray-900 text-white py-10 text-center">
        <p>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}