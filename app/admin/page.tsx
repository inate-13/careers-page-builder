// app/admin/page.tsx
'use client';
import React from 'react';
// import AuthGuard from '../components/auth/AuthGuard';

export default function AdminPage() {
  return (
    // <AuthGuard>
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Admin Console</h1>
        <p className="mt-2 text-sm text-gray-600">Admin-only operations (manage companies, imports).</p>
      </main>
    // </AuthGuard>
  );
}
