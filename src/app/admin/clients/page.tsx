"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadClients() {
      if (!supabase) {
        setMessage("Configuration Supabase manquante.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .eq("role", "customer")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("Impossible de charger les clients : " + error.message);
      } else {
        setClients(data || []);
      }

      setLoading(false);
    }

    loadClients();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#A18455]">KËR KHADIM / ADMINISTRATION</p>
        <h1 className="mt-2 text-3xl font-bold text-[#4B3022]">
          Gestion des clients
        </h1>
        <p className="mt-2 text-sm text-[#88796B]">
          Consultez les comptes de vos clients.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E8DDCE] bg-white p-5">
        <h2 className="mb-4 font-semibold text-[#4B3022]">
          Liste des clients ({clients.length})
        </h2>

        {message && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {message}
          </p>
        )}

        {loading ? (
          <p className="py-8 text-center text-gray-500">
            Chargement des clients...
          </p>
        ) : clients.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            Aucun client enregistré.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="bg-[#FAF6EF] text-[#786B5D]">
                <tr>
                  <th className="p-4">Nom complet</th>
                  <th className="p-4">Téléphone</th>
                  <th className="p-4">Inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E9DF]">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="p-4 font-medium text-[#4B3022]">
                      {client.full_name || "Sans nom"}
                    </td>
                    <td className="p-4 text-gray-600">
                      {client.phone || "Non renseigné"}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(client.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}