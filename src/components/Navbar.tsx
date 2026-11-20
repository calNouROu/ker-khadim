"use client";

import Link from "next/link";
import { useState } from "react";
import CartLink from "@/components/CartLink";


const navigation = [
  { label: "Accueil", href: "/" },
  { label: "Xassidas", href: "/xassidas" },
  { label: "Accessoires", href: "/accessoires" },
  { label: "Parfumerie", href: "/parfumerie" },
  { label: "Vidéos", href: "/videos" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contacter", href: "/contact" },
];


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-navbar sticky top-0 z-50 border-b border-[#D5BD91]/30 bg-[#101D35] text-[#F8FAFC] shadow-sm shadow-black/10">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex shrink-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5BD91]"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B08D57]/70 bg-[#101D35] font-serif text-sm font-bold text-[#F5E6C8] shadow-sm"
          >
            KK
          </span>
          <span>
            <span className="site-navbar-brand-title block font-serif text-lg font-semibold tracking-[0.12em] text-[#F8FAFC]">
              KËR KHADIM
            </span>
            <span className="site-navbar-tagline hidden text-[10px] tracking-wide text-[#CBD5E1] sm:block">
              Librairie de savoir et de transmission
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-5 lg:flex xl:gap-7"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-navbar-link whitespace-nowrap text-sm text-[#F8FAFC] transition hover:text-[#D5BD91] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5BD91]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <CartLink variant="dark" />
          <Link
            href="/compte"
            className="navbar-account-link hidden whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5BD91] lg:inline-flex"
          >
            Mon compte
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="site-navbar-menu-toggle inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D5BD91]/60 text-[#F8FAFC] transition hover:border-[#D5BD91] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5BD91] lg:hidden"
          >
            {menuOpen ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navigation mobile"
          className="site-navbar-mobile-menu border-t border-[#D5BD91]/25 bg-[#152A45] px-5 pb-5 pt-3 shadow-lg lg:hidden"
        >
          <ul className="mx-auto max-w-7xl">
            {navigation.map((item) => (
              <li
                key={item.href}
                className="border-b border-[#D5BD91]/20 last:border-0"
              >
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className="site-navbar-link block py-3 text-sm text-[#F8FAFC] transition hover:text-[#D5BD91] focus-visible:outline-2 focus-visible:outline-[#D5BD91]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <Link
                href="/compte"
                onClick={closeMenu}
                className="navbar-mobile-account inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold"
              >
                Mon compte
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
