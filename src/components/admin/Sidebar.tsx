"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BookOpenIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: "Tableau de bord",
    href: "/admin",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    name: "Ouvrages",
    href: "/admin/ouvrages",
    icon: <BookOpenIcon className="h-5 w-5" />,
  },
  {
    name: "Accessoires",
    href: "/admin/accessoires",
    icon: <ShoppingBagIcon className="h-5 w-5" />,
  },
  {
    name: "Parfumerie",
    href: "/admin/parfumerie",
    icon: <SparklesIcon className="h-5 w-5" />,
  },
  {
    name: "Commandes",
    href: "/admin/commandes",
    icon: <ShoppingCartIcon className="h-5 w-5" />,
  },
  {
    name: "Clients",
    href: "/admin/clients",
    icon: <UsersIcon className="h-5 w-5" />,
  },
  {
    name: "Paramètres",
    href: "/admin/parametres",
    icon: <Cog6ToothIcon className="h-5 w-5" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#4B3022] p-4 text-[#F8F0E4]">
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
          className="mb-5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#F8F0E4] transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          Retourner au site
        </Link>
        © {new Date().getFullYear()} KËR KHADIM
        <p className="mt-1">Tous droits réservés.</p>
      </footer>
    </aside>
  );
}
