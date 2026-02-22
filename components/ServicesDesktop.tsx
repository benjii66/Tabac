"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay, Navigation } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Image from "next/image";

interface Service {
  id: number;
  title: string;
  description: string;
  details: string;
  image: string;
}

interface Props {
  services: Service[];
  onSelectService: (service: Service) => void;
}

export default function ServicesDesktop({ services = [], onSelectService }: Props) {

  if (!services.length) {
    console.warn("❌ Aucun service reçu dans ServicesDesktop");
  }

  // Données JSON-LD pour les services (SEO)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: Array.isArray(services) ? services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.description,
        image: service.image,
        provider: {
          "@type": "LocalBusiness",
          name: "Tabac Presse Le Soler",
        },
      },
    })) : [],
  };

  console.log("Services reçus dans ServicesDesktop :", services);

  return (
    <div className="relative">
      {/* Ajout des métadonnées JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        initialSlide={1}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
          slideShadows: false,
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
        className="w-full py-12 px-4 pb-14"
        aria-label="Carousel des services disponibles"
      >
        {services.length > 0 ? (
          services.map((service) => (
            <SwiperSlide
              key={service.id}
              className="group"
              style={{
                width: "320px",
                height: "450px",
              }}
              onClick={() => onSelectService(service)}
              role="button"
              aria-label={`Voir les détails du service : ${service.title}`}
            >
              <div
                className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl bg-gray-100 transition-all duration-500 group-hover:shadow-2xl"
              >
                <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                
                {/* Overlay pour assurer la lisibilité */}
                <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:bg-transparent"></div>

                <div
                  className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50 transform transition-transform duration-300 group-hover:-translate-y-2"
                  aria-hidden="true"
                >
                  <h3 className="text-xl font-bold mb-2 text-nordic-text">{service.title}</h3>
                  <div className="w-8 h-1 bg-tabac-red rounded-full mb-3 transition-all duration-300 group-hover:w-12"></div>
                  <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
                </div>
              </div>
            </SwiperSlide>

          ))
        ) : (
          <p className="text-gray-500 text-center">Aucun service disponible pour le moment.</p>
        )}
      </Swiper>
    </div>
  );
}
