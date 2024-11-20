import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AccessibilityMenu from '@/components/AccessibilityMenu'; // Importe le composant AccessibilityMenu

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tabac Le Soler - Bureau de tabac à Le Soler',
  description: 'Votre bureau de tabac de confiance à Le Soler. Tabac, Loto, PMU, et plus encore.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
        <AccessibilityMenu /> {/* Ajout du composant Accessibilité */}
      </body>
    </html>
  );
}
