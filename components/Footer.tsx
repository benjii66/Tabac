export default function Footer() {
    return (
        <footer className="bg-black text-white py-8">
            <div className="container mx-auto px-4">
                {/* Section principale du footer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                    {/* Colonne 1 : Nom et slogan */}
                    <div>
                        <h2 className="text-xl font-bold">Tabac Presse Le Soler</h2>
                        <p className="text-sm text-gray-400">
                            Le choix et la proximité, c'est ici !
                        </p>
                    </div>

                    {/* Colonne 2 : Mentions légales */}
                    <div className="md:text-center">
                        <ul className="space-y-1">
                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-400 hover:text-blue-400 transition"
                                >
                                    Mentions légales
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Colonne 3 : Coordonnées */}
                    <div>
                        <ul className="space-y-1 text-center">
                            <li>46 rue des Orangers, 66270 Le Soler</li>
                            <li>
                                Téléphone :{" "}
                                <a
                                    href="tel:0468297856"
                                    className="hover:text-blue-400 transition"
                                >
                                    04 68 29 78 56
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Section des réseaux sociaux */}
                <div className="mt-6 text-center">
                    <ul className="flex justify-center space-x-6">
                        <li>
                            <a
                                href="https://www.facebook.com/p/Tabac-presse-Le-Soler-100057636871519/?locale=fr_FR"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img
                                    src="/assets/logo/facebook.png"
                                    alt="Facebook"
                                    className="w-6 h-6"
                                />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.instagram.com/tabaclesoler/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img
                                    src="/assets/logo/instagram.png"
                                    alt="Instagram"
                                    className="w-6 h-6"
                                />
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Copyright */}
                <div className="mt-6 text-center text-xs text-gray-400">
                    ©2024 Tabac Presse Le Soler
                </div>
            </div>
        </footer>
    );
}
