'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const services = [
  {
    title: 'Tabac',
    description: 'Large sélection de produits de tabac',
    image: '/tobacco.jpg'
  },
  {
    title: 'Loto & Jeux',
    description: 'Française des Jeux, tickets à gratter',
    image: '/lotto.jpg'
  },
  {
    title: 'PMU',
    description: 'Paris hippiques et sportifs',
    image: '/pmu.jpg'
  },
  {
    title: 'Presse',
    description: 'Journaux et magazines',
    image: '/press.jpg'
  }
];

export default function Services() {
  return (
    <section className="py-16 bg-stone-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nos Services</h2>
          <p className="text-gray-600">Découvrez tout ce que nous proposons</p>
        </motion.div>
        
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
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
          pagination={true}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="w-full py-8"
        >
          {services.map((service, index) => (
            <SwiperSlide key={index} className="w-72 h-96">
              <div className="relative h-full rounded-lg overflow-hidden shadow-lg">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                  <p className="text-sm">{service.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}