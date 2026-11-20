import type { ReactNode } from "react";
import Sidebar from '@/components/admin/Sidebar';
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin-login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#FFFEFA]">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
