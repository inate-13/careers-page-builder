// app/company/create/page.tsx
'use client';
import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { useRouter } from 'next/navigation';
import { showToast } from '../../components/ui/Toast';

export default function CreateCompanyPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [saving, setSaving] = useState(false);

  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch('/api/company/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: user.id, name, slug, tagline }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? 'Create failed');
      showToast('Company created', 'success');
      router.push(`/company/${json.company.slug}/edit`);
    } catch (err: any) {
      showToast(err.message ?? 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <form onSubmit={handleCreate} className="bg-white rounded p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Create Company</h2>
        <label className="block text-sm mb-1">Name</label>
        <input className="w-full border rounded px-3 py-2 mb-3" value={name} onChange={(e) => setName(e.target.value)} required />
        <label className="block text-sm mb-1">URL slug (unique)</label>
        <input className="w-full border rounded px-3 py-2 mb-3" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <label className="block text-sm mb-1">Tagline</label>
        <input className="w-full border rounded px-3 py-2 mb-3" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded">
            {saving ? 'Creating…' : 'Create company'}
          </button>
        </div>
      </form>
    </div>
  );
}
