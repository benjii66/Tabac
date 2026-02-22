"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import imageCompression from "browser-image-compression";

async function uploadImageToCloudinary(file: File): Promise<string | null> {
  const signRes = await fetch("/api/cloudinary/sign");
  const { timestamp, signature, apiKey, cloudName, folder } =
    await signRes.json();

  // Compression de l'image
  const options = {
    maxSizeMB: 1, // Limite la taille maximale à 1MB
    maxWidthOrHeight: 1440, // Redimensionne l'image pour un web performant
    useWebWorker: true, // Utilisation des Web Workers pour ne pas bloquer l'UI
  };

  let fileToUpload = file;
  try {
    fileToUpload = await imageCompression(file, options);
  } catch (error) {
    console.warn("Erreur lors de la compression de l'image, upload de l'originale :", error);
  }

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return data.secure_url;
}

interface News {
  id: number;
  title: string;
  description: string;
  image: string | File; // Accepte une chaîne ou un fichier
  images: (string | File)[]; // Accepte un mélange de chaînes et fichiers
  date: string;
  details: string;
}

export default function ManageNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newNews, setNewNews] = useState<News | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(""); // Prévisualisation de l'image principale
  const [previewImagesMultiple, setPreviewImagesMultiple] = useState<string[]>(
    []
  ); // Prévisualisation des images multiples
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null); // Actualité en attente de suppression
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Générer l'URL temporaire pour l'image d'édition
  useEffect(() => {
    if (editingNews?.image instanceof File) {
      const url = URL.createObjectURL(editingNews.image);
      setTempImageUrl(url);
    } else {
      setTempImageUrl(null);
    }
  }, [editingNews]);

  // Nettoyer les URLs temporaires pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
      if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
    };
  }, [previewImage, tempImageUrl]);

  // Récupérer les actualités et gérer les URLs des images
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("/api/news");
        setNews(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des actualités :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  const validateNewsForm = (news: News | null): boolean => {
    if (!news?.title || !news.description || !news.details || !news.date) {
      setFormMessage({
        type: "error",
        text: "Tous les champs obligatoires doivent être remplis.",
      });
      return false;
    }
    return true;
  };

  // Affichage des erreurs
  {
    formError && <p className="text-red-500">{formError}</p>;
  }

  const handleAddNews = async () => {
    if (!newNews) return;

    setIsSubmitting(true);
    setProgress(0);

    const simulateProgress = () => {
      let progressValue = 0;
      let isCancelled = false;

      const updateProgress = () => {
        if (isCancelled) return;
        progressValue += 3;
        setProgress(progressValue);

        if (progressValue < 100) {
          setTimeout(updateProgress, 100);
        }
      };

      updateProgress();
      return () => {
        isCancelled = true;
      };
    };

    const cancelProgress = simulateProgress();

    // 🔎 Vérif poids
    if (
      newNews.image instanceof File &&
      newNews.image.size > 10 * 1024 * 1024
    ) {
      setFormMessage({
        type: "error",
        text: "L’image principale dépasse 10 Mo.",
      });
      setIsSubmitting(false);
      cancelProgress();
      return;
    }

    for (const img of newNews.images) {
      if (img instanceof File && img.size > 10 * 1024 * 1024) {
        setFormMessage({
          type: "error",
          text: "Une des images secondaires dépasse 10 Mo.",
        });
        setIsSubmitting(false);
        cancelProgress();
        return;
      }
    }

    try {
      // 🧠 Étape 1 : récupérer signature Cloudinary
      const signRes = await fetch("/api/cloudinary/sign");
      const { timestamp, signature, apiKey, cloudName, folder } =
        await signRes.json();

      // 🖼️ Étape 2 : Uploader image principale
      let mainImageUrl = "";
      if (newNews.image instanceof File) {
        const imageForm = new FormData();
        imageForm.append("file", newNews.image);
        imageForm.append("api_key", apiKey);
        imageForm.append("timestamp", timestamp);
        imageForm.append("signature", signature);
        imageForm.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: imageForm,
          }
        );

        const uploadData = await uploadRes.json();
        mainImageUrl = uploadData.secure_url;
      }

      // 🖼️ Étape 3 : Uploader images secondaires
      const imageUrls = [];
      for (const img of newNews.images) {
        if (img instanceof File) {
          const imageForm = new FormData();
          imageForm.append("file", img);
          imageForm.append("api_key", apiKey);
          imageForm.append("timestamp", timestamp);
          imageForm.append("signature", signature);
          imageForm.append("folder", folder);

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: imageForm,
            }
          );

          const uploadData = await uploadRes.json();
          imageUrls.push(uploadData.secure_url);
        }
      }

      // 📦 Étape 4 : Envoyer le formulaire final
      const formData = new FormData();
      formData.append("title", newNews.title);
      formData.append("description", newNews.description);
      formData.append("details", newNews.details);
      formData.append("date", newNews.date);
      formData.append("image", mainImageUrl);

      imageUrls.forEach((url, index) => {
        formData.append(`images[${index}]`, url);
      });

      const response = await axios.post("/api/news", formData);

      cancelProgress();
      setProgress(100);

      setTimeout(() => {
        setNews((prev) => [response.data, ...prev]);
        setIsSubmitting(false);
        resetState();
      }, 1500);
    } catch (error) {
      console.error("Erreur handleAddNews :", error);
      cancelProgress();
      setProgress(0);
      setIsSubmitting(false);
      setFormMessage({
        type: "error",
        text: "Erreur lors de l’ajout de l’actualité.",
      });
    }
  };

  const resetState = () => {
    setNewNews(null);
    setEditingNews(null);
    setRemovedImages([]);
    setPreviewImage("");
    setPreviewImagesMultiple([]);
    setProgress(0);
  };

  //modifier une mauvaise image
  const handleRemoveMultipleImage = (index: number) => {
    if (newNews) {
      setNewNews((prev) => {
        if (!prev) return null;
        const updatedImages = prev.images.filter((_, i) => i !== index);
        const updatedPreviews = previewImagesMultiple.filter(
          (_, i) => i !== index
        );
        setPreviewImagesMultiple(updatedPreviews);
        return { ...prev, images: updatedImages };
      });
    } else if (editingNews) {
      setEditingNews((prev) => {
        if (!prev) return null;
        const updatedImages = prev.images.filter((_, i) => i !== index);
        const removedImage = prev.images[index];
        if (
          typeof removedImage === "string" &&
          !removedImages.includes(removedImage)
        ) {
          setRemovedImages((prev) => [...prev, removedImage]);
        }
        const updatedPreviews = previewImagesMultiple.filter(
          (_, i) => i !== index
        );
        setPreviewImagesMultiple(updatedPreviews);
        return { ...prev, images: updatedImages };
      });
    }
  };

  const handleAddMultipleImages = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreviewImagesMultiple((prev) => [...prev, ...previews]);

      if (editingNews) {
        setEditingNews((prev) => {
          if (!prev) return null;
          return { ...prev, images: [...prev.images, ...files] };
        });
      } else if (newNews) {
        setNewNews((prev) => {
          if (!prev) return null;
          return { ...prev, images: [...prev.images, ...files] };
        });
      }
    }
  };

  // Supprimer une actualité
  const handleDelete = async () => {
    if (!newsToDelete) return;

    setIsSubmitting(true);
    setProgress(0);

    const simulateProgress = () => {
      let progressValue = 0;
      let isCancelled = false;

      const updateProgress = () => {
        if (isCancelled) return;
        progressValue += 3;
        setProgress(progressValue);

        if (progressValue < 100) {
          setTimeout(updateProgress, 100);
        }
      };

      updateProgress();
      return () => {
        isCancelled = true;
      };
    };

    const cancelProgress = simulateProgress();

    try {
      await axios.delete("/api/news", { data: { id: newsToDelete.id } });

      cancelProgress();
      setProgress(100);

      setTimeout(() => {
        setNews((prev) => prev.filter((item) => item.id !== newsToDelete.id));
        setNewsToDelete(null);
        setFormMessage({
          type: "success",
          text: "Actualité supprimée avec succès !",
        });

        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      cancelProgress();
      setProgress(0);
      setIsSubmitting(false);
      setFormMessage({ type: "error", text: "Erreur lors de la suppression." });
    }
  };

  const confirmDelete = (news: News) => {
    setNewsToDelete(news);
  };

  const handleSave = async () => {
    if (!editingNews) return;

    setIsSubmitting(true);
    setProgress(0);

    const simulateProgress = () => {
      let progressValue = 0;
      let isCancelled = false;

      const updateProgress = () => {
        if (isCancelled) return;
        progressValue += 3;
        setProgress(progressValue);
        if (progressValue < 100) {
          setTimeout(updateProgress, 100);
        }
      };

      updateProgress();
      return () => {
        isCancelled = true;
      };
    };

    const cancelProgress = simulateProgress();

    try {
      const formData = new FormData();
      formData.append("id", editingNews.id.toString());
      formData.append("title", editingNews.title);
      formData.append("description", editingNews.description);
      formData.append("details", editingNews.details);
      formData.append("date", editingNews.date);
      formData.append("removedImages", JSON.stringify(removedImages));

      // ✅ Image principale
      const imageFile = (
        document.querySelector("#editImageUpload") as HTMLInputElement
      )?.files?.[0];

      if (imageFile) {
        if (imageFile.size > 10 * 1024 * 1024) {
          throw new Error("L’image principale dépasse 10 Mo.");
        }
        const uploadedMainUrl = await uploadImageToCloudinary(imageFile);
        if (uploadedMainUrl) formData.append("image", uploadedMainUrl);
      } else {
        formData.append("image", editingNews.image);
      }

      // ✅ Images secondaires
      for (const image of editingNews.images) {
        if (image instanceof File) {
          if (image.size > 10 * 1024 * 1024) {
            throw new Error("Une des images secondaires dépasse 10 Mo.");
          }
          const uploadedUrl = await uploadImageToCloudinary(image);
          if (uploadedUrl) {
            const index = Math.floor(Math.random() * 100000); // juste pour éviter doublons de key
            formData.append(`images[${index}]`, uploadedUrl);
          }
        } else if (!removedImages.includes(image)) {
          const index = Math.floor(Math.random() * 100000);
          formData.append(`images[${index}]`, image);
        }
      }

      // 🔁 Requête
      const response = await axios.put("/api/news", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      cancelProgress();
      setProgress(100);

      setTimeout(() => {
        setNews((prev) =>
          prev.map((news) =>
            news.id === editingNews.id ? response.data : news
          )
        );
        setFormMessage({
          type: "success",
          text: "Modification effectuée avec succès !",
        });
        setIsSubmitting(false);
        resetState();
      }, 1500);
    } catch (error) {
      cancelProgress();
      setProgress(0);
      setIsSubmitting(false);
      setFormMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erreur lors de la modification.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-nordic-bg text-nordic-text">
      {/* Header premium aligné avec le Dashboard */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 shadow-sm flex flex-col md:flex-row justify-between items-center px-6 lg:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center border border-orange-100 hidden sm:flex">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">
             Gestion des <span className="text-orange-600">Nouveautés</span>
          </h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end">
          <button
            onClick={() => (window.location.href = "/admin")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-full transition-colors text-sm border border-gray-200 flex items-center gap-2"
          >
            Dashboard
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-tabac-red hover:bg-[#c20510] text-white font-medium px-4 py-2 rounded-full transition-all shadow-md shadow-tabac-red/20 text-sm flex items-center gap-2"
          >
            Site web
          </button>
        </div>
      </header>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900">Liste des Nouveautés</h2>
            <button
              onClick={() =>
                setNewNews({
                  id: Date.now(),
                  title: "",
                  description: "",
                  image: "",
                  images: [],
                  date: new Date().toISOString().split("T")[0],
                  details: "",
                })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Ajouter une Nouveauté
            </button>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-12">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tabac-red"></div>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setEditingNews(item)}
                    className="cursor-pointer bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative group"
                  >
                    
                    {/* Image principale (Grande) */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-gray-50 border border-gray-100 shadow-inner">
                      <Image
                        src={
                          typeof item.image === "string"
                            ? item.image
                            : URL.createObjectURL(item.image)
                        }
                        fill
                        alt={item.title}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Badge Nombre de photos secondaires */}
                      {item.images && item.images.length > 0 && (
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                          +{item.images.length}
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 truncate">{item.title}</h3>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md shrink-0">
                          {new Date(item.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Actions collées en bas */}
                    <div className="flex items-center gap-3 pt-5 border-t border-gray-100 mt-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingNews(item); }}
                        className="flex-1 justify-center text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold text-sm shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                        Modifier
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmDelete(item); }}
                        className="flex-none justify-center text-red-500 hover:text-white bg-red-50 hover:bg-red-500 p-2.5 rounded-xl transition-all duration-300 flex items-center shadow-sm"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
          )}
        </section>
      </div>
      {/* Modale d'ajout */}
      <AnimatePresence>
        {newNews && (
          <motion.div
            key={newNews.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
          >
            <div className="bg-white rounded-3xl p-8 relative max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Ajouter une Actualité</h3>

              {/* Affichage des erreurs */}
              {formMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className={`fixed bottom-4 right-4 z-50 p-3 rounded shadow-md text-white 
        ${formMessage.type === "success" ? "bg-green-500" : "bg-red-500"}`}
                >
                  {formMessage.text}
                </motion.div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={newNews?.title || ""}
                  onChange={(e) =>
                    setNewNews((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newNews.description || ""}
                  onChange={(e) =>
                    setNewNews((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all resize-none"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Détails</label>
                <textarea
                  value={newNews.details || ""}
                  onChange={(e) =>
                    setNewNews((prev) =>
                      prev ? { ...prev, details: e.target.value } : null
                    )
                  }
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all resize-none"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newNews.date || ""}
                  onChange={(e) =>
                    setNewNews((prev) =>
                      prev ? { ...prev, date: e.target.value } : null
                    )
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all"
                />
              </div>

              <div className="mb-5 relative z-10">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image Principale</label>

                <div className="relative group rounded-2xl overflow-hidden mt-2 border border-gray-200 shadow-sm bg-gray-50">
                  <Image
                    src={
                      previewImage ||
                      (editingNews?.image instanceof File
                        ? URL.createObjectURL(editingNews.image)
                        : editingNews?.image) ||
                      "/assets/images/placeholder.svg"
                    }
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <label htmlFor="newImageUpload" className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-full font-medium backdrop-blur-md flex items-center gap-2 transition-colors shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                        Modifier l'image
                      </label>
                  </div>
                </div>

                <input
                  type="file"
                  id="newImageUpload"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setPreviewImage(URL.createObjectURL(file));
                      setNewNews((prev) =>
                        prev ? { ...prev, image: file } : null
                      );
                    }
                  }}
                  className="hidden"
                />
              </div>

              <div className="mb-6 relative z-10">
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-sm font-semibold text-gray-700">Galerie (Images supplémentaires)</label>
                  <label htmlFor="newImagesUpload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Ajouter
                  </label>
                </div>

                <input
                  type="file"
                  id="newImagesUpload"
                  multiple
                  accept="image/*"
                  onChange={handleAddMultipleImages}
                  className="hidden"
                />

                {previewImagesMultiple.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                    {previewImagesMultiple.map((image, index) => (
                      <div key={index} className="relative aspect-square group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                        <Image
                          src={image}
                          alt={`Image multiple ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Overlay poubelle au hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => handleRemoveMultipleImage(index)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 transform scale-75 group-hover:scale-100 transition-transform shadow-lg"
                              title="Supprimer la photo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                      <span className="text-sm">Aucune image supplémentaire</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={resetState}
                  className="px-6 py-2.5 rounded-xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>

                <button
                  onClick={handleAddNews}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white bg-tabac-red hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 w-44 relative overflow-hidden flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 w-full text-center">
                  {isSubmitting
                    ? progress === 100
                      ? "Actualité ajoutée !"
                      : "Ajout..."
                    : "Ajouter"}
                  </span>

                  {isSubmitting && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      style={{ width: `${progress}%` }}
                      className="absolute bottom-0 left-0 h-full bg-white/20"
                    />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Modale de modification */}
      <AnimatePresence>
        {editingNews && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
          >
            <div className="bg-white rounded-3xl p-8 relative max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Modifier une Actualité</h3>

              {/* Affichage des erreurs */}
              {formMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className={`fixed bottom-4 right-4 z-50 p-3 rounded shadow-md text-white 
        ${formMessage.type === "success" ? "bg-green-500" : "bg-red-500"}`}
                >
                  {formMessage.text}
                </motion.div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={editingNews.title || ""}
                  onChange={(e) =>
                    setEditingNews({ ...editingNews, title: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingNews.description || ""}
                  onChange={(e) =>
                    setEditingNews({
                      ...editingNews,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all resize-none"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Détails</label>
                <textarea
                  value={editingNews.details || ""}
                  onChange={(e) =>
                    setEditingNews({ ...editingNews, details: e.target.value })
                  }
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all resize-none"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={editingNews.date || ""}
                  onChange={(e) =>
                    setEditingNews({ ...editingNews, date: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all"
                />
              </div>

              <div className="mb-5 relative z-10">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image Principale
                </label>

                <div className="relative group rounded-2xl overflow-hidden mt-2 border border-gray-200 shadow-sm bg-gray-50">
                  <Image
                    src={
                      previewImage ||
                      (editingNews?.image instanceof File
                        ? URL.createObjectURL(editingNews.image)
                        : editingNews?.image) ||
                      "/assets/images/placeholder.svg"
                    }
                    width={400}
                    height={300}
                    alt="Preview"
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <label htmlFor="editImageUpload" className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-full font-medium backdrop-blur-md flex items-center gap-2 transition-colors shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                        Modifier l'image
                      </label>
                  </div>
                </div>

                <input
                  type="file"
                  id="editImageUpload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setPreviewImage(URL.createObjectURL(file));
                      setEditingNews({ ...editingNews, image: file });
                    }
                  }}
                  className="hidden"
                />
              </div>

              <div className="mb-6 relative z-10">
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Galerie (Images supplémentaires)
                  </label>
                  <label htmlFor="editMultipleImagesUpload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Ajouter
                  </label>
                </div>

                <input
                  type="file"
                  id="editMultipleImagesUpload"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);
                      const previews = files.map((file) =>
                        URL.createObjectURL(file)
                      );

                      setPreviewImagesMultiple((prev) => [
                        ...prev,
                        ...previews,
                      ]);
                      setEditingNews((prev) => {
                        if (!prev || !prev.id) return null;
                        return {
                          ...prev,
                          images: [...(prev.images || []), ...files],
                        };
                      });
                    }
                  }}
                  className="hidden"
                />

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                  {editingNews?.images.map((image, index) => (
                    <div key={index} className="relative aspect-square group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                      <Image
                        src={
                          image instanceof File
                            ? URL.createObjectURL(image)
                            : image
                        }
                        fill
                        alt={`Image multiple ${index + 1}`}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Overlay poubelle au hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={() => handleRemoveMultipleImage(index)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 transform scale-75 group-hover:scale-100 transition-transform shadow-lg"
                            title="Supprimer la photo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          </button>
                      </div>
                    </div>
                  ))}
                  {(!editingNews?.images || editingNews.images.length === 0) && (
                    <div className="col-span-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                        <span className="text-sm">Aucune image supplémentaire</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={resetState}
                  className="px-6 py-2.5 rounded-xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white bg-tabac-red hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 w-52 relative overflow-hidden flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 w-full text-center">
                  {isSubmitting
                    ? progress === 100
                      ? "Modification réussie !"
                      : "Sauvegarde en cours..."
                    : "Sauvegarder"}
                  </span>
                  
                  {isSubmitting && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      style={{ width: `${progress}%` }}
                      className="absolute bottom-0 left-0 h-full bg-white/20"
                    />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      ;{/* confirmer la suppression  */}
      <AnimatePresence>
        {newsToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          >
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">
                Confirmer la suppression
              </h3>
              <p className="mb-4">
                Êtes-vous sûr de vouloir supprimer l&apos;actualité :{" "}
                <strong>{newsToDelete.title}</strong> ?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setNewsToDelete(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="relative px-4 py-2 rounded w-32 overflow-hidden text-white transition-colors"
                  style={{
                    backgroundColor: `rgb(
            ${
              160 + (progress / 100) * (220 - 160)
            },  /* De 160 (gris) à 220 (rouge) */
            ${
              160 - (progress / 100) * (160 - 34)
            },   /* De 160 (gris) à 34 (rouge) */
            ${
              160 - (progress / 100) * (160 - 34)
            })` /* De 160 (gris) à 34 (rouge) */,
                  }}
                >
                  {isSubmitting
                    ? progress === 100
                      ? "Actualité supprimée !"
                      : "Suppression en cours..."
                    : "Supprimer"}

                  {isSubmitting && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      className="absolute bottom-0 left-0 h-1 bg-red-700"
                    />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
