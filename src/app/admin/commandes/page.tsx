"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  shipping_address: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total: number;
  created_at: string;
  order_items: {
    product_title: string;
    quantity: number;
    unit_price: number;
  }[];
};

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "preparing", label: "En préparation" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

const paymentStatuses: { value: PaymentStatus; label: string }[] = [
  { value: "unpaid", label: "Non payé" },
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payé" },
  { value: "failed", label: "Échec" },
  { value: "refunded", label: "Remboursé" },
];

const allowedNextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      if (!supabase) {
        setMessage("Configuration Supabase manquante.");
        setLoading(false);
        return;
      }

      const firstResult = await supabase
        .from("orders")
        .select("id, customer_name, phone, shipping_address, status, payment_status, total, created_at, order_items(product_title, quantity, unit_price)")
        .order("created_at", { ascending: false });

      let data: unknown = firstResult.data;
      let error = firstResult.error;

      if (error?.message.includes("shipping_address")) {
        const legacyResult = await supabase
          .from("orders")
          .select("id, customer_name, phone, address, status, payment_status, total, created_at, order_items(product_title, quantity, unit_price)")
          .order("created_at", { ascending: false });
        data = legacyResult.data;
        error = legacyResult.error;
      }
      if (error) {
        setMessage("Impossible de charger les commandes : " + error.message);
        setLoading(false);
        return;
      }

      const rawOrders = (Array.isArray(data) ? data : []) as Record<string, unknown>[];
      const mappedOrders: Order[] = rawOrders.map((o) => ({
        id: String(o.id || ""),
        customer_name: String(o.customer_name || ""),
        phone: String(o.phone || ""),
        shipping_address: String(o.shipping_address || o.address || ""),
        status: (o.status as OrderStatus) || "pending",
        payment_status: String(o.payment_status || "unpaid") as PaymentStatus,
        total: Number(o.total || 0),
        created_at: String(o.created_at || ""),
        order_items: (Array.isArray(o.order_items) ? o.order_items : []) as {
          product_title: string;
          quantity: number;
          unit_price: number;
        }[],
      }));

      setOrders(mappedOrders);
      setLoading(false);
    }

    void loadOrders();
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    if (!supabase) {
      setMessage("Configuration Supabase manquante.");
      return;
    }

    setUpdatingOrderId(orderId);
    setMessage("");
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("id")
      .maybeSingle();
    setUpdatingOrderId(null);

    if (error) {
      setMessage("Impossible de modifier la commande : " + error.message);
      return;
    }
    if (!data) {
      setMessage("Commande non modifiée. Vérifiez vos droits administrateur.");
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    setMessage("Statut de commande mis à jour.");
  }

  async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    if (!supabase) {
      setMessage("Configuration Supabase manquante.");
      return;
    }

    setUpdatingOrderId(orderId);
    setMessage("");
    const { data, error } = await supabase
      .from("orders")
      .update({ payment_status: paymentStatus })
      .eq("id", orderId)
      .select("id")
      .maybeSingle();
    setUpdatingOrderId(null);

    if (error) {
      setMessage("Impossible de modifier le paiement : " + error.message);
      return;
    }
    if (!data) {
      setMessage("Paiement non modifié. Vérifiez vos droits administrateur.");
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, payment_status: paymentStatus } : order
      )
    );
    setMessage("Statut de paiement mis à jour. Le chiffre d’affaires inclut les commandes marquées payées.");
  }
  return (
    <main className="min-h-screen bg-[#F5E6C8] p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="text-sm font-semibold text-[#8A6A39] hover:underline">
          ← Tableau de bord
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-[#101D35]">
          Gestion des commandes
        </h1>

        {message && (
          <p role="status" className="mt-5 rounded-lg bg-white p-4 text-sm text-[#263D5B]">
            {message}
          </p>
        )}

        {loading ? (
          <p className="mt-8 text-[#263D5B]">Chargement des commandes...</p>
        ) : orders.length === 0 ? (
          <p className="mt-8 rounded-xl bg-white p-8 text-center text-gray-600">
            Aucune commande enregistrée.
          </p>
        ) : (
          <ul className="mt-8 space-y-5">
            {orders.map((order) => (
              <li key={order.id} className="rounded-2xl bg-white p-6 shadow">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-[#101D35]">
                      Commande {order.id}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <p className="font-bold text-[#101D35]">
                    {Number(order.total).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>

                <div className="mt-4 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
                  <div>
                    <p className="font-semibold">{order.customer_name}</p>
                    <p>{order.phone}</p>
                    <p className="mt-1 whitespace-pre-line">
                      {order.shipping_address}
                    </p>
                  </div>
                  <div>
                    <label className="flex flex-wrap items-center gap-2">
                      Paiement
                      <select
                        value={order.payment_status}
                        disabled={updatingOrderId === order.id}
                        onChange={(event) => updatePaymentStatus(order.id, event.target.value as PaymentStatus)}
                        className="rounded border p-2"
                      >
                        {paymentStatuses.map((paymentStatus) => (
                          <option key={paymentStatus.value} value={paymentStatus.value}>
                            {paymentStatus.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="mt-3 flex items-center gap-2">
                      Statut
                      <select
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onChange={(event) =>
                          updateStatus(order.id, event.target.value as OrderStatus)
                        }
                        className="rounded border p-2"
                      >
                        {[order.status, ...allowedNextStatuses[order.status]].map(
                          (statusValue) => {
                            const status = statuses.find(
                              (item) => item.value === statusValue
                            );
                            if (!status) return null;

                            return (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                            );
                          }
                        )}
                      </select>
                    </label>
                  </div>
                </div>

                <ul className="mt-4 border-t border-[#E9DFC9] pt-3 text-sm text-gray-700">
                  {order.order_items.map((item, index) => (
                    <li key={`${order.id}-${index}`} className="py-1">
                      {item.product_title} × {item.quantity} —{" "}
                      {Number(item.unit_price).toLocaleString("fr-FR")} FCFA
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
