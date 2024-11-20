'use client';

import { useState } from 'react';

export default function AccessibilityMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDyslexiaActive, setIsDyslexiaActive] = useState(false);
    const [isHighContrastActive, setIsHighContrastActive] = useState(false);
    const [isNightModeActive, setIsNightModeActive] = useState(false);

    // Ouvrir/fermer le menu
    const toggleAccessibilityMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Activer/Désactiver la police Dyslexie
    const toggleDyslexiaFont = () => {
        document.body.classList.toggle('font-dyslexia');
        setIsDyslexiaActive(!isDyslexiaActive);
    };

    // Activer/Désactiver le mode Contraste élevé
    const toggleHighContrast = () => {
        document.body.classList.toggle('high-contrast');
        setIsHighContrastActive(!isHighContrastActive);
    };

    // Activer/Désactiver le mode Nuit
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
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
                >
                    <img src="/assets/logo/eye.ico" alt="Accessibilité" className="w-6 h-6" />
                </button>
            </div>

            {/* Menu d'accessibilité */}
            <div
                className={`fixed top-0 right-0 w-80 h-full bg-black text-white shadow-lg transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    } transition-transform duration-300`}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Accessibilité</h2>
                    <p className="text-sm mb-6">Adaptez ce site selon vos besoins.</p>

                    <ul className="space-y-4">
                        <li>
                            <button
                                onClick={toggleDyslexiaFont}
                                className={`w-full text-left p-3 rounded transition ${isDyslexiaActive ? 'bg-white text-blue-900' : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                            >
                                {isDyslexiaActive ? 'Désactiver Dyslexie' : 'Activer Dyslexie'}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={toggleHighContrast}
                                className={`w-full text-left p-3 rounded transition ${isHighContrastActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                            >
                                {isHighContrastActive ? 'Désactiver Contraste élevé' : 'Activer Contraste élevé'}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={toggleNightMode}
                                className={`w-full text-left p-3 rounded transition ${isNightModeActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                            >
                                {isNightModeActive ? 'Désactiver Mode Nuit' : 'Activer Mode Nuit'}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}
