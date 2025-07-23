import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 🔐 Récupération du token depuis les cookies
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      console.warn("❌ Aucun token trouvé");
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    if (token.role !== "ADMIN") {
      console.warn("⛔ Accès refusé - rôle insuffisant :", token.role);
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // ✅ Récupération des rendez-vous avec toutes les infos utiles
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("❌ Erreur dans /api/backoffice/appointments :", error);
    return NextResponse.json(
      {
        message: "Erreur interne serveur",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
