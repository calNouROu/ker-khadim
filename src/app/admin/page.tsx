


import Link from "next/link";
import type { ReactNode } from "react";
import { BanknotesIcon, BookOpenIcon, EyeIcon, ShoppingBagIcon, ShoppingCartIcon, SparklesIcon, UsersIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase-server";


function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E8DDCE] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#786B5D]">{title}</p>
        <span aria-hidden="true" className="text-[#8A6A39]">{icon}</span>
      </div>
      <p className="mt-4 text-2xl font-bold text-[#4B3022]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#A18E7B]">{description}</p>
    </div>
  );
}

function formatFCFA(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    productsRes,
    ordersRes,
    clientsRes,
    recentOrdersRes,
    paidOrdersRes,
    visitorStatsRes,
  ] =
    await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "customer"),
      supabase
        .from("orders")
        .select("id, customer_name, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("orders")
        .select("total")
        .eq("payment_status", "paid"),
      supabase.rpc("get_site_visitor_stats"),
    ]);

  const orders = recentOrdersRes.data ?? [];
  const visitorStats = Array.isArray(visitorStatsRes.data)
    ? visitorStatsRes.data[0]
    : visitorStatsRes.data;
  const totalRevenue = (paidOrdersRes.data ?? []).reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const statisticErrors = [
    productsRes.error && `Produits : ${productsRes.error.message}`,
    ordersRes.error && `Commandes : ${ordersRes.error.message}`,
    clientsRes.error && `Clients : ${clientsRes.error.message}`,
    recentOrdersRes.error && `Commandes récentes : ${recentOrdersRes.error.message}`,
    paidOrdersRes.error && `Chiffre d’affaires : ${paidOrdersRes.error.message}`,
    visitorStatsRes.error &&
      "Visiteurs : appliquez la migration 20261118000200_site_visitor_statistics.sql dans Supabase.",
  ].filter((message): message is string => Boolean(message));
  return (
    <div className="min-h-screen space-y-8 bg-[#FFFEFA] p-2 md:p-4">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#A18455]">
            KËR KHADIM / ADMINISTRATION
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#4B3022]">
            Tableau de bord
          </h1>
          <p className="mt-2 text-sm text-[#88796B]">
            Bienvenue dans votre espace de gestion.
          </p>
        </div>

        <div className="rounded-xl bg-[#4B3022] px-5 py-3 text-sm font-semibold text-[#F4D69B]">
          Administration KËR KHADIM
        </div>
      </header>

      {statisticErrors.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Certaines statistiques n’ont pas pu être chargées.</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {statisticErrors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total des produits"
          value={productsRes.error ? "—" : productsRes.count ?? 0}
          description="Ouvrages, accessoires et parfums enregistrés"
          icon={<BookOpenIcon className="h-6 w-6" />}
        />

        <StatCard
          title="Total des commandes"
          value={ordersRes.error ? "—" : ordersRes.count ?? 0}
          description="Commandes enregistrées"
          icon={<ShoppingCartIcon className="h-6 w-6" />}
        />

        <StatCard
          title="Clients"
          value={clientsRes.error ? "—" : clientsRes.count ?? 0}
          description="Comptes clients"
          icon={<UsersIcon className="h-6 w-6" />}
        />

        <StatCard
          title="Chiffre d'affaires"
          value={paidOrdersRes.error ? "—" : formatFCFA(totalRevenue)}
          description="Commandes payées"
          icon={<BanknotesIcon className="h-6 w-6" />}
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-[#4B3022]">
          Visiteurs du site
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            title="Visiteurs au total"
            value={visitorStatsRes.error ? "—" : visitorStats?.total_visitors ?? 0}
            description="Sessions anonymes enregistrées"
            icon={<UsersIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Visiteurs aujourd’hui"
            value={visitorStatsRes.error ? "—" : visitorStats?.visitors_today ?? 0}
            description="Nouvelles sessions aujourd’hui"
            icon={<EyeIcon className="h-6 w-6" />}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E8DDCE] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#F0E9DF] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-[#4B3022]">
              Commandes récentes
            </h2>
            <p className="mt-1 text-sm text-[#9A8978]">
              Les cinq dernières commandes reçues
            </p>
          </div>

          <Link
            href="/admin/commandes"
            className="rounded-lg bg-[#4B3022] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#684630]"
          >
            Voir toutes les commandes
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-[#FAF6EF] text-[#786B5D]">
              <tr>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Montant</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F0E9DF]">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFFCF7]">
                    <td className="px-5 py-4 font-medium text-[#4B3022]">
                      {order.customer_name || "Client"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#8B6839]">
                      {formatFCFA(Number(order.total || 0))}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#F5EBDD] px-3 py-1 text-xs font-medium text-[#76532E]">
                        {order.status || "En attente"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#88796B]">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-[#9A8978]"
                  >
                    Aucune commande pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-[#4B3022]">
          Accès rapide
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/admin/ouvrages"
            className="rounded-2xl border border-[#E8DDCE] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
          >
            <BookOpenIcon aria-hidden="true" className="h-6 w-6 text-[#8A6A39]" />
            <h3 className="mt-3 font-bold text-[#4B3022]">
              Gérer les ouvrages
            </h3>
            <p className="mt-1 text-sm text-[#958474]">
              Ajouter, modifier et supprimer des ouvrages.
            </p>
          </Link>

          <Link
            href="/admin/accessoires"
            className="rounded-2xl border border-[#E8DDCE] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
          >
            <ShoppingBagIcon aria-hidden="true" className="h-6 w-6 text-[#8A6A39]" />
            <h3 className="mt-3 font-bold text-[#4B3022]">
              Gérer les accessoires
            </h3>
            <p className="mt-1 text-sm text-[#958474]">
              Ajouter, modifier et supprimer les accessoires.
            </p>
          </Link>

          <Link
            href="/admin/parfumerie"
            className="rounded-2xl border border-[#E8DDCE] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
          >
            <SparklesIcon aria-hidden="true" className="h-6 w-6 text-[#8A6A39]" />
            <h3 className="mt-3 font-bold text-[#4B3022]">
              Gérer la parfumerie
            </h3>
            <p className="mt-1 text-sm text-[#958474]">
              Ajouter et organiser les parfums par catégorie.
            </p>
          </Link>

          <Link
            href="/admin/commandes"
            className="rounded-2xl border border-[#E8DDCE] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
          >
            <ShoppingCartIcon aria-hidden="true" className="h-6 w-6 text-[#8A6A39]" />
            <h3 className="mt-3 font-bold text-[#4B3022]">
              Gérer les commandes
            </h3>
            <p className="mt-1 text-sm text-[#958474]">
              Consulter et suivre les commandes.
            </p>
          </Link>

          </div>
      </section>
    </div>
  );
}
