import type { Metadata } from 'next';
import { Suspense } from 'react';
import DocumentationWorkspace from '@/components/operations/DocumentationWorkspace';

export const metadata: Metadata = { title: 'Documentation | Multigraphic AI' };

export default function DocumentationPage() {
  return <Suspense fallback={<div role="status" className="h-48 animate-pulse bg-ops-text/[0.05]" />}><DocumentationWorkspace /></Suspense>;
}
