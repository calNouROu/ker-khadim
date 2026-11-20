"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignOutButton() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  async function signOut() {
    setErrorMessage("");
    if (!supabase) {
      setErrorMessage("Configuration Supabase manquante.");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage("La déconnexion a échoué : " + error.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={signOut}
        className="text-sm font-semibold text-[#8A6A39] hover:underline"
      >
        Se déconnecter
      </button>
      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
