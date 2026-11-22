
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  HomeIcon,
  BookOpenIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: "Tableau de bord", href: "/admin", icon: <HomeIcon className="h-5 w-5" /> },
  { name: "Ouvrages", href: "/admin/ouvrages", icon: <BookOpenIcon className="h-5 w-5" /> },
  { name: "Accessoires", href: "/admin/accessoires", icon: <ShoppingBagIcon className="h-5 w-5" /> },
  { name: "Parfumerie", href: "/admin/parfumerie", icon: <SparklesIcon className="h-5 w-5" /> },
  { name: "Commandes", href: "/admin/commandes", icon: <ShoppingCartIcon className="h-5 w-5" /> },
  { name: "Clients", href: "/admin/clients", icon: <UsersIcon className="h-5 w-5" /> },
  { name: "Paramètres", href: "/admin/parametres", icon: <Cog6ToothIcon className="h-5 w-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  const renderNavigation = () => (
    <>
      <div className="mb-8 border-b border-white/10 pb-6">
        <h2 className="text-2xl font-bold text-[#D8B46A]">
          KËR KHADIM
        </h2>
        <p className="mt-1 text-xs text-white/50">
          Administration
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" &&
              pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#D8B46A] text-[#4B3022] shadow-md"
                  : "text-[#F8F0E4] hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <footer className="border-t border-white/10 pt-5 text-xs text-white/50">
        <Link
          href="/"
          className="mb-5 flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-[#F8F0E4] transition hover:bg-white/10"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Retourner au site
        </Link>
        © {new Date().getFullYear()} KËR KHADIM
        <p className="mt-1">Tous droits réservés.</p>
      </footer>
    </>
  );

  return (
    <>
      {/* SIDEBAR ORDINATEUR */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col bg-[#4B3022] p-4 text-[#F8F0E4] md:flex md:sticky md:top-0">
        {renderNavigation()}
      </aside>

      {/* BARRE MOBILE */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#E8DDCE] bg-[#FFFEFA] px-4 shadow-sm md:hidden">
        <div>
          <p className="text-lg font-bold text-[#8A6A39]">
            KËR KHADIM
          </p>
          <p className="text-[10px] text-[#88796B]">
            Administration
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4B3022] text-[#D8B46A] shadow-sm"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* FOND DU MENU */}
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
        />
      )}

      {/* MENU MOBILE */}
      <aside
        aria-label="Navigation administrateur"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-[60] flex w-[280px] max-w-[85vw] flex-col overflow-y-auto bg-[#4B3022] p-4 text-[#F8F0E4] shadow-2xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-widest text-[#D8B46A]">
            MENU ADMIN
          </span>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {renderNavigation()}
      </aside>
    </>
  );
}
