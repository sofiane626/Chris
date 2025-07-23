// app/api/appointments/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les rendez-vous pour une date donnée
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');

  if (!dateParam) {
    return NextResponse.json({ message: "Date manquante" }, { status: 400 });
  }

  try {
    // 🔥 Supprimer les rendez-vous passés
    await prisma.appointment.deleteMany({
      where: {
        date: {
          lt: new Date(),
        },
      },
    });

    // Convertir la date en début et fin de journée
    const startOfDay = new Date(dateParam + 'T00:00:00.000Z');
    const endOfDay = new Date(dateParam + 'T23:59:59.999Z');

    if (isNaN(startOfDay.getTime()) || isNaN(endOfDay.getTime())) {
      return NextResponse.json({ message: "Date invalide" }, { status: 400 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        date: true,
        duration: true,
        fullName: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau rendez-vous
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { date, fullName, phone, email } = body;

  if (!date || !fullName || !phone || !email) {
    return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
  }

  const appointmentDate = new Date(date);
  if (isNaN(appointmentDate.getTime())) {
    return NextResponse.json({ message: "Date invalide" }, { status: 400 });
  }

  // ❌ Refuser si le rendez-vous est dans moins de 24h
  const now = new Date();
  const diffInMs = appointmentDate.getTime() - now.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return NextResponse.json({ message: "Les rendez-vous doivent être pris au moins 24h à l'avance." }, { status: 400 });
  }

  try {
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        date: appointmentDate,
      },
    });

    if (existingAppointment) {
      return NextResponse.json({ message: "Ce créneau est déjà pris." }, { status: 409 });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        userId: session.user.id,
        date: appointmentDate,
        duration: 60,
        fullName,
        phone,
        email,
      },
    });

    return NextResponse.json(newAppointment);
  } catch (error: any) {
    console.error("Erreur lors de la création du rendez-vous:", error);

    if (error.code === 'P2002') {
      return NextResponse.json({ message: "Ce créneau est déjà pris." }, { status: 409 });
    }

    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
