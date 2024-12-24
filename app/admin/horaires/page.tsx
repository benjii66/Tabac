"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface OpeningHour {
    day: string;
    hours: string;
}

export default function ManageOpeningHours() {
    const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingHour, setEditingHour] = useState<OpeningHour | null>(null);
    const [updatedHours, setUpdatedHours] = useState<string>("");

    // Charger les horaires depuis l'API
    useEffect(() => {
        const fetchOpeningHours = async () => {
            try {
                const response = await axios.get("/api/openingHours");
                setOpeningHours(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des horaires :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOpeningHours();
    }, []);

    // Sauvegarder les modifications
    const handleSave = async () => {
        if (!editingHour || !updatedHours.trim()) return;

        try {
            const updatedHour = { ...editingHour, hours: updatedHours };
            await axios.put("/api/openingHours", updatedHour);

            setOpeningHours((prev) =>
                prev.map((hour) =>
                    hour.day === updatedHour.day ? updatedHour : hour
                )
            );

            setEditingHour(null);
            setUpdatedHours("");
            alert("Horaire mis à jour avec succès !");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            alert("Erreur lors de la sauvegarde des horaires !");
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
                    <h2 className="text-2xl font-bold mb-4">Horaires d'ouverture</h2>

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
                                        <td className="border border-gray-300 px-4 py-2 font-bold">
                                            {hour.day}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {editingHour?.day === hour.day ? (
                                                <input
                                                    type="text"
                                                    value={updatedHours}
                                                    onChange={(e) => setUpdatedHours(e.target.value)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            ) : (
                                                hour.hours
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {editingHour?.day === hour.day ? (
                                                <button
                                                    onClick={handleSave}
                                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                                >
                                                    Sauvegarder
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingHour(hour);
                                                        setUpdatedHours(hour.hours);
                                                    }}
                                                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                                                >
                                                    Modifier
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>
        </main>
    );
}
