"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaClock } from "react-icons/fa";
import axios from "axios";

interface OpeningHour {
  day: string;
  hours: string;
}

export default function OpeningHours() {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Récupération des horaires via l'API Next.js
  useEffect(() => {
    const fetchOpeningHours = async () => {
      try {
        const response = await axios.get("/api/openingHours");
        console.log("✅ Horaires récupérés :", response.data);

        if (Array.isArray(response.data)) {
          setOpeningHours(response.data);
        } else {
          console.error("❌ Les données reçues ne sont pas un tableau :", response.data);
          setOpeningHours([]);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des horaires :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpeningHours();
  }, []);

  // 🔹 Données structurées pour le SEO (schema.org)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Tabac Presse Le Soler",
    address: {
      "@type": "PostalAddress",
      streetAddress: "46 Rue des Orangers",
      addressLocality: "Le Soler",
      postalCode: "66270",
      addressCountry: "FR",
    },
    openingHoursSpecification: openingHours.map((item) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: item.day,
      opens: item.hours.split("-")[0]?.trim(),
      closes: item.hours.split("-")[1]?.trim(),
    })),
    url: "https://tabaclesoler.fr/horaires",
  };

  return (
    <section className="py-12 sm:py-16 bg-white" aria-labelledby="opening-hours-title" id="horaires">
      <div className="container mx-auto px-4">
        {/* ✅ Titre de la section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <FaClock className="text-red-600 text-2xl" aria-hidden="true" />
            <h2 id="opening-hours-title" className="text-2xl sm:text-3xl font-bold text-gray-800">
              Horaires d’ouverture
            </h2>
          </div>

          {/* ✅ Liste des horaires */}
          <div className="bg-stone-50 rounded-lg p-4 sm:p-6 shadow-lg" aria-labelledby="opening-hours-list">
            <div id="opening-hours-list" className="sr-only">Horaires d’ouverture pour chaque jour de la semaine</div>

            {loading ? (
              <p className="text-gray-500 text-center">Chargement...</p>
            ) : openingHours.length > 0 ? (
              openingHours.map((item, index) => (
                <motion.div
                  key={item.day}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between text-sm sm:text-base py-2 border-b border-gray-200 last:border-0"
                >
                  <span className="font-medium text-gray-800">{item.day}</span>
                  <span className="text-sm text-gray-600">{item.hours}</span>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Aucun horaire disponible.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ✅ Données SEO pour Google */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </section>
  );
}
