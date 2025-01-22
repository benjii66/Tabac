'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  return (
    <section
      className="relative h-[80vh] w-full"
      aria-label="Presentation du Tabac Presse Le Soler"
    >
      {/* Image d'arriere-plan avec description accessible */}
      <Image
        src="/assets/images/triple_monstre.jpg"
        alt="Devanture du Tabac Presse Le Soler"
        fill
        className="object-cover brightness-75"
        priority
      />

      {/* Superposition avec degrade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50">
        <div className="container mx-auto h-full px-4 flex flex-col justify-center items-center text-white">
          {/* Contenu anime */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
              aria-label="Nom de l'etablissement"
            >
              Tabac Presse Le Soler
            </h1>
            <p
              className="text-lg sm:text-xl md:text-2xl"
              aria-label="Slogan de l'etablissement"
            >
              Le choix et la proximite, c’est ici !
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
// "Le choix et la proximite, c’est ici !"
// "Votre tabac presse, un service qui compte pour vous."
// "L’essentiel de votre quotidien, a portee de main."