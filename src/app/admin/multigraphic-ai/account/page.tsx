import type { Metadata } from 'next';
import AccountWorkspace from '@/components/operations/AccountWorkspace';

export const metadata: Metadata = { title: 'Account & security | Multigraphic AI' };

export default function AccountPage() {
  return <AccountWorkspace />;
}
