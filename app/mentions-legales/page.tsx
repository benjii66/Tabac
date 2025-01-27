"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function MentionsLegales() {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>Mentions Légales - Tabac Le Soler</title>
                <meta
                    name="description"
                    content="Découvrez les mentions légales du site Tabac Le Soler : informations sur l'entreprise, l'hébergeur et la réalisation du site."
                />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content="Mentions Légales - Tabac Le Soler" />
                <meta
                    property="og:description"
                    content="Découvrez les mentions légales du site Tabac Le Soler : informations sur l'entreprise, l'hébergeur et la réalisation du site."
                />
                <meta property="og:url" content="https://tabaclesoler.fr/mentions-legales" />
                <meta property="og:type" content="website" />
            </Head>
            <main className="bg-stone-50 text-gray-800 min-h-screen py-10 px-6">
                <div className="container mx-auto max-w-4xl bg-white shadow-md rounded-lg p-6">
                    {/* En-tête */}
                    <header className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Mentions Légales
                        </h1>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                            aria-label="Retourner à la page d'accueil"
                        >
                            Retour à l’accueil
                        </button>
                    </header>

                    {/* Contenu principal */}
                    <section aria-labelledby="mentions-details" className="space-y-6">
                        <h2 id="mentions-details" className="sr-only">
                            Détails des mentions légales
                        </h2>
                        <p className="text-lg">
                            <strong className="font-semibold">Nom de l’entreprise :</strong>{' '}
                            Tabac Presse Le Soler
                        </p>
                        <p className="text-lg">
                            <strong className="font-semibold">Adresse :</strong> 46 rue des
                            Orangers, 66270 Le Soler
                        </p>
                        <p className="text-lg">
                            <strong className="font-semibold">Téléphone :</strong>{' '}
                            <a
                                href="tel:0468297856"
                                className="text-blue-600 hover:underline"
                                aria-label="Appeler le Tabac Presse Le Soler"
                            >
                                04 68 29 78 56
                            </a>
                        </p>
                        <p className="text-lg">
                            <strong className="font-semibold">Réalisation :</strong>{' '}
                            <a
                                href="https://benjamin-simon.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                                aria-label="Visiter le portfolio de Simon Benjamin"
                            >
                                Simon Benjamin
                            </a>
                        </p>
                        <p className="text-lg">
                            <strong className="font-semibold">Hébergeur :</strong> Vercel Inc., 340
                            S Lemon Ave #4133, Walnut, CA 91789, USA
                        </p>
                    </section>

                    {/* Pied de page */}
                    <footer className="mt-8 text-center text-sm text-gray-500">
                        Ces mentions légales respectent les exigences légales en vigueur. <br />
                        Merci de votre visite et à bientôt !
                    </footer>
                </div>
            </main>
        </>
    );
}
