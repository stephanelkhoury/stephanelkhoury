import type { Metadata } from 'next';
import { getPublicContent } from '@/lib/bootstrap';
import { normalizeMultigraphicPage } from '@/lib/multigraphic-page';
import MultigraphicPageRenderer from '@/components/multigraphic/MultigraphicPageRenderer';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'MultigraphicLB | Stephan El Khoury',
  description:
    'MultigraphicLB is Stephan El Khoury\'s startup for high-performance digital products, branding systems, and full-stack web platforms.',
  alternates: {
    canonical: '/multigraphiclb',
  },
  openGraph: {
    title: 'MultigraphicLB | Stephan El Khoury',
    description:
      'Explore MultigraphicLB projects, startup services, and product engineering showcase embedded in Stephan El Khoury portfolio.',
    url: '/multigraphiclb',
    siteName: 'Stephan El Khoury',
    images: ['/logo-multigraphic.lb.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MultigraphicLB | Stephan El Khoury',
    description:
      'Startup showcase for MultigraphicLB: engineering, creative systems, and project portfolio.',
    images: ['/logo-multigraphic.lb.png'],
  },
};

export default async function MultigraphicPage() {
  const { blocks } = await getPublicContent();
  const block = blocks.find((item) => item.slug === 'multigraphic-main');
  const page = normalizeMultigraphicPage(block?.content || {});

  return <MultigraphicPageRenderer page={page} />;
}
