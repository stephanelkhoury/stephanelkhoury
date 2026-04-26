'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdminAuth } from './AdminAuthProvider';

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/full-site', label: 'Full Site Editor' },
  { href: '/admin/sections', label: 'Sections' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/systems', label: 'Systems' },
  { href: '/admin/certificates', label: 'Certificates' },
  { href: '/admin/blob', label: 'Blob Storage' },
  { href: '/admin/chats', label: 'Chats' },
];

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAdminAuth();
  const [checking, setChecking] = useState(pathname !== '/admin/sign-in');

  useEffect(() => {
    if (pathname === '/admin/sign-in') {
      setChecking(false);
      return;
    }

    let active = true;
    const checkSession = async () => {
      const response = await fetch('/api/admin/auth/session', { cache: 'no-store' });
      if (!active) return;

      if (!response.ok) {
        router.push('/admin/sign-in');
        router.refresh();
        return;
      }

      setChecking(false);
    };

    void checkSession();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (pathname === '/admin/sign-in') {
    return <>{children}</>;
  }

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-gray-300">Checking session...</div>;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[270px_1fr] bg-[#0b1220] text-slate-100">
      <aside className="border-r border-slate-700/60 p-4 md:p-6 bg-[#0f172a]">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">CMS Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Neon PostgreSQL • Route-based CMS</p>
        </div>

        <nav className="space-y-2">
          {links.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-slate-200 text-slate-900 font-medium'
                    : 'bg-transparent hover:bg-slate-800 text-slate-300'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => void signOut()}
          className="mt-6 w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm"
        >
          Sign Out
        </button>
      </aside>

      <main className="p-6 md:p-10 bg-[#0b1220]">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
