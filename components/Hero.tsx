'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Hero() {
  const slogans = [
    "Le choix et la proximité, c’est ici !",
    "Votre tabac, au cœur de vos besoins.",
    "Plus qu’un bureau de tabac : un service avec le sourire.",
    "L’essentiel de votre quotidien, à portée de main.",
  ];

  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSloganIndex((prevIndex) => (prevIndex + 1) % slogans.length);
    }, 5000); // Change toutes les 5 secondes
    return () => clearInterval(interval);
  }, [slogans.length]);

  // Scroll fluide au clic
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      className="relative h-[80vh] w-full"
      aria-label="Présentation du Tabac Presse Le Soler"
    >
      {/* Image d’arrière-plan */}
      <Image
        src="/assets/images/facade_magasin_copie.jpg"
        alt="Vue extérieure du Tabac Presse Le Soler avec sa façade accueillante."
        fill
        className="object-cover brightness-75"
        priority
      />

      {/* Superposition avec un dégradé */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"
        aria-hidden="true"
      >
        <div className="container mx-auto h-full px-4 flex flex-col justify-center items-center text-white">
          {/* Contenu animé */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
              aria-label="Nom de l’établissement Tabac Presse Le Soler"
            >
              Tabac Presse Le Soler
            </h1>

            {/* Roulement des slogans */}
            <div className="overflow-hidden h-10 mt-10">
              <motion.p
                key={currentSloganIndex}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="text-lg sm:text-xl md:text-2xl"
                aria-label="Slogan de l’établissement"
              >
                {slogans[currentSloganIndex]}
              </motion.p>
            </div>
          </motion.div>

          {/* Flèche CTA avec cercle et animation uniquement sur la flèche */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-28" // Flèche encore plus basse
          >
            <button
              onClick={() => scrollToSection("horaires")} // Pointe vers la section Horaires
              aria-label="Voir nos horaires"
              className="flex justify-center items-center w-14 h-14 rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition"
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                animate={{
                  y: [0, 15, 0], // Animation idle uniquement sur la flèche
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
