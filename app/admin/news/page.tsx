"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

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
    const [previewImagesMultiple, setPreviewImagesMultiple] = useState<string[]>([]); // Prévisualisation des images multiples
    const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [formMessage, setFormMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
    const [newsToDelete, setNewsToDelete] = useState<News | null>(null); // Actualité en attente de suppression
    const [removedImages, setRemovedImages] = useState<string[]>([]);



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
            const timer = setTimeout(() => {
                setFormMessage(null);
            }, 2000); // Disparaît après 5 secondes

            return () => clearTimeout(timer); // Nettoyage
        }
    }, [formMessage]);




    const validateNewsForm = (news: News | null): boolean => {
        if (!news) {
            setFormError("Le formulaire est vide.");
            return false;
        }
        if (!news.title || !news.description || !news.details || !news.date) {
            setFormError("Tous les champs obligatoires doivent être remplis.");
            return false;
        }
        setFormError(null); // Réinitialise les erreurs si tout est valide
        return true;
    };


    // Affichage des erreurs
    { formError && <p className="text-red-500">{formError}</p> }

    const resetState = () => {
        setNewNews(null);
        setEditingNews(null);
        setFormMessage(null);
        setRemovedImages([]); // Réinitialiser les images supprimées
        resetErrors();
    };

    const resetErrors = () => {
        setPreviewImage("");
        setPreviewImagesMultiple([]);
    };


    const handleAddNews = async () => {
        if (!newNews) return;

        if (!validateNewsForm(newNews)) {
            setFormMessage({ type: "error", text: "Tous les champs obligatoires doivent être remplis." });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", newNews.title);
            formData.append("description", newNews.description);
            formData.append("details", newNews.details);
            formData.append("date", newNews.date);

            if (newNews.image instanceof File) {
                formData.append("image", newNews.image);
            }

            newNews.images.forEach((img, index) => {
                if (img instanceof File) {
                    formData.append(`images[${index}]`, img);
                }
            });

            const response = await axios.post("/api/news", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setNews((prev) => [...prev, response.data]);
            setFormMessage({ type: "success", text: "Nouvelle ajoutée avec succès !" });

            // Réinitialiser l'état après 2 secondes
            setTimeout(() => {
                resetState();
            }, 2000);
        } catch (error: any) {
            console.error("Erreur lors de l'ajout de la nouvelle :", error);
            setFormMessage({
                type: "error",
                text: error.response?.data || "Erreur interne du serveur lors de l'ajout.",
            });
        }
    };

    //modifier une mauvaise image
    const handleRemoveMultipleImage = (index: number) => {
        setEditingNews((prevNews) => {
            if (!prevNews) {
                console.log("Aucune actualité en cours d'édition.");
                return null;
            }

            const updatedImages = [...prevNews.images];
            const [removedImage] = updatedImages.splice(index, 1);

            if (removedImage) {
                console.log(`Image instanciée dans la liste à supprimer :`, removedImage);
            } else {
                console.log(`Aucune image n'a été trouvée à l'index ${index}`);
            }

            // Si c'est une image existante (string), ajoute-la à removedImages
            if (typeof removedImage === "string" && !removedImages.includes(removedImage)) {
                setRemovedImages((prev) => {
                    const updatedRemovedImages = [...prev, removedImage];
                    console.log("Liste mise à jour des images à supprimer :", updatedRemovedImages);
                    return updatedRemovedImages;
                });
            }


            console.log("Images restantes après suppression :", updatedImages);

            return {
                ...prevNews,
                images: updatedImages,
            };
        });
    };

    const handleAddMultipleImages = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const previews = files.map((file) => URL.createObjectURL(file));

            console.log("Fichiers ajoutés :", files);

            // Ajouter les nouvelles images aux prévisualisations existantes
            setPreviewImagesMultiple((prev) => [...prev, ...previews]);

            // Ajouter les fichiers aux fichiers existants
            if (editingNews) {
                setEditingNews((prev) => {
                    if (!prev) return null;
                    const updatedImages = [...prev.images, ...files];
                    console.log("Images mises à jour dans la modification :", updatedImages);
                    return {
                        ...prev,
                        images: updatedImages, // Ajoute les nouvelles images à celles existantes
                    };
                });
            } else if (newNews) {
                setNewNews((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        images: [...(prev.images || []), ...files],
                    };
                });
            }
        }
    };



    // Supprimer une actualité
    const handleDelete = async () => {
        if (!newsToDelete) return;

        try {
            await axios.delete("/api/news", { data: { id: newsToDelete.id } });

            // Supprimer l'élément de la liste
            setNews((prev) => prev.filter((item) => item.id !== newsToDelete.id));

            // Réinitialiser les états
            setNewsToDelete(null);
            setFormMessage({ type: "success", text: "Actualité supprimée avec succès !" });
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            setFormMessage({
                type: "error",
                text: "Erreur lors de la suppression de l'actualité.",
            });
        }
    };

    const confirmDelete = (news: News) => {
        setNewsToDelete(news);
    };


    const handleSave = async () => {
        if (!editingNews) return;

        try {
            console.log("Liste des images supprimées :", removedImages); // Log des images supprimées
            console.log("Images avant envoi :", editingNews.images); // Log des images en cours

            const formData = new FormData();
            formData.append("id", editingNews.id.toString());
            formData.append("title", editingNews.title);
            formData.append("description", editingNews.description);
            formData.append("details", editingNews.details);
            formData.append("date", editingNews.date);

            const imageFile = (document.querySelector("#editImageUpload") as HTMLInputElement).files?.[0];
            if (imageFile) {
                formData.append("image", imageFile);
            }

            // Log des images ajoutées et restantes
            console.log("Images finales pour l'upload :", editingNews.images);

            // Ajouter les images restantes après suppression
            editingNews.images.forEach((image, index) => {
                if (image instanceof File) {
                    console.log(`Ajout d'une image fichier dans FormData :`, image);
                    formData.append(`images[${index}]`, image);
                } else if (!removedImages.includes(image as string)) {
                    console.log(`Ajout d'une image existante dans FormData :`, image);
                    formData.append(`existingImages[${index}]`, image);
                }
            });


            // Ajouter les images supprimées
            formData.append("removedImages", JSON.stringify(removedImages));

            const response = await axios.put("/api/news", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setNews((prev) =>
                prev.map((news) => (news.id === editingNews.id ? response.data : news))
            );
            console.log("Données reçues après sauvegarde :", response.data);


            setFormMessage({ type: "success", text: "Modification effectuée avec succès !" });
            setTimeout(() => resetState(), 2000);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            setFormMessage({ type: "error", text: "Erreur lors de la mise à jour de l'actualité." });
        }
    };


    const resetForm = () => {
        if (previewImage) URL.revokeObjectURL(previewImage);
        previewImagesMultiple.forEach((url) => URL.revokeObjectURL(url));
        setPreviewImage("");
        setPreviewImagesMultiple([]);
        setNewNews(null); // Ferme la modale après réinitialisation
        setFormMessage(null); // Réinitialise les messages
    };


    return (


        <main className="min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white py-4 shadow-md flex justify-between items-center px-4">
                <div>
                    <h1 className="text-2xl font-bold">Gestion des Actualités</h1>
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
                        <h2 className="text-2xl font-bold">Liste des Actualités</h2>
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
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Ajouter une Actualité
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
                                    <th className="border border-gray-300 px-4 py-2">Date</th>
                                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {news.map((item) => (
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
                                        <td className="border border-gray-300 px-4 py-2">{item.date}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={() => setEditingNews(item)}
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
                {newNews && (
                    <motion.div
                        key={newNews.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <div className="bg-white rounded-lg p-6 relative">
                            <h3 className="text-xl font-bold mb-4">Ajouter une Actualité</h3>

                            {/* Affichage des erreurs */}
                            {formMessage && (
                                <div
                                    className={`mb-4 p-3 rounded ${formMessage.type === "error" ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"
                                        }`}
                                >
                                    {formMessage.text}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Titre</label>
                                <input
                                    type="text"
                                    value={newNews?.title || ""} // Assure une valeur par défaut
                                    onChange={(e) =>
                                        setNewNews((prev) => prev ? { ...prev, title: e.target.value } : null)
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Description</label>
                                <textarea
                                    value={newNews.description}
                                    onChange={(e) =>
                                        setNewNews({ ...newNews, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Détails</label>
                                <textarea
                                    value={newNews.details}
                                    onChange={(e) =>
                                        setNewNews({ ...newNews, details: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Date</label>
                                <input
                                    type="date"
                                    value={newNews.date}
                                    onChange={(e) =>
                                        setNewNews({ ...newNews, date: e.target.value })
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
                                            setNewNews((prev) => (prev ? { ...prev, image: file } : null)); // Met à jour newNews
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />

                                <img
                                    src={
                                        previewImage ||
                                        (editingNews?.image instanceof File
                                            ? URL.createObjectURL(editingNews.image)
                                            : editingNews?.image) ||
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
                                    onClick={handleAddNews}
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Ajouter
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
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <div className="bg-white rounded-lg p-6 relative">
                            <h3 className="text-xl font-bold mb-4">Modifier une Actualité</h3>

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
                                <input
                                    type="text"
                                    value={editingNews.title}
                                    onChange={(e) =>
                                        setEditingNews({ ...editingNews, title: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Description</label>
                                <textarea
                                    value={editingNews.description}
                                    onChange={(e) =>
                                        setEditingNews({ ...editingNews, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Détails</label>
                                <textarea
                                    value={editingNews.details}
                                    onChange={(e) =>
                                        setEditingNews({ ...editingNews, details: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Date</label>
                                <input
                                    type="date"
                                    value={editingNews.date}
                                    onChange={(e) =>
                                        setEditingNews({ ...editingNews, date: e.target.value })
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
                                            setEditingNews({ ...editingNews, image: file });
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <img
                                    src={
                                        previewImage ||
                                        (editingNews?.image instanceof File
                                            ? URL.createObjectURL(editingNews.image)
                                            : editingNews?.image) ||
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
                                            setEditingNews((prev) => {
                                                if (!prev || !prev.id) {
                                                    console.error("Actualité non valide ou id manquant.");
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
                                    {editingNews?.images.map((image, index) => (
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
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Sauvegarder
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>;
            {/* confirmer la suppression  */}
            <AnimatePresence>
                {newsToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <div className="bg-white rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
                            <p className="mb-4">
                                Êtes-vous sûr de vouloir supprimer l&apos;actualité : <strong>{newsToDelete.title}</strong> ?
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
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}