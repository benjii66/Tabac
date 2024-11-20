
export default function Footer() {
    return (
        <footer className="bg-black text-white py-10">
            <div className="container mx-auto px-4">
                {/* Conteneur principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Colonne 1 : Nom et slogan */}
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold">Tabac Presse Le Soler</h2>
                        <p className="text-sm text-gray-400">
                            Le choix et la proximité, c'est ici !
                        </p>
                    </div>

                    {/* Colonne 2 : Mentions légales */}
                    <div className="text-center">
                        <ul className="flex justify-center space-x-6">
                            <li>
                                <a
                                    href="/mentions-legales"
                                    className="text-sm text-gray-400 hover:text-white transition"
                                >
                                    Mentions légales
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Colonne 3 : Coordonnées */}
                    <div className="text-center md:text-right">
                        <p>46 rue des Orangers, 66270 Le Soler</p>
                        <p>Téléphone : 04 68 29 78 56</p>
                        <p>Horaires : 7h - 19h</p>
                    </div>
                </div>

                {/* Réseaux sociaux */}
                <div className="mt-8 text-center">
                    <ul className="flex justify-center space-x-6">
                        <li>
                            <a href="https://www.facebook.com/p/Tabac-presse-Le-Soler-100057636871519/?locale=fr_FR" target="_blank" rel="noreferrer">
                                <img
                                    src="/assets/logo/facebook.png"
                                    alt="Facebook"
                                    className="w-6 h-6"
                                />
                            </a>
                        </li>
                        <li>
                            <a href="https://www.instagram.com/tabaclesoler/" target="_blank" rel="noreferrer">
                                <img
                                    src="/assets/logo/instagram.png"
                                    alt="Instagram"
                                    className="w-6 h-6"
                                />
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Copyright et réalisé par */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Tabac Presse Le Soler. Tous droits réservés.
                    <br />
                    Fièrement réalisé par <span className="text-white font-bold">Ton Prénom Nom</span>.
                </div>
            </div>
        </footer>
    );
}
