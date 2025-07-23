import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, phone } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
  }

  const hashed = await hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      phone,
    },
  });

  return NextResponse.json({ success: true });
}
