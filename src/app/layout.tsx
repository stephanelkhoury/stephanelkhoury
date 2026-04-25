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
    default: 'Stephan El Khoury | Full-Stack Developer Portfolio',
    template: '%s | Stephan El Khoury',
  },
  description:
    'Portfolio of Stephan El Khoury, a full-stack developer, QA analyst, and technical SEO specialist building high-performance digital products.',
  keywords: [
    'Stephan El Khoury',
    'Full-Stack Developer',
    'Portfolio',
    'Next.js Developer',
    'Technical SEO',
    'QA Analyst',
    'Multigraphic',
  ],
  alternates: {
    canonical: '/',
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
    title: 'Stephan El Khoury | Full-Stack Developer Portfolio',
    description:
      'Explore projects, systems, and experience across full-stack development, QA, and technical SEO.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stephan El Khoury | Full-Stack Developer Portfolio',
    description:
      'Explore projects, systems, and experience across full-stack development, QA, and technical SEO.',
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

