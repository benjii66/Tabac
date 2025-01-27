"use client";

import { useEffect, useState } from "react";
import ServicesMobile from "./ServicesMobile";
import ServicesDesktop from "./ServicesDesktop";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Service {
  id: number;
  title: string;
  description: string;
  details: string;
  image: string;
  images?: string[]; // Images multiples optionnelles
}

export default function Services() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Détecter la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Données JSON-LD pour les services
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Services du Tabac Presse Le Soler",
    description:
      "Découvrez les services proposés par le Tabac Presse Le Soler : jeux, presse, produits locaux, maroquinerie, et bien plus.",
    provider: {
      "@type": "LocalBusiness",
      name: "Tabac Presse Le Soler",
      address: {
        "@type": "PostalAddress",
        streetAddress: "46 rue des Orangers",
        addressLocality: "Le Soler",
        postalCode: "66270",
        addressCountry: "FR",
      },
    },
    serviceType: "Tabac, Presse, Jeux, Produits Locaux",
    areaServed: {
      "@type": "Place",
      name: "Le Soler et alentours",
    },
  };

  return (
    <section
      className="py-16 bg-stone-100"
      aria-labelledby="services-title"
      id="services"
    >
      {/* Métadonnées JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4">
        <h2
          id="services-title"
          className="text-3xl font-bold text-gray-800 mb-4 text-center"
        >
          Nos Services : Tabac, Presse, et plus encore
        </h2>
        <p className="text-gray-600 text-center mb-12">
          Découvrez tout ce que nous proposons pour répondre à vos besoins
          quotidiens.
        </p>

        {/* Affichage des services pour mobile ou desktop */}
        {isMobile ? (
          <ServicesMobile onSelectService={setSelectedService} />
        ) : (
          <ServicesDesktop onSelectService={setSelectedService} />
        )}
      </div>

      {/* Modal avec carrousel des images multiples */}
      <AnimatePresence>
        {selectedService && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

              {/* Carrousel des images multiples */}
              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                  prevEl: ".custom-swiper-button-prev",
                  nextEl: ".custom-swiper-button-next",
                }}
                pagination={{ clickable: true }}
                spaceBetween={10}
                slidesPerView={1}
                className="mb-4"
              >
                {selectedService.images && selectedService.images.length > 0 ? (
                  selectedService.images.map((img, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={img}
                        alt={`Image ${index + 1} du service ${selectedService.title}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide>
                    <img
                      src={selectedService.image}
                      alt={`Image principale du service ${selectedService.title}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </SwiperSlide>
                )}
              </Swiper>

              {/* Flèches de navigation personnalisées */}
              <div
                className="custom-swiper-button-prev absolute top-1/2 left-[-20px] transform -translate-y-1/2 text-gray-800 hover:text-gray-500 z-10 cursor-pointer"
                role="button"
                aria-label="Précédent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div
                className="custom-swiper-button-next absolute top-1/2 right-[-20px] transform -translate-y-1/2 text-gray-800 hover:text-gray-500 z-10 cursor-pointer"
                role="button"
                aria-label="Suivant"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Contenu textuel du service */}
              <h3 className="text-xl font-bold mb-2">{selectedService.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedService.description}
              </p>
              <p className="text-sm text-gray-700">{selectedService.details}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
