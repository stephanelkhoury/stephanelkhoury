import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import { AnimationProvider } from '@/components/animations';
import LiveChatWidget from '@/components/dynamic/LiveChatWidget';
import ThemeProvider from '@/components/ThemeProvider';
import "./globals.css";

// Import the FontAwesome CSS
import '@fortawesome/fontawesome-svg-core/styles.css';

// Configure FontAwesome
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.stephanelkhoury.com'),
  title: {
    default: 'Stephan El Khoury | Full-Stack Developer, SEO Expert, AI Search Expert',
    template: '%s | Stephan El Khoury',
  },
  description:
    'Portfolio of Stephan El Khoury, a full-stack developer, technical SEO expert, and AI search optimization specialist building high-performance digital products.',
  keywords: [
    'Stephan El Khoury',
    'Full-Stack Developer',
    'SEO Expert',
    'AI Search Expert',
    'AEO Expert',
    'GEO Expert',
    'Portfolio',
  ],
  authors: [{ name: 'Stephan El Khoury', url: 'https://www.stephanelkhoury.com' }],
  creator: 'Stephan El Khoury',
  publisher: 'Stephan El Khoury',
  category: 'Technology',
  classification: 'Portfolio, SEO, Full-Stack Development, AI Search Optimization',
  referrer: 'origin-when-cross-origin',
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.stephanelkhoury.com',
    siteName: 'Stephan El Khoury',
    title: 'Stephan El Khoury | Full-Stack Developer, SEO Expert, AI Search Expert',
    description:
      'Explore projects, technical SEO execution, AI search optimization, platforms, and product delivery across full-stack engineering.',
    images: [
      {
        url: '/images/profile/stephan-profile.jpg',
        width: 1200,
        height: 630,
        alt: 'Stephan El Khoury profile and portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stephan El Khoury | Full-Stack Developer, SEO Expert, AI Search Expert',
    description:
      'Explore projects, technical SEO execution, AI search optimization, platforms, and product delivery across full-stack engineering.',
    images: ['/images/profile/stephan-profile.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${sora.variable} ${sora.className} bg-background text-foreground`}>
        <ThemeProvider>
          <AnimationProvider>
            {children}
            <LiveChatWidget />
          </AnimationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

