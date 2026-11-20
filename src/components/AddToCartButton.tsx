"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

type Props = {
  compact?: boolean;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    videoUrl?: string | null;
  };
};

export default function AddToCartButton({ product, compact = false }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  function handleAdd() {
    const added = addItem(
      {
        productId: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        videoUrl: product.videoUrl || null,
      },
      quantity
    );
    setMessage(
      added
        ? "Le livre a été ajouté à votre panier."
        : "La quantité demandée n'est pas disponible."
    );
  }

  return (
    <div className={compact ? "min-w-0" : "mt-8"}>
      {!compact && product.stock > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="book-quantity" className="text-sm font-semibold">
            Quantité
          </label>
          <input
            id="book-quantity"
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(event) => {
              const nextQuantity = Number(event.target.value);
              if (Number.isInteger(nextQuantity)) {
                setQuantity(
                  Math.min(Math.max(1, nextQuantity), product.stock)
                );
              }
            }}
            className="w-20 rounded-lg border border-[#D5BD91] bg-white p-2 text-center"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={product.stock <= 0}
        className={
          compact
            ? "add-to-cart-button inline-flex min-h-11 w-full whitespace-nowrap items-center justify-center gap-1 rounded-full bg-[#101D35] px-2 text-xs font-semibold text-white transition hover:bg-[#263D5B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A6A39] disabled:cursor-not-allowed disabled:border disabled:border-[#94A3B8] disabled:bg-[#CBD5E1] disabled:text-[#101D35] disabled:opacity-100 disabled:hover:bg-[#CBD5E1]"
            : "add-to-cart-button w-full rounded-lg bg-[#101D35] px-8 py-4 font-bold text-white hover:bg-[#263D5B] disabled:cursor-not-allowed disabled:border disabled:border-[#94A3B8] disabled:bg-[#CBD5E1] disabled:text-[#101D35] disabled:opacity-100 disabled:hover:bg-[#CBD5E1]"
        }
      >
        {compact && product.stock > 0 && (
          <span aria-hidden="true" className="text-base leading-none">
            +
          </span>
        )}
        {product.stock > 0
          ? "Ajouter au panier"
          : compact
            ? "Épuisé"
            : "Indisponible"}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={
          compact
            ? "mt-1 min-h-4 text-center text-xs text-[#263D5B]"
            : "mt-3 min-h-5 text-sm text-[#263D5B]"
        }
      >
        {message}
      </p>
    </div>
  );
}
