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
    onSelectService: (service: Service) => void; // Ajout de la prop `onSelectService`
}

export default function ServicesMobile({ onSelectService }: Props) {
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get("/api/services");

                console.log("Données reçues depuis l'API services:", response.data); // Debug des données

                if (Array.isArray(response.data)) {
                    setServices(response.data); // Assigner les données seulement si elles sont un tableau
                } else {
                    console.error("Données invalides reçues:", response.data);
                    setServices([]); // Mettre un tableau vide en cas de problème
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des services:", error);
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
                rotate: 30,
                stretch: 40,
                depth: 120,
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
                            width: "85%",
                            height: "40vh",
                        }}
                        onClick={() => onSelectService(service)} // Utilisation de la prop pour signaler le service sélectionné
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                            className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                        >
                            <Image
                                src={service.image || "/assets/images/placeholder.svg"}
                                alt={`${service.title} - ${service.description}`} // SEO amélioré
                                width={85}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center bg-gradient-to-t from-black/20 to-black/10 text-white p-3">
                                <h3 className="text-md font-bold mb-1">{service.title}</h3>
                                <p className="text-xs">{service.description}</p>
                            </div>
                        </motion.div>
                    </SwiperSlide>
                ))
            ) : (
                <p className="text-center text-gray-500">Aucun service disponible pour le moment.</p>
            )}
        </Swiper>
    );
}
