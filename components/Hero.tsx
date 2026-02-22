'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const slogans = [
  "L'essentiel au quotidien.",
  "Vos magazines préférés.",
  "La chance au tirage.",
  "Vos services à proximité."
];

export default function Hero() {

  const [displayText, setDisplayText] = useState('');
  const [sloganIndex, setSloganIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentSlogan = slogans[sloganIndex];
    let typingSpeed = isDeleting ? 30 : 80;

    if (!isDeleting && displayText === currentSlogan) {
      const timeout = setTimeout(() => setIsDeleting(true), 2500); // Pause à la fin de la phrase
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setSloganIndex((prev) => (prev + 1) % slogans.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText(currentSlogan.substring(0, displayText.length + (isDeleting ? -1 : 1)));
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, sloganIndex]);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Logique pour mettre le dernier mot en rouge pendant qu'il est tapé
  const targetSlogan = slogans[sloganIndex];
  const targetLastWord = targetSlogan.split(' ').pop() || '';
  const prefixLength = targetSlogan.length - targetLastWord.length;
  const typedPrefix = displayText.substring(0, prefixLength);
  const typedRed = displayText.substring(prefixLength);

  return (
    <section
      className="relative min-h-screen bg-nordic-bg text-nordic-text flex items-center overflow-hidden pt-20 pb-16 md:pt-0 md:pb-0"
      aria-label="Présentation du Tabac Presse Le Soler"
    >
      {/* Subtle background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-tabac-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
        
        {/* Left Content - Typography & CTA */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left mt-10 md:mt-0"
        >
          {/* Logo Placeholder (Replace src with actual logo if needed) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="relative w-32 h-32 md:w-40 md:h-40 mb-8 rounded-full border-4 border-tabac-red bg-white flex items-center justify-center shadow-xl shadow-tabac-red/20 overflow-hidden"
          >
             <Image src="/assets/logo/logow.jpg" alt="Logo Tabac Presse Le Soler" fill className="object-cover" /> 
          </motion.div>

          {/* Slogan Container - Typewriter Effect */}
          <div className="h-[160px] sm:h-[130px] md:h-[180px] lg:h-[200px] w-full flex items-start mt-4 mb-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] text-nordic-text w-full">
              {typedPrefix}
              <span className="text-tabac-red relative whitespace-nowrap">{typedRed}</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="inline-block bg-tabac-red w-[4px] md:w-[6px] h-[0.9em] ml-2 align-middle"
              />
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-lg font-light leading-relaxed">
            Votre espace moderne et convivial à Le Soler. Retrouvez tous vos services : tabac, presse, loto et bien plus, avec le sourire.
          </p>
          
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-6">
             <button 
               onClick={() => scrollToSection('horaires')} 
               className="px-8 py-4 bg-tabac-red text-white text-lg font-medium rounded-full hover:bg-[#c20510] transition-all transform hover:-translate-y-1 shadow-lg shadow-tabac-red/30 w-full sm:w-auto"
             >
               Voir nos horaires
             </button>
             <button 
               onClick={() => scrollToSection('services')} 
               className="px-8 py-4 bg-white text-nordic-text border border-gray-200 text-lg font-medium rounded-full hover:bg-gray-50 transition-all transform hover:-translate-y-1 shadow-sm w-full sm:w-auto"
             >
               Nos services
             </button>
          </div>
        </motion.div>

        {/* Right Content - Image Layout */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="md:w-1/2 relative h-[400px] md:h-[600px] w-full mt-10 md:mt-0"
        >
           {/* Image container with rounded corners and shadow */}
           <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl z-10">
             <Image 
               src="/assets/images/facade_magasin.jpg" 
               alt="Façade du magasin" 
               fill 
               className="object-cover hover:scale-105 transition-transform duration-700"
               priority
             />
           </div>
           
           {/* Decorative frame box to add depth (Nordic style touch) */}
           <div className="absolute -inset-4 md:-inset-6 border-2 border-gray-200 rounded-[2.5rem] z-0 hidden md:block" />
           <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-tabac-red/10 rounded-full blur-2xl z-0" />
        </motion.div>
      </div>

      {/* Floating Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center"
      >
        <span className="text-gray-400 text-sm mb-2 font-medium tracking-widest uppercase">Scroll</span>
        <motion.div 
          className="w-[1px] h-12 bg-gray-300 overflow-hidden relative"
        >
          <motion.div 
            animate={{ y: [0, 48, 48] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-[50%] bg-tabac-red"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
