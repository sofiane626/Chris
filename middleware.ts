import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/", "/login"];
const protectedRoutes = ["/profil", "/admin"]; // tu peux étendre ici si besoin
const apiPrefixes = ["/api/", "/_next/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ne rien faire pour les API et assets Next.js
  if (apiPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Utilisateur non connecté
  if (!token) {
    const isProtected = protectedRoutes.some(route =>
      pathname.startsWith(route)
    );

    if (isProtected) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next(); // Page publique autorisée
  }

  // Utilisateur connecté

  // Rediriger /login vers /profil s'il est déjà connecté
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/profil", req.url));
  }

  // Accès restreint à /admin
  if (pathname.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
