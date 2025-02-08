import { NextResponse } from "next/server";

export function POST() {
    const response = NextResponse.json({ success: true }, { status: 200 });

    // Supprimer le cookie en le réglant avec une date d'expiration passée
    response.cookies.set("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(0), // Expire immédiatement
    });

    return response;
}
