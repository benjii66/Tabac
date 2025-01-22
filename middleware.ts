import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    console.log("Middleware activé pour :", pathname);

    // Ignorer les routes API de l'authentification
    if (pathname.startsWith("/api/login") || pathname.startsWith("/api/logout")) {
        return NextResponse.next();
    }

    // Protéger les routes d'administration
    if (pathname.startsWith("/admin")) {
        const token = req.cookies.get("auth_token")?.value;
        console.log("Token récupéré :", token);

        if (!token || token !== process.env.ADMIN_TOKEN) {
            console.log("Accès refusé, redirection vers /login");
            const url = req.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}
