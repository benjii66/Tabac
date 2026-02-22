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

    return cld.image(formattedImageName).resize(fill().width(500).height(400)).toURL();
  };

  useEffect(() => {
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
    <section className="py-20 sm:py-28 bg-nordic-bg" aria-labelledby="news-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="container mx-auto px-6 relative">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <h2 id="news-title" className="text-4xl md:text-5xl font-extrabold text-nordic-text text-center tracking-tight mb-4">
            Nos <span className="text-tabac-red relative whitespace-nowrap">Nouveautés</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-500 text-center mb-16 max-w-2xl mx-auto font-light">
            Découvrez nos derniers arrivages et les actualités brûlantes de votre tabac presse.
          </p>
        </motion.div>

        {news.length > 0 ? (
          news.length > 3 ? (
            <div className="relative">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{ prevEl: ".custom-swiper-button-prev", nextEl: ".custom-swiper-button-next" }}
                pagination={{ clickable: true }}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 24 },
                  1024: { slidesPerView: 3, spaceBetween: 32 },
                }}
                className="pb-12"
              >
                {news.map((item) => (
                  <SwiperSlide key={item.id} className="h-auto">
                    <div
                      className="group relative w-full h-[380px] md:h-[450px] rounded-3xl overflow-hidden shadow-md bg-gray-100 transition-all duration-500 hover:shadow-xl cursor-pointer"
                      onClick={() => setSelectedNews(item)}
                    >
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      
                      {/* Overlay pour assurer la lisibilité */}
                      <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:bg-transparent"></div>

                      <div
                        className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50 transform transition-transform duration-300 group-hover:-translate-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="text-xl font-bold text-nordic-text mb-2 line-clamp-1">{item.title}</h3>
                          <div className="w-8 h-1 bg-tabac-red rounded-full mb-3 transition-all duration-300 group-hover:w-12"></div>
                          <p className="text-sm text-gray-500 line-clamp-2 md:line-clamp-3 mb-3">{item.description}</p>
                        </div>
                        <p className="text-xs text-tabac-red font-medium tracking-wide uppercase">Publié le {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="custom-swiper-button-prev absolute top-[40%] left-[-16px] xl:left-[-48px] transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-nordic-text hover:text-white hover:bg-tabac-red z-10 transition-all duration-300 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                </svg>
              </button>
              <button className="custom-swiper-button-next absolute top-[40%] right-[-16px] xl:right-[-48px] transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-nordic-text hover:text-white hover:bg-tabac-red z-10 transition-all duration-300 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${news.length === 1 ? 'max-w-md mx-auto' : news.length === 2 ? 'sm:grid-cols-2 max-w-4xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-8`}>
              {news.map((item) => (
                <div key={item.id} className="group relative w-full h-[380px] md:h-[450px] rounded-3xl overflow-hidden shadow-md bg-gray-100 transition-all duration-500 hover:shadow-xl cursor-pointer" onClick={() => setSelectedNews(item)}>
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:bg-transparent"></div>

                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50 transform transition-transform duration-300 group-hover:-translate-y-2 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-nordic-text mb-2 line-clamp-1">{item.title}</h3>
                      <div className="w-8 h-1 bg-tabac-red rounded-full mb-3 transition-all duration-300 group-hover:w-12"></div>
                      <p className="text-sm text-gray-500 line-clamp-2 md:line-clamp-3 mb-3">{item.description}</p>
                    </div>
                    <p className="text-xs text-tabac-red font-medium tracking-wide uppercase">Publié le {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="text-center text-gray-400 py-12">Chargement ou aucune nouveauté à afficher...</p>
        )}
      </div>

      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 bg-nordic-text/80 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => setSelectedNews(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden relative m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedNews(null)} 
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-tabac-red transition-colors z-20 shadow-sm"
              >
                ✕
              </button>

              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{ prevEl: ".modal-custom-prev", nextEl: ".modal-custom-next" }}
                pagination={{ clickable: true }}
                spaceBetween={0}
                slidesPerView={1}
                className="w-full relative"
              >
                {selectedNews.images && selectedNews.images.length > 0 ? (
                  selectedNews.images.map((img, index) => (
                    <SwiperSlide key={index}>
                      <img src={img} alt={`Image ${index + 1}`} className="w-full h-64 sm:h-80 object-cover" />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide>
                    <img src={selectedNews.image} alt="Principale" className="w-full h-64 sm:h-80 object-cover" />
                  </SwiperSlide>
                )}
                
                {/* Modal Navigation Arrows */}
                <div className="modal-custom-prev w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center absolute top-1/2 left-4 transform -translate-y-1/2 z-10 cursor-pointer text-nordic-text hover:text-white hover:bg-tabac-red transition-all duration-300 shadow-md group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                  </svg>
                </div>
                <div className="modal-custom-next w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center absolute top-1/2 right-4 transform -translate-y-1/2 z-10 cursor-pointer text-nordic-text hover:text-white hover:bg-tabac-red transition-all duration-300 shadow-md group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </div>
              </Swiper>

              <div className="p-8">
                <h3 className="text-3xl font-extrabold text-nordic-text mb-2 tracking-tight">{selectedNews.title}</h3>
                <p className="text-sm text-tabac-red font-semibold tracking-wider uppercase mb-5">Publié le {new Date(selectedNews.date).toLocaleDateString()}</p>
                <div className="w-12 h-1 bg-gray-200 rounded-full mb-5"></div>
                <p className="text-base text-gray-600 leading-relaxed font-light">{selectedNews.details}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}