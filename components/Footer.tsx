export default function Footer() {
    return (
        <footer className="bg-black text-white py-10">
            <div className="container mx-auto px-4">
                {/* Conteneur principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 items-center">
                    {/* Colonne 1 : Nom et slogan */}
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold">Tabac Presse Le Soler</h2>
                        <p className="text-sm text-gray-400">
                            Le choix et la proximité, c'est ici !
                        </p>
                    </div>

                    {/* Colonne 2 : Mentions légales */}
                    <div className="text-center">
                        <a
                            href="/mentions-legales"
                            className="text-sm text-gray-400 hover:text-white transition"
                        >
                            Mentions légales
                        </a>
                    </div>

                    {/* Colonne 3 : Coordonnées */}
                    <div className="text-left">
                        <ul className="inline-block space-y-1 text-sm">
                            <li className="whitespace-nowrap">46 rue des Orangers, 66270 Le Soler</li>
                            <li className="whitespace-nowrap">
                                Téléphone : <a href="tel:0468297856" className="hover:text-blue-400 transition">04 68 29 78 56</a>
                            </li>
                        </ul>
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
                                    className="w-6 h-6 hover:scale-110 transition-transform"
                                />
                            </a>
                        </li>
                        <li>
                            <a href="https://www.instagram.com/tabaclesoler/" target="_blank" rel="noreferrer">
                                <img
                                    src="/assets/logo/instagram.png"
                                    alt="Instagram"
                                    className="w-6 h-6 hover:scale-110 transition-transform"
                                />
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Copyright */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Tabac Presse Le Soler | Créé avec💖à Le Soler.
                </div>
            </div>
        </footer>
    );
}
