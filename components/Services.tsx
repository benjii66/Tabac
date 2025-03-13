"use client";

import { useEffect, useState } from "react";
import ServicesMobile from "./ServicesMobile";
import ServicesDesktop from "./ServicesDesktop";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import axios from "axios";
import cld from "../config/cloudinaryConfig"; // 🔥 Import Cloudinary
import { fill } from "@cloudinary/url-gen/actions/resize";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Service {
  id: number;
  title: string;
  description: string;
  details: string;
  image: string;
  images?: string[];
}

// 🔗 URL du fichier JSON stocké sur Cloudinary
const CLOUDINARY_JSON_URL = `https://res.cloudinary.com/dchckbio5/raw/upload/tabac/json/services.json?invalidate=true&timestamp=${Date.now()}`;


// ✅ Vérifie si une URL est déjà hébergée sur Cloudinary
const isCloudinaryUrl = (url: string) => url.includes("res.cloudinary.com");

// 🔥 Fonction pour récupérer l'URL Cloudinary formatée
const getCloudinaryImageUrl = (imageName?: string) => {
  if (!imageName) return ""; // Gestion des valeurs nulles
  if (isCloudinaryUrl(imageName)) return imageName; // Si c'est déjà une URL Cloudinary, on ne touche pas

  const extractedName = imageName.split("/").pop(); // Récupère juste le nom du fichier
  const formattedImageName = `tabac/${extractedName}`; // Ajoute le préfixe correct

  console.log("✅ URL Cloudinary générée :", formattedImageName);

  return cld.image(formattedImageName).resize(fill().width(400).height(300)).toURL();
};

export default function Services() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true); // Ajout du chargement

  // 📥 Récupération des services depuis Cloudinary
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(CLOUDINARY_JSON_URL);
        console.log("✅ Nombre de services récupérés :", response.data.length);
        console.log("✅ Services bruts récupérés :", response.data);

        if (Array.isArray(response.data)) {
          const formattedServices = response.data.map((service: Service) => ({
            ...service,
            id: Number(service.id), // ✅ On garde bien un ID numérique
            image: service.image || "/assets/images/placeholder.svg",
            images: service.images ? service.images.map(img => img || "/assets/images/placeholder.svg") : [],
          }));

          console.log("✅ Services après transformation :", formattedServices);
          setServices(formattedServices);
          console.log("✅ Nombre de services après transformation :", formattedServices.length);
          console.log("✅ Services après transformation :", formattedServices);
        } else {
          console.error("❌ Les données reçues ne sont pas un tableau :", response.data);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des services :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);



  // 📏 Détecter la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🎯 Données JSON-LD pour les services (SEO)
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
    <section className="py-16 bg-stone-100" aria-labelledby="services-title" id="services">
      {/* Métadonnées JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="container mx-auto px-4">
        <h2 id="services-title" className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Nos Services : Tabac, Presse, Vape Shop et plus encore
        </h2>
        <p className="text-gray-600 text-center mb-12">
          Découvrez tout ce que nous proposons pour répondre à vos besoins quotidiens.
        </p>

        {/* 🔄 Ajout d'un message de chargement */}
        {loading ? (
          <div className="text-center text-gray-500 text-lg">Chargement des services...</div>
        ) : (
          <>
            {/* Affichage des services pour mobile ou desktop */}
            {isMobile ? (
              <ServicesMobile services={services} onSelectService={setSelectedService} />
            ) : (
              <ServicesDesktop services={services} onSelectService={setSelectedService} />
            )}
          </>
        )}
      </div>

      {/* Modal avec carrousel des images multiples */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => setSelectedService(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedService(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                ✕
              </button>

              {/* Carrousel des images multiples */}
              <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} spaceBetween={10} slidesPerView={1} className="mb-4">
                {selectedService.images && selectedService.images.length > 0 ? (
                  (selectedService.images?.length > 0 ? selectedService.images : [selectedService.image]).map((img, index) => (
                    <SwiperSlide key={index}>
                      <img src={img} alt={`Image ${index + 1}`} className="w-full h-80 object-cover rounded-lg" />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide>
                    <img src={selectedService.image} alt={`Image principale du service ${selectedService.title}`} className="w-full h-40 object-cover rounded-lg" />
                  </SwiperSlide>
                )}
              </Swiper>

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
