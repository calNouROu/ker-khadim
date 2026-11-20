
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
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#8A6A39]">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-3xl font-bold text-[#101D35] md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-gray-600">
          {description}
        </p>
      </div>

      <div className="mx-auto mb-8 max-w-xl">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={itemLabel === "parfum" ? "Rechercher un parfum..." : "Rechercher un ouvrage..."}
          className="w-full rounded-xl border border-[#E5DCCB] bg-white px-5 py-4 text-sm text-[#101D35] outline-none focus:border-[#B08D57]"
        />
      </div>

      <div className="mb-12 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setCategory("Tous")}
          className={`catalogue-filter-button rounded-full px-6 py-3 text-sm font-semibold transition ${
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
            className={`catalogue-filter-button rounded-full px-6 py-3 text-sm font-semibold transition ${
              category === item.id
                ? "catalogue-filter-button-active bg-[#101D35] text-white"
                : "catalogue-filter-button-inactive border border-[#D5BD91] bg-white text-[#101D35]"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {filteredBooks.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredBooks.map((book) => (
            <article
              key={book.id}
              className="catalogue-product-card overflow-hidden rounded-2xl border border-[#EAE2D5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Link
                href={`/livres/${book.slug}`}
          aria-label={`Voir le produit ${book.title}`}
                className="block focus-visible:outline-2 focus-visible:outline-[#8A6A39]"
              >
                <div className="flex h-56 items-center justify-center bg-[#F5E6C8] p-4">
                  {book.image_url ? (
                    <Image
                      src={book.image_url}
                      alt={`${imageLabel} de ${book.title}`}
                      width={176}
                      height={224}
                      className="h-full w-auto max-w-full rounded-lg object-contain"
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
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-40 items-center justify-center border border-[#D5BD91] bg-[#101D35] p-4 text-center font-serif text-lg text-[#F5E6C8]">
                      {book.title}
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link
                  href={`/livres/${book.slug}`}
                  className="block rounded focus-visible:outline-2 focus-visible:outline-[#8A6A39]"
                >
                  <h3 className="catalogue-product-title font-serif text-lg font-bold text-[#101D35]">
                    {book.title}
                  </h3>
                  <p className="catalogue-product-description mt-2 min-h-12 break-words line-clamp-2 text-sm leading-6 text-gray-600">
                    {book.description || "Découvrez cet article de KËR KHADIM."}
                  </p>
                  <p className="catalogue-product-price mt-3 text-lg font-bold text-[#101D35]">
                    {Number(book.price).toLocaleString("fr-FR")} FCFA
                  </p>
                </Link>
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
                      videoUrl: book.video_url,
                    }}
                  />
                </div>
              </div>            </article>
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
