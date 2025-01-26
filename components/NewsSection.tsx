"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

interface NewsItem {
  id: number;
  title: string;
  description: string;
  image: string;
  images?: string[]; // Propriété optionnelle
  date: string;
  details: string;
}


export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("/api/news");
        console.log("Données reçues de l'API :", response.data);
        if (Array.isArray(response.data)) {
          setNews(response.data);
        } else {
          console.error("Les données de l'API ne sont pas un tableau :", response.data);
          setNews([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des nouveautés :", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-gray-50" aria-labelledby="news-title">
      <div className="container mx-auto px-4 relative">
        <h2
          id="news-title"
          className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center"
        >
          Nouveautés
        </h2>

        {news.length > 0 ? (
          news.length > 3 ? (
            <div className="relative">
              {/* Swiper avec navigation responsive */}
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                  prevEl: ".custom-swiper-button-prev",
                  nextEl: ".custom-swiper-button-next",
                }}
                pagination={{ clickable: true }}
                breakpoints={{
                  320: { slidesPerView: 1, spaceBetween: 10 },
                  640: { slidesPerView: 2, spaceBetween: 15 },
                  1024: { slidesPerView: 3, spaceBetween: 20 },
                }}
              >
                {news.map((item) => (
                  <SwiperSlide key={item.id}>
                    <div
                      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                      onClick={() => setSelectedNews(item)}
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
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Flèches positionnées pour mobile et desktop */}
              <div
                className="custom-swiper-button-prev absolute top-1/2 left-[-20px] sm:left-[-40px] transform -translate-y-1/2 text-gray-800 hover:text-gray-500 z-10 cursor-pointer"
                role="button"
                aria-label="Précédent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 sm:w-6 sm:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              <div
                className="custom-swiper-button-next absolute top-1/2 right-[-20px] sm:right-[-40px] transform -translate-y-1/2 text-gray-800 hover:text-gray-500 z-10 cursor-pointer"
                role="button"
                aria-label="Suivant"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 sm:w-6 sm:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ) : (
            // Grille si 3 articles ou moins
            <div
              className={`${news.length < 3
                ? "flex justify-center gap-6"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                }`}
            >
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedNews(item)}
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
          )
        ) : (
          <p className="text-center text-gray-500">
            Aucune nouveauté à afficher pour le moment.
          </p>
        )}
      </div>

      {/* Modal avec AnimatePresence */}
      <AnimatePresence>
        {selectedNews && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              {/* Carousel des images */}
              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                  prevEl: ".custom-swiper-button-prev",
                  nextEl: ".custom-swiper-button-next",
                }}
                pagination={{ clickable: true }}
                spaceBetween={10}
                slidesPerView={1}
                className="mb-4"
              >
                {selectedNews.images && selectedNews.images.length > 0 ? (
                  selectedNews.images.map((img, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={img} // Utilise "img" ici pour accéder à chaque image
                        alt={`Image ${index + 1}`}
                        className="w-full h-60 object-cover rounded-lg"
                      />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide>
                    <img
                      src={selectedNews.image} // Par défaut, l'image principale
                      alt={selectedNews.title}
                      className="w-full h-60 object-cover rounded-lg"
                    />
                  </SwiperSlide>
                )}
              </Swiper>

              {/* Boutons de navigation */}
              <div
                className="custom-swiper-button-prev absolute top-1/2 left-[-20px] transform -translate-y-1/2 z-10 cursor-pointer"
                role="button"
                aria-label="Précédent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-red-500" /* Flèche rouge */
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div
                className="custom-swiper-button-next absolute top-1/2 right-[-20px] transform -translate-y-1/2 z-10 cursor-pointer"
                role="button"
                aria-label="Suivant"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-red-500" /* Flèche rouge */
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Contenu textuel */}
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
