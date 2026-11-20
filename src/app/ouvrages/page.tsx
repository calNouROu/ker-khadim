
import Navbar from "@/components/Navbar";
import CatalogueClient from "./CatalogueClient";
import { getStorefrontCatalog, isPerfumeryCategoryName } from "@/lib/catalog";

export const instant = false;

export default async function OuvragesPage() {
  const { books, categories, error } = await getStorefrontCatalog();
  const perfumeCategoryIds = new Set(
    categories
      .filter((category) => isPerfumeryCategoryName(category.name))
      .map((category) => category.id)
  );
  const bookCategories = categories.filter(
    (category) => !isPerfumeryCategoryName(category.name)
  );
  const bookProducts = books.filter(
    (book) => !book.category_id || !perfumeCategoryIds.has(book.category_id)
  );

  return (
    <main className="min-h-screen bg-[#FFFEFA] text-[#101D35]">
      <Navbar />

      {/* CATALOGUE */}
      {error ? (
        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p className="rounded-xl bg-red-50 p-5 text-sm text-red-700">
            Impossible de charger les ouvrages : {error}
          </p>
        </section>
      ) : bookProducts.length > 0 ? (
        <CatalogueClient books={bookProducts} categories={bookCategories} />
      ) : (
        <section className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="font-serif text-2xl font-bold">
            Notre bibliothèque se prépare
          </h2>
          <p className="mt-4 text-gray-600">
            Aucun ouvrage n&apos;est disponible pour le moment.
          </p>
        </section>
      )}

      {/* MESSAGE */}
      <section className="bg-[#F5E6C8] px-5 py-16 text-center">
        <h2 className="font-serif text-3xl font-bold text-[#101D35]">
          Le savoir se transmet par les écrits
        </h2>

        <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#263D5B]">
          KËR KHADIM vous accompagne dans la découverte et la transmission
          de l&apos;héritage des écrits de Serigne Touba.
        </p>
      </section>

    </main>
  );
}
