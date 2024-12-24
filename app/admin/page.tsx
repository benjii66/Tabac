"use client";

import Link from "next/link";

export default function AdminDashboard() {
    return (
        <main className="min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white py-4 shadow-md">
                <h1 className="text-center text-3xl font-bold">Panneau d'administration</h1>
            </header>

            <div className="container mx-auto py-8 px-4">
                {/* Section Tutoriel */}
                <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-bold mb-4">Tutoriel</h2>
                    <p className="text-gray-700 mb-2">
                        Bienvenue dans l'administration du site. Voici les étapes pour gérer les données :
                    </p>
                    <ul className="list-disc pl-6 text-gray-700">
                        <li>Pour ajouter une nouvelle donnée, cliquez sur "Créer".</li>
                        <li>Pour modifier une donnée existante, cliquez sur "Modifier".</li>
                        <li>Pour supprimer une donnée, utilisez le bouton "Supprimer".</li>
                    </ul>
                </section>

                {/* Section Accès rapide */}
                <section className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Accès rapide</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/admin/services" className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-4 rounded-lg text-center shadow-md">
                            Gestion des Services
                        </Link>
                        <Link href="/admin/horaires" className="bg-green-100 hover:bg-green-200 text-green-700 p-4 rounded-lg text-center shadow-md">
                            Gestion des Horaires
                        </Link>

                        <Link href="/admin/news" className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-4 rounded-lg text-center shadow-md">
                            Gestion des Nouveautés
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
