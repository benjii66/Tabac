"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

interface OpeningHour {
    day: string;
    hours: string;
}

export default function ManageOpeningHours() {
    const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingHour, setEditingHour] = useState<OpeningHour | null>(null);
    const [updatedHours, setUpdatedHours] = useState<string>("");
    const [formMessage, setFormMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);

    // 📌 Charger les horaires depuis Cloudinary via l'API
    useEffect(() => {
        const fetchOpeningHours = async () => {
            try {
                const response = await axios.get("/api/openingHours");
                setOpeningHours(response.data);
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des horaires :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOpeningHours();
    }, []);

    useEffect(() => {
        if (formMessage) {
            const timer = setTimeout(() => setFormMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [formMessage]);

    // 📌 Sauvegarder les modifications avec un indicateur de progression
    const handleSave = async () => {
        if (!editingHour || !updatedHours.trim()) return;

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
            const updatedHour = { ...editingHour, hours: updatedHours };
            await axios.put("/api/openingHours", updatedHour);

            cancelProgress();
            setProgress(100);

            setTimeout(() => {
                setOpeningHours((prev) =>
                    prev.map((hour) => (hour.day === updatedHour.day ? updatedHour : hour))
                );

                setEditingHour(null);
                setUpdatedHours("");
                setIsSubmitting(false);
                setFormMessage({ type: "success", text: "✅ Horaire mis à jour avec succès !" });
            }, 1500);
        } catch (error) {
            cancelProgress();
            setProgress(0);
            setIsSubmitting(false);
            setFormMessage({ type: "error", text: "❌ Erreur lors de la mise à jour des horaires !" });
        }
    };

    return (
        <main className="min-h-screen bg-gray-100">
             <header className="bg-blue-600 text-white py-4 shadow-md flex justify-between items-center px-4">
                <div>
                    <h1 className="text-2xl font-bold">Gestion des Horaires</h1>
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
                    <h2 className="text-2xl font-bold mb-4">Horaires d&apos;ouverture</h2>

                    {loading ? (
                        <p>Chargement...</p>
                    ) : (
                        <table className="table-auto w-full border-collapse border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2">Jour</th>
                                    <th className="border border-gray-300 px-4 py-2">Horaires</th>
                                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {openingHours.map((hour) => (
                                    <tr key={hour.day}>
                                        <td className="border border-gray-300 px-4 py-2 font-bold">{hour.day}</td>
                                        <td className="border border-gray-300 px-4 py-2">{hour.hours}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={() => {
                                                    setEditingHour(hour);
                                                    setUpdatedHours(hour.hours);
                                                }}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded"
                                            >
                                                Modifier
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>

            {/* Modale de modification avec animation */}
            <AnimatePresence>
                {editingHour && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <div className="bg-white rounded-lg p-6 relative">
                            <h3 className="text-xl font-bold mb-4">Modifier un Horaire</h3>

                            {/* Affichage des messages */}
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
                                <label className="block text-sm font-bold mb-2">Jour</label>
                                <input
                                    type="text"
                                    value={editingHour.day}
                                    disabled
                                    className="w-full px-3 py-2 border rounded bg-gray-200"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Horaires</label>
                                <input
                                    type="text"
                                    value={updatedHours}
                                    onChange={(e) => setUpdatedHours(e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingHour(null)}
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
                                            ${160 - (progress / 100) * (160 - 34)},  
                                            ${160 + (progress / 100) * (180 - 160)}, 
                                            ${160 - (progress / 100) * (160 - 34)})`
                                    }}
                                >
                                    {isSubmitting ? (progress === 100 ? "Horaire mis à jour !" : "Sauvegarde...") : "Sauvegarder"}

                                    {isSubmitting && (
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 2, ease: "easeInOut" }}
                                            className="absolute bottom-0 left-0 h-1 bg-green-700"
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
