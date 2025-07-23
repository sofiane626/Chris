'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type AppointmentFormProps = {
  user: {
    name: string;
    email: string;
    phone: string;
  };
  onBooked: (appointment: any) => void;
};

function generateTimeSlots(startHour = 12, endHour = 22) {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  slots.push(`${endHour}:00`);
  return slots;
}

export default function AppointmentForm({ user, onBooked }: AppointmentFormProps) {
  const [dateObj, setDateObj] = useState<Date | null>(new Date());
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (dateObj) {
      const isoDate = dateObj.toISOString().slice(0, 10);
      setDate(isoDate);
    }
  }, [dateObj]);

  useEffect(() => {
    if (!date) return;
    fetch(`/api/appointments?date=${date}`)
      .then(async res => {
        if (!res.ok) throw new Error('Erreur lors du chargement');
        const text = await res.text();
        return text ? JSON.parse(text) : [];
      })
      .then(data => {
        const times = data.map((a: any) => new Date(a.date).toISOString().slice(11, 16));
        setBookedTimes(times);
      })
      .catch(err => {
        console.error("Erreur de chargement des rendez-vous :", err);
        setBookedTimes([]);
      });
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!date || !time) {
      setMessage("Merci de choisir une date et une heure.");
      return;
    }

    if (!user.phone) {
      setMessage("⚠️ Vous devez enregistrer un numéro de téléphone pour réserver.");
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const [year, month, day] = date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day, hours, minutes);

    const now = new Date();
    const diffInMs = appointmentDate.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      setMessage("⛔ Les rendez-vous doivent être pris au moins 24h à l'avance.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: appointmentDate.toISOString(),
          fullName: user.name || 'Nom inconnu',
          phone: user.phone,
          email: user.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage("❌ " + (errorData.message || 'Erreur lors de la réservation.'));
      } else {
        const data = await res.json();
        onBooked(data);
        setMessage("✅ Rendez-vous réservé !");
        setTime('');
        setBookedTimes(prev => [...prev, time]);
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur réseau, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filtrer les horaires disponibles à +24h si c’est aujourd’hui ou demain proche
  const filteredSlots = timeSlots.filter(slot => {
    if (!dateObj) return true;

    const [hours, minutes] = slot.split(':').map(Number);
    const slotDate = new Date(dateObj);
    slotDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffInHours = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return diffInHours >= 24;
  });

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 border-2 border-black rounded-2xl shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-black">Prendre un rendez-vous</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1 text-black">Date :</label>
        <DatePicker
          selected={dateObj}
          onChange={(d) => setDateObj(d)}
          dateFormat="yyyy-MM-dd"
          minDate={new Date()}
          className="w-full border-2 border-black px-3 py-2 rounded-lg bg-white text-black"
        />
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-1 text-black">Heure :</label>
        <select
          value={time}
          onChange={e => setTime(e.target.value)}
          className="w-full border-2 border-black px-3 py-2 rounded-lg bg-white text-black"
          required
        >
          <option value="">-- Choisissez une heure --</option>
          {filteredSlots.map(slot => (
            <option
              key={slot}
              value={slot}
              disabled={bookedTimes.includes(slot)}
            >
              {slot} {bookedTimes.includes(slot) ? '(Réservé)' : ''}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 border-2 border-black"
      >
        {loading ? "⏳ En cours..." : "🗓️ Réserver le créneau"}
      </button>

      {message && (
        <div className="mt-4 text-center text-sm text-black bg-gray-50 p-3 rounded border-2 border-black">
          {message}
        </div>
      )}
    </form>
  );
}
