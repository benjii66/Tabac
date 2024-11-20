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
            rotate: 30,
            stretch: 20, // Ajout d'un léger espacement
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
              className="flex justify-center items-center" // Ne touche pas aux dimensions globales
              style={{
                width: '20vw', // Largeur de chaque slide : 25% de l'écran
                height: '30vh', // Hauteur de chaque slide : 35% de l'écran
              }}
            >
              {/* Slide avec bordure subtile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm"
              >
                <img
                  src={service.image || '/assets/images/placeholder.jpg'}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center bg-gradient-to-t from-black/20 to-black/10 text-white p-3">
                  <h3 className="text-lg font-bold mb-1">{service.title}</h3>
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
