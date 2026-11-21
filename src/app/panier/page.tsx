
"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/lib/cart-context";

type OrderConfirmation = {
  orderId: string;
  total: number;
};

export default function PanierPage() {
  const {
    items,
    total,
    isReady,
    storageError,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);
  const [orderConfirmation, setOrderConfirmation] =
    useState<OrderConfirmation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function confirmWhatsAppOrder() {
    setMessage("");

    if (!customerName.trim() || !phone.trim() || !shippingAddress.trim()) {
      setMessage(
        "Veuillez remplir votre nom, votre téléphone et votre adresse avant de continuer."
      );
      return;
    }

    if (items.length === 0) {
      setMessage("Votre panier est vide.");
      return;
    }

    const orderDetails = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.title}
   Quantité : ${item.quantity}
   Prix unitaire : ${Number(item.price).toLocaleString("fr-FR")} FCFA
   Sous-total : ${(item.price * item.quantity).toLocaleString("fr-FR")} FCFA`
      )
      .join("\n\n");

    const whatsappMessage = `
Bonjour KËR KHADIM !

Je souhaite confirmer ma commande.

CLIENT
Nom : ${customerName}
Téléphone : ${phone}
Adresse de livraison : ${shippingAddress}

MA COMMANDE
${orderDetails}

TOTAL : ${total.toLocaleString("fr-FR")} FCFA

Merci de me confirmer la disponibilité et les modalités de livraison.

Cordialement.
`;

    const whatsappUrl = `https://wa.me/221789846525?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setLoginRequired(false);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ productId, quantity }) => ({
            productId,
            quantity,
          })),
          customerName,
          phone,
          shippingAddress,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        code?: string;
        orderId?: string;
        total?: number;
      };

      if (!response.ok) {
        setMessage(result.error || "La commande n'a pas pu être enregistrée.");
        setLoginRequired(result.code === "AUTH_REQUIRED");
        return;
      }

      if (
        typeof result.orderId !== "string" ||
        typeof result.total !== "number"
      ) {
        setMessage("La réponse du serveur est invalide.");
        return;
      }

      setOrderConfirmation({
        orderId: result.orderId,
        total: result.total,
      });
      clearCart();
    } catch (error) {
      console.error("Impossible d'envoyer la commande.", error);
      setMessage("Une erreur réseau a empêché l'envoi de la commande.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFEFA]">
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold text-[#101D35]">Mon panier</h1>

        {storageError && (
          <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {storageError}
          </p>
        )}

        {orderConfirmation ? (
          <div className="mt-8 rounded-2xl border border-[#D5BD91] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#101D35]">
              Commande enregistrée
            </h2>
            <p className="mt-3 text-gray-700">
              Référence :{" "}
              <span className="font-semibold">
                {orderConfirmation.orderId}
              </span>
            </p>
            <p className="mt-2 text-gray-700">
              Total confirmé :{" "}
              <span className="font-semibold">
                {Number(orderConfirmation.total).toLocaleString("fr-FR")} FCFA
              </span>
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Le paiement n’a pas été effectué. Nous vous contacterons pour
              confirmer la livraison.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block font-semibold text-[#8A6A39] hover:underline"
            >
              Retourner à la boutique
            </Link>
          </div>
        ) : !isReady ? (
          <p className="mt-8 text-gray-600">Chargement du panier...</p>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E9DFC9] bg-white p-10 text-center shadow-sm">
            <p className="text-lg text-gray-600">Votre panier est vide.</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-[#101D35] px-6 py-3 font-semibold text-white hover:bg-[#263D5B]"
            >
              Découvrir les livres
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 rounded-xl border border-[#E9DFC9] bg-white p-3 shadow-sm sm:gap-4 sm:p-4"
                >
                  {item.imageUrl ? (
                    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded bg-[#F5E6C8]">
                      <Image
                        src={item.imageUrl}
                        alt={`Couverture de ${item.title}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ) : item.videoUrl ? (
                    <video
                      src={item.videoUrl}
                      aria-label={`Vidéo de couverture de ${item.title}`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="h-28 w-20 shrink-0 rounded bg-[#F5E6C8] object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded bg-[#F5E6C8] text-center text-xs text-[#101D35]">
                      Aucun visuel
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/livres/${item.slug}`}
                      className="font-semibold text-[#101D35] hover:underline"
                    >
                      {item.title}
                    </Link>

                    <p className="mt-2 text-sm text-gray-600">
                      {Number(item.price).toLocaleString("fr-FR")} FCFA
                    </p>

                    <label className="mt-3 flex items-center gap-2 text-sm">
                      Quantité
                      <input
                        type="number"
                        min={1}
                        max={item.stock}
                        value={item.quantity}
                        onChange={(event) => {
                          const quantity = Number(event.target.value);
                          if (Number.isInteger(quantity) && quantity > 0) {
                            updateQuantity(item.productId, quantity);
                          }
                        }}
                        className="w-20 rounded border border-[#D5BD91] p-1 text-center"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="mt-3 text-sm text-red-700 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>

                  <p className="shrink-0 text-right text-sm font-semibold text-[#101D35]">
                    {(item.price * item.quantity).toLocaleString("fr-FR")} FCFA
                  </p>
                </li>
              ))}
            </ul>

            <form
              onSubmit={submitOrder}
              className="h-fit space-y-4 rounded-xl border border-[#E9DFC9] bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-bold text-[#101D35]">
                Livraison et commande
              </h2>

              <p className="text-sm text-gray-600">
                Renseignez vos coordonnées pour envoyer votre commande par
                WhatsApp.
              </p>

              <div>
                <label
                  htmlFor="customer-name"
                  className="mb-1 block text-sm font-semibold"
                >
                  Nom complet
                </label>
                <input
                  id="customer-name"
                  required
                  maxLength={200}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label
                  htmlFor="customer-phone"
                  className="mb-1 block text-sm font-semibold"
                >
                  Téléphone
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  required
                  maxLength={40}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label
                  htmlFor="shipping-address"
                  className="mb-1 block text-sm font-semibold"
                >
                  Adresse de livraison
                </label>
                <textarea
                  id="shipping-address"
                  required
                  maxLength={1000}
                  rows={3}
                  value={shippingAddress}
                  onChange={(event) =>
                    setShippingAddress(event.target.value)
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div className="border-t border-[#E9DFC9] pt-4">
                <p className="flex justify-between font-bold text-[#101D35]">
                  <span>Total estimé</span>
                  <span>{total.toLocaleString("fr-FR")} FCFA</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Le montant final sera vérifié lors de la confirmation.
                </p>
              </div>

              {message && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={confirmWhatsAppOrder}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] p-3 font-bold text-white transition hover:bg-[#1DA851]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.48 0 .13 5.35.13 11.92c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.78 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.46-8.43ZM12.06 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.23-.37a9.87 9.87 0 0 1-1.52-5.26c0-5.46 4.44-9.9 9.9-9.9a9.84 9.84 0 0 1 7.01 2.9 9.84 9.84 0 0 1 2.9 7.01c0 5.46-4.44 9.9-9.92 9.9Zm5.43-7.41c-.3-.15-1.77-.87-2.05-.97-.28-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.7.64.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                </svg>
                Confirmer la commande par WhatsApp
              </button>

              <p className="text-center text-xs text-gray-500">
                WhatsApp s'ouvrira avec votre commande prête à être envoyée.
              </p>

              <div className="border-t border-[#E9DFC9] pt-4">
                <p className="mb-3 text-center text-xs text-gray-500">
                  Ou enregistrer la commande sur le site (connexion requise).
                </p>

                {loginRequired && (
                  <Link
                    href="/connexion"
                    className="mb-3 block text-sm font-semibold text-[#8A6A39] underline"
                  >
                    Se connecter ou créer un compte pour continuer
                  </Link>
                )}

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="w-full rounded-lg bg-[#101D35] p-3 font-bold text-white hover:bg-[#263D5B] disabled:opacity-50"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer sur le site"}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
