// components/builder/ImageUploader.tsx
'use client';
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { showToast } from '../../components/ui/Toast';

export default function ImageUploader({ companyId, folder = 'uploads', onUploaded }: { companyId: string; folder?: string; onUploaded?: (url: string) => void }) {
  const [loading, setLoading] = useState(false);
  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Only images allowed', 'error');
      return;
    }
    if (file.size > 5_000_000) {
      showToast('Max 5MB', 'error');
      return;
    }
    setLoading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${companyId}/${folder}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('company-assets').upload(path, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('company-assets').getPublicUrl(data.path);
      const publicUrl = (urlData as any)?.publicUrl;
      if (!publicUrl) throw new Error('Missing public URL. Make bucket public.');
      onUploaded?.(publicUrl);
      showToast('Uploaded', 'success');
    } catch (err: any) {
      console.error('upload err', err);
      showToast(err?.message ?? 'Upload failed', 'error');
    } finally {
      setLoading(false);
    //   e.currentTarget.value = '';
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handle} />
      {loading && <div className="text-sm text-slate-500">Uploading…</div>}
    </div>
  );
}
