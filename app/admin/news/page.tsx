"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

interface News {
    id: number;
    title: string;
    description: string;
    image: string;
    date: string;
    details: string;
}

export default function ManageNews() {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [newNews, setNewNews] = useState<News | null>(null);
    const [previewImage, setPreviewImage] = useState<string>("");

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

    // Ajouter une nouvelle actualité
    const handleAddNews = async () => {
        if (!newNews) return;

        try {
            const formData = new FormData();
            formData.append("title", newNews.title);
            formData.append("description", newNews.description);
            formData.append("details", newNews.details);
            formData.append("date", newNews.date);

            const imageFile = (document.querySelector("#newImageUpload") as HTMLInputElement).files?.[0];
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await axios.post("/api/news", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setNews((prev) => [...prev, response.data]); // Ajouter la nouvelle actualité à la liste
            setNewNews(null); // Réinitialiser l'état
            alert("Nouvelle ajoutée avec succès !");
        } catch (error) {
            console.error("Erreur lors de l'ajout de la nouvelle :", error);
            alert("Erreur lors de l'ajout de la nouvelle !");
        }
    };


    // Supprimer une actualité
    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette actualité ?")) return;

        try {
            await axios.delete("/api/news", { data: { id } });
            setNews((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    };

    const handleSave = async () => {
        if (!editingNews) return;

        try {
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

            await axios.put("/api/news", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setNews((prev) =>
                prev.map((news) =>
                    news.id === editingNews.id ? editingNews : news
                )
            );

            setEditingNews(null);
            alert("Nouvelle mise à jour avec succès !");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            alert("Erreur lors de la mise à jour de la nouvelle !");
        }
    };


    return (
        <main className="min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white py-4 shadow-md">
                <h1 className="text-center text-3xl font-bold">Gestion des Actualités</h1>
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
                                    <th className="border border-gray-300 px-4 py-2">Image</th>
                                    <th className="border border-gray-300 px-4 py-2">Titre</th>
                                    <th className="border border-gray-300 px-4 py-2">Description</th>
                                    <th className="border border-gray-300 px-4 py-2">Date</th>
                                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {news.map((item) => (
                                    <tr key={item.id}>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <img
                                                src={item.image || "/assets/images/placeholder.jpg"}
                                                alt={item.title}
                                                className="w-32 h-32 object-cover rounded"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">{item.title}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.date}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={() => setEditingNews(item)}
                                                className="bg-yellow-500 px-4 py-2 rounded text-white"
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
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
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <div className="bg-white rounded-lg p-6 relative">
                            <h3 className="text-xl font-bold mb-4">Ajouter une Actualité</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Titre</label>
                                <input
                                    type="text"
                                    value={newNews.title}
                                    onChange={(e) =>
                                        setNewNews({ ...newNews, title: e.target.value })
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
                                            setNewNews({ ...newNews, image: `/assets/images/${file.name}` });
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {previewImage && (
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        className="w-full h-40 object-cover rounded mt-4"
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setNewNews(null)}
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
                                <label className="block text-sm font-bold mb-2">Image</label>
                                <input
                                    type="file"
                                    id="editImageUpload"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setPreviewImage(URL.createObjectURL(file));
                                            setEditingNews({ ...editingNews, image: `/assets/images/${file.name}` });
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <img
                                    src={previewImage || editingNews.image}
                                    alt="Preview"
                                    className="w-full h-40 object-cover rounded mt-4"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingNews(null)}
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
            </AnimatePresence>

        </main>
    );
}
