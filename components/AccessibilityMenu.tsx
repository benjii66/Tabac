'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function AccessibilityMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [accessibilityOptions, setAccessibilityOptions] = useState({
        dyslexia: false,
        highContrast: false,
        nightMode: false,
    });

    // Ouvrir/fermer le menu
    const toggleAccessibilityMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    // Gérer les options d'accessibilité
    const toggleOption = (option: keyof typeof accessibilityOptions) => {
        const updatedOptions = { ...accessibilityOptions, [option]: !accessibilityOptions[option] };

        setAccessibilityOptions(updatedOptions);
        document.body.classList.toggle(option, updatedOptions[option]);
    };

    return (
        <>
            {/* Bouton fixe pour ouvrir le menu */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={toggleAccessibilityMenu}
                    aria-label={isMenuOpen ? "Fermer le menu d'accessibilité" : "Ouvrir le menu d'accessibilité"}
                    aria-expanded={isMenuOpen}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <Image
                        src="/assets/logo/eye.ico"
                        alt="Icône d'accessibilité"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                        priority
                    />
                </button>
            </div>

            {/* Menu d'accessibilité */}
            <nav
                className={`fixed top-0 right-0 h-full bg-black text-white shadow-lg transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ width: '80%', maxWidth: '320px' }}
                role="menu"
                aria-hidden={!isMenuOpen}
            >
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Accessibilité</h2>
                    <p className="text-sm mb-6">Adaptez ce site selon vos besoins.</p>

                    <ul className="space-y-4">
                        <li>
                            <button
                                onClick={() => toggleOption('dyslexia')}
                                className={`w-full text-left p-3 rounded transition ${accessibilityOptions.dyslexia ? 'bg-white text-blue-400' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                                aria-pressed={accessibilityOptions.dyslexia}
                                role="menuitem"
                            >
                                {accessibilityOptions.dyslexia
                                    ? 'Désactiver la police Dyslexie'
                                    : 'Activer la police Dyslexie'}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => toggleOption('highContrast')}
                                className={`w-full text-left p-3 rounded transition ${accessibilityOptions.highContrast ? 'bg-white text-blue-400' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                                aria-pressed={accessibilityOptions.highContrast}
                                role="menuitem"
                            >
                                {accessibilityOptions.highContrast
                                    ? 'Désactiver le Contraste élevé'
                                    : 'Activer le Contraste élevé'}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => toggleOption('nightMode')}
                                className={`w-full text-left p-3 rounded transition ${accessibilityOptions.nightMode ? 'bg-white text-blue-400' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                                aria-pressed={accessibilityOptions.nightMode}
                                role="menuitem"
                            >
                                {accessibilityOptions.nightMode
                                    ? 'Désactiver le Mode Nuit'
                                    : 'Activer le Mode Nuit'}
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Bouton pour fermer le menu */}
                <div className="text-center mt-6">
                    <button
                        onClick={toggleAccessibilityMenu}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                        aria-label="Fermer le menu d'accessibilité"
                    >
                        Fermer le menu
                    </button>
                </div>
            </nav>
        </>
    );
}
