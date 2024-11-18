'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative h-[80vh] w-full">
      <Image
        src="/shop-front.jpg"
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
            <Image
              src="/logo.png"
              alt="Tabac Le Soler Logo"
              width={200}
              height={200}
              className="mx-auto mb-8"
            />
            <h1 className="text-5xl font-bold mb-4">Tabac Le Soler</h1>
            <p className="text-xl">Votre bureau de tabac de confiance</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}