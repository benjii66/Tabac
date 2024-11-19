'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

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
    title: 'PMU',
    description: 'Paris hippiques et sportifs',
    image: '/assets/images/pmu.jpg',
  },
  {
    title: 'Presse',
    description: 'Journaux et magazines',
    image: '/assets/images/press.jpg',
  },
];

export default function Services() {
  return (
    <section className="py-16 bg-stone-100">
      <div className="container mx-auto px-4">
        {/* Titre de la section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nos Services</h2>
          <p className="text-gray-600">Découvrez tout ce que nous proposons</p>
        </motion.div>

        {/* Slider Swiper */}
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
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
            <SwiperSlide key={index} className="w-80 h-80">
              {/* Slide avec image et contenu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full rounded-lg overflow-hidden shadow-lg"
              >
                <img
                  src={service.image || '/assets/images/placeholder.jpg'} // Placeholder en cas d'image manquante
                  alt={service.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                  <p className="text-sm">{service.description}</p>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
