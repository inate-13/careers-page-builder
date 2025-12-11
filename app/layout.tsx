// app/layout.tsx
import NavBar from './components/NavBar';
import './globals.css';
 

 

 

export const metadata = {
  title: 'Careers Builder',
  description: 'Build branded careers pages',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
       <head>
        {/* Temporary: use compiled Tailwind CSS to ensure styles apply */}
        <link rel="stylesheet" href="/tailwind.css" />
      </head> 
      <body className="bg-slate-50 min-h-screen">
        <NavBar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
