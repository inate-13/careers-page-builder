// app/company/[slug]/edit/ClientEditShadcn.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import SectionsBuilder from './components/SectionsBuilder';
import { useRouter } from 'next/navigation';

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
  published?: boolean;
};

export default function ClientEditShadcn({
  company: initialCompany,
  sections: initialSections,
}: {
  company: Company;
  sections: any[];
}) {
  const [company, setCompany] = useState<Company>(initialCompany);
  const [sections, setSections] = useState<any[]>(initialSections ?? []);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  // SYNC STATE WHEN SERVER REFRESHES (initial props change)
  useEffect(() => {
    setCompany(initialCompany);
    setSections(initialSections ?? []);
    setLogoFile(null);
    setBannerFile(null);
    if (logoRef.current) logoRef.current.value = '';
    if (bannerRef.current) bannerRef.current.value = '';
  }, [initialCompany, initialSections]);

  const uploadFile = async (file: File, field: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('companyId', company.id);
    fd.append('field', field);
    const res = await fetch('/api/company/upload-cloudinary', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json.url;
  };

  // STRONG: improved handleSave — updates local UI from server response
  const handleSave = async () => {
    setSaving(true);
    try {
      const patch: any = {};
      if (logoFile) patch.logo_url = await uploadFile(logoFile, 'logo_url');
      if (bannerFile) patch.banner_url = await uploadFile(bannerFile, 'banner_url');

      const payload = {
        companyId: company.id,
        company: {
          name: company.name,
          tagline: company.tagline || null,
          primary_color: company.primary_color || null,
          accent_color: company.accent_color || null,
          culture_video_url: company.culture_video_url || null,
          ...patch,
        },
        sections,
      };

      const res = await fetch('/api/company/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || (typeof json === 'string' ? json : 'Save failed'));

      // IMPORTANT: update local UI from API response (avoids stale renderer)
      // Expect server to return { success: true, company: <row>, sections: [ ... ] }
      if (json.company) {
        setCompany(json.company);
      } else {
        // fallback: merge patch into local company
        setCompany((c) => ({ ...c, ...patch }));
      }
      if (Array.isArray(json.sections)) {
        setSections(json.sections);
      }

      // reset pending files
      setLogoFile(null);
      setBannerFile(null);
      if (logoRef.current) logoRef.current.value = '';
      if (bannerRef.current) bannerRef.current.value = '';

      // lightly refresh server cache for routes if desired (optional)
      // router.refresh();

      alert('Saved successfully!');
    } catch (err: any) {
      console.error('Save error', err);
      alert('Error: ' + (err?.message ?? String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish?')) return;
    try {
      const res = await fetch('/api/company/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, published: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Publish failed');
      // update local company published flag and then navigate to public page
      setCompany((c) => ({ ...c, published: true }));
      router.push(`/${company.slug}/careers`);
    } catch (err: any) {
      console.error('publish err', err);
      alert(err?.message ?? 'Publish failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{company.name}</h1>
              <p className="text-xl text-gray-600 mt-2">{company.tagline || 'Add a tagline'}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${company.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {company.published ? 'Published' : 'Draft'}
                </span>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">/{company.slug}/careers</code>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="px-8 py-4 bg-indigo-600 text-black rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save All'}
              </button>
              {!company.published && (
                <button onClick={handlePublish} className="px-6 py-4 bg-emerald-600 text-black rounded-xl font-bold hover:bg-emerald-700">
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Branding */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Branding</h2>

              <input value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-lg" placeholder="Company Name" />

              <input value={company.tagline || ''} onChange={e => setCompany({ ...company, tagline: e.target.value })} className="w-full px-4 py-3 border rounded-lg mt-4" placeholder="Tagline" />

              <div className="mt-6">
                <label className="block font-medium mb-2">Logo</label>
                <input ref={logoRef} type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="block w-full" />
                {company.logo_url && <img src={company.logo_url} alt="Logo" className="mt-4 w-full h-48 object-contain rounded-xl border" />}
              </div>

              <div className="mt-6">
                <label className="block font-medium mb-2">Banner</label>
                <input ref={bannerRef} type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} className="block w-full" />
                {company.banner_url && <img src={company.banner_url} alt="Banner" className="mt-4 w-full h-64 object-cover rounded-xl border" />}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block font-medium mb-2">Primary Color</label>
                  <input type="color" value={company.primary_color || '#0ea5e9'} onChange={e => setCompany({ ...company, primary_color: e.target.value })} className="w-full h-16 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="block font-medium mb-2">Accent Color</label>
                  <input type="color" value={company.accent_color || '#7c3aed'} onChange={e => setCompany({ ...company, accent_color: e.target.value })} className="w-full h-16 rounded cursor-pointer" />
                </div>
              </div>

              <div className="mt-6">
                <label className="block font-medium mb-2">Culture Video URL</label>
                <input value={company.culture_video_url || ''} onChange={e => setCompany({ ...company, culture_video_url: e.target.value })} className="w-full px-4 py-3 border rounded-lg" placeholder="YouTube URL" />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Content Sections</h2>
              <SectionsBuilder sections={sections} setSections={setSections} companyId={company.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
