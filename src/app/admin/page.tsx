
import Link from "next/link";
import type { ReactNode } from "react";
import {
  BanknotesIcon,
  BookOpenIcon,
  EyeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SparklesIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
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
    <div className="min-w-0 rounded-2xl border border-[#E8DDCE] bg-white p-3 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[#786B5D] sm:text-sm">
          {title}
        </p>
        <span className="shrink-0 text-[#8A6A39]">{icon}</span>
      </div>

      <p className="mt-3 break-words text-xl font-bold text-[#4B3022] sm:mt-4 sm:text-2xl">
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-relaxed text-[#A18E7B] sm:text-xs">
        {description}
      </p>
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
  ] = await Promise.all([
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
    recentOrdersRes.error &&
      `Commandes récentes : ${recentOrdersRes.error.message}`,
    paidOrdersRes.error &&
      `Chiffre d’affaires : ${paidOrdersRes.error.message}`,
    visitorStatsRes.error &&
      "Visiteurs : appliquez la migration 20261118000200_site_visitor_statistics.sql dans Supabase.",
  ].filter((message): message is string => Boolean(message));

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#FFFEFA] p-3 sm:p-5 lg:p-6">

      {/* EN-TÊTE */}
      <header className="mb-6 flex min-w-0 flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wider text-[#A18455] sm:text-sm">
            KËR KHADIM / ADMINISTRATION
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#4B3022] sm:text-3xl">
            Tableau de bord
          </h1>

          <p className="mt-1 text-xs text-[#88796B] sm:text-sm">
            Bienvenue dans votre espace de gestion.
          </p>
        </div>

        <div className="w-fit max-w-full rounded-xl bg-[#4B3022] px-4 py-2.5 text-xs font-semibold text-[#F4D69B] sm:px-5 sm:py-3 sm:text-sm">
          Administration KËR KHADIM
        </div>
      </header>

      {/* ERREURS */}
      {statisticErrors.length > 0 && (
        <div
          role="alert"
          className="mb-6 break-words rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:p-4 sm:text-sm"
        >
          <p className="font-semibold">
            Certaines statistiques n’ont pas pu être chargées.
          </p>

          <ul className="mt-2 list-inside list-disc space-y-1">
            {statisticErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* STATISTIQUES */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard
          title="Produits"
          value={productsRes.error ? "—" : productsRes.count ?? 0}
          description="Ouvrages, accessoires et parfums"
          icon={<BookOpenIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
        />

        <StatCard
          title="Commandes"
          value={ordersRes.error ? "—" : ordersRes.count ?? 0}
          description="Commandes enregistrées"
          icon={<ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
        />

        <StatCard
          title="Clients"
          value={clientsRes.error ? "—" : clientsRes.count ?? 0}
          description="Comptes clients"
          icon={<UsersIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
        />

        <StatCard
          title="Chiffre d'affaires"
          value={
            paidOrdersRes.error ? "—" : formatFCFA(totalRevenue)
          }
          description="Commandes payées"
          icon={<BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
      </section>

      {/* VISITEURS */}
      <section className="mt-7 sm:mt-9">
        <h2 className="mb-3 text-base font-bold text-[#4B3022] sm:mb-4 sm:text-lg">
          Visiteurs du site
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard
            title="Visiteurs au total"
            value={
              visitorStatsRes.error
                ? "—"
                : visitorStats?.total_visitors ?? 0
            }
            description="Sessions anonymes enregistrées"
            icon={<UsersIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          />

          <StatCard
            title="Aujourd'hui"
            value={
              visitorStatsRes.error
                ? "—"
                : visitorStats?.visitors_today ?? 0
            }
            description="Nouvelles sessions aujourd'hui"
            icon={<EyeIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          />
        </div>
      </section>

      {/* COMMANDES RÉCENTES */}
      <section className="mt-7 overflow-hidden rounded-2xl border border-[#E8DDCE] bg-white shadow-sm sm:mt-9">

        <div className="flex flex-col gap-3 border-b border-[#F0E9DF] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-base font-bold text-[#4B3022] sm:text-lg">
              Commandes récentes
            </h2>

            <p className="mt-1 text-xs text-[#9A8978] sm:text-sm">
              Les cinq dernières commandes reçues
            </p>
          </div>

          <Link
            href="/admin/commandes"
            className="w-full rounded-lg bg-[#4B3022] px-4 py-3 text-center text-xs font-semibold text-white transition hover:bg-[#684630] sm:w-auto sm:py-2 sm:text-sm"
          >
            Voir toutes les commandes
          </Link>
        </div>

        {/* VERSION MOBILE : CARTES */}
        <div className="space-y-3 p-3 sm:hidden">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-[#E8DDCE] bg-[#FFFEFA] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#9A8978]">
                      CLIENT
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-[#4B3022]">
                      {order.customer_name || "Client"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-[#F5EBDD] px-2.5 py-1 text-[10px] font-semibold text-[#76532E]">
                    {order.status || "En attente"}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-1 border-t border-[#F0E9DF] pt-3">
                  <p className="text-xs text-[#88796B]">
                    Montant
                  </p>

                  <p className="text-base font-bold text-[#8B6839]">
                    {formatFCFA(Number(order.total || 0))}
                  </p>

                  <p className="mt-1 text-[10px] text-[#9A8978]">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-[#9A8978]">
              Aucune commande pour le moment.
            </p>
          )}
        </div>

        {/* VERSION ORDINATEUR : TABLEAU */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
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
                  <tr
                    key={order.id}
                    className="hover:bg-[#FFFCF7]"
                  >
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

      {/* ACCÈS RAPIDE */}
      <section className="mt-7 sm:mt-9">
        <h2 className="mb-3 text-base font-bold text-[#4B3022] sm:mb-4 sm:text-lg">
          Accès rapide
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">

          <Link
            href="/admin/ouvrages"
            className="min-w-0 rounded-2xl border border-[#E8DDCE] bg-white p-3 transition hover:shadow-md sm:p-5"
          >
            <BookOpenIcon className="h-6 w-6 text-[#8A6A39]" />

            <h3 className="mt-3 text-sm font-bold text-[#4B3022] sm:text-base">
              Gérer les ouvrages
            </h3>

            <p className="mt-1 text-[10px] leading-relaxed text-[#958474] sm:text-sm">
              Ajouter, modifier et supprimer des ouvrages.
            </p>
          </Link>

          <Link
            href="/admin/accessoires"
            className="min-w-0 rounded-2xl border border-[#E8DDCE] bg-white p-3 transition hover:shadow-md sm:p-5"
          >
            <ShoppingBagIcon className="h-6 w-6 text-[#8A6A39]" />

            <h3 className="mt-3 text-sm font-bold text-[#4B3022] sm:text-base">
              Gérer les accessoires
            </h3>

            <p className="mt-1 text-[10px] leading-relaxed text-[#958474] sm:text-sm">
              Ajouter, modifier et supprimer les accessoires.
            </p>
          </Link>

          <Link
            href="/admin/parfumerie"
            className="min-w-0 rounded-2xl border border-[#E8DDCE] bg-white p-3 transition hover:shadow-md sm:p-5"
          >
            <SparklesIcon className="h-6 w-6 text-[#8A6A39]" />

            <h3 className="mt-3 text-sm font-bold text-[#4B3022] sm:text-base">
              Gérer la parfumerie
            </h3>

            <p className="mt-1 text-[10px] leading-relaxed text-[#958474] sm:text-sm">
              Ajouter et organiser les parfums par catégorie.
            </p>
          </Link>

          <Link
            href="/admin/commandes"
            className="min-w-0 rounded-2xl border border-[#E8DDCE] bg-white p-3 transition hover:shadow-md sm:p-5"
          >
            <ShoppingCartIcon className="h-6 w-6 text-[#8A6A39]" />

            <h3 className="mt-3 text-sm font-bold text-[#4B3022] sm:text-base">
              Gérer les commandes
            </h3>

            <p className="mt-1 text-[10px] leading-relaxed text-[#958474] sm:text-sm">
              Consulter et suivre les commandes.
            </p>
          </Link>

        </div>
      </section>

    </main>
  );
}
