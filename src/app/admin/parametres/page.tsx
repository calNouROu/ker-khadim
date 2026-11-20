"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ParametresPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAdmin() {
      if (!supabase) {
        setMessage("Configuration Supabase manquante.");
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) setMessage("Impossible de charger le compte : " + authError.message);

      if (authData.user) {
        setEmail(authData.user.email || "");

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (error) setMessage("Impossible de charger le profil : " + error.message);
        setFullName(data?.full_name || "");
      }

      setLoading(false);
    }

    loadAdmin();
  }, []);

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (!supabase) {
      setMessage("Configuration Supabase manquante.");
      setSaving(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setMessage("Vous devez être connecté.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", authData.user.id);

    if (error) {
      setMessage("Erreur lors de l'enregistrement : " + error.message);
    } else {
      setMessage("Informations enregistrées avec succès.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-[#786B5D]">
        Chargement des paramètres...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-sm font-medium text-[#A18455]">
          KËR KHADIM / ADMINISTRATION
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#4B3022]">
          Paramètres
        </h1>
        <p className="mt-2 text-sm text-[#88796B]">
          Gérez les informations de votre espace administrateur.
        </p>
      </header>

      <section className="rounded-2xl border border-[#E8DDCE] bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-[#4B3022]">
          Informations de la boutique
        </h2>

        <div className="rounded-xl bg-[#FAF6EF] p-5">
          <h3 className="text-xl font-bold text-[#4B3022]">
            KËR KHADIM
          </h3>
          <p className="mt-2 text-sm text-[#88796B]">
            Boutique spécialisée dans la vente d&apos;ouvrages.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E8DDCE] bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-[#4B3022]">
          Compte administrateur
        </h2>

        <form onSubmit={saveSettings} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#4B3022]">
              Nom complet
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom complet"
              className="w-full rounded-xl border border-[#E8DDCE] p-3 outline-none focus:border-[#A18455]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#4B3022]">
              Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-xl border border-[#E8DDCE] bg-[#FAF6EF] p-3 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Adresse associée à votre compte de connexion.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#4B3022] px-6 py-3 font-semibold text-white transition hover:bg-[#684630] disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>

          {message && (
            <p role="status" className="text-sm text-[#76532E]">{message}</p>
          )}
        </form>
      </section>

      <section className="rounded-2xl border border-[#E8DDCE] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#4B3022]">
          Identité de la boutique
        </h2>
        <p className="mt-2 text-sm text-[#88796B]">
          Le logo et les coordonnées publiques pourront être configurés
          dans une prochaine étape.
        </p>
      </section>
    </div>
  );
}