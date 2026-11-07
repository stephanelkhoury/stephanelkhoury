'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity, Archive, BadgeCheck, BookOpen, Boxes, Building2, ChartColumnBig, ChartNoAxesCombined, FileText, LayoutDashboard, ListTodo, Layers3, LogOut, MessagesSquare, Moon, PanelLeftClose, PanelLeftOpen, PlugZap, Plus, Settings2, ShieldCheck, Sun, UserCog, UsersRound } from 'lucide-react';

const navigation = [
  { href: '/admin/multigraphic-ai', label: 'Headquarters', icon: Building2, exact: true },
  { href: '/admin/multigraphic-ai/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/multigraphic-ai/departments', label: 'Departments', icon: Layers3 },
  { href: '/admin/multigraphic-ai/people', label: 'People & Academy', icon: UsersRound },
  { href: '/admin/multigraphic-ai/projects', label: 'Projects', icon: Boxes },
  { href: '/admin/multigraphic-ai/tasks', label: 'Task board', icon: ListTodo },
  { href: '/admin/multigraphic-ai/meetings', label: 'Meetings', icon: MessagesSquare },
  { href: '/admin/multigraphic-ai/approvals', label: 'Approvals', icon: BadgeCheck },
  { href: '/admin/multigraphic-ai/deliverables', label: 'Deliverables', icon: Archive },
  { href: '/admin/multigraphic-ai/agents', label: 'Agents', icon: Settings2 },
  { href: '/admin/multigraphic-ai/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/admin/multigraphic-ai/documentation', label: 'Documentation', icon: FileText },
  { href: '/admin/multigraphic-ai/analytics', label: 'Analytics', icon: ChartColumnBig },
  { href: '/admin/multigraphic-ai/integrations', label: 'Integrations', icon: PlugZap },
  { href: '/admin/multigraphic-ai/usage', label: 'Usage', icon: ChartNoAxesCombined },
  { href: '/admin/multigraphic-ai/activity', label: 'Activity', icon: Activity },
  { href: '/admin/multigraphic-ai/team', label: 'Team', icon: UserCog, manage: true },
  { href: '/admin/multigraphic-ai/account', label: 'Account & security', icon: ShieldCheck },
];

type Me = { role: string; user: { email: string; name: string } | null };
const initials = (name?: string) => (name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'MG';

type Theme = 'light' | 'dark';
type NavState = 'expanded' | 'collapsed';

function remember(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/admin/multigraphic-ai; max-age=31536000; samesite=lax`;
}

export default function OperationsShell({ children, initialTheme = 'light', initialNav = 'expanded' }: { children: React.ReactNode; initialTheme?: Theme; initialNav?: NavState }) {
  const pathname = usePathname() ?? '';
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [nav, setNav] = useState<NavState>(initialNav);
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/auth/session', { cache: 'no-store', signal: controller.signal }).then(async response => { if (response.ok) setMe(await response.json()); }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  async function signOut() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/sign-in');
    router.refresh();
  }
  const canManage = !me || me.role === 'OWNER' || me.role === 'ADMIN';
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const current = navigation.find(item => isActive(item.href, item.exact));
  const fullBleed = pathname === '/admin/multigraphic-ai';

  function chooseTheme(next: Theme) { setTheme(next); remember('ops-theme', next); }
  function toggleNav() { const next = nav === 'expanded' ? 'collapsed' : 'expanded'; setNav(next); remember('ops-nav', next); }

  return (
    <div className="operations-shell ops-app" data-theme={theme} data-nav={nav}>
      <a href="#operations-content" className="skip-link">Skip to content</a>
      <aside id="ops-sidebar" className="ops-sidebar" aria-label="Workspace">
        <Link href="/admin/multigraphic-ai" className="ops-brand" aria-label="Multigraphic AI headquarters">
          <Image src="/brand/multigraphic-mark.png" alt="" width={38} height={38} className="ops-brand-logo" priority />
          <span className="ops-brand-copy"><strong>multigraphic <span>/ ai</span></strong><small>Your company, together</small></span>
        </Link>
        <nav className="ops-nav" aria-label="Multigraphic workspace">
          {navigation.filter(item => !('manage' in item) || canManage).map(({ href, label, icon: Icon, exact }) => (
            <Link key={href} href={href} aria-current={isActive(href, exact) ? 'page' : undefined} title={nav === 'collapsed' ? label : undefined}>
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
              <span className="ops-nav-label">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="ops-sidebar-footer">
          <div className="ops-user">
            <span className="ops-owner" aria-hidden="true">{initials(me?.user?.name)}</span>
            <span className="ops-user-meta"><b>{me?.user?.name ?? 'Workspace'}</b><small>{me?.role ? me.role.toLowerCase() : 'owner'}</small></span>
          </div>
          <button type="button" className="ops-signout" onClick={() => void signOut()} aria-label="Sign out" title="Sign out"><LogOut size={16} aria-hidden="true" /></button>
        </div>
      </aside>
      <div className="ops-column">
        <header className="ops-topbar">
          <div className="ops-topbar-lead">
            <button type="button" className="ops-nav-toggle" onClick={toggleNav} aria-label={nav === 'expanded' ? 'Collapse navigation' : 'Expand navigation'} aria-expanded={nav === 'expanded'} aria-controls="ops-sidebar" title={nav === 'expanded' ? 'Collapse navigation' : 'Expand navigation'}>
              {nav === 'expanded' ? <PanelLeftClose size={17} aria-hidden="true" /> : <PanelLeftOpen size={17} aria-hidden="true" />}
            </button>
            <p className="ops-breadcrumb">Multigraphic AI <span aria-hidden="true">/</span> <b>{current?.label ?? 'Workspace'}</b></p>
          </div>
          <div className="ops-topbar-actions">
            <fieldset className="ops-theme-switch">
              <legend className="sr-only">Theme</legend>
              <label><input type="radio" name="ops-theme" value="light" checked={theme === 'light'} onChange={() => chooseTheme('light')} /><Sun size={14} aria-hidden="true" /><span>Light</span></label>
              <label><input type="radio" name="ops-theme" value="dark" checked={theme === 'dark'} onChange={() => chooseTheme('dark')} /><Moon size={14} aria-hidden="true" /><span>Dark</span></label>
            </fieldset>
            <Link href="/admin/multigraphic-ai/projects/new" className="ops-primary-action"><Plus size={15} aria-hidden="true" /><span>New brief</span></Link>
          </div>
        </header>
        <main id="operations-content" tabIndex={-1} className={fullBleed ? 'ops-content-full' : 'operations-main'}>{children}</main>
      </div>
    </div>
  );
}
