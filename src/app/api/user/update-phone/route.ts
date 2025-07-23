// app/api/user/update-phone/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  // ✅ Corrigé : on utilise bien NextRequest ici
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const phone = body.phone;

  try {
    const user = await prisma.user.update({
      where: { email: token.email },
      data: { phone },
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Erreur serveur :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
