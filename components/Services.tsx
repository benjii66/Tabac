"use client";

// ACHTUNG
// Aggrandir les placeholders d'images de services

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
    <section className="py-16 bg-stone-100" aria-labelledby="services-title">
      <div className="container mx-auto px-4">
        <h2
          id="services-title"
          className="text-3xl font-bold text-gray-800 mb-4 text-center"
        >
          Nos Services : Tabac, Presse, et plus encore
        </h2>
        <p
          className="text-gray-600 text-center mb-12"
          aria-label="Découvrez les services proposés par Tabac Presse Le Soler, incluant Tabac, Loto, PMU, et Presse."
        >
          Découvrez tout ce que nous proposons pour répondre à vos besoins
          quotidiens.
        </p>

        {/* Afficher la version appropriée */}
        {isMobile ? (
          <ServicesMobile aria-label="Services affichés sur mobile" />
        ) : (
          <ServicesDesktop aria-label="Services affichés sur desktop" />
        )}
      </div>
    </section>
  );
}
