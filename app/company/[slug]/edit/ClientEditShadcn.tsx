// app/company/[slug]/edit/EditClient.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionsBuilder, { SectionShape } from './components/SectionsBuilder';

type Company = { id: string; name: string; slug: string; tagline?: string | null; logo_url?: string | null; banner_url?: string | null; primary_color?: string | null; accent_color?: string | null; culture_video_url?: string | null; published?: boolean; };

export default function EditClient({
  initialSlug,
  fallbackCompany,
  fallbackSections,
}: {
  initialSlug: string;
  fallbackCompany: Company;
  fallbackSections: SectionShape[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(fallbackCompany ?? null);
  const [sections, setSections] = useState<SectionShape[]>(fallbackSections ?? []);
  const [deletedSectionIds, setDeletedSectionIds] = useState<string[]>([]);
  const logoRef = useRef<HTMLInputElement | null>(null);
  const bannerRef = useRef<HTMLInputElement | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingSections, setSavingSections] = useState(false);
  const [fetching, setFetching] = useState(false);

  async function fetchFresh() {
    setFetching(true);
    try {
      const url = `/api/company/get?slug=${encodeURIComponent(initialSlug)}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        console.error('fetchFresh non-ok', res.status, await res.text());
        setFetching(false);
        return;
      }
      const json = await res.json();
      if (json.company) setCompany(json.company);
      if (Array.isArray(json.sections)) setSections(json.sections);
    } catch (err) {
      console.error('fetchFresh error', err);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  }
  useEffect(() => { fetchFresh(); /* eslint-disable-next-line */ }, []);

  async function uploadFile(file: File, field: string) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('companyId', company?.id ?? '');
    fd.append('field', field);
    const res = await fetch('/api/company/upload-cloudinary', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? 'Upload failed');
    return json.url as string;
  }

  async function handleSaveTheme() {
    if (!company) return toast('No company loaded', 'error');
    setSavingTheme(true);
    try {
      const patch: any = {
        name: company.name,
        tagline: company.tagline ?? null,
        primary_color: company.primary_color ?? null,
        accent_color: company.accent_color ?? null,
        culture_video_url: company.culture_video_url ?? null,
      };
      if (logoFile) patch.logo_url = await uploadFile(logoFile, 'logo_url');
      if (bannerFile) patch.banner_url = await uploadFile(bannerFile, 'banner_url');
      const payload = { companyId: company.id, company: patch };
      const res = await fetch('/api/company/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? 'Save theme failed');
      }
      await fetchFresh();
      setLogoFile(null); setBannerFile(null);
      if (logoRef.current) logoRef.current.value = ''; if (bannerRef.current) bannerRef.current.value = '';
      toast('Company theme saved successfully!');
    } catch (err: any) {
      console.error('handleSaveTheme error', err);
      toast(err?.message ?? 'Save theme failed', 'error');
    } finally { setSavingTheme(false); }
  }

  async function handleSaveSections() {
    if (!company) return toast('No company loaded', 'error');
    setSavingSections(true);
    try {
      const body = { companyId: company.id, sections, deletedIds: deletedSectionIds };
      const res = await fetch('/api/company/sections/bulk-upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch { json = { raw: text }; }

      if (!res.ok) {
        throw new Error(json?.error ?? `Save failed (${res.status})`);
      }
      // refresh authoritative data
      await fetchFresh();
      setDeletedSectionIds([]);
      toast('Sections saved successfully!');
    } catch (err: any) {
      console.error('handleSaveSections error', err);
      toast(err?.message ?? 'Save sections failed', 'error');
    } finally { setSavingSections(false); }
  }

  async function handlePublish() {
    if (!company) return;
    if (!confirm('Publish this careers page?')) return;
    try {
      const res = await fetch('/api/company/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: company.id, published: true }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Publish failed');
      await fetchFresh();
      router.push(`/${company.slug}/careers`);
    } catch (err: any) { console.error('publish err', err); toast(err?.message ?? 'Publish failed', 'error'); }
  }

  function handleDeletedChange(ids: string[]) {
    setDeletedSectionIds(prev => Array.from(new Set([...prev, ...ids])));
  }

  // toast helper
  function toast(msg: string, level: 'success' | 'error' = 'success') {
    const el = document.createElement('div');
    el.textContent = msg;
    el.className = `fixed bottom-6 right-6 z-[100] px-4 py-3 rounded shadow-lg font-medium transition-all transform duration-300 ${level === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
  }

  if (loading || fetching || !company) return (<div className="min-h-screen flex items-center justify-center p-8"><div className="text-center"><div className="mb-4 text-slate-600">Loading latest company data…</div><div role="status" className="h-2 w-64 bg-slate-200 rounded animate-pulse" /></div></div>);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header controls (Dashboard, etc) */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Edit Careers Page</h1>
            <p className="text-sm text-slate-500">Manage branding and content sections.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">Dashboard</button>
            <button onClick={() => router.push(`/${company.slug}/preview`)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">Preview</button>
            <button onClick={() => { void navigator.clipboard?.writeText(`${location.origin}/${company.slug}/careers`); toast('Public link copied'); }} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">Copy Link</button>
            <button onClick={handlePublish} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm">Publish Changes</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT: Branding Column */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Branding</h2>
                <button onClick={handleSaveTheme} disabled={savingTheme} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50">{savingTheme ? 'Saving...' : 'Save Theme'}</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                  <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
                  <input value={company.tagline ?? ''} onChange={(e) => setCompany({ ...company, tagline: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Building the future" />
                </div>

                {/* Logo Upload with Preview */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                      {company.logo_url ? <img src={company.logo_url} className="w-full h-full object-contain" alt="Logo" /> : <span className="text-xs text-slate-400">None</span>}
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                  {logoFile && <p className="text-xs text-amber-600 mt-1">New logo selected (save to apply)</p>}
                </div>

                {/* Banner Upload with Preview */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Banner</label>
                  <div className="w-full h-24 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden mb-2 relative">
                    {company.banner_url ? (
                      <img src={company.banner_url} className="w-full h-full object-cover" alt="Banner" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Banner</div>
                    )}
                  </div>
                  <input ref={bannerRef} type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1">
                      <input type="color" value={company.primary_color ?? '#0ea5e9'} onChange={(e) => setCompany({ ...company, primary_color: e.target.value })} className="w-8 h-8 rounded border-none mr-2 curser-pointer" />
                      <span className="text-xs text-slate-500 font-mono">{company.primary_color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Accent Color</label>
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1">
                      <input type="color" value={company.accent_color ?? '#7c3aed'} onChange={(e) => setCompany({ ...company, accent_color: e.target.value })} className="w-8 h-8 rounded border-none mr-2 curser-pointer" />
                      <span className="text-xs text-slate-500 font-mono">{company.accent_color}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Culture Video (YouTube)</label>
                  <input value={company.culture_video_url ?? ''} onChange={(e) => setCompany({ ...company, culture_video_url: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="https://youtube.com/..." />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button onClick={handleSaveTheme} disabled={savingTheme} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-70 transition-colors">
                  {savingTheme ? 'Saving Changes...' : 'Save Branding'}
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT: Sections Column */}
          <main className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Page Content</h2>
                  <p className="text-sm text-slate-500">Add, edit, and reorder sections.</p>
                </div>
                <button onClick={handleSaveSections} disabled={savingSections} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg shadow-sm hover:bg-slate-800 disabled:opacity-70 transition-colors">
                  {savingSections ? 'Saving...' : 'Save Sections'}
                </button>
              </div>

              <SectionsBuilder
                sections={sections}
                onChange={setSections}
                onDeletedChange={handleDeletedChange}
              />

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button onClick={handleSaveSections} disabled={savingSections} className="px-6 py-2.5 bg-slate-900 text-black font-bold rounded-lg shadow-sm hover:bg-slate-800 disabled:opacity-70 transition-colors">
                  {savingSections ? 'Saving...' : 'Save Sections'}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
