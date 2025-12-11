// app/page.tsx
import Link from 'next/link';
import Button from './components/ui/Button';

// app/page.tsx
export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">Careers Builder</h1>
        <p className="text-slate-700">Create branded careers pages for your company. Please log in or sign up to begin.</p>
      </div>
    </div>
  );
}
