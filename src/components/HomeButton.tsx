
"use client";

import Link from "next/link";

export default function HomeButton() {
  return (
    <Link
      href="/"
      aria-label="Retour à l'accueil"
      title="Accueil"
      className="fixed bottom-6 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#D5BD91] bg-[#101D35] text-[#D5BD91] shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#263D5B] sm:bottom-8 sm:left-8 sm:h-14 sm:w-14"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9" />
        <path d="M9 21v-8h6v8" />
      </svg>
    </Link>
  );
}
