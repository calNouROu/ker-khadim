
"use client";

import Link from "next/link";

export default function HomeButton() {
  return (
    <Link
      href="/"
      aria-label="Retour à l'accueil"
      title="Accueil"
      className="fixed bottom-[92px] right-5 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-[#B08D57] bg-gradient-to-br from-[#F5E6C8] to-[#C5A46D] text-[#101D35] shadow-lg shadow-[#B08D57]/30 transition duration-300 hover:-translate-y-1 hover:scale-105 hover:from-[#FFF1D6] hover:to-[#D5BD91]"
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
