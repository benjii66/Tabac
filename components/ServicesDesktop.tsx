"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import Image from "next/image";

interface Service {
  id: number;
  title: string;
  description: string;
  details: string;
  image: string;
}

interface Props {
  onSelectService: (service: Service) => void;
}

export default function ServicesDesktop({ onSelectService }: Props) {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("/api/services");

        console.log("Services récupérés :", response.data); // Debug des données
        if (Array.isArray(response.data)) {
          setServices(response.data); // Assigne uniquement si c'est un tableau
        } else {
          console.error("Les données reçues ne sont pas un tableau :", response.data);
          setServices([]); // Par défaut, on assigne un tableau vide
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des services :", error);
      }
    };

    fetchServices();
  }, []);

  return (
    <Swiper
      effect="coverflow"
      grabCursor={true}
      centeredSlides={true}
      slidesPerView="auto"
      coverflowEffect={{
        rotate: 20,
        stretch: 50,
        depth: 150,
        modifier: 1,
        slideShadows: true,
      }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      modules={[EffectCoverflow, Pagination, Autoplay]}
      className="w-full py-8"
    >
      {services.length > 0 ? (
        services.map((service) => (
          <SwiperSlide
            key={service.id}
            className="flex justify-center items-center"
            style={{
              width: "30vw",
              height: "40vh",
            }}
            onClick={() => onSelectService(service)} // Signalement du service sélectionné
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-md"
            >
              <Image
                src={service.image || "/assets/images/placeholder.svg"}
                alt={`${service.title} - ${service.description}`}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center bg-gradient-to-t from-black/50 to-black/20 text-white p-3">
                <h3 className="text-lg sm:text-xl font-bold mb-1">{service.title}</h3>
                <p className="text-sm sm:text-base">{service.description}</p>
              </div>
            </motion.div>
          </SwiperSlide>
        ))
      ) : (
        <p className="text-gray-500 text-center">Aucun service disponible pour le moment.</p>
      )}
    </Swiper>
  );
}
