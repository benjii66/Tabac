'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaClock } from "react-icons/fa";

interface OpeningHour {
  day: string;
  hours: string;
}

export default function OpeningHours() {

  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);

  // Fonction pour récupérer les horaires via l'API
  useEffect(() => {
    const fetchOpeningHours = async () => {
      try {
        const response = await axios.get("/api/openingHours");
        setOpeningHours(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des horaires :", error);
      }
    };

    fetchOpeningHours();
  }, []);


  return (
    <section
      className="py-12 sm:py-16 bg-white"
      aria-labelledby="opening-hours-title"
    >
      <div className="container mx-auto px-4">
        {/* Titre de la section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <FaClock className="text-red-600 text-2xl" aria-hidden="true" />
            <h2
              id="opening-hours-title"
              className="text-2xl sm:text-3xl font-bold text-gray-800"
            >
              Horaires d’ouverture
            </h2>
          </div>

          {/* Liste des horaires */}
          <div
            className="bg-stone-50 rounded-lg p-4 sm:p-6 shadow-lg"
            aria-labelledby="opening-hours-list"
          >
            <div id="opening-hours-list" className="sr-only">
              Horaires d’ouverture pour chaque jour de la semaine
            </div>
            {openingHours.map((item, index) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between text-sm sm:text-base py-2 border-b border-gray-200 last:border-0"
              >
                <span className="font-medium text-gray-800">
                  {item.day}
                </span>
                <span className="text-sm text-gray-600">
                  {item.hours}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
