"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartLink({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const { itemCount } = useCart();
  const colors =
    variant === "light"
      ? "border-[#D8C9A8] text-[#263D5B] hover:border-[#8A6A39] hover:bg-[#F8F5EF] hover:text-[#8A6A39] focus-visible:outline-[#8A6A39]"
      : "border-white/20 text-[#F5E6C8] hover:border-[#D5BD91] hover:bg-white/5 hover:text-[#D5BD91] focus-visible:outline-[#D5BD91]";

  return (
    <Link
      href="/panier"
      aria-label={`Panier${itemCount > 0 ? `, ${itemCount} article${itemCount > 1 ? "s" : ""}` : ", vide"}`}
      className={`relative inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 ${colors}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 4h2l2.1 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
      <span className="hidden sm:inline">Panier</span>
      {itemCount > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#D5BD91] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#101D35]">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
