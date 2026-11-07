import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import OperationsShell from '@/components/operations/OperationsShell';
import './operations.css';
import './theme.css';
import './hq-studio.css';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function MultigraphicOperationsLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const theme = store.get('ops-theme')?.value === 'dark' ? 'dark' : 'light';
  const nav = store.get('ops-nav')?.value === 'collapsed' ? 'collapsed' : 'expanded';
  return <OperationsShell initialTheme={theme} initialNav={nav}>{children}</OperationsShell>;
}
