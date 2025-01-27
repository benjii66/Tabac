import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tabac Le Soler - Bureau de tabac et services à Le Soler',
  description: 'Tabac Le Soler : profitez de jeux, lotos, PMU, presse, produits locaux, e-cigarettes, CBD, maroquinerie et prêt-à-porter. Ouvert 7j/7 à Le Soler !',
  openGraph: {
    title: 'Tabac Le Soler - Votre bureau de tabac local',
    description: 'Tabac, jeux, lotos, PMU, presse, produits locaux, e-cigarettes, CBD et bien plus à Le Soler. Retrouvez-nous au 46 rue des Orangers, 66270 Le Soler.',
    url: 'https://tabaclesoler.fr/',
    images: [
      {
        url: '/assets/images/facade_magasin.jpg',
        alt: 'Façade du Tabac Presse Le Soler',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabac Le Soler - Votre tabac de proximité à Le Soler',
    description: 'Retrouvez tous vos services préférés : tabac, presse, lotos, e-cigarettes et produits locaux. Ouvert tous les jours à Le Soler !',
    images: ['/assets/images/facade_magasin.jpg'],
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
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "Tabac Le Soler",
            description: "Votre bureau de tabac de confiance à Le Soler. Retrouvez tous vos services : jeux, lotos, PMU, presse, produits locaux, e-cigarettes, CBD, maroquinerie et prêt-à-porter.",
            url: "https://tabaclesoler.fr/",
            telephone: "+33 4 68 00 00 00",
            address: {
              "@type": "PostalAddress",
              streetAddress: "46 rue des Orangers",
              addressLocality: "Le Soler",
              postalCode: "66270",
              addressCountry: "FR",
            },
            openingHoursSpecification: [
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "07:00", closes: "19:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "07:00", closes: "19:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "07:00", closes: "19:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "07:00", closes: "19:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "07:00", closes: "19:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "07:00", closes: "12:30" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "14:30", closes: "19:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "08:00", closes: "12:30" },
            ],
            sameAs: [
              "https://www.facebook.com/p/Tabac-presse-Le-Soler-100057636871519/?locale=fr_FR",
              "https://www.instagram.com/tabaclesoler/",
            ],
          })}
        </script>
      </head>
      <body className={inter.className}>
        {children}
        <SpeedInsights />
        <Analytics />
        <AccessibilityMenu />
      </body>
    </html>
  );
}
