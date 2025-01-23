import argon2 from "argon2";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body;

        // Logs pour débogage
        console.log("Requête reçue :", { username, password });
        console.log("ADMIN_USERNAME :", process.env.ADMIN_USERNAME);
        console.log("ADMIN_PASSWORD_HASH brut :", process.env.ADMIN_PASSWORD_HASH);

        // Vérification du nom d'utilisateur
        if (username !== process.env.ADMIN_USERNAME) {
            return NextResponse.json(
                { error: "Nom d'utilisateur incorrect" },
                { status: 401 }
            );
        }

        // Lecture du hash depuis les variables d'environnement
        const passwordHash = process.env.ADMIN_PASSWORD_HASH;
        if (!passwordHash) {
            console.error("Hash de mot de passe introuvable dans les variables d'environnement");
            return NextResponse.json(
                { error: "Erreur de configuration côté serveur" },
                { status: 500 }
            );
        }

        // Vérification du mot de passe
        const passwordMatches = await argon2.verify(passwordHash, password);
        if (!passwordMatches) {
            return NextResponse.json(
                { error: "Mot de passe incorrect" },
                { status: 401 }
            );
        }

        // Création du cookie de session
        const response = NextResponse.json({ success: true }, { status: 200 });
        response.cookies.set("auth_token", process.env.ADMIN_TOKEN || "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 semaine
        });

        return response;
    } catch (error) {
        console.error("Erreur dans POST /api/login :", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}
