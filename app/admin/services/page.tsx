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

interface Service {
  id: number;
  title: string;
  description: string;
  details: string;
  image: string | File;
  images: (string | File)[];
}

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Service | null>(null);
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
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Générer l'URL temporaire pour l'image d'édition
  useEffect(() => {
    if (editingService?.image instanceof File) {
      const url = URL.createObjectURL(editingService.image);
      setTempImageUrl(url);
    } else {
      setTempImageUrl(null);
    }
  }, [editingService]);

  // Nettoyer les URLs temporaires pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
      if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
    };
  }, [previewImage, tempImageUrl]);

  // Récupérer les actualités et gérer les URLs des images
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("/api/services");
        setServices(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des services :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  const validateServiceForm = (service: Service | null): boolean => {
    if (
      !service ||
      !service.title ||
      !service.description ||
      !service.details
    ) {
      setFormMessage({
        type: "error",
        text: "Tous les champs obligatoires doivent être remplis.",
      });
      return false;
    }
    return true;
  };

  const resetState = () => {
    setNewService(null);
    setEditingService(null);
    setServiceToDelete(null);
    setFormMessage(null);
    setRemovedImages([]);
    setPreviewImage("");
    setPreviewImagesMultiple([]);
    setProgress(0);
  };

  // Affichage des erreurs
  {
    formError && <p className="text-red-500">{formError}</p>;
  }

  const handleAddService = async () => {
    if (!newService) return;

    setIsSubmitting(true);
    setProgress(0);

    const simulateProgress = () => {
      let progressValue = 0;
      let isCancelled = false;

      const updateProgress = () => {
        if (isCancelled) return;
        progressValue += 4;
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
      formData.append("title", newService.title);
      formData.append("description", newService.description);
      formData.append("details", newService.details);

      // 📤 Upload de l’image principale
      if (newService.image instanceof File) {
        const uploadedMain = await uploadImageToCloudinary(newService.image);
        if (uploadedMain) {
          formData.append("image", uploadedMain);
        }
      }

      // 📤 Upload des images secondaires
      for (const img of newService.images) {
        if (img instanceof File) {
          const uploaded = await uploadImageToCloudinary(img);
          if (uploaded) {
            formData.append("images[]", uploaded);
          }
        }
      }

      // 📤 Ajoute même un champ vide pour éviter des erreurs dans la route PUT
      formData.append("removedImages", JSON.stringify([]));

      const response = await axios.post("/api/services", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      cancelProgress();
      setProgress(100);

      setTimeout(() => {
        setServices((prev) => [response.data, ...prev]);
        setIsSubmitting(false);
        resetState();
      }, 1500);
    } catch (error) {
      cancelProgress();
      console.error("❌ Erreur lors de l'ajout :", error);
      setProgress(0);
      setIsSubmitting(false);
    }
  };

  //modifier une mauvaise image
  const handleRemoveMultipleImage = (index: number) => {
    if (newService) {
      setNewService((prev) => {
        if (!prev) return null;
        const updatedImages = prev.images.filter((_, i) => i !== index);
        const updatedPreviews = previewImagesMultiple.filter(
          (_, i) => i !== index
        );
        setPreviewImagesMultiple(updatedPreviews);
        return { ...prev, images: updatedImages };
      });
    } else if (editingService) {
      setEditingService((prev) => {
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

      if (editingService) {
        setEditingService((prev) => {
          if (!prev) return null;
          return { ...prev, images: [...prev.images, ...files] };
        });
      } else if (newService) {
        setNewService((prev) => {
          if (!prev) return null;
          return { ...prev, images: [...prev.images, ...files] };
        });
      }
    }
  };

  const handleSave = async () => {
    if (!editingService) return;

    setIsSubmitting(true);
    setProgress(0);

    // 🌀 Progression simulée
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

    const imageFile = (
      document.querySelector("#editServiceImageUpload") as HTMLInputElement
    )?.files?.[0];

    // 📏 Validation tailles
    if (imageFile && imageFile.size > 10 * 1024 * 1024) {
      setFormMessage({
        type: "error",
        text: "L’image principale dépasse 10 Mo.",
      });
      setIsSubmitting(false);
      cancelProgress();
      return;
    }

    for (const img of editingService.images) {
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
      const formData = new FormData();
      formData.append("id", editingService.id.toString());
      formData.append("title", editingService.title);
      formData.append("description", editingService.description);
      formData.append("details", editingService.details);

      // 📤 Image principale
      if (imageFile) {
        const uploadedImageUrl = await uploadImageToCloudinary(imageFile);
        if (uploadedImageUrl) {
          formData.append("image", uploadedImageUrl);
        }
      } else {
        formData.append("image", editingService.image);
      }

      // 📤 Images secondaires
      for (const image of editingService.images) {
        if (image instanceof File) {
          const uploadedUrl = await uploadImageToCloudinary(image);
          if (uploadedUrl) {
            formData.append("images[]", uploadedUrl);
          }
        } else if (!removedImages.includes(image as string)) {
          formData.append("images[]", image);
        }
      }

      formData.append("removedImages", JSON.stringify(removedImages));

      const response = await axios.put("/api/services", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      cancelProgress();
      setProgress(100);

      setTimeout(() => {
        setServices((prev) =>
          prev.map((service) =>
            service.id === editingService.id ? response.data : service
          )
        );
        setFormMessage({
          type: "success",
          text: "Service modifié avec succès !",
        });
        setIsSubmitting(false);
        resetState();
      }, 1500);
    } catch (error) {
      console.error(error);
      cancelProgress();
      setProgress(0);
      setIsSubmitting(false);
      setFormMessage({
        type: "error",
        text: "Erreur lors de la modification du service.",
      });
    }
  };

  // Supprimer une actualité
  const handleDelete = async () => {
    if (!serviceToDelete) return;

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
      await axios.delete("/api/services", { data: { id: serviceToDelete.id } });

      cancelProgress();
      setProgress(100);

      setTimeout(() => {
        setServices((prev) =>
          prev.filter((item) => item.id !== serviceToDelete.id)
        );
        setServiceToDelete(null);
        setFormMessage({
          type: "success",
          text: "Service supprimé avec succès !",
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

  const confirmDelete = (services: Service) => {
    setServiceToDelete(services);
  };

  return (
    <main className="min-h-screen bg-nordic-bg text-nordic-text">
      {/* Header premium aligné avec le Dashboard */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 shadow-sm flex flex-col md:flex-row justify-between items-center px-6 lg:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 hidden sm:flex">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" /></svg>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">
             Gestion des <span className="text-blue-600">Services</span>
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
            <h2 className="text-xl font-bold text-gray-900">Liste des Services</h2>
            <button
              onClick={() =>
                setNewService({
                  id: Date.now(),
                  title: "",
                  description: "",
                  image: "",
                  images: [],
                  details: "",
                })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Ajouter un Service
            </button>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-12">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tabac-red"></div>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setEditingService(item)}
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
                      <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Actions collées en bas */}
                    <div className="flex items-center gap-3 pt-5 border-t border-gray-100 mt-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingService(item); }}
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
        {newService && (
          <motion.div
            key={newService.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
          >
            <div className="bg-white rounded-3xl p-8 relative max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Ajouter un Service</h3>

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
                  value={newService?.title || ""}
                  onChange={(e) =>
                    setNewService((prev) =>
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
                  value={newService.description || ""}
                  onChange={(e) =>
                    setNewService((prev) =>
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
                  value={newService.details || ""}
                  onChange={(e) =>
                    setNewService((prev) =>
                      prev ? { ...prev, details: e.target.value } : null
                    )
                  }
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all resize-none"
                />
              </div>
              <div className="mb-5 relative z-10">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image Principale</label>

                <div className="relative group rounded-2xl overflow-hidden mt-2 border border-gray-200 shadow-sm bg-gray-50">
                  <Image
                    src={
                      previewImage ||
                      (editingService?.image instanceof File
                        ? URL.createObjectURL(editingService.image)
                        : editingService?.image) ||
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
                      setNewService((prev) =>
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
                  onClick={handleAddService}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white bg-tabac-red hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 w-40 relative overflow-hidden flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Texte dynamique */}
                  <span className="relative z-10 w-full text-center">
                  {isSubmitting
                    ? progress === 100
                      ? "Service ajouté !"
                      : "Ajout..."
                    : "Ajouter"}
                  </span>

                  {/* Barre de progression bien synchronisée */}
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
        {editingService && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
          >
            <div className="bg-white rounded-3xl p-8 relative max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Modifier un Service</h3>

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
                  value={editingService.title || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingService.description || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
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
                  value={editingService.details || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      details: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-tabac-red focus:border-transparent px-4 py-3 outline-none transition-all resize-none"
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
                      (editingService?.image instanceof File
                        ? URL.createObjectURL(editingService.image)
                        : editingService?.image) ||
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
                      setEditingService({ ...editingService, image: file });
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
                      setEditingService((prev) => {
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
                  {editingService?.images.map((image, index) => (
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
                  {(!editingService?.images || editingService.images.length === 0) && (
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
        {serviceToDelete && (
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
                Êtes-vous sûr de vouloir supprimer le service :{" "}
                <strong>{serviceToDelete?.title}</strong> ?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setServiceToDelete(null)}
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
                      ? "Service supprimé !"
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
