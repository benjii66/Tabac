'use client';

import { motion } from 'framer-motion';

export default function MapSection() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": "Tabac Presse Le Soler",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "46 rue des Orangers",
      "addressLocality": "Le Soler",
      "postalCode": "66270",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 42.6939, // Coordonnées approximatives
      "longitude": 2.8347
    },
    "telephone": "+33468738659"
  };

  return (
    <section className="py-16 bg-white" aria-labelledby="map-title">
      <div className="container mx-auto px-4">
        {/* Données structurées pour le SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        ></script>

        {/* Titre et adresse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2
            id="map-title"
            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4"
          >
            Nous Trouver
          </h2>
          <p
            className="text-gray-600 text-sm sm:text-base"
            aria-label="Adresse du Tabac Presse Le Soler"
          >
            46 rue des Orangers, 66270 Le Soler
          </p>
        </motion.div>

        {/* Carte Google Maps */}
        <div
          className="rounded-lg overflow-hidden shadow-lg"
          aria-label="Carte pour localiser le Tabac Presse Le Soler"
        >
          <iframe
            title="Localisation de Tabac Presse Le Soler sur Google Maps"
            className="w-full h-[300px] sm:h-[400px] md:h-[600px]"
            src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=fr&amp;q=46,%20rue%20des%20orangers%20Le%20Soler+(Tabac%20Presse%20Le%20Soler)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Section contact */}
      <div className="text-center pt-10">
        <h2
          className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4"
          aria-label="Contact"
        >
          Nous Contacter
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Téléphone :{' '}
          <a
            href="tel:+33468738659"
            className="text-blue-600 hover:underline"
            aria-label="Numéro de téléphone du Tabac Presse Le Soler"
          >
            04 68 73 86 59
          </a>
        </p>
      </div>
    </section>
  );
}
