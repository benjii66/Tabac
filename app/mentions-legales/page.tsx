"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function MentionsLegales() {
    const router = useRouter(); // Utilise le hook pour naviguer

    return (
        <main className="bg-stone-50 text-gray-800 min-h-screen py-10 px-6">
            <div className="container mx-auto max-w-4xl bg-white shadow-md rounded-lg p-6">
                {/* Titre principal */}
                <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
                    Mentions légales
                </h1>

                {/* Bouton de retour */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => router.push('/')} // Retour à la page d'accueil
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Retour à l'accueil
                    </button>
                </div>

                {/* Contenu des mentions légales */}
                <div className="space-y-6">
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
                        >
                            04 68 29 78 56
                        </a>
                    </p>
                    <p className="text-lg">
                        <strong className="font-semibold">Réalise avec💖par :</strong>{' '}
                        <a
                            href="https://www.linkedin.com/in/benjamiinsimon/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            Simon Benjamin
                        </a>
                    </p>
                    <p className="text-lg">
                        <strong className="font-semibold">Hébergeur :</strong> Vercel Inc.,
                        340 S Lemon Ave #4133, Walnut, CA 91789, USA
                    </p>
                </div>

                {/* Footer des mentions légales */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    Ces mentions légales sont conformes aux exigences légales en vigueur. <br /> Merci de votre visite et à bientôt !
                </div>
            </div>
        </main>
    );
}
