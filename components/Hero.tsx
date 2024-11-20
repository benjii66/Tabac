'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative h-[80vh] w-full">
      <Image
        src="/assets/images/devanture.jpg"
        alt="Tabac Le Soler Shop Front"
        fill
        className="object-cover brightness-75"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50">
        <div className="container mx-auto h-full px-4 flex flex-col justify-center items-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Tabac Presse Le Soler
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl">
              Le choix et la proximité, c'est ici !
            </p>
          </motion.div>
        </div>
      </div>
    </section>

  );
}




// autres catch phrase : "Le rendez-vous convivial de votre quotidien !"
// "Votre tabac presse, au cœur de vos besoins."
// "Plus qu’un bureau de tabac : un service avec le sourire."
// "Ici, tout commence par un bon accueil."
// "Le choix et la proximité, c’est ici !"
// "Votre tabac presse, un service qui compte pour vous."
// "L’essentiel de votre quotidien, à portée de main."