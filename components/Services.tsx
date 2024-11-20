"use client";

// ACHTUNG
// aggrandir les placeholders d'images de services



import { useEffect, useState } from "react";
import ServicesMobile from "./ServicesMobile";
import ServicesDesktop from "./ServicesDesktop";


export default function Services() {
  const [isMobile, setIsMobile] = useState(false);

  // Détecter la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Mobile si largeur <= 768px
    };

    handleResize(); // Vérifier lors du premier rendu
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="py-16 bg-stone-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Nos Services
        </h2>
        <p className="text-gray-600 text-center mb-12">
          Découvrez tout ce que nous proposons
        </p>

        {/* Afficher la version appropriée */}
        {isMobile ? <ServicesMobile /> : <ServicesDesktop />}
      </div>
    </section>
  );
}



