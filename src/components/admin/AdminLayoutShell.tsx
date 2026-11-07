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
  { href: '/admin/multigraphic-ai', label: 'Multigraphic AI' },
  { href: '/admin/multigraphic-ai/agents', label: 'Agent Registry' },
  { href: '/admin/multigraphic-ai/knowledge', label: 'Knowledge' },
  { href: '/admin/systems', label: 'Systems' },
  { href: '/admin/certificates', label: 'Certificates' },
  { href: '/admin/blob', label: 'Blob Storage' },
  { href: '/admin/chats', label: 'Chats' },
  { href: '/admin/multigraphic-ai/team', label: 'Team' },
  { href: '/admin/multigraphic-ai/account', label: 'Account & security' },
];

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAdminAuth();
  const [checking, setChecking] = useState(pathname !== '/admin/sign-in');
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.localStorage.getItem('cms-nav') === 'collapsed');
  const toggleNav = () => { const next = !collapsed; setCollapsed(next); window.localStorage.setItem('cms-nav', next ? 'collapsed' : 'expanded'); };

  useEffect(() => {
    if (pathname === '/admin/sign-in') {
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

  if (pathname?.startsWith('/admin/multigraphic-ai')) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen grid bg-[#0b1220] text-slate-100 transition-[grid-template-columns] duration-200 ${collapsed ? 'md:grid-cols-[72px_1fr]' : 'md:grid-cols-[270px_1fr]'}`}>
      <aside className={`border-r border-slate-700/60 bg-[#0f172a] p-4 md:sticky md:top-0 md:h-screen md:overflow-y-auto ${collapsed ? 'md:p-3' : 'md:p-6'}`}>
        <div className="mb-6 flex items-start justify-between gap-2">
          {!collapsed && <div><h1 className="text-xl font-semibold tracking-tight">CMS Dashboard</h1><p className="text-xs text-slate-400 mt-1">Neon PostgreSQL • Route-based CMS</p></div>}
          <button type="button" onClick={toggleNav} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!collapsed} title={collapsed ? 'Expand navigation' : 'Collapse navigation'} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">{collapsed ? '»' : '«'}</button>
        </div>

        <nav className="space-y-2">
          {links.map((item) => {
            const active = pathname === item.href || (item.href === '/admin/multigraphic-ai' && pathname?.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${collapsed ? 'text-center' : ''} ${
                  active
                    ? 'bg-slate-200 text-slate-900 font-medium'
                    : 'bg-transparent hover:bg-slate-800 text-slate-300'
                }`}
              >
                {collapsed ? <span aria-hidden="true">{item.label.slice(0, 2)}</span> : item.label}
                {collapsed && <span className="sr-only">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => void signOut()}
          className="mt-6 w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm"
        >
          {collapsed ? '⎋' : 'Sign Out'}
        </button>
      </aside>

      <main className="p-6 md:p-10 bg-[#0b1220]">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
