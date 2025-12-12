// // components/auth/AuthGuard.tsx
// 'use client';

// import React, { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '../../hooks/';

// export default function AuthGuard({ children }: { children: React.ReactNode }) {
//   const { authUser, dbUser, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (loading) return;
//     if (!authUser) {
//       router.push('/login');
//       return;
//     }
//     // dbUser may be undefined while loading; ensure it exists
//     if (dbUser === undefined) return;
//     // redirect by role
//     if (dbUser === null) {
//       // user record missing -> redirect to onboarding
//       router.push('/onboarding');
//       return;
//     }
//     if (dbUser.role === 'admin') router.push('/admin');
//   }, [authUser, dbUser, loading, router]);

//   if (loading || !authUser || dbUser === undefined) return <div className="p-8">Loading…</div>;
//   return <>{children}</>;
// }
// at top or bottom of app/api/auth/upsert/route.ts
export {}; // <-- makes this file an ES module for TypeScript
