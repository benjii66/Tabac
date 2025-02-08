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
    services: Service[];
    onSelectService: (service: Service) => void;
}

interface Props {
    onSelectService: (service: Service) => void;
}

export default function ServicesMobile({ services = [], onSelectService }: Props) {

    if (!services.length) {
        console.warn("❌ Aucun service reçu dans Services Mobile");
    }

    // Données JSON-LD pour le SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: services.map((service, index) => ({
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
        })),
    };

    return (
        <div className="relative">
            {/* Ajout du JSON-LD pour le SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

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
                aria-label="Carousel des services disponibles (version mobile)"
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
                            onClick={() => onSelectService(service)}
                            role="button"
                            aria-label={`Voir les détails du service : ${service.title}`}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.5 }}
                                className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                            >
                                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                                <div
                                    className="absolute inset-0 flex flex-col justify-center items-center text-center bg-gradient-to-t from-black/20 to-black/10 text-white p-3"
                                    aria-hidden="true"
                                >
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
        </div>
    );
}
