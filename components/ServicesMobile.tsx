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
                initialSlide={1}
                coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 100,
                    modifier: 2.5,
                    slideShadows: false,
                }}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                modules={[EffectCoverflow, Pagination, Autoplay]}
                className="w-full py-8 px-2 pb-16"
                aria-label="Carousel des services disponibles (version mobile)"
            >
                {services.length > 0 ? (
                    services.map((service) => (
                        <SwiperSlide
                            key={service.id}
                            className="group"
                            style={{
                                width: "280px",
                                height: "380px",
                            }}
                            onClick={() => onSelectService(service)}
                            role="button"
                            aria-label={`Voir les détails du service : ${service.title}`}
                        >
                            <div
                                className="relative w-full h-full rounded-3xl overflow-hidden shadow-lg bg-gray-100"
                            >
                                <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                
                                <div className="absolute inset-0 bg-black/10"></div>

                                <div
                                    className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-md border border-white/50"
                                    aria-hidden="true"
                                >
                                    <h3 className="text-lg font-bold mb-1 text-nordic-text">{service.title}</h3>
                                    <div className="w-6 h-1 bg-tabac-red rounded-full mb-2"></div>
                                    <p className="text-xs text-gray-500 line-clamp-2">{service.description}</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))
                ) : (
                    <p className="text-center text-gray-500">Aucun service disponible pour le moment.</p>
                )}
            </Swiper>
        </div>
    );
}
