"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

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
    const [previewImagesMultiple, setPreviewImagesMultiple] = useState<string[]>([]); // Prévisualisation des images multiples
    const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [formMessage, setFormMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
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
        if (!service || !service.title || !service.description || !service.details) {
            setFormMessage({ type: "error", text: "Tous les champs obligatoires doivent être remplis." });
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
    { formError && <p className="text-red-500">{formError}</p> }

    const handleAddService = async () => {
        if (!newService) return;

        setIsSubmitting(true);
        setProgress(0);

        const formData = new FormData();
        formData.append("title", newService.title);
        formData.append("description", newService.description);
        formData.append("details", newService.details);

        if (newService.image instanceof File) {
            formData.append("image", newService.image);
        }

        newService.images.forEach((img, index) => {
            if (img instanceof File) {
                formData.append(`images[${index}]`, img);
            }
        });

        console.log("📤 FormData envoyé :", Object.fromEntries(formData.entries()));

        try {
            const response = await axios.post("/api/services", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProgress(100);
            setTimeout(() => {
                setServices((prev) => [response.data, ...prev]);
                setIsSubmitting(false);
                resetState();
            }, 1500);
        } catch (error) {
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
                const updatedPreviews = previewImagesMultiple.filter((_, i) => i !== index);
                setPreviewImagesMultiple(updatedPreviews);
                return { ...prev, images: updatedImages };
            });
        } else if (editingService) {
            setEditingService((prev) => {
                if (!prev) return null;
                const updatedImages = prev.images.filter((_, i) => i !== index);
                const removedImage = prev.images[index];
                if (typeof removedImage === "string" && !removedImages.includes(removedImage)) {
                    setRemovedImages((prev) => [...prev, removedImage]);
                }
                const updatedPreviews = previewImagesMultiple.filter((_, i) => i !== index);
                setPreviewImagesMultiple(updatedPreviews);
                return { ...prev, images: updatedImages };
            });
        }
    };

    const handleAddMultipleImages = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            return () => { isCancelled = true; };
        };

        const cancelProgress = simulateProgress();

        try {
            const formData = new FormData();
            formData.append("id", editingService.id.toString());
            formData.append("title", editingService.title);
            formData.append("description", editingService.description);
            formData.append("details", editingService.details);

            const imageFile = (document.querySelector("#editImageUpload") as HTMLInputElement).files?.[0];
            if (imageFile) {
                formData.append("image", imageFile);
            }

            editingService.images.forEach((image, index) => {
                if (image instanceof File) {
                    formData.append(`images[${index}]`, image);
                } else if (!removedImages.includes(image as string)) {
                    formData.append(`existingImages[${index}]`, image);
                }
            });

            formData.append("removedImages", JSON.stringify(removedImages));

            const response = await axios.put("/api/services", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            cancelProgress();
            setProgress(100);

            setTimeout(() => {
                setServices((prev) =>
                    prev.map((services) => (services.id === editingService.id ? response.data : services))
                );
                setFormMessage({ type: "success", text: "Modification effectuée avec succès !" });

                setIsSubmitting(false);
                resetState();
            }, 1500);
        } catch (error) {
            cancelProgress();
            setProgress(0);
            setIsSubmitting(false);
            setFormMessage({ type: "error", text: "Erreur lors de la modification." });
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
            return () => { isCancelled = true; };
        };

        const cancelProgress = simulateProgress();

        try {
            await axios.delete("/api/services", { data: { id: serviceToDelete.id } });

            cancelProgress();
            setProgress(100);

            setTimeout(() => {
                setServices((prev) => prev.filter((item) => item.id !== serviceToDelete.id));
                setServiceToDelete(null);
                setFormMessage({ type: "success", text: "Service supprimé avec succès !" });

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

        <main className="min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white py-4 shadow-md flex justify-between items-center px-4">
                <div>
                    <h1 className="text-2xl font-bold">Gestion des Services</h1>
                </div>
                <div className="flex gap-4">
                    {/* Bouton pour revenir au dashboard */}
                    <button
                        onClick={() => window.location.href = "/admin"} // Remplacez "/admin" par l'URL de votre dashboard
                        className="bg-gray-200 text-blue-600 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Dashboard
                    </button>
                    {/* Bouton pour revenir au site frontend */}
                    <button
                        onClick={() => window.location.href = "/"} // Remplacez "/" par l'URL de votre frontend
                        className="bg-gray-200 text-blue-600 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Accueil
                    </button>
                </div>
            </header>

            <div className="container mx-auto py-8 px-4">
                <section className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Liste des Services</h2>
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
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Ajouter un Service
                        </button>

                    </div>

                    {loading ? (
                        <p>Chargement...</p>
                    ) : (
                        <table className="table-auto w-full border-collapse border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2">Images</th>
                                    <th className="border border-gray-300 px-4 py-2">Images Description</th>
                                    <th className="border border-gray-300 px-4 py-2">Titre</th>
                                    <th className="border border-gray-300 px-4 py-2">Description</th>
                                    <th className="border border-gray-300 px-4 py-2">Détails</th>
                                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((item) => (
                                    <tr key={item.id}>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {/* Image principale */}
                                            <img
                                                src={typeof item.image === "string" ? item.image : URL.createObjectURL(item.image)}
                                                alt={item.title}
                                                className="w-32 h-32 object-cover rounded mb-2"
                                            />

                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {/* Images multiples */}
                                            <div className="grid grid-cols-3 gap-1">
                                                {item.images &&
                                                    item.images.map((img, index) => (
                                                        <img
                                                            key={index}
                                                            src={img instanceof File ? URL.createObjectURL(img) : img}
                                                            alt={`Image ${index + 1}`}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    ))}
                                            </div>

                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">{item.title}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.details}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={() => setEditingService(item)}
                                                className="bg-yellow-500 px-4 py-2 rounded text-white mb-1"
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(item)}
                                                className="bg-red-500 px-4 py-2 rounded text-white"
                                            >
                                                Supprimer
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <div className="bg-white rounded-lg p-6 relative">
                            <h3 className="text-xl font-bold mb-4">Ajouter un Service</h3>

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


                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Titre</label>
                                <textarea
                                    value={newService?.title || ""} // Assure une valeur par défaut
                                    onChange={(e) =>
                                        setNewService((prev) => prev ? { ...prev, title: e.target.value } : null)
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Description</label>
                                <textarea
                                    value={newService.description}
                                    onChange={(e) =>
                                        setNewService({ ...newService, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Détails</label>
                                <textarea
                                    value={newService.details}
                                    onChange={(e) =>
                                        setNewService({ ...newService, details: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Image</label>

                                <input
                                    type="file"
                                    id="newImageUpload"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setPreviewImage(URL.createObjectURL(file));
                                            setNewService((prev) => (prev ? { ...prev, image: file } : null)); // Met à jour newNews
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />

                                <img
                                    src={
                                        previewImage ||
                                        (editingService?.image instanceof File
                                            ? URL.createObjectURL(editingService.image)
                                            : editingService?.image) ||
                                        "/assets/images/placeholder.svg"
                                    }
                                    alt="Preview"
                                    className="w-full h-40 object-cover rounded mt-4"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Images Multiples</label>

                                <input
                                    type="file"
                                    id="newImagesUpload"
                                    multiple
                                    onChange={handleAddMultipleImages}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />

                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    {previewImagesMultiple.map((image, index) => (
                                        <div key={index} className="relative w-20 h-20">
                                            <img
                                                src={image}
                                                alt={`Image multiple ${index + 1}`}
                                                className="w-full h-full object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMultipleImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={resetState}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Annuler
                                </button>

                                <button
                                    onClick={handleAddService}
                                    disabled={isSubmitting}
                                    className="relative px-4 py-2 rounded w-32 overflow-hidden text-white transition-colors"
                                    style={{
                                        backgroundColor: `rgb(
                                        ${160 - (progress / 100) * (160 - 34)},  /* De 160 (gris) à 34 (vert) */
                                        ${160 + (progress / 100) * (180 - 160)}, /* De 160 (gris) à 180 (vert) */
                                        ${160 - (progress / 100) * (160 - 34)})` /* De 160 (gris) à 34 (vert) */
                                    }}
                                >
                                    {/* Texte dynamique */}
                                    {isSubmitting ? (progress === 100 ? "Service ajouté !" : "Ajout en cours...") : "Ajouter"}

                                    {/* Barre de progression bien synchronisée */}
                                    {isSubmitting && (
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 2, ease: "easeInOut" }}
                                            style={{ width: `${progress}%` }}
                                            className="absolute bottom-0 left-0 h-1 bg-green-700"
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
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <div className="bg-white rounded-lg p-6 relative">
                            <h3 className="text-xl font-bold mb-4">Modifier un Service</h3>

                            {/* Affichage des erreurs */}
                            {formMessage && (
                                <div
                                    className={`fixed bottom-4 right-4 z-50 p-4 rounded shadow-md ${formMessage.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                        }`}
                                >
                                    {formMessage.text}
                                </div>
                            )}


                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Titre</label>
                                <textarea
                                    value={editingService.title}
                                    onChange={(e) =>
                                        setEditingService({ ...editingService, title: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Description</label>
                                <textarea
                                    value={editingService.description}
                                    onChange={(e) =>
                                        setEditingService({ ...editingService, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Détails</label>
                                <textarea
                                    value={editingService.details}
                                    onChange={(e) =>
                                        setEditingService({ ...editingService, details: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Image Principale</label>
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
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <img
                                    src={
                                        previewImage ||
                                        (editingService?.image instanceof File
                                            ? URL.createObjectURL(editingService.image)
                                            : editingService?.image) ||
                                        "/assets/images/placeholder.svg"
                                    }
                                    alt="Preview"
                                    className="w-full h-40 object-cover rounded mt-4"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Images Multiples</label>
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

                                            setPreviewImagesMultiple((prev) => [...prev, ...previews]);
                                            setEditingService((prev) => {
                                                if (!prev || !prev.id) {
                                                    console.error("Service non valide ou id manquant.");
                                                    return null;
                                                }

                                                return {
                                                    ...prev,
                                                    images: [...(prev.images || []), ...files],
                                                };
                                            });

                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />

                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    {editingService?.images.map((image, index) => (
                                        <div key={index} className="relative w-20 h-20">
                                            <img
                                                src={
                                                    image instanceof File
                                                        ? URL.createObjectURL(image)
                                                        : image
                                                }
                                                alt={`Image multiple ${index + 1}`}
                                                className="w-full h-full object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMultipleImage(index)} // Appel ici
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={resetState}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Annuler
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={isSubmitting}
                                    className="relative px-4 py-2 rounded w-32 overflow-hidden text-white transition-colors"
                                    style={{
                                        backgroundColor: `rgb(
            ${160 - (progress / 100) * (160 - 34)},  /* De 160 (gris) à 34 (bleu) */
            ${160 + (progress / 100) * (150 - 160)}, /* De 160 (gris) à 150 (bleu) */
            ${160 + (progress / 100) * (220 - 160)})` /* De 160 (gris) à 220 (bleu) */
                                    }}
                                >
                                    {isSubmitting ? (progress === 100 ? "Modification réussie !" : "Sauvegarde en cours...") : "Sauvegarder"}

                                    {isSubmitting && (
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 2, ease: "easeInOut" }}
                                            className="absolute bottom-0 left-0 h-1 bg-blue-700"
                                        />
                                    )}
                                </button>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>;
            {/* confirmer la suppression  */}
            <AnimatePresence>
                {serviceToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <div className="bg-white rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
                            <p className="mb-4">
                                Êtes-vous sûr de vouloir supprimer le service : <strong>{serviceToDelete?.title}</strong> ?
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
            ${160 + (progress / 100) * (220 - 160)},  /* De 160 (gris) à 220 (rouge) */
            ${160 - (progress / 100) * (160 - 34)},   /* De 160 (gris) à 34 (rouge) */
            ${160 - (progress / 100) * (160 - 34)})`  /* De 160 (gris) à 34 (rouge) */
                                    }}
                                >
                                    {isSubmitting ? (progress === 100 ? "Service supprimé !" : "Suppression en cours...") : "Supprimer"}

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