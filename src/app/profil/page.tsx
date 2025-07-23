'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AppointmentForm from "@/app/components/AppointmentForm";

type Appointment = {
  id: string;
  date: string;
  fullName: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user && status === "authenticated") {
      setDataLoading(true);
      fetch('/api/user', {
        credentials: "include",
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Erreur de récupération des données');
          }
          return res.json();
        })
        .then(data => {
          if (!data?.user) {
            throw new Error('Utilisateur non trouvé dans la réponse');
          }

          setUser(data.user);
          setPhoneInput(data.user?.phone ?? "");
          const sorted = (data.appointments ?? []).sort(
            (a: Appointment, b: Appointment) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setAppointments(sorted);
        })
        .catch(error => {
          console.error('Erreur:', error);
          toast.error("Erreur lors du chargement des données");
        })
        .finally(() => {
          setDataLoading(false);
        });
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 shadow-lg">
            <p className="text-white text-xl font-bold">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 shadow-lg">
            <p className="text-white text-xl font-bold">Redirection vers la page de connexion...</p>
          </div>
        </div>
      </div>
    );
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: phoneInput }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        toast.success("Téléphone mis à jour ✅");
      } else {
        const errorData = await res.json();
        toast.error(`Erreur: ${errorData.error || 'Erreur lors de la mise à jour'} ❌`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur de connexion ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    toast((t) => (
      <div className="p-4 backdrop-blur-lg bg-white/90 rounded-lg border border-white/20 shadow-xl">
        <p className="font-bold text-black text-lg">Annuler ce rendez-vous ?</p>
        <p className="text-black mt-2 font-medium">Cette action est irréversible.</p>
        <div className="mt-3 flex justify-end gap-3">
          <button
            className="text-black px-4 py-2 bg-white/80 hover:bg-white border border-black/20 rounded-lg transition font-bold"
            onClick={() => toast.dismiss(t.id)}
          >
            Annuler
          </button>
          <button
            className="text-white px-4 py-2 bg-red-600 hover:bg-red-700 border border-red-800 rounded-lg transition font-bold"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`/api/appointments/${id}`, {
                  method: "DELETE",
                  credentials: "include",
                });

                if (res.ok) {
                  setAppointments((prev) =>
                    prev.filter((a) => a.id !== id)
                  );
                  toast.success("Rendez-vous annulé ✅");
                } else {
                  const errorData = await res.json();
                  toast.error(`Erreur: ${errorData.error || 'Erreur lors de l\'annulation'} ❌`);
                }
              } catch (error) {
                console.error('Erreur:', error);
                toast.error("Erreur de connexion ❌");
              }
            }}
          >
            Confirmer
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <h1 className="text-4xl font-bold mb-8 text-center text-white">Mon Profil</h1>

          {dataLoading ? (
            <div className="text-center py-8">
              <p className="text-white text-lg">Chargement de vos informations...</p>
            </div>
          ) : (
            <>
              {/* Infos utilisateur */}
              <div className="mb-8 p-6 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-white">Informations personnelles</h2>
                <div className="space-y-4">
                  <p className="text-white text-lg"><strong className="text-white">Nom :</strong> <span className="text-white">{session.user.name}</span></p>
                  <p className="text-white text-lg"><strong className="text-white">Email :</strong> <span className="text-white">{session.user.email}</span></p>
                  <p className="text-white text-lg"><strong className="text-white">Téléphone :</strong> <span className="text-white">{user?.phone || 'Non renseigné'}</span></p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Ajouter/modifier téléphone"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full border border-white/30 px-4 py-3 rounded-xl text-white bg-white/10 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 text-lg font-medium"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-white/90 text-black px-6 py-3 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-lg border border-white/30"
                    disabled={loading}
                  >
                    {loading ? "..." : "💾 Sauver"}
                  </button>
                </form>
              </div>

              {/* Formulaire de réservation */}
              <div className="mb-8 p-6 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-white">Prendre un rendez-vous</h2>
                {user?.phone ? (
                  <AppointmentForm
                    user={user as {
                      name: string;
                      email: string;
                      phone: string;
                    }}
                    onBooked={(newAppointment) => {
                      setAppointments((prev) =>
                        [...prev, newAppointment].sort(
                          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                        )
                      );
                      toast.success("Rendez-vous confirmé ! 🎉");
                    }}
                  />
                ) : (
                  <div className="p-6 bg-yellow-100/80 border border-yellow-400/50 rounded-xl backdrop-blur-sm">
                    <p className="text-yellow-900 text-lg flex items-center font-bold">
                      <span className="mr-3 text-2xl">⚠️</span>
                      Vous devez enregistrer un numéro de téléphone pour prendre un rendez-vous.
                    </p>
                  </div>
                )}
              </div>

              {/* Liste des rendez-vous */}
              <div className="p-6 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-white">Mes rendez-vous</h2>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white text-xl font-medium">📅 Aucun rendez-vous encore pris.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((r) => (
                      <div 
                        key={r.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-blue-100/10 border border-blue-200/30 rounded-xl shadow-md backdrop-blur-sm"
                      >
                        <div className="mb-3 sm:mb-0">
                          <p className="font-bold text-white text-lg">
                            {new Date(r.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-white/90 font-medium text-base mt-1">
                            {new Date(r.date).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} • <span className="font-bold text-white">{r.fullName}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteAppointment(r.id)}
                          className="w-full sm:w-auto text-white bg-red-600/90 hover:bg-red-700 px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg transition duration-200 ease-in-out cursor-pointer font-bold text-sm sm:text-base border border-red-800/50"
                        >
                          ❌ Annuler
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}