"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


import cld from "../config/cloudinaryConfig";
import { fill } from "@cloudinary/url-gen/actions/resize";

interface NewsItem {
  id: number;
  title: string;
  description: string;
  image: string;
  images?: string[]; // Propriété optionnelle
  date: string;
  details: string;
}



const CLOUDINARY_JSON_URL = "https://res.cloudinary.com/dchckbio5/raw/upload/tabac/json/news.json";

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  // Vérifie si l'URL est déjà une image Cloudinary complète
  const isCloudinaryUrl = (url: string) => url.includes("res.cloudinary.com");
  // Fonction pour générer l'URL Cloudinary si ce n'est pas déjà une URL complète
  const getCloudinaryImageUrl = (imageName?: string) => {
    if (!imageName) return ""; // Évite les erreurs sur les images nulles ou undefined
    if (isCloudinaryUrl(imageName)) return imageName; // Si c'est déjà une URL Cloudinary, ne rien modifier

    const extractedName = imageName.split("/").pop(); // Récupère juste le nom du fichier
    const formattedImageName = `tabac/${extractedName}`; // Ajoute le préfixe correct

    console.log("✅ URL Cloudinary générée :", formattedImageName);

    return cld.image(formattedImageName).resize(fill().width(400).height(300)).toURL();
  };

  const fetchNews = async () => {
    try {
      const timestamp = new Date().getTime(); // 🔥 Ajoute un timestamp unique
      const response = await axios.get(`${CLOUDINARY_JSON_URL}?invalidate=true&nocache=${timestamp}`);

      if (Array.isArray(response.data)) {
        const formattedNews = response.data.map((newsItem: NewsItem) => ({
          ...newsItem,
          image: getCloudinaryImageUrl(newsItem.image),
          images: newsItem.images?.map((img) => getCloudinaryImageUrl(img)),
        }));

        console.log("✅ News après transformation :", formattedNews);
        setNews(formattedNews);
      } else {
        console.error("❌ Les données récupérées ne sont pas un tableau :", response.data);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des nouveautés :", error);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);
  

// Données structurées pour le SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: news.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Article",
      headline: item.title,
      description: item.description,
      image: item.image,
      datePublished: item.date,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://tabaclesoler.fr",
      },
    },
  })),
};

return (
  <section className="py-12 sm:py-16 bg-gray-50" aria-labelledby="news-title">
    {/* Données JSON-LD */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />

    <div className="container mx-auto px-4 relative">
      <h2
        id="news-title"
        className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center"
        aria-label="Découvrez les nouveautés du Tabac Presse Le Soler"
      >
        Nouveautés
      </h2>

      {news.length > 0 ? (
        news.length > 3 ? (
          <div className="relative">
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
                520: { slidesPerView: 1, spaceBetween: 10 },
                640: { slidesPerView: 2, spaceBetween: 15 },
                1024: { slidesPerView: 3, spaceBetween: 20 },
              }}
            >
              {news.map((item) => (
                <SwiperSlide key={item.id}>
                  <div
                    className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer h-auto"
                    onClick={() => setSelectedNews(item)}
                    aria-label={`Afficher les détails de l'article : ${item.title}`}
                  >
                    <img
                      src={item.image}
                      alt={`Image de l'article : ${item.title}`}
                      className="w-full h-90 object-cover"
                    />
                    <div className="p-4">
                      <h3
                        className="text-lg font-bold text-gray-800"
                        aria-label={`Titre de l'article : ${item.title}`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-sm text-gray-600"
                        aria-label={`Résumé de l'article : ${item.description}`}
                      >
                        {item.description}
                      </p>
                      <p
                        className="text-xs text-gray-400 mt-2"
                        aria-label={`Date de publication : ${new Date(
                          item.date
                        ).toLocaleDateString()}`}
                      >
                        Publié le : {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Flèches réduites et repositionnées */}
            <button
              className="custom-swiper-button-prev absolute top-1/2 left-[-10px] transform -translate-y-1/2 text-gray-800 hover:text-gray-500 z-10"
              aria-label="Voir l'article précédent"
            >
              &larr;
            </button>
            <button
              className="custom-swiper-button-next absolute top-1/2 right-[-10px] transform -translate-y-1/2 text-gray-800 hover:text-gray-500 z-10"
              aria-label="Voir l'article suivant"
            >
              &rarr;
            </button>
          </div>
        ) : (
          <div className={`${news.length < 3 ? "flex justify-center gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}`}>
            {news.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer" onClick={() => setSelectedNews(item)}>
                <img src={item.image} alt={`Image de l'article : ${item.title}`} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Publié le : {new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <p
          className="text-center text-gray-500"
          aria-label="Aucune nouveauté disponible actuellement"
        >
          Aucune nouveauté à afficher pour le moment.
        </p>
      )}
    </div>

    <AnimatePresence>
      {selectedNews && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setSelectedNews(null)}
          aria-label={`Détails de l'article : ${selectedNews.title}`}
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
              aria-label="Fermer la fenêtre"
            >
              ✕
            </button>

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
                      src={img}
                      alt={`Image ${index + 1} de l'article : ${selectedNews.title}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <img
                    src={selectedNews.image}
                    alt={`Image principale de l'article : ${selectedNews.title}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </SwiperSlide>
              )}
            </Swiper>

            {/* Flèches de navigation personnalisées */}
            <div
              className="custom-swiper-button-prev absolute top-1/2 left-[-20px] transform -translate-y-1/2 text-gray-800 hover:text-gray-500 z-10 cursor-pointer"
              role="button"
              aria-label="Précédent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 sm:w-10 sm:h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div
              className="custom-swiper-button-next absolute top-1/2 right-[-20px] transform -translate-y-1/2 text-gray-800 hover:text-gray-500 z-10 cursor-pointer"
              role="button"
              aria-label="Suivant"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 sm:w-10 sm:h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>


            <h3
              className="text-xl font-bold mb-2"
              aria-label={`Titre de l'article affiché : ${selectedNews.title}`}
            >
              {selectedNews.title}
            </h3>
            <p
              className="text-sm text-gray-600 mb-4"
              aria-label={`Détails de l'article : ${selectedNews.details}`}
            >
              {selectedNews.details}
            </p>
            <p
              className="text-xs text-gray-400"
              aria-label={`Date de publication : ${new Date(
                selectedNews.date
              ).toLocaleDateString()}`}
            >
              Publié le : {new Date(selectedNews.date).toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </section>
);
}