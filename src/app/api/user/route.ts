import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔍 Appel API /api/user");

    const session = await getServerSession(authOptions);
    console.log("📦 session:", session);

    if (!session?.user?.email) {
      console.warn("⚠️ Aucune session valide");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        appointments: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (!user) {
      console.warn("⚠️ Utilisateur non trouvé");
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      appointments: user.appointments,
    });
  } catch (error: any) {
    console.error("❌ Erreur /api/user :", error.message, error.stack);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
