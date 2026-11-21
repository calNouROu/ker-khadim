
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
      className="fixed bottom-[164px] right-5 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-[#B08D57] bg-gradient-to-br from-[#F5E6C8] to-[#C5A46D] text-2xl font-bold text-[#101D35] shadow-lg shadow-[#B08D57]/30 transition duration-300 hover:-translate-y-1 hover:scale-105 hover:from-[#FFF1D6] hover:to-[#D5BD91]"
    >
      ↑
    </button>
  );
}
