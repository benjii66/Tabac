"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

// Données des services
const services = [
    {
        title: 'CBD',
        description: 'Large sélection de produits de CBD',
        image: '/assets/images/CBD.jpg',
    },
    {
        title: 'Maroquinerie',
        description: 'Des petits sacs à mains et accessoires',
        image: '/assets/images/maroquinerie.jpg',
    },
    {
        title: 'Magasin',
        description: 'Rayons spacieux',
        image: '/assets/images/magas1.jpg',
    },
    {
        title: 'Presse',
        description: 'Journaux et magazines',
        image: '/assets/images/presse.jpg',
    },
    {
        title: 'Produits Locaux',
        description: 'Produits Locaux et de la Région',
        image: '/assets/images/prodLoc.jpg',
    },
    {
        title: 'Cigarettes Electroniques',
        description: 'Produits e-cigarettes',
        image: '/assets/images/ecig.jpg',
    },
    {
        title: 'Boissons',
        description: 'A boire et ça repart',
        image: '/assets/images/Frigo.jpg',
    },
];

export default function ServicesMobile() {
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
            {services.map((service, index) => (
                <SwiperSlide
                    key={index}
                    className="flex justify-center items-center"
                    style={{
                        width: "85%", // Largeur réduite pour mobile
                        height: "40vh", // Hauteur ajustée pour mobile
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                    >
                        <img
                            src={service.image || "/assets/images/placeholder.jpg"}
                            alt={service.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center bg-gradient-to-t from-black/20 to-black/10 text-white p-3">
                            <h3 className="text-md font-bold mb-1">{service.title}</h3>
                            <p className="text-xs">{service.description}</p>
                        </div>
                    </motion.div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
