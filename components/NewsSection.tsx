"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

interface NewsItem {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
  details: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null); // Nouveauté sélectionnée

  // Récupérer les données depuis l'API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("/api/news");
        setNews(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des nouveautés :", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <section
      className="py-12 sm:py-16 bg-gray-50"
      aria-labelledby="news-title"
    >
      <div className="container mx-auto px-4">
        {/* Titre de la section */}
        <h2
          id="news-title"
          className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center"
        >
          Nouveautés
        </h2>

        {/* Grille des nouveautés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedNews(item)} // Sélectionner la nouveauté
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Publié le : {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal avec AnimatePresence */}
      <AnimatePresence>
        {selectedNews && (
          <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setSelectedNews(null)} // Fermer le modal si on clique en dehors
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }} // Animation pour la fermeture
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()} // Empêcher la fermeture si on clique sur le modal
            >
              <button
                onClick={() => setSelectedNews(null)} // Fermer le modal
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <img
                src={selectedNews.image}
                alt={selectedNews.title}
                className="w-full h-60 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold mb-2">{selectedNews.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedNews.details}</p>
              <p className="text-xs text-gray-400">
                Publié le : {new Date(selectedNews.date).toLocaleDateString()}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
