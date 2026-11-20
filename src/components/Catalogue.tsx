"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";

type Book = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string | null;
};

type Category = {
  id: string;
  name: string;
};

function isXassida(categoryName: string) {
  return /xassida|khassida/i.test(categoryName);
}

function BookCard({ book, categoryName }: { book: Book; categoryName: string }) {
  const formattedPrice = Number(book.price).toLocaleString("fr-FR");

  return (
    <article className="catalogue-product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8E2D6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/livres/${book.slug}`}
        aria-label={`Voir le livre ${book.title}`}
        className="relative block aspect-[5/6] overflow-hidden bg-[#F5E6C8] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#8A6A39]"
      >
        {book.image_url ? (
          <Image
            src={book.image_url}
            alt={`Couverture de ${book.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="catalogue-cover-placeholder flex h-full items-center justify-center bg-gradient-to-br from-[#F5E6C8] to-[#E8DCC2] text-sm font-medium text-[#52627A]">
            Couverture indisponible
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-[#D5BD91]/60 bg-[#101D35]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#F5E6C8] shadow-sm backdrop-blur">
          {categoryName}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/livres/${book.slug}`}
          className="catalogue-product-title font-serif text-lg font-semibold leading-snug text-[#101D35] transition hover:text-[#8A6A39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A6A39]"
        >
          {book.title}
        </Link>
        <p className="catalogue-product-description mt-2 line-clamp-2 min-h-12 break-words text-sm leading-6 text-[#64748B]">
          {book.description || "Un ouvrage à découvrir dans la bibliothèque KËR KHADIM."}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="catalogue-product-price text-lg font-bold text-[#101D35]">
            {formattedPrice}{" "}
            <span className="text-xs font-semibold tracking-wide text-[#64748B]">
              FCFA
            </span>
          </p>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              book.stock > 0 ? "text-emerald-800" : "text-[#9B3434]"
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${
                book.stock > 0 ? "bg-emerald-600" : "bg-[#9B3434]"
              }`}
            />
            {book.stock > 0 ? "Disponible" : "Épuisé"}
          </span>
        </div>
        <div className="mt-4">
          <AddToCartButton
            compact
            product={{
              id: book.id,
              title: book.title,
              slug: book.slug,
              price: Number(book.price),
              stock: book.stock,
              imageUrl: book.image_url,
            }}
          />
        </div>
      </div>
    </article>
  );
}

export default function Catalogue({
  books,
  categories,
}: {
  books: Book[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");
  const filteredBooks = useMemo(
    () =>
      books.filter((book) => {
        const matchesCategory =
          selectedCategory === "all" ||
          book.category_id === selectedCategory;
        const matchesQuery =
          !normalizedQuery ||
          `${book.title} ${book.description || ""}`
            .toLocaleLowerCase("fr")
            .includes(normalizedQuery);

        return matchesCategory && matchesQuery;
      }),
    [books, normalizedQuery, selectedCategory]
  );
  const xassidaCategories = categories.filter((category) =>
    isXassida(category.name)
  );
  const otherCategories = categories.filter(
    (category) => !isXassida(category.name)
  );

  useEffect(() => {
    function handleHash() {
      if (typeof window !== "undefined" && window.location.hash === "#xassidas") {
        setSelectedCategory((prev) => {
          const isXassidaCat = xassidaCategories.some((c) => c.id === prev);
          return prev === "all" || isXassidaCat ? prev : "all";
        });
      }
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [xassidaCategories]);
  const uncategorizedBooks = filteredBooks.filter(
    (book) =>
      !book.category_id ||
      !categories.some((category) => category.id === book.category_id)
  );
  const xassidaCount = xassidaCategories.reduce(
    (total, category) =>
      total +
      filteredBooks.filter((book) => book.category_id === category.id).length,
    0
  );
  const otherCount =
    otherCategories.reduce(
      (total, category) =>
        total +
        filteredBooks.filter((book) => book.category_id === category.id).length,
      0
    ) + uncategorizedBooks.length;
  const emptyGroupMessage =
    books.length === 0
      ? "Aucun ouvrage n’est actuellement publié dans le catalogue."
      : selectedCategory !== "all" || normalizedQuery
        ? "Aucun ouvrage ne correspond à votre recherche dans cette sélection."
        : "Aucun ouvrage n’est actuellement publié dans cette sélection.";

  function renderCategoryBooks(category: Category) {
    const categoryBooks = filteredBooks.filter(
      (book) => book.category_id === category.id
    );
    if (categoryBooks.length === 0) return null;

    return (
      <div key={category.id} id={`categorie-${category.id}`} className="scroll-mt-24">
        <h4 className="mb-5 text-lg font-semibold text-[#263D5B]">
          {category.name}
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoryBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              categoryName={category.name}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 grid gap-4 rounded-2xl border border-[#E8E2D6] bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-5">
        <div>
          <label htmlFor="book-search" className="sr-only">
            Rechercher un livre
          </label>
          <input
            id="book-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un titre ou un ouvrage..."
            className="min-h-12 w-full rounded-xl border border-[#D8C9A8] bg-[#FFFEFA] px-4 text-[#101D35] outline-none transition placeholder:text-[#8993A2] focus:border-[#8A6A39] focus:ring-2 focus:ring-[#D5BD91]/40"
          />
        </div>
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Filtrer par catégorie
          </legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              aria-pressed={selectedCategory === "all"}
              className={`catalogue-filter-button min-h-10 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A6A39] ${
                selectedCategory === "all"
                  ? "catalogue-filter-button-active bg-[#101D35] text-white"
                  : "catalogue-filter-button-inactive border border-[#E8DCC2] bg-[#FFFEFA] text-[#263D5B] hover:bg-[#F8F5EF]"
              }`}
            >
              Toutes
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={selectedCategory === category.id}
                className={`catalogue-filter-button min-h-10 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A6A39] ${
                  selectedCategory === category.id
                    ? "catalogue-filter-button-active bg-[#101D35] text-white"
                    : "catalogue-filter-button-inactive border border-[#E8DCC2] bg-[#FFFEFA] text-[#263D5B] hover:bg-[#F8F5EF]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="mb-6 text-sm text-[#64748B]" aria-live="polite">
        {filteredBooks.length}{" "}
        {filteredBooks.length === 1 ? "ouvrage affiché" : "ouvrages affichés"}
      </p>

      {filteredBooks.length === 0 && (
        <p className="rounded-2xl border border-[#E8E2D6] bg-white p-8 text-center text-[#52627A]">
          {books.length === 0
            ? "Aucun livre publié pour le moment."
            : "Aucun ouvrage ne correspond à votre recherche."}
        </p>
      )}

      <section
        id="xassidas"
        className="scroll-mt-24 space-y-7"
        aria-labelledby="xassidas-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8A6A39]">
              Poésie & spiritualité
            </p>
            <h3
              id="xassidas-heading"
              className="mt-2 font-serif text-2xl font-medium text-[#101D35] sm:text-3xl"
            >
              Xassidas
            </h3>
          </div>
          <span className="text-sm text-[#64748B]">
            {xassidaCount} {xassidaCount === 1 ? "ouvrage" : "ouvrages"}
          </span>
        </div>
        {xassidaCount > 0 ? (
          <div className="space-y-8">
            {xassidaCategories.map(renderCategoryBooks)}
          </div>
        ) : filteredBooks.length > 0 ? (
          <p className="rounded-2xl border border-dashed border-[#D8C9A8] bg-white/70 p-6 text-sm text-[#64748B]">
            {emptyGroupMessage}
          </p>
        ) : null}
      </section>

      <section
        id="autres-ouvrages"
        className="mt-16 scroll-mt-24 space-y-7"
        aria-labelledby="other-books-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8A6A39]">
              Livres & transmission
            </p>
            <h3
              id="other-books-heading"
              className="mt-2 font-serif text-2xl font-medium text-[#101D35] sm:text-3xl"
            >
              Autres ouvrages
            </h3>
          </div>
          <span className="text-sm text-[#64748B]">
            {otherCount} {otherCount === 1 ? "ouvrage" : "ouvrages"}
          </span>
        </div>
        {otherCount > 0 && otherCategories.length > 0 && (
          <div className="space-y-8">
            {otherCategories.map(renderCategoryBooks)}
          </div>
        )}
        {uncategorizedBooks.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {uncategorizedBooks.map((book) => (
              <BookCard key={book.id} book={book} categoryName="Ouvrage" />
            ))}
          </div>
        )}
        {otherCount === 0 && filteredBooks.length > 0 && (
          <p className="rounded-2xl border border-dashed border-[#D8C9A8] bg-white/70 p-6 text-sm text-[#64748B]">
            {emptyGroupMessage}
          </p>
        )}
      </section>
    </>
  );
}

