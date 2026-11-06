'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Activity, Archive, BadgeCheck, BookOpen, Boxes, Building2, ChartColumnBig, ChartNoAxesCombined, FileText, LayoutDashboard, ListTodo, Layers3, MessagesSquare, Moon, PanelLeftClose, PanelLeftOpen, PlugZap, Plus, Settings2, Sun, UsersRound } from 'lucide-react';

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
];

type Theme = 'light' | 'dark';
type NavState = 'expanded' | 'collapsed';

function remember(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/admin/multigraphic-ai; max-age=31536000; samesite=lax`;
}

export default function OperationsShell({ children, initialTheme = 'light', initialNav = 'expanded' }: { children: React.ReactNode; initialTheme?: Theme; initialNav?: NavState }) {
  const pathname = usePathname() ?? '';
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [nav, setNav] = useState<NavState>(initialNav);
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const current = navigation.find(item => isActive(item.href, item.exact));
  const fullBleed = pathname === '/admin/multigraphic-ai';

  function chooseTheme(next: Theme) { setTheme(next); remember('ops-theme', next); }
  function toggleNav() { const next = nav === 'expanded' ? 'collapsed' : 'expanded'; setNav(next); remember('ops-nav', next); }

  return (
    <div className="operations-shell ops-app" data-theme={theme} data-nav={nav}>
      <a href="#operations-content" className="skip-link">Skip to content</a>
      <aside className="ops-sidebar" aria-label="Workspace">
        <Link href="/admin/multigraphic-ai" className="ops-brand" aria-label="Multigraphic AI headquarters">
          <span className="ops-brand-mark" aria-hidden="true">M</span>
          <span className="ops-brand-copy"><strong>multigraphic <span>/ ai</span></strong><small>Your company, together</small></span>
        </Link>
        <nav className="ops-nav" aria-label="Multigraphic workspace">
          {navigation.map(({ href, label, icon: Icon, exact }) => (
            <Link key={href} href={href} aria-current={isActive(href, exact) ? 'page' : undefined} title={nav === 'collapsed' ? label : undefined}>
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
              <span className="ops-nav-label">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="ops-sidebar-footer">
          <span className="ops-owner" aria-label="Owner workspace" title="Owner workspace">SE</span>
          <button type="button" className="ops-collapse" onClick={toggleNav} aria-label={nav === 'expanded' ? 'Collapse navigation' : 'Expand navigation'} aria-expanded={nav === 'expanded'} title={nav === 'expanded' ? 'Collapse navigation' : 'Expand navigation'}>
            {nav === 'expanded' ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
        </div>
      </aside>
      <div className="ops-column">
        <header className="ops-topbar">
          <p className="ops-breadcrumb">Multigraphic AI <span aria-hidden="true">/</span> <b>{current?.label ?? 'Workspace'}</b></p>
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
