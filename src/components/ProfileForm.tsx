"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  userId: string;
  initialName: string;
  initialPhone: string;
};

export default function ProfileForm({
  userId,
  initialName,
  initialPhone,
}: Props) {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Configuration Supabase manquante.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
        })
        .eq("id", userId);

      if (error) {
        setMessage("La mise à jour a échoué : " + error.message);
        return;
      }

      setMessage("Vos informations ont été enregistrées.");
    } catch (error) {
      console.error("La mise à jour du profil a échoué.", error);
      setMessage("Une erreur réseau a empêché la mise à jour.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="profile-name" className="mb-1 block text-sm font-semibold">
          Nom complet
        </label>
        <input
          id="profile-name"
          required
          maxLength={200}
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>
      <div>
        <label htmlFor="profile-phone" className="mb-1 block text-sm font-semibold">
          Téléphone
        </label>
        <input
          id="profile-phone"
          type="tel"
          required
          maxLength={40}
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>
      {message && (
        <p role="status" className="text-sm text-[#263D5B]">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-[#101D35] px-5 py-3 font-semibold text-white hover:bg-[#263D5B] disabled:opacity-50"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
