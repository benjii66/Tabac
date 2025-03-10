import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname, searchParams } = req.nextUrl;

    console.log("Middleware activé pour :", pathname);

    // Ignorer les fichiers statiques, Next.js assets, et favicon
    if (
        pathname.startsWith("/_next/") || // Next.js fichiers
        pathname.startsWith("/assets/") || // Images et autres assets
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    // Permettre l'accès aux routes API
    if (pathname.startsWith("/api")) {
        console.log("Accès autorisé aux routes API :", pathname);
        return NextResponse.next();
    }

    // Permettre l'accès à /login sans restriction
    if (pathname.startsWith("/login")) {
        console.log("Accès autorisé à /login");
        return NextResponse.next();
    }

    // Permettre l'accès à /admin si le token est valide
    if (pathname.startsWith("/admin")) {
        const token = req.cookies.get("auth_token")?.value;
        console.log("Token récupéré :", token);

        if (!token || token !== process.env.ADMIN_TOKEN) {
            console.log("Accès refusé à /admin, redirection vers /login");
            const url = req.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        console.log("Accès autorisé à /admin");
        return NextResponse.next();
    }

    // Permettre l'accès à l'index si le mode debug est activé
    if (pathname === "/" && searchParams.has("debug") && searchParams.get("debug") === "true") {
        console.log("Mode debug activé : accès à l'index");
        return NextResponse.next();
    }

    /*
    // 🔴 Maintenance activée : redirige toutes les routes vers /maintenance
    if (pathname !== "/maintenance") {
        console.log("Redirection vers /maintenance");
        const url = req.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.redirect(url);
    }
    */

    // Par défaut, continuer normalement
    return NextResponse.next();
}
