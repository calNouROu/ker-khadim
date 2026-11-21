
"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      aria-label="Retourner en haut de la page"
      title="Retour en haut"
      className="fixed bottom-6 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#D5BD91] bg-[#101D35] text-2xl font-bold text-[#D5BD91] shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#263D5B] sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
    >
      ↑
    </button>
  );
}
