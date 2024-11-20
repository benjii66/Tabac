"use client";

import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import OpeningHours from '@/components/OpeningHours';
import Services from '@/components/Services';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-stone-50">

      <AccessibilityMenu />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <OpeningHours />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Services />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MapSection />
      </motion.div>
      <Footer />
    </main>
  );
}
