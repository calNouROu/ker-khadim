import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CatalogueClient from "@/app/ouvrages/CatalogueClient";
import { getStorefrontCatalog, isPerfumeryCategoryName } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Parfumerie — KËR KHADIM",
  description:
    "Découvrez les parfums, muscs, encens et huiles parfumées de la parfumerie KËR KHADIM.",
};

export const instant = false;

export default async function ParfumeriePage() {
  const { books, categories, error } = await getStorefrontCatalog();
  const allPerfumeryCategories = categories.filter((category) =>
    isPerfumeryCategoryName(category.name)
  );
  const perfumeCategories = allPerfumeryCategories.filter(
    (category) =>
      !/^(?:parfums?|coffrets?\s+parfum[eé]s?)$/i.test(category.name.trim())
  ).map((category) => {
    const gender = category.name
      .trim()
      .match(/^parfums?\s+(femme|homme)$/i)?.[1];
    return {
      ...category,
      name: gender
        ? `${gender.charAt(0).toUpperCase()}${gender.slice(1).toLowerCase()}`
        : category.name,
    };
  });
  const perfumeCategoryIds = new Set(
    allPerfumeryCategories.map((category) => category.id)
  );
  const perfumeProducts = books.filter(
    (book) => book.category_id && perfumeCategoryIds.has(book.category_id)
  );

  return (
    <main className="min-h-screen bg-[#FFFEFA] text-[#101D35]">
      <Navbar />
      {error ? (
        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">
            Impossible de charger les parfums : {error}
          </p>
        </section>
      ) : (
        <CatalogueClient
          books={perfumeProducts}
          categories={perfumeCategories}
          eyebrow="La boutique KËR KHADIM"
          title="Notre parfumerie"
          description="Découvrez notre sélection de parfums, muscs, encens et huiles parfumées. Choisissez une catégorie ou recherchez un produit."
          itemLabel="parfum"
        />
      )}
    </main>
  );
}
