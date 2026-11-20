"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";

export type VideoBook = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  video_url: string;
};

function VideoEntry({ book }: { book: VideoBook }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.55, 1] }
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  return (
    <article className="grid items-center gap-6 md:grid-cols-[minmax(17rem,360px)_minmax(0,1fr)] md:gap-12">
      <div className="relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#071321] shadow-2xl shadow-[#101D35]/20">
        <video
          ref={videoRef}
          src={book.video_url}
          poster={book.image_url || undefined}
          aria-label={"Vidéo de présentation de " + book.title}
          controls
          muted
          loop
          playsInline
          preload="none"
          onError={() => setVideoError(true)}
          className="h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/20 bg-[#071321]/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5E6C8] backdrop-blur">
          Présentation
        </span>
        {videoError && (
          <p role="status" className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-xl bg-[#071321]/90 p-4 text-center text-sm text-white">
            Cette vidéo ne peut pas être lue. Vérifiez son lien dans l’administration.
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-[#E8E2D6] bg-white p-6 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8A6A39]">
          À découvrir
        </p>
        <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#101D35] sm:text-4xl">
          {book.title}
        </h2>
        <p className="mt-4 leading-7 text-[#52627A]">
          {book.description || "Découvrez cet ouvrage de la bibliothèque KËR KHADIM."}
        </p>

        <p className="mt-7 text-2xl font-bold text-[#101D35]">
          {Number(book.price).toLocaleString("fr-FR")} FCFA
        </p>
        <p className="mt-2 text-sm text-[#64748B]">
          {book.stock > 0
            ? `${book.stock} exemplaire${book.stock > 1 ? "s" : ""} disponible${book.stock > 1 ? "s" : ""}`
            : "Rupture de stock"}
        </p>

        <div className="mt-6">
          <AddToCartButton
            compact
            product={{
              id: book.id,
              title: book.title,
              slug: book.slug,
              price: Number(book.price),
              stock: book.stock,
              imageUrl: book.image_url,
              videoUrl: book.video_url,
            }}
          />
        </div>
        <Link
          href={`/livres/${book.slug}`}
          className="mt-5 inline-flex rounded text-sm font-semibold text-[#8A6A39] transition hover:text-[#101D35] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8A6A39]"
        >
          Voir la fiche de l’ouvrage
        </Link>
      </div>
    </article>
  );
}

export default function VideoFeed({ books }: { books: VideoBook[] }) {
  return (
    <div className="space-y-14 md:space-y-20">
      {books.map((book) => (
        <VideoEntry key={book.id} book={book} />
      ))}
    </div>
  );
}
