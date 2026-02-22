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
    <section className="py-24 bg-white" aria-labelledby="services-title" id="services">
      {/* Métadonnées JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="container mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <h2 id="services-title" className="text-4xl md:text-5xl font-extrabold text-nordic-text text-center tracking-tight mb-6">
            Nos <span className="text-tabac-red relative whitespace-nowrap">Services</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-500 text-center mb-16 max-w-2xl mx-auto font-light">
            Découvrez tout ce que nous proposons pour répondre à vos besoins quotidiens, alliant choix et proximité.
          </p>
        </motion.div>

        {/* 🔄 Ajout d'un message de chargement */}
        {loading ? (
          <div className="text-center text-gray-400 text-lg py-12">Chargement de nos services...</div>
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
          <div className="fixed inset-0 bg-nordic-text/80 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => setSelectedService(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden relative m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedService(null)} 
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-tabac-red transition-colors z-20 shadow-sm"
              >
                ✕
              </button>

              {/* Carrousel des images multiples */}
              <Swiper 
                modules={[Navigation, Pagination]} 
                navigation={{ prevEl: ".services-modal-prev", nextEl: ".services-modal-next" }} 
                pagination={{ clickable: true }} 
                spaceBetween={0} 
                slidesPerView={1} 
                className="w-full relative pb-10" /* pb-10 pour dégager la place de la pagination */
              >
                {selectedService.images && selectedService.images.length > 0 ? (
                  (selectedService.images?.length > 0 ? selectedService.images : [selectedService.image]).map((img, index) => (
                    <SwiperSlide key={index}>
                      <img src={img} alt={`Image ${index + 1}`} className="w-full h-64 sm:h-80 object-cover" />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide>
                    <img src={selectedService.image} alt={`Image principale du service ${selectedService.title}`} className="w-full h-64 sm:h-80 object-cover" />
                  </SwiperSlide>
                )}
                {/* Modal Navigation Arrows */}
                <div className="services-modal-prev w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center absolute top-1/2 left-4 transform -translate-y-1/2 z-10 cursor-pointer text-nordic-text hover:text-white hover:bg-tabac-red transition-all duration-300 shadow-md group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                  </svg>
                </div>
                <div className="services-modal-next w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center absolute top-1/2 right-4 transform -translate-y-1/2 z-10 cursor-pointer text-nordic-text hover:text-white hover:bg-tabac-red transition-all duration-300 shadow-md group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </div>
              </Swiper>

              <div className="p-8">
                <h3 className="text-3xl font-extrabold text-nordic-text mb-2 tracking-tight">{selectedService.title}</h3>
                <p className="text-base text-tabac-red font-semibold mb-5">{selectedService.description}</p>
                <div className="w-12 h-1 bg-gray-200 rounded-full mb-5"></div>
                <p className="text-base text-gray-600 leading-relaxed font-light">{selectedService.details}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
