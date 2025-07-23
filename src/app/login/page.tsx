'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup) {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        toast.error("Inscription échouée ❌");
        return;
      }

      toast.success("Compte créé ✅");
    }

    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (result?.error) {
      toast.error("Connexion échouée ❌");
    } else if (result?.ok) {
      toast.success("Connexion réussie ✅");
      router.push("/profil");
      router.refresh(); // Force le refresh pour mettre à jour la session
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 bg-black">
      <div className="max-w-md mx-auto p-6 border-2 border-black rounded-2xl shadow-lg bg-white">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          {isSignup ? "Créer un compte" : "Se connecter"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block font-medium mb-1 text-black">Nom :</label>
              <input
                type="text"
                placeholder="Votre nom complet"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 rounded-lg bg-white text-black"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block font-medium mb-1 text-black">Email :</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border-2 border-black px-3 py-2 rounded-lg bg-white text-black"
              required
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1 text-black">Mot de passe :</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border-2 border-black px-3 py-2 rounded-lg bg-white text-black"
              required
            />
          </div>
          
          {isSignup && (
            <div>
              <label className="block font-medium mb-1 text-black">Téléphone (facultatif) :</label>
              <input
                type="tel"
                placeholder="+32 123 45 67 89"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 rounded-lg bg-white text-black"
              />
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition border-2 border-black font-medium cursor-pointer"
          >
            {isSignup ? "🚀 S'inscrire" : "🔐 Se connecter"}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-black font-medium">ou</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => signIn("google", { callbackUrl: "/profil" })} 
            className="w-full bg-white text-black py-3 px-4 rounded-lg border-2 border-black hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>
          
          <div className="text-center">
            <p className="text-sm text-black">
              {isSignup ? "Déjà inscrit ?" : "Pas encore de compte ?"}{" "}
              <button 
                onClick={() => setIsSignup(!isSignup)} 
                className="text-blue-600 underline font-medium hover:text-blue-800 transition cursor-pointer"
              >
                {isSignup ? "Se connecter" : "Créer un compte"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}