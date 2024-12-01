import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AccessibilityMenu from '@/components/AccessibilityMenu';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tabac Le Soler - Bureau de tabac a Le Soler',
  description: 'Votre bureau de tabac de confiance a Le Soler. Tabac, Loto, PMU, et plus encore.',
  openGraph: {
    title: 'Tabac Le Soler',
    description: 'Votre bureau de tabac de confiance a Le Soler. Tabac, Loto, PMU, et plus encore.',
    url: 'https://tabac-le-soler.com',
    images: [
      {
        url: '/assets/images/devanture.jpg',
        alt: 'Tabac Presse Le Soler - façade',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabac Le Soler',
    description: 'Votre bureau de tabac de confiance a Le Soler. Tabac, Loto, PMU, et plus encore.',
    images: ['/assets/images/devanture.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
      </head>
      <body className={inter.className}>
        {children}
        <AccessibilityMenu />
      </body>
    </html>
  );
}
