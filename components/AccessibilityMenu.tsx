'use client';

import { useState } from "react";

export default function AccessibilityMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Ouvrir/fermer le menu
    const toggleAccessibilityMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Activer la police Dyslexie
    const enableDyslexiaFont = () => {
        document.body.classList.toggle("dyslexia-font");
    };

    // Activer le mode Contraste élevé
    const enableHighContrast = () => {
        document.body.classList.toggle("high-contrast");
    };

    // Activer le mode Nuit
    const enableNightMode = () => {
        document.body.classList.toggle("night-mode");
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
                className={`fixed top-0 right-0 w-80 h-full bg-black text-white shadow-lg transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                    } transition-transform duration-300`}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Accessibilité</h2>
                    <p className="text-sm mb-6">Adaptez ce site selon vos besoins.</p>

                    <ul className="space-y-4">
                        <li>
                            <button
                                onClick={enableDyslexiaFont}
                                className="w-full text-left p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
                            >
                                Dyslexie
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={enableHighContrast}
                                className="w-full text-left p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
                            >
                                Contraste élevé
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={enableNightMode}
                                className="w-full text-left p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
                            >
                                Mode nuit
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}