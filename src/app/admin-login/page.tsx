"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!supabase) {
      setMessage(
        "Variables Supabase manquantes. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#101D35] flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-[#FFFEFA] p-8 rounded-2xl shadow-xl"
      >
        <h1 className="text-3xl font-bold text-[#101D35] text-center">
          KËR KHADIM
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Espace administrateur
        </p>

        <label className="block text-sm font-semibold mb-2">
          Adresse e-mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 mb-5"
          placeholder="admin@kerkhadim.com"
        />

        <label className="block text-sm font-semibold mb-2">
          Mot de passe
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-3 mb-5"
          placeholder="Votre mot de passe"
        />

        {message && (
          <p className="text-red-600 text-sm mb-4">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#101D35] text-white rounded-lg p-3 font-semibold hover:bg-[#263D5B] disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}