
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import type { Book, Category } from "@/lib/catalog";

type Props = {
  books: Book[];
  categories: Category[];
  eyebrow?: string;
  title?: string;
  description?: string;
  itemLabel?: string;
};

function placeAccessoriesAfterPrayerMats(categories: Category[]) {
  const accessoryCategories = categories.filter((category) =>
    /^accessoires?(?:\s+de\s+lecture)?$/i.test(category.name.trim())
  );

  if (accessoryCategories.length === 0) return categories;

  const remainingCategories = categories.filter(
    (category) =>
      !/^accessoires?(?:\s+de\s+lecture)?$/i.test(category.name.trim())
  );

  const prayerMatIndex = remainingCategories.findIndex((category) =>
    /tapis\s+de\s+pri[eè]re/i.test(category.name)
  );

  const insertAt =
    prayerMatIndex < 0 ? remainingCategories.length : prayerMatIndex + 1;

  return [
    ...remainingCategories.slice(0, insertAt),
    ...accessoryCategories,
    ...remainingCategories.slice(insertAt),
  ];
}

export default function CatalogueClient({
  books,
  categories,
  eyebrow = "Notre bibliothèque",
  title = "Tous nos ouvrages",
  description = "Recherchez et explorez nos différentes collections.",
  itemLabel = "ouvrage",
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");

  const imageLabel = itemLabel === "ouvrage" ? "Couverture" : "Photo";

  const orderedCategories = useMemo(
    () => placeAccessoriesAfterPrayerMats(categories),
    [categories]
  );

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        (book.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "Tous" || book.category_id === category;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  return (
    <section className="mx-auto max-w-7xl px-3 py-8 sm:px-8 sm:py-16">
      {/* EN-TÊTE */}
      <div className="mb-6 text-center sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8A6A39] sm:text-sm">
          {eyebrow}
        </p>

        <h2 className="mt-2 font-serif text-2xl font-bold text-[#101D35] sm:mt-3 sm:text-4xl">
          {title}
        </h2>

        <p className="mt-2 text-sm text-gray-600 sm:mt-4 sm:text-base">
          {description}
        </p>
      </div>

      {/* RECHERCHE */}
      <div className="mx-auto mb-6 max-w-xl sm:mb-8">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            itemLabel === "parfum"
              ? "Rechercher un parfum..."
              : "Rechercher un ouvrage..."
          }
          className="w-full rounded-xl border border-[#E5DCCB] bg-white px-4 py-3 text-sm text-[#101D35] outline-none focus:border-[#B08D57] sm:px-5 sm:py-4"
        />
      </div>

      {/* FILTRES */}
      <div className="mb-8 flex flex-wrap justify-center gap-2 sm:mb-12 sm:gap-3">
        <button
          onClick={() => setCategory("Tous")}
          className={`catalogue-filter-button rounded-full px-4 py-2 text-xs font-semibold transition sm:px-6 sm:py-3 sm:text-sm ${
            category === "Tous"
              ? "catalogue-filter-button-active bg-[#101D35] text-white"
              : "catalogue-filter-button-inactive border border-[#D5BD91] bg-white text-[#101D35]"
          }`}
        >
          Tous
        </button>

        {orderedCategories.map((item) => (
          <button
            key={item.id}
            onClick={() => setCategory(item.id)}
            className={`catalogue-filter-button rounded-full px-4 py-2 text-xs font-semibold transition sm:px-6 sm:py-3 sm:text-sm ${
              category === item.id
                ? "catalogue-filter-button-active bg-[#101D35] text-white"
                : "catalogue-filter-button-inactive border border-[#D5BD91] bg-white text-[#101D35]"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* PRODUITS */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {filteredBooks.map((book) => (
            <article
              key={book.id}
              className="catalogue-product-card group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#EAE2D5] bg-white shadow-sm transition hover:shadow-lg sm:rounded-2xl"
            >
              {/* IMAGE */}
              <Link
                href={`/livres/${book.slug}`}
                aria-label={`Voir le produit ${book.title}`}
                className="block focus-visible:outline-2 focus-visible:outline-[#8A6A39]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#F5E6C8]">
                  {book.image_url ? (
                    <Image
                      src={book.image_url}
                      alt={`${imageLabel} de ${book.title}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-contain p-2 transition duration-300 group-hover:scale-105 sm:p-3"
                    />
                  ) : book.video_url ? (
                    <video
                      src={book.video_url}
                      aria-label={`Vidéo de couverture de ${book.title}`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#101D35] p-3 text-center font-serif text-sm text-[#F5E6C8]">
                      {book.title}
                    </div>
                  )}
                </div>
              </Link>

              {/* INFORMATIONS PRODUIT */}
              <div className="flex flex-1 flex-col p-2 sm:p-4">
                <Link
                  href={`/livres/${book.slug}`}
                  className="block rounded focus-visible:outline-2 focus-visible:outline-[#8A6A39]"
                >
                  <h3 className="catalogue-product-title line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-[#101D35] sm:text-lg sm:leading-snug">
                    {book.title}
                  </h3>

                  <p className="catalogue-product-description mt-1 hidden line-clamp-2 text-sm leading-6 text-gray-600 sm:mt-2 sm:block">
                    {book.description || "Découvrez cet article de KËR KHADIM."}
                  </p>

                  <p className="catalogue-product-price mt-2 text-sm font-extrabold text-[#101D35] sm:mt-3 sm:text-lg">
                    {Number(book.price).toLocaleString("fr-FR")} FCFA
                  </p>
                </Link>

                {/* PANIER */}
                <div className="mt-auto pt-2 sm:pt-4">
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
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-[#F5E6C8]/50 p-8 text-center text-gray-600">
          Aucun {itemLabel} trouvé.
        </p>
      )}
    </section>
  );
}
