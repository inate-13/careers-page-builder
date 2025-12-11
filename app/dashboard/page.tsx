// app/dashboard/page.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '../hooks/useUser';
import { useRouter } from 'next/navigation';

type Company = { id: string; name: string; slug: string; tagline?: string; published?: boolean };

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.id || fetched.current) return;
    fetched.current = true;
    fetch('/api/company/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId: user.id })
    })
      .then(r => r.json())
      .then(d => setCompanies(d.companies || []))
      .finally(() => setLoadingCompanies(false));
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this company and all data?')) return;
    await fetch('/api/company/delete', { method: 'POST', body: JSON.stringify({ companyId: id }), headers: { 'Content-Type': 'application/json' } });
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  if (loading || !user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Your Companies</h1>
          <button onClick={() => router.push('/company/create')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
            + Create New Company
          </button>
        </div>

        {loadingCompanies ? (
          <div className="text-center py-20 text-gray-500">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow text-center">
            <p className="text-xl text-gray-600">No companies yet. Create your first one!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Company</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Link</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-lg">{c.name}</div>
                      {c.tagline && <div className="text-sm text-gray-600">{c.tagline}</div>}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.published ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">/{c.slug}/careers</td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button onClick={() => router.push(`/company/${c.slug}/edit`)} className="px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700">Edit</button>
                      <button onClick={() => router.push(`/${c.slug}/careers`)} className="px-4 py-2 bg-green-600 text-black rounded hover:bg-green-700">View</button>
                      <button onClick={() => handleDelete(c.id)} className="px-4 py-2 bg-red-600 text-black rounded hover:bg-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}