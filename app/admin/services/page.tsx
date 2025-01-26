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
    const [previewImage, setPreviewImage] = useState<string>("");
    const [previewImagesMultiple, setPreviewImagesMultiple] = useState<string[]>([]);
    const [formMessage, setFormMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [removedImages, setRemovedImages] = useState<string[]>([]);

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
            const timer = setTimeout(() => setFormMessage(null), 2000);
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
        setFormMessage(null);
        setRemovedImages([]);
        setPreviewImage("");
        setPreviewImagesMultiple([]);
    };

    const handleAddService = async () => {
        if (!newService || !validateServiceForm(newService)) return;

        try {
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

            const response = await axios.post("/api/services", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setServices((prev) => [...prev, response.data]);
            setFormMessage({ type: "success", text: "Service ajouté avec succès !" });
            resetState();
        } catch (error) {
            console.error("Erreur lors de l'ajout du service :", error);
            setFormMessage({ type: "error", text: "Erreur interne du serveur." });
        }
    };

    const handleEditService = async () => {
        if (!editingService || !validateServiceForm(editingService)) return;

        try {
            const formData = new FormData();
            formData.append("id", editingService.id.toString());
            formData.append("title", editingService.title);
            formData.append("description", editingService.description);
            formData.append("details", editingService.details);

            if (editingService.image instanceof File) {
                formData.append("image", editingService.image);
            }

            editingService.images.forEach((img, index) => {
                if (img instanceof File) {
                    formData.append(`images[${index}]`, img);
                }
            });

            formData.append("removedImages", JSON.stringify(removedImages));

            const response = await axios.put("/api/services", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setServices((prev) =>
                prev.map((service) => (service.id === editingService.id ? response.data : service))
            );
            setFormMessage({ type: "success", text: "Service modifié avec succès !" });
            resetState();
        } catch (error) {
            console.error("Erreur lors de la modification du service :", error);
            setFormMessage({ type: "error", text: "Erreur interne du serveur." });
        }
    };

    const handleDeleteService = async () => {
        if (!serviceToDelete) return;

        try {
            await axios.delete("/api/services", { data: { id: serviceToDelete.id } });
            setServices((prev) => prev.filter((service) => service.id !== serviceToDelete.id));
            setFormMessage({ type: "success", text: "Service supprimé avec succès !" });
            setServiceToDelete(null);
        } catch (error) {
            console.error("Erreur lors de la suppression du service :", error);
            setFormMessage({ type: "error", text: "Erreur interne du serveur." });
        }
    };

    const handleRemoveMultipleImage = (index: number) => {
        setEditingService((prev) => {
            if (!prev) return null;
            const updatedImages = [...prev.images];
            const removedImage = updatedImages.splice(index, 1)[0];

            if (typeof removedImage === "string") {
                setRemovedImages((prev) => [...prev, removedImage]);
            }

            return { ...prev, images: updatedImages };
        });
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
                                    details: "",
                                    image: "",
                                    images: [],
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
                                    <th className="border border-gray-300 px-4 py-2">Image Principale</th>
                                    <th className="border border-gray-300 px-4 py-2">Images</th>
                                    <th className="border border-gray-300 px-4 py-2">Titre</th>
                                    <th className="border border-gray-300 px-4 py-2">Description</th>
                                    <th className="border border-gray-300 px-4 py-2">Détails</th>
                                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service) => (
                                    <tr key={service.id}>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <img
                                                src={
                                                    typeof service.image === "string"
                                                        ? service.image
                                                        : URL.createObjectURL(service.image)
                                                }
                                                alt={service.title}
                                                className="w-32 h-32 object-cover rounded mb-2"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <div className="grid grid-cols-3 gap-1">
                                                {service.images.map((img, index) => (
                                                    <img
                                                        key={index}
                                                        src={
                                                            typeof img === "string" ? img : URL.createObjectURL(img)
                                                        }
                                                        alt={`Image ${index + 1}`}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">{service.title}</td>
                                        <td className="border border-gray-300 px-4 py-2">{service.description}</td>
                                        <td className="border border-gray-300 px-4 py-2">{service.details}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={() => setEditingService(service)}
                                                className="bg-yellow-500 px-4 py-2 rounded text-white mb-1"
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => setServiceToDelete(service)}
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
            <AnimatePresence>
                {newService && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <div className="bg-white rounded-lg p-6 relative">
                            <h3 className="text-xl font-bold mb-4">Ajouter un Service</h3>

                            {/* Affichage des messages d'erreur/succès */}
                            {formMessage && (
                                <div
                                    className={`fixed bottom-4 right-4 z-50 p-4 rounded shadow-md ${formMessage.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                                >
                                    {formMessage.text}
                                </div>
                            )}

                            {/* Formulaire d'ajout */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Titre</label>
                                <input
                                    type="text"
                                    value={newService.title}
                                    onChange={(e) =>
                                        setNewService({ ...newService, title: e.target.value })
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
                                <label className="block text-sm font-bold mb-2">Image Principale</label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setPreviewImage(URL.createObjectURL(file));
                                            setNewService({ ...newService, image: file });
                                        }
                                    }}
                                    className="w-full px-3 py-2 border rounded"
                                />
                                <img
                                    src={previewImage || "/assets/images/placeholder.svg"}
                                    alt="Preview"
                                    className="w-full h-40 object-cover mt-4 rounded"
                                />
                            </div>

                            {/* Ajout des images multiples */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Images Multiples</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const files = Array.from(e.target.files);
                                            const previews = files.map((file) => URL.createObjectURL(file));
                                            setPreviewImagesMultiple((prev) => [...prev, ...previews]);
                                            setNewService((prev) =>
                                                prev ? { ...prev, images: [...prev.images, ...files] } : null
                                            );
                                        }
                                    }}
                                    className="w-full px-3 py-2 border rounded"
                                />
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    {previewImagesMultiple.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Image multiple ${index + 1}`}
                                                className="w-20 h-20 object-cover rounded"
                                            />
                                            <button
                                                onClick={() => {
                                                    setPreviewImagesMultiple((prev) => prev.filter((_, i) => i !== index));
                                                    setNewService((prev) =>
                                                        prev
                                                            ? {
                                                                ...prev,
                                                                images: prev.images.filter((_, i) => i !== index),
                                                            }
                                                            : null
                                                    );
                                                }}
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
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Ajouter
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingService && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <div className="bg-white p-6 rounded-lg relative">
                            <h3 className="text-xl font-bold mb-4">Modifier un Service</h3>

                            {formMessage && (
                                <div
                                    className={`fixed bottom-4 right-4 z-50 p-4 rounded shadow-md ${formMessage.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                                >
                                    {formMessage.text}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Titre</label>
                                <input
                                    type="text"
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
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setPreviewImage(URL.createObjectURL(file));
                                            setEditingService({ ...editingService, image: file });
                                        }
                                    }}
                                    className="w-full px-3 py-2 border rounded"
                                />
                                <img
                                    src={
                                        previewImage ||
                                        (editingService.image instanceof File
                                            ? URL.createObjectURL(editingService.image)
                                            : editingService.image) ||
                                        "/assets/images/placeholder.svg"
                                    }
                                    alt="Preview"
                                    className="w-full h-40 object-cover mt-4 rounded"
                                />
                            </div>

                            {/* Modification des images multiples */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Images Multiples</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const files = Array.from(e.target.files);
                                            const previews = files.map((file) => URL.createObjectURL(file));
                                            setPreviewImagesMultiple((prev) => [...prev, ...previews]);
                                            setEditingService((prev) =>
                                                prev ? { ...prev, images: [...prev.images, ...files] } : null
                                            );
                                        }
                                    }}
                                    className="w-full px-3 py-2 border rounded"
                                />
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    {editingService?.images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={
                                                    image instanceof File
                                                        ? URL.createObjectURL(image)
                                                        : image
                                                }
                                                alt={`Image multiple ${index + 1}`}
                                                className="w-20 h-20 object-cover rounded"
                                            />
                                            <button
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
                                    onClick={handleEditService}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Sauvegarder
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
                                Êtes-vous sûr de vouloir supprimer le service : <strong>{serviceToDelete.title}</strong> ?
                            </p>
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => setServiceToDelete(null)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteService}
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
