"use client";

import { useEffect, useState } from "react";
import ServicesMobile from "./ServicesMobile";
import ServicesDesktop from "./ServicesDesktop";
import { AnimatePresence, motion } from "framer-motion";

interface Service {
  id: number;
  title: string;
  description: string;
  details: string;
  image: string;
}

export default function Services() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null); // État pour le service sélectionné

  // Détecter la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Mobile si largeur <= 768px
    };

    handleResize(); // Vérifier lors du premier rendu
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="py-16 bg-stone-100" aria-labelledby="services-title">
      <div className="container mx-auto px-4">
        <h2
          id="services-title"
          className="text-3xl font-bold text-gray-800 mb-4 text-center"
        >
          Nos Services : Tabac, Presse, et plus encore
        </h2>
        <p
          className="text-gray-600 text-center mb-12"
          aria-label="Découvrez les services proposés par Tabac Presse Le Soler, incluant Tabac, Loto, PMU, et Presse."
        >
          Découvrez tout ce que nous proposons pour répondre à vos besoins
          quotidiens.
        </p>

        {/* Afficher la version appropriée */}
        {isMobile ? (
          <ServicesMobile onSelectService={setSelectedService} />
        ) : (
          <ServicesDesktop onSelectService={setSelectedService} />
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedService && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setSelectedService(null)} // Ferme la modale si on clique en dehors
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()} // Empêche la fermeture si on clique sur la modale
            >
              <button
                onClick={() => setSelectedService(null)} // Ferme la modale en cliquant sur le bouton ✕
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <img
                src={selectedService.image}
                alt={selectedService.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold mb-2">{selectedService.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedService.description}</p>
              <p className="text-sm text-gray-700">{selectedService.details}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </section>
  );
}
