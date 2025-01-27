'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import OpeningHours from '@/components/OpeningHours';
import Services from '@/components/Services';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import NewsSection from '@/components/NewsSection';
import Head from 'next/head';

// Composant de chargement (fallback) pour Suspense
function LoadingFallback({ message }: { message: string }) {
  return (
    <div className="flex justify-center items-center min-h-[200px] text-gray-500">
      <p>{message}</p>
    </div>
  );
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Tabac Le Soler - Bureau de tabac à Le Soler",
    "description": "Découvrez Tabac Le Soler : votre bureau de tabac local proposant des services de tabac, PMU, jeux, lotos, presse, e-cigarettes, CBD, maroquinerie, et produits locaux.",
    "url": "https://tabaclesoler.fr",
    "publisher": {
      "@type": "Organization",
      "name": "Tabac Le Soler",
      "url": "https://tabaclesoler.fr",
      "logo": "/assets/images/facade_magasin.jpg",
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://tabaclesoler.fr"
    },
  };

  return (
    <main className="flex min-h-screen flex-col bg-stone-50">
      <Head>
        <title>Tabac Le Soler - Bureau de tabac à Le Soler</title>
        <meta
          name="description"
          content="Tabac Le Soler : Tabac, Loto, PMU, presse, produits locaux, e-cigarettes, CBD et maroquinerie. Retrouvez-nous au 46 rue des Orangers, 66270 Le Soler."
        />
        <meta
          name="keywords"
          content="Tabac Le Soler, Bureau de tabac, PMU, presse, lotos, produits locaux, e-cigarettes, CBD, maroquinerie, prêt-à-porter"
        />
        <meta name="author" content="Tabac Le Soler" />
        <meta
          property="og:title"
          content="Tabac Le Soler - Bureau de tabac à Le Soler"
        />
        <meta
          property="og:description"
          content="Votre bureau de tabac local proposant une large gamme de services : tabac, PMU, presse, e-cigarettes, CBD, maroquinerie et plus encore."
        />
        <meta property="og:image" content="/assets/images/facade_magasin.jpg" />
        <meta property="og:url" content="https://tabaclesoler.fr" />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <AccessibilityMenu />

      <Suspense fallback={<LoadingFallback message="Chargement de la bannière..." />}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Hero />
        </motion.div>
      </Suspense>

      <Suspense fallback={<LoadingFallback message="Chargement des horaires d'ouverture..." />}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <OpeningHours />
        </motion.div>
      </Suspense>

      <Suspense fallback={<LoadingFallback message="Chargement des actualités..." />}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <NewsSection />
        </motion.div>
      </Suspense>

      <Suspense fallback={<LoadingFallback message="Chargement des services..." />}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Services />
        </motion.div>
      </Suspense>

      <Suspense fallback={<LoadingFallback message="Chargement de la carte..." />}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MapSection />
        </motion.div>
      </Suspense>

      <Footer />
    </main>
  );
}
