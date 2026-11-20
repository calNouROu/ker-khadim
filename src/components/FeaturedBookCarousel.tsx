"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Book } from "@/lib/catalog";

export default function FeaturedBookCarousel({ books }: { books: Book[] }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstBookWithCover = books.findIndex(
      (book) => book.image_url || book.video_url
    );
    return firstBookWithCover >= 0 ? firstBookWithCover : 0;
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const currentBook = books.length ? books[currentIndex % books.length] : null;
  const previousBook =
    books.length > 1
      ? books[(currentIndex - 1 + books.length) % books.length]
      : null;
  const nextBook =
    books.length > 1 ? books[(currentIndex + 1) % books.length] : null;

  useEffect(() => {
    if (!isPlaying || books.length < 2) return;

    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % books.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [books.length, isPlaying]);

  const currentLabel = books.length
    ? String((currentIndex % books.length) + 1).padStart(2, "0")
    : "00";
  const totalLabel = String(books.length).padStart(2, "0");

  return (
    <div
      role="group"
      aria-label="Sélection tournante des ouvrages KËR KHADIM"
      className="relative mx-auto flex h-[380px] w-full max-w-[440px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-[#D5BD91]/35 bg-[#0B1829] px-5 py-6 shadow-2xl sm:h-[480px] sm:rounded-[2.25rem] sm:px-8 sm:py-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(213,189,145,0.14),transparent_52%),linear-gradient(145deg,#13243B_0%,#091625_100%)]"
      />
      <div
        aria-hidden="true"
        className="book-carousel-halo pointer-events-none absolute left-1/2 top-[40%] aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D5BD91]/10"
      />

      <div className="relative z-10 mb-3 flex w-full max-w-[340px] items-center justify-between sm:mb-4">
        <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D5BD91] sm:text-[10px]">
          La bibliothèque KËR KHADIM
        </span>
        <div className="flex items-center gap-2">
          <span className="font-serif text-sm tabular-nums text-[#D5BD91]/80">
            {currentLabel} / {totalLabel}
          </span>
          {books.length > 1 && (
            <button
              type="button"
              onClick={() => setIsPlaying((playing) => !playing)}
              aria-label={isPlaying ? "Mettre le défilement en pause" : "Reprendre le défilement"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D5BD91]/40 text-[#F5E6C8] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5BD91]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="currentColor"
              >
                {isPlaying ? (
                  <>
                    <path d="M7 5h3v14H7z" />
                    <path d="M14 5h3v14h-3z" />
                  </>
                ) : (
                  <path d="M8 5v14l11-7z" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="book-carousel-stage relative z-10 h-[220px] w-[260px] shrink-0 sm:h-[300px] sm:w-[340px]">
        {previousBook && (
          <div className="book-carousel-side book-carousel-side-left absolute bottom-1 left-0 h-[190px] w-[132px] overflow-hidden rounded-xl border border-white/20 bg-[#172947] opacity-75 shadow-xl sm:bottom-3 sm:h-[270px] sm:w-[185px]">
            {previousBook.image_url ? (
              <Image
                src={previousBook.image_url}
                alt=""
                fill
                sizes="(max-width: 640px) 132px, 185px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-end bg-gradient-to-br from-[#263D5B] to-[#101D35] p-3 font-serif text-xs text-[#F5E6C8]">
                {previousBook.title}
              </div>
            )}
          </div>
        )}

        {nextBook && (
          <div className="book-carousel-side book-carousel-side-right absolute bottom-1 right-0 h-[190px] w-[132px] overflow-hidden rounded-xl border border-white/20 bg-[#172947] opacity-75 shadow-xl sm:bottom-3 sm:h-[270px] sm:w-[185px]">
            {nextBook.image_url ? (
              <Image
                src={nextBook.image_url}
                alt=""
                fill
                sizes="(max-width: 640px) 132px, 185px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-end bg-gradient-to-br from-[#263D5B] to-[#101D35] p-3 font-serif text-xs text-[#F5E6C8]">
                {nextBook.title}
              </div>
            )}
          </div>
        )}

        <div className="book-carousel-center absolute left-1/2 top-1/2 z-20 h-[220px] w-[156px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-white/30 bg-gradient-to-br from-[#263D5B] to-[#101D35] shadow-[0_30px_58px_rgba(0,0,0,0.56)] sm:h-[300px] sm:w-[215px]">
          {currentBook?.image_url ? (
            <Image
              key={currentBook.id}
              src={currentBook.image_url}
              alt={`Couverture de ${currentBook.title}`}
              fill
              sizes="(max-width: 640px) 156px, 215px"
              loading="eager"
              className="animate-fade-in object-cover"
            />
          ) : currentBook?.video_url ? (
            <video
              key={currentBook.id}
              src={currentBook.video_url}
              aria-label={`Vidéo de couverture de ${currentBook.title}`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="animate-fade-in h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#263D5B] via-[#172947] to-[#101D35] px-4 text-center text-[#F5E6C8]">
              <span className="font-serif text-lg tracking-[0.16em] sm:text-xl">
                KËR KHADIM
              </span>
              <span className="mt-3 text-[8px] uppercase tracking-[0.24em] text-[#D5BD91]">
                Bibliothèque de savoir
              </span>
              {currentBook && (
                <span className="mt-5 line-clamp-3 font-serif text-xs text-[#E8E2D6]">
                  {currentBook.title}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {currentBook ? (
        <Link
          href={`/livres/${currentBook.slug}`}
          className="relative z-10 mt-4 flex min-h-14 w-full max-w-[340px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#13243B]/90 px-4 py-3 text-left shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-[#D5BD91]/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5BD91]"
        >
          <span className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-[#D5BD91]">
              À la une
            </span>
            <span className="mt-1 block truncate font-serif text-sm font-semibold text-[#FFFEFA]">
              {currentBook.title}
            </span>
          </span>
          <span aria-hidden="true" className="text-lg text-[#D5BD91]">
            ↗
          </span>
        </Link>
      ) : (
        <div className="relative z-10 mt-4 flex min-h-14 w-full max-w-[340px] items-center justify-center rounded-2xl border border-white/10 bg-[#13243B]/90 px-4 py-3 text-center text-xs font-medium tracking-wide text-[#E8E2D6]">
          Des écrits à transmettre
        </div>
      )}
    </div>
  );
}
