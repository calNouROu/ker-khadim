
import type { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // Vérification de la connexion
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin-login");
  }

  // Vérification du rôle administrateur
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden bg-[#FFFEFA]">

      {/* Navigation administrateur */}
      <Sidebar />

      {/* Contenu principal */}
      <main
        className="
          min-h-screen
          min-w-0
          w-full
          flex-1
          overflow-x-hidden
          px-3
          pb-6
          pt-20
          sm:px-5
          md:p-6
        "
      >
        {children}
      </main>

    </div>
  );
}
