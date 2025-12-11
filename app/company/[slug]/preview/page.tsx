// app/company/[slug]/preview/page.tsx
import React from 'react';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

function embedYouTube(url: string) {
  // accept watch?v= or youtu.be links, return embed src
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('www.youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      // maybe embed path like /embed/...
      if (u.pathname.startsWith('/embed/')) return url;
    }
  } catch (e) {
    // not a URL
  }
  return null;
}

export default async function PreviewPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const { data: company, error: compErr } = await supabaseAdmin.from('companies').select('*').eq('slug', slug).maybeSingle();
  if (compErr) {
    console.error('preview company err', compErr);
    return <div className="p-6 text-red-600">Error loading company</div>;
  }
  if (!company) return <div className="p-6">Company not found</div>;

  const { data: sections } = await supabaseAdmin.from('company_sections').select('*').eq('company_id', company.id).order('order_index', { ascending: true });
  const { data: jobs } = await supabaseAdmin.from('jobs').select('*').eq('company_id', company.id).order('created_at', { ascending: false });

  return (
    <div className="min-h-screen" style={{ backgroundColor: company?.accent_color ?? '#f8fafc' }}>
      <div className="max-w-6xl mx-auto">
        {/* Preview banner */}
        <div className="mt-6 mb-6">
          <div className="rounded overflow-hidden relative h-48 md:h-64" style={{ background: company.banner_url ? `url(${company.banner_url}) center/cover no-repeat` : company.primary_color ?? '#0ea5e9' }}>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute left-6 bottom-6 flex items-center gap-4">
              {company.logo_url ? <img src={company.logo_url} alt="logo" className="w-20 h-20 rounded object-cover" /> : <div className="w-20 h-20 bg-white/10 rounded" />}
              <div className="text-white">
                <h1 className="text-2xl font-bold">{company.name} (Preview)</h1>
                {company.tagline && <p className="text-sm">{company.tagline}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <main className="md:col-span-2 space-y-6">
            {(sections ?? []).filter((s: any) => s.visible !== false).map((s: any) => {
              // render by type
              if (s.type === 'cards') {
                // parse cards JSON from layout
                let cards = [];
                try {
                  cards = s.layout ? JSON.parse(s.layout) : [];
                } catch (e) {
                  cards = [];
                }
                return (
                  <section key={s.id} className="bg-white p-4 rounded shadow">
                    {s.title && <h2 className="text-xl font-semibold mb-3">{s.title}</h2>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {cards.map((c: any, i: number) => (
                        <article key={i} className="p-3 border rounded">
                          {c.image && <img src={c.image} alt={c.title} className="w-full h-32 object-cover rounded mb-2" />}
                          <div className="font-semibold">{c.title}</div>
                          <div className="text-sm text-slate-600">{c.desc}</div>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              }

              if (s.type === 'carousel') {
                // media_url could be a comma-separated list or layout JSON
                let items: string[] = [];
                if (s.layout) {
                  try {
                    const j = JSON.parse(s.layout);
                    if (Array.isArray(j)) items = j;
                  } catch (e) {
                    // fallback: media_url comma separated
                    if (s.media_url) items = s.media_url.split(',').map((x: string) => x.trim());
                  }
                } else if (s.media_url) {
                  items = s.media_url.split(',').map((x: string) => x.trim());
                }

                return (
                  <section key={s.id} className="bg-white p-4 rounded shadow">
                    {s.title && <h2 className="text-xl font-semibold mb-3">{s.title}</h2>}
                    <div className="overflow-x-auto snap-x snap-mandatory" style={{ scrollBehavior: 'smooth' }}>
                      <div className="flex gap-3">
                        {items.map((src: string, i: number) => (
                          <img key={i} src={src} className="snap-center w-full md:w-96 h-48 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  </section>
                );
              }

              if (s.type === 'video') {
                // prefer media_url then company.culture_video_url then content
                const url = s.media_url || company.culture_video_url || s.content || '';
                const embed = embedYouTube(url || '');
                return (
                  <section key={s.id} className="bg-white p-4 rounded shadow">
                    {s.title && <h2 className="text-xl font-semibold mb-3">{s.title}</h2>}
                    {embed ? (
                      <div className="aspect-video rounded overflow-hidden">
                        <iframe src={embed} title="video" frameBorder={0} allowFullScreen className="w-full h-full" />
                      </div>
                    ) : (
                      <div className="text-slate-700" dangerouslySetInnerHTML={{ __html: s.content ?? '' }} />
                    )}
                  </section>
                );
              }

              // default
              return (
                <section key={s.id} className="bg-white p-4 rounded shadow">
                  {s.title && <h2 className="text-xl font-semibold mb-2">{s.title}</h2>}
                  <div className="text-slate-700" dangerouslySetInnerHTML={{ __html: s.content ?? '' }} />
                  {s.media_url && <img src={s.media_url} alt={s.title ?? ''} className="mt-3 rounded max-h-80 object-cover w-full" />}
                </section>
              );
            })}

            {/* Jobs list */}
            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-3">Open roles</h2>
              {(jobs ?? []).length === 0 ? <div className="text-slate-600">No roles right now.</div> : jobs.map((j: any) => (
                <div key={j.id} className="border-b last:border-b-0 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{j.title}</div>
                      <div className="text-sm text-slate-500">{j.location} • {j.experience_level}</div>
                    </div>
                    <div className="text-sm">{j.posted_days_ago ?? 'N/A'} days ago</div>
                  </div>
                </div>
              ))}
            </section>
          </main>

          <aside>
            <div className="bg-white p-4 rounded shadow mb-4">
              <h3 className="font-semibold">{company.name}</h3>
              <div className="text-sm text-slate-600">{company.tagline}</div>
              <div className="mt-2">
                <a className="text-sm text-sky-600 underline" href={`/${company.slug}/careers`}>Open public page</a>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h4 className="font-semibold mb-2">Brand</h4>
              <div className="text-sm">Primary: <span style={{ color: company.primary_color }}>{company.primary_color ?? '—'}</span></div>
              <div className="text-sm">Accent: <span style={{ color: company.accent_color }}>{company.accent_color ?? '—'}</span></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
