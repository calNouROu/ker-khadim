"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Book } from "@/lib/catalog";

const LIBRARY_IMAGE = "/images/ker-khadim-library-background.jpeg";

type FeaturedProduct = Book & { featuredCategory: string };

export default function FeaturedBookSpotlight({ books }: { books: FeaturedProduct[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || books.length < 2) return;

    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % books.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [books.length, isPaused]);

  const currentBook = books[currentIndex] ?? null;

  return (
    <Link
      href={currentBook ? "/livres/" + currentBook.slug : "/ouvrages"}
      aria-label={
        currentBook
          ? "À la une, " + currentBook.featuredCategory + " : " + currentBook.title + ". Ouvrir la fiche."
          : "Parcourir la bibliothèque KËR KHADIM"
      }
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="group relative min-h-[27rem] overflow-hidden rounded-[2rem] border border-[#D5BD91]/40 bg-[#0B1829] shadow-[0_16px_40px_rgba(16,29,53,0.14)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(16,29,53,0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8A6A39] sm:min-h-[34rem] lg:min-h-[40rem]"
    >
      {currentBook?.image_url ? (
        <Image
          key={currentBook.id}
          src={currentBook.image_url}
          alt={`Visuel de ${currentBook.title}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 46vw"
          className="animate-fade-in object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : currentBook?.video_url ? (
        <video
          key={currentBook.id}
          src={currentBook.video_url}
          aria-label={`Vidéo de présentation de ${currentBook.title}`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <Image
          src={LIBRARY_IMAGE}
          alt="Intérieur de la bibliothèque KËR KHADIM"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 46vw"
          className="animate-fade-in object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#081426] via-[#081426]/35 to-[#081426]/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 rounded-[1.35rem] border border-white/20"
      />
      <span className="absolute left-7 top-7 inline-flex items-center rounded-full border border-white/25 bg-[#0B1829]/55 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F1D7A7] backdrop-blur sm:left-9 sm:top-9">
        {currentBook ? `À la une · ${currentBook.featuredCategory}` : "À la une"}
      </span>
      {books.length > 1 && (
        <span
          aria-hidden="true"
          className="absolute right-7 top-7 rounded-full border border-white/20 bg-[#0B1829]/55 px-3 py-2 text-[10px] font-semibold tracking-[0.14em] text-white/90 backdrop-blur sm:right-9 sm:top-9"
        >
          {String(currentIndex + 1).padStart(2, "0")}
          <span className="mx-1.5 text-[#D5BD91]">/</span>
          {String(books.length).padStart(2, "0")}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
        <h3 className="line-clamp-2 font-serif text-2xl font-semibold leading-tight text-white sm:text-3xl">
          {currentBook?.title ?? "La bibliothèque KËR KHADIM"}
        </h3>
        <div className="mt-5 flex items-center justify-between gap-4 text-sm font-semibold text-[#F1D7A7]">
          <span>
            {currentBook
              ? "Découvrir le produit"
              : "Parcourir la bibliothèque"}
          </span>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#D5BD91]/50 transition-colors group-hover:bg-[#D5BD91]/15">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
