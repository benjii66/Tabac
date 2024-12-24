"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

interface Service {
    id: number;
    title: string;
    description: string;
    details: string;
    image: string;
}

export default function ManageServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [newService, setNewService] = useState<Service | null>(null); // État pour un nouveau service
    const [previewImage, setPreviewImage] = useState<string>(""); // Aperçu de l'image

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

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        isNew: boolean = false
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);

            if (isNew) {
                setNewService((prev) => prev ? { ...prev, image: `/assets/images/${file.name}` } : null);
            } else {
                setEditingService((prev) => prev ? { ...prev, image: `/assets/images/${file.name}` } : null);
            }
        }
    };

    // Ajouter un service
    const handleAddService = async () => {
        if (!newService) return;

        try {
            const formData = new FormData();
            formData.append("title", newService.title);
            formData.append("description", newService.description);
            formData.append("details", newService.details);

            const imageFile = (document.querySelector("#newImageUpload") as HTMLInputElement).files?.[0];
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await axios.post("/api/services", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setServices((prev) => [...prev, response.data]); // Ajoute le nouveau service à la liste
            setNewService(null); // Réinitialise l'état
            setPreviewImage(""); // Réinitialise l'aperçu
        } catch (error) {
            console.error("Erreur lors de l'ajout d'un service :", error);
        }
    };

    // Supprimer un service
    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) return;

        try {
            // Appel à l'API DELETE
            await axios.delete("/api/services", {
                data: { id },
            });

            // Mise à jour de la liste localement
            setServices((prev) => prev.filter((service) => service.id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    };

    // Sauvegarder les modifications d'un service
    const handleSave = async () => {
        if (!editingService) return;

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

            await axios.put("/api/services", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Mettre à jour la liste localement
            setServices((prev) =>
                prev.map((service) =>
                    service.id === editingService.id ? editingService : service
                )
            );

            // Réinitialiser les états
            setEditingService(null);
            setPreviewImage("");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des modifications :", error);
        }
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
                                    <th className="border border-gray-300 px-4 py-2">Image</th>
                                    <th className="border border-gray-300 px-4 py-2">Titre</th>
                                    <th className="border border-gray-300 px-4 py-2">Description Courte</th>
                                    <th className="border border-gray-300 px-4 py-2">Détails</th>
                                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service) => (
                                    <tr key={service.id}>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <img
                                                src={service.image || "/assets/images/placeholder.jpg"}
                                                alt={service.title}
                                                className="w-32 h-32 object-cover rounded"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">{service.title}</td>
                                        <td className="border border-gray-300 px-4 py-2">{service.description}</td>
                                        <td className="border border-gray-300 px-4 py-2">{service.details}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={() => setEditingService(service)}
                                                className="bg-yellow-500 px-4 py-2 rounded text-white"
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
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
            {/* Modale d'ajout */}
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

                            {/* Aperçu de l'image */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Aperçu de l'image</label>
                                <img
                                    src={previewImage || "/assets/images/placeholder.jpg"} // Affiche l'aperçu ou un placeholder
                                    alt="Aperçu"
                                    className="w-full h-40 object-cover rounded mb-4"
                                />
                            </div>

                            {/* Champ pour téléversement */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Image</label>
                                <input
                                    type="file"
                                    id="newImageUpload"
                                    onChange={(e) => handleImageChange(e, true)} // Met à jour l'aperçu lors du changement
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>

                            {/* Champs pour les détails du service */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Titre</label>
                                <input
                                    type="text"
                                    value={newService.title}
                                    onChange={(e) =>
                                        setNewService((prev) =>
                                            prev ? { ...prev, title: e.target.value } : null
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Description courte</label>
                                <textarea
                                    value={newService.description}
                                    onChange={(e) =>
                                        setNewService((prev) =>
                                            prev ? { ...prev, description: e.target.value } : null
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Description détaillée</label>
                                <textarea
                                    value={newService.details}
                                    onChange={(e) =>
                                        setNewService((prev) =>
                                            prev ? { ...prev, details: e.target.value } : null
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setNewService(null)}
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
                            <h3 className="text-xl font-bold mb-4">Modifier le service</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Image</label>
                                <img
                                    src={previewImage || editingService.image || "/assets/images/placeholder.jpg"}
                                    alt="Aperçu"
                                    className="w-full h-40 object-cover rounded mb-4"
                                />
                                <input
                                    type="file"
                                    id="editImageUpload"
                                    onChange={(e) => handleImageChange(e)}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Titre</label>
                                <input
                                    type="text"
                                    value={editingService.title}
                                    onChange={(e) =>
                                        setEditingService((prev) =>
                                            prev ? { ...prev, title: e.target.value } : null
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Description courte</label>
                                <textarea
                                    value={editingService.description}
                                    onChange={(e) =>
                                        setEditingService((prev) =>
                                            prev ? { ...prev, description: e.target.value } : null
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Description détaillée</label>
                                <textarea
                                    value={editingService.details}
                                    onChange={(e) =>
                                        setEditingService((prev) =>
                                            prev ? { ...prev, details: e.target.value } : null
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingService(null)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </main>
    );
}

