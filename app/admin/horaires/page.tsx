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
        <main className="min-h-screen bg-nordic-bg text-nordic-text">
            {/* Header premium aligné avec le Dashboard */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 shadow-sm flex flex-col md:flex-row justify-between items-center px-6 lg:px-12 sticky top-0 z-50">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100 hidden sm:flex">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">
                        Gestion des <span className="text-green-600">Horaires</span>
                    </h1>
                </div>
                <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end">
                    <button
                        onClick={() => window.location.href = "/admin"}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-full transition-colors text-sm border border-gray-200 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                        Dashboard
                    </button>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="bg-tabac-red hover:bg-[#c20510] text-white font-medium px-4 py-2 rounded-full transition-all shadow-md shadow-tabac-red/20 text-sm flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                        Site web
                    </button>
                </div>
            </header>


            <div className="container mx-auto py-8 px-4 max-w-5xl">
                <section className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-gray-900">Horaires actuels</h2>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tabac-red"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto ring-1 ring-gray-200 rounded-2xl">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Jour</th>
                                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Horaires</th>
                                        <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {openingHours.map((hour) => (
                                        <tr key={hour.day} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hour.day}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                                                    {hour.hours}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setEditingHour(hour);
                                                        setUpdatedHours(hour.hours);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 inline-flex"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                                                    Modifier
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                        <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md relative shadow-2xl border border-gray-100 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            
                            <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-4 relative z-10">Modifier l&apos;horaire</h3>

                            {/* Affichage des messages */}
                            {formMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className={`mb-4 p-4 rounded-xl shadow-sm text-sm font-medium z-50
                                    ${formMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
                                >
                                    {formMessage.text}
                                </motion.div>
                            )}

                            <div className="mb-5 relative z-10">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Jour</label>
                                <input
                                    type="text"
                                    value={editingHour.day}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-medium select-none cursor-not-allowed"
                                />
                            </div>

                            <div className="mb-8 relative z-10">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nouvel Horaire</label>
                                <input
                                    type="text"
                                    value={updatedHours}
                                    onChange={(e) => setUpdatedHours(e.target.value)}
                                    placeholder="ex: 06:00 - 19:30"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>

                            <div className="flex justify-end gap-3 relative z-10">
                                <button
                                    onClick={() => setEditingHour(null)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Annuler
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={isSubmitting}
                                    className="relative px-5 py-2.5 rounded-xl min-w-[140px] overflow-hidden text-white font-medium transition-colors shadow-md shadow-blue-500/20"
                                    style={{
                                        backgroundColor: `rgb(
                                            ${59 - (progress / 100) * (59 - 34)},  
                                            ${130 + (progress / 100) * (197 - 130)}, 
                                            ${246 - (progress / 100) * (246 - 94)})`
                                    }}
                                >
                                    <span className="relative z-10">{isSubmitting ? (progress === 100 ? "Fait !" : "Enregistrement...") : "Enregistrer"}</span>

                                    {isSubmitting && (
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 2, ease: "easeInOut" }}
                                            className="absolute bottom-0 left-0 h-full bg-black/10 z-0"
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
