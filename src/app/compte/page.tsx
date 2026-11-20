import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProfileForm from "@/components/ProfileForm";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase-server";

export const instant = false;

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/connexion");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  let { data: rawOrders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, status, total, created_at, order_items(product_title, quantity, unit_price)"
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (ordersError && ordersError.message.includes("customer_id")) {
    const fallback = await supabase
      .from("orders")
      .select(
        "id, status, total, created_at, order_items(product_title, quantity, unit_price)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    rawOrders = fallback.data;
    ordersError = fallback.error;
  }

  const orders = (rawOrders || []) as {
    id: string;
    status: string;
    total: number;
    created_at: string;
    order_items: {
      product_title: string;
      quantity: number;
      unit_price: number;
    }[];
  }[];

  return (
    <main className="min-h-screen bg-[#FFFEFA]">
      <Navbar />

      <section className="mx-auto max-w-5xl space-y-10 px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9DFC9] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#101D35]">
              Mon compte
            </h1>
            <p className="mt-1 text-sm text-gray-600">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        <section className="rounded-2xl border border-[#E9DFC9] bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-serif text-xl font-bold text-[#101D35]">
            Informations personnelles
          </h2>
          {profileError ? (
            <p role="alert" className="text-sm text-red-700">
              Impossible de charger votre profil : {profileError.message}
            </p>
          ) : (
            <ProfileForm
              userId={user.id}
              initialName={profile?.full_name || ""}
              initialPhone={profile?.phone || ""}
            />
          )}
        </section>

        <section className="rounded-2xl border border-[#E9DFC9] bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-serif text-xl font-bold text-[#101D35]">
            Historique des commandes
          </h2>
          {ordersError ? (
            <p role="alert" className="text-sm text-red-700">
              Impossible de charger vos commandes : {ordersError.message}
            </p>
          ) : orders.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Vous n’avez pas encore passé de commande.
              </p>
              <Link
                href="/ouvrages"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#8A6A39] hover:text-[#101D35]"
              >
                Découvrir les autres ouvrages <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-xl border border-[#E9DFC9] p-4"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-semibold text-[#101D35]">
                      Commande {order.id.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Statut :{" "}
                    <span className="font-medium text-[#101D35]">
                      {statusLabels[order.status] || order.status}
                    </span>
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-700">
                    {order.order_items.map((item, index) => (
                      <li key={`${order.id}-${index}`}>
                        {item.product_title} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 font-bold text-[#101D35]">
                    {Number(order.total).toLocaleString("fr-FR")} FCFA
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

    </main>
  );
}
