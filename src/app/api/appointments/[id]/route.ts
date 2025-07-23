// app/api/appointment/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!appointment || appointment.user.email !== token.email) {
    return NextResponse.json({ error: "Rendez-vous introuvable ou accès interdit" }, { status: 403 });
  }

  await prisma.appointment.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
