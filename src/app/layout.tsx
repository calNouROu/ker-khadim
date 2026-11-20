import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart-context";
import ThemeToggle from "@/components/ThemeToggle";
import VisitorTracker from "@/components/VisitorTracker";
import "./globals.css";
import "./theme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KËR KHADIM — Librairie des écrits de Serigne Touba",
  description:
    "Découvrez les Xassidas et les ouvrages de Cheikh Ahmadou Bamba dans la bibliothèque en ligne KËR KHADIM.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          <VisitorTracker />
        </CartProvider>
        <ThemeToggle />
      </body>
    </html>
  );
}


