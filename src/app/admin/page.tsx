"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

type Appointment = {
  id: string;
  date: string;
  phone: string;
  user: {
    name: string | null;
    email: string;
  };
};

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("jour");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();

      if (!session || session.user.role !== "ADMIN") {
        router.replace("/unauthorized");
        return;
      }

      try {
        const res = await fetch("/api/backoffice/appointments", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Erreur API");

        const data = await res.json();
        const sortedAppointments = data.sort(
          (a: Appointment, b: Appointment) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setAppointments(sortedAppointments);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des rendez-vous :", err);
      }
    };

    fetchData();
  }, [router]);

  const now = new Date();
  const filtered = appointments.filter((rdv) => {
    const date = new Date(rdv.date);

    if (filter === "jour") {
      return date.toDateString() === now.toDateString();
    }

    if (filter === "semaine") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());

      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      return date >= start && date <= end;
    }

    if (filter === "mois") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (filter === "tous") {
      return true;
    }

    return false;
  });

  const handleCancel = async (id: string) => {
    const confirmDelete = confirm("Voulez-vous vraiment annuler ce rendez-vous ?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/backoffice/appointments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erreur API");

      setAppointments((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("❌ Erreur annulation :", err);
      alert("Erreur lors de l'annulation du rendez-vous.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white">
          Tableau de bord admin
        </h1>

        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-300">
          <label className="block text-sm font-medium text-black mb-2">
            Filtrer par :
          </label>
          <select
            className="border border-gray-400 rounded-md px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-gray-500 text-black"
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
          >
            <option value="jour">Aujourdn&apos;hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois-ci</option>
            <option value="tous">Tous les rendez-vous</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border border-gray-300 text-center">
            <p className="text-black">Aucun rendez-vous trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((rdv) => {
              const { date, time } = formatDate(rdv.date);
              return (
                <div
                  key={rdv.id}
                  className="bg-white rounded-lg border border-gray-300 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-2 py-1 bg-gray-200 text-black text-xs font-medium rounded">
                        {time}
                      </span>
                      <span className="text-xs text-gray-600">
                        #{rdv.id.slice(0, 6)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-black mb-1">
                      {date}
                    </h3>

                    <p className="text-gray-800 mb-1">
                      {rdv.user.name || rdv.user.email.split("@")[0]}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      📞 {rdv.phone}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className="flex-1 bg-red-100 hover:bg-red-200 text-black px-4 py-2 rounded-md text-sm font-medium transition-colors border border-red-300 cursor-pointer"
                        onClick={() => handleCancel(rdv.id)}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
