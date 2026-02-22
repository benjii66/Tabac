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
    <section className="py-20 sm:py-28 bg-white" aria-labelledby="opening-hours-title" id="horaires">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex flex-col items-center justify-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-full bg-tabac-red/10 flex items-center justify-center">
              <FaClock className="text-tabac-red text-2xl" aria-hidden="true" />
            </div>
            <h2 id="opening-hours-title" className="text-3xl sm:text-4xl font-extrabold text-nordic-text text-center tracking-tight">
              Horaires d'ouverture
            </h2>
          </div>

          <div className="bg-nordic-bg rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm" aria-labelledby="opening-hours-list">
            <div id="opening-hours-list" className="sr-only">Horaires d’ouverture pour chaque jour de la semaine</div>

            {loading ? (
              <p className="text-gray-400 text-center py-4">Chargement...</p>
            ) : openingHours.length > 0 ? (
              <div className="space-y-4">
                {openingHours.map((item, index) => (
                  <motion.div
                    key={item.day}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex justify-between items-center text-base sm:text-lg py-3 border-b border-gray-200/50 last:border-0"
                  >
                    <span className="font-semibold text-nordic-text">{item.day}</span>
                    <span className="text-gray-500 font-light">{item.hours}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Aucun horaire disponible.</p>
            )}
          </div>
        </motion.div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </section>
  );
}
