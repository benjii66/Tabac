import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-nordic-text text-white py-12 md:py-16 font-light" role="contentinfo">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10 md:gap-6 text-center md:text-left border-b border-gray-800 pb-12">
                    {/* Colonne 1 : Nom et slogan */}
                    <div className="md:w-1/3">
                        <h2 className="text-2xl font-bold mb-2">Tabac Presse Le Soler</h2>
                        <div className="w-12 h-1 bg-tabac-red rounded-full mb-4 mx-auto md:mx-0"></div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            L&apos;essentiel au quotidien.<br/>Le choix et la proximité, c&rsquo;est ici.
                        </p>
                    </div>

                    {/* Colonne 2 : Coordonnées */}
                    <div className="md:w-1/3 flex flex-col items-center md:items-start">
                        <h3 className="text-lg font-semibold mb-4 text-gray-200">Contact</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>46 rue des Orangers<br/>66270 Le Soler</li>
                            <li className="pt-2">
                                Tél :{" "}
                                <a
                                    href="tel:0468738659"
                                    className="text-white hover:text-tabac-red transition-colors font-medium"
                                    aria-label="Appeler Tabac Presse Le Soler au 04 68 73 86 59"
                                >
                                    04 68 73 86 59
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Section du bas (Réseaux, Mentions, Copyright) */}
                <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Tabac Presse Le Soler.
                    </div>
                    
                    <ul className="flex justify-center space-x-6">
                        <li>
                            <a
                                href="https://www.facebook.com/p/Tabac-presse-Le-Soler-100057636871519/?locale=fr_FR"
                                target="_blank"
                                rel="noreferrer"
                                className="opacity-70 hover:opacity-100 hover:scale-110 transition-all"
                                aria-label="Visitez notre page Facebook Tabac Presse Le Soler"
                            >
                                <Image src="/assets/logo/facebook.png" alt="Facebook" width={24} height={24} className="w-6 h-6 brightness-0 invert" priority />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.instagram.com/tabaclesoler/"
                                target="_blank"
                                rel="noreferrer"
                                className="opacity-70 hover:opacity-100 hover:scale-110 transition-all"
                                aria-label="Visitez notre page Instagram Tabac Presse Le Soler"
                            >
                                <Image src="/assets/logo/instagram.png" alt="Instagram" width={24} height={24} className="w-6 h-6 brightness-0 invert" priority />
                            </a>
                        </li>
                    </ul>

                    <div>
                        <Link
                            href="/mentions-legales"
                            className="text-sm text-gray-500 hover:text-tabac-red transition-colors"
                            aria-label="Lire les mentions légales du site Tabac Presse Le Soler"
                        >
                            Mentions légales
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
