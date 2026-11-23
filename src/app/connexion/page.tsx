
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

function normalizePhone(value: string) {
  const compact = value.trim().replace(/[\s().-]/g, "");

  const international = compact.startsWith("00")
    ? `+${compact.slice(2)}`
    : compact;

  return /^\+[1-9]\d{7,14}$/.test(international)
    ? international
    : null;
}

export default function ConnexionPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage(
        "Configuration Supabase manquante. Vérifiez les variables d’environnement."
      );
      return;
    }

    const value = identifier.trim();
    const isEmail = value.includes("@");
    const phone = isEmail ? null : normalizePhone(value);

    if (!isEmail && !phone) {
      setMessage(
        "Saisissez un e-mail valide ou un téléphone au format international (+221...)."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword(
        isEmail
          ? {
              email: value.toLowerCase(),
              password,
            }
          : {
              phone: phone!,
              password,
            }
      );

      if (error) {
        setMessage("Connexion impossible : " + error.message);
        return;
      }

      router.replace("/panier");
      router.refresh();
    } catch (error) {
      console.error("La connexion Supabase a échoué.", error);

      setMessage(
        "Une erreur réseau a empêché la connexion."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101D35] p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-[#FFFEFA] p-8 shadow-xl"
      >
        <Link
          href="/"
          className="block text-center text-2xl font-bold text-[#101D35]"
        >
          KËR KHADIM
        </Link>

        <h1 className="mt-3 text-center text-xl font-semibold text-[#263D5B]">
          Connexion à votre compte
        </h1>

        <label
          htmlFor="identifier"
          className="mb-2 mt-8 block text-sm font-semibold"
        >
          E-mail ou téléphone
        </label>

        <input
          id="identifier"
          type="text"
          autoComplete="username"
          inputMode="text"
          placeholder="nom@exemple.com ou +221..."
          required
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <label
          htmlFor="password"
          className="mb-2 mt-5 block text-sm font-semibold"
        >
          Mot de passe
        </label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border p-3"
        />

        {message && (
          <p
            role="alert"
            className="mt-4 text-sm text-red-700"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#101D35] p-3 font-semibold text-white hover:bg-[#263D5B] disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="mt-5 text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-semibold text-[#8A6A39] underline"
          >
            Créer un compte
          </Link>
        </p>
      </form>
    </main>
  );
}
