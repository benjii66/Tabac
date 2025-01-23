"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Maintenance() {
    const [timeLeft, setTimeLeft] = useState(14 * 24 * 60 * 60); // 14 jours en secondes

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const secs = seconds % 60;
        return `${days}j ${hours}h ${minutes}m ${secs}s`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen absolute inset-0 bg-white text-center px-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                🚧 Site en construction 🚧
            </h1>
            <p className="text-lg text-gray-600 mb-6">
                Nous travaillons actuellement à la mise à jour du site.
                Merci pour votre patience !
            </p>
            <p className="text-2xl font-semibold text-gray-800 mb-8">
                Réouverture prévue dans : <span>{formatTime(timeLeft)}</span>
            </p>
            <Image
                src="/worker-animation.gif"
                alt="Ouvrier travaillant"
                width={150}
                height={150}
                className=""
            />
        </div>
    );
}
