'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function AccessibilityMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDyslexiaActive, setIsDyslexiaActive] = useState(false);
    const [isHighContrastActive, setIsHighContrastActive] = useState(false);
    const [isNightModeActive, setIsNightModeActive] = useState(false);

    // Ouvrir/fermer le menu
    const toggleAccessibilityMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Activer/Desactiver la police Dyslexie
    const toggleDyslexiaFont = () => {
        document.body.classList.toggle('font-dyslexia');
        setIsDyslexiaActive(!isDyslexiaActive);
    };

    // Activer/Desactiver le mode Contraste eleve
    const toggleHighContrast = () => {
        document.body.classList.toggle('high-contrast');
        setIsHighContrastActive(!isHighContrastActive);
    };

    // Activer/Desactiver le mode Nuit
    const toggleNightMode = () => {
        document.body.classList.toggle('night-mode');
        setIsNightModeActive(!isNightModeActive);
    };

    return (
        <>
            {/* Bouton fixe pour ouvrir le menu */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={toggleAccessibilityMenu}
                    aria-label={isMenuOpen ? "Fermer le menu d'accessibilite" : "Ouvrir le menu d'accessibilite"}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
                >
                    <Image
                        src="/assets/logo/eye.ico"
                        alt="Icône menu d'accessibilite"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                        priority
                    />
                </button>
            </div>

            {/* Menu d'accessibilite */}
            <div
                className={`fixed top-0 right-0 h-full bg-black text-white shadow-lg transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    } transition-transform duration-300`}
                style={{ width: '80%', maxWidth: '320px' }} // Ajustement responsive
            >
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Accessibilite</h2>
                    <p className="text-sm mb-6">
                        Adaptez ce site selon vos besoins.
                    </p>

                    <ul className="space-y-4">
                        <li>
                            <button
                                onClick={toggleDyslexiaFont}
                                className={`w-full text-left p-3 rounded transition ${isDyslexiaActive
                                    ? 'bg-white text-blue-400'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                                aria-pressed={isDyslexiaActive}
                            >
                                {isDyslexiaActive
                                    ? 'Desactiver la police Dyslexie'
                                    : 'Activer la police Dyslexie'}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={toggleHighContrast}
                                className={`w-full text-left p-3 rounded transition ${isHighContrastActive
                                    ? 'bg-white text-blue-400'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                                aria-pressed={isHighContrastActive}
                            >
                                {isHighContrastActive
                                    ? 'Desactiver le Contraste eleve'
                                    : 'Activer le Contraste eleve'}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={toggleNightMode}
                                className={`w-full text-left p-3 rounded transition ${isNightModeActive
                                    ? 'bg-white text-blue-400'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                                aria-pressed={isNightModeActive}
                            >
                                {isNightModeActive
                                    ? 'Desactiver le Mode Nuit'
                                    : 'Activer le Mode Nuit'}
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Ajout d'un bouton pour fermer le menu */}
                <div className="text-center mt-6">
                    <button
                        onClick={toggleAccessibilityMenu}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                        aria-label="Fermer le menu d'accessibilite"
                    >
                        Fermer le menu
                    </button>
                </div>
            </div>
        </>
    );
}
