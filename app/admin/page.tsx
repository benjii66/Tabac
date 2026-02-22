"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Envoie une requête POST à la route /api/logout
            const response = await fetch("/api/auth/logout", { method: "POST" });

            // Vérifie si la requête a réussi
            if (!response.ok) {
                throw new Error(`Erreur lors de la déconnexion : ${response.statusText}`);
            }

            // Redirige vers la page principale après la déconnexion
            router.push("/");
        } catch (error) {
            // Log l'erreur dans la console
            console.error("Erreur lors de la déconnexion :", error);
            alert("Impossible de se déconnecter. Veuillez réessayer.");
        }
    };


    return (
        <main className="min-h-screen bg-nordic-bg text-nordic-text">
            {/* Header premium */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 shadow-sm flex flex-col md:flex-row justify-between items-center px-6 lg:px-12 sticky top-0 z-50">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4 md:mb-0">
                    Console <span className="text-tabac-red">Admin</span>
                </h1>
                <div className="flex space-x-3 w-full md:w-auto justify-center md:justify-end">
                    <button
                        onClick={handleLogout}
                        className="bg-gray-100 hover:bg-red-50 text-red-600 hover:text-red-700 font-medium px-5 py-2.5 rounded-full transition-colors w-full md:w-auto text-sm md:text-base border border-gray-200 hover:border-red-200"
                    >
                        Déconnexion
                    </button>
                    <Link
                        href="/"
                        className="bg-tabac-red hover:bg-[#c20510] text-white font-medium px-5 py-2.5 rounded-full transition-all shadow-md shadow-tabac-red/20 w-full md:w-auto text-center text-sm md:text-base transform hover:-translate-y-0.5"
                    >
                        Voir le site
                    </Link>
                </div>
            </header>

            <div className="container mx-auto py-10 px-4 max-w-5xl">
                {/* Section Tutoriel */}
                <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-tabac-red/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-tabac-red">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        Guide rapide
                    </h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                        Bienvenue dans votre espace d&apos;administration simplifié. Ici, vous pouvez gérer le contenu de votre site en temps réel :
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                            <span className="bg-green-100 text-green-700 p-1 rounded-md shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            </span>
                            <span>Utilisez <strong>Ajouter</strong> pour créer de nouveaux éléments (services, actus).</span>
                        </li>
                        <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                            <span className="bg-yellow-100 text-yellow-700 p-1 rounded-md shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                            </span>
                            <span>Utilisez <strong>Modifier</strong> pour mettre à jour des textes ou images existants.</span>
                        </li>
                        <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                            <span className="bg-red-100 text-red-700 p-1 rounded-md shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            </span>
                            <span>Utilisez <strong>Supprimer</strong> pour enlever définitivement un élément.</span>
                        </li>
                    </ul>
                </section>

                {/* Section Accès rapide */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-tabac-red">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                        Modules
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link
                            href="/admin/services"
                            className="group bg-white hover:bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-200 transition-colors"></div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1 relative z-10">Services</h3>
                            <p className="text-sm text-gray-500 relative z-10">Gérer les produits et services proposés en boutique.</p>
                        </Link>
                        
                        <Link
                            href="/admin/horaires"
                            className="group bg-white hover:bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-green-200 transition-colors"></div>
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 border border-green-100">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1 relative z-10">Horaires</h3>
                            <p className="text-sm text-gray-500 relative z-10">Modifier vos horaires d&apos;ouverture hebdomadaires.</p>
                        </Link>

                        <Link
                            href="/admin/news"
                            className="group bg-white hover:bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-200 transition-colors"></div>
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4 border border-orange-100">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1 relative z-10">Nouveautés</h3>
                            <p className="text-sm text-gray-500 relative z-10">Publier de nouvelles actualités ou arrivages.</p>
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
