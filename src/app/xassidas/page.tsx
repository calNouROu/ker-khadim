import Navbar from "@/components/Navbar";
import CatalogueClient from "@/app/ouvrages/CatalogueClient";
import { getStorefrontCatalog } from "@/lib/catalog";

export const instant = false;

export default async function XassidasPage() {
  const { books, categories, error } = await getStorefrontCatalog();
  const xassidaCategories = categories.filter((category) =>
    /xassida|khassida|enseignement|po[eè]sie|ouvrage(?:s)?\s+religieux/i.test(category.name)
  );
  const xassidaCategoryIds = new Set(
    xassidaCategories.map((category) => category.id)
  );
  const xassidaBooks = books.filter(
    (book) => book.category_id && xassidaCategoryIds.has(book.category_id)
  );

  return (
    <main className="min-h-screen bg-[#FFFEFA] text-[#101D35]">
      <Navbar />
      {error ? (
        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">
            Impossible de charger les Xassidas : {error}
          </p>
        </section>
      ) : (
        <CatalogueClient
          books={xassidaBooks}
          categories={xassidaCategories}
          eyebrow="Écrits de Serigne Touba"
          title="Xassidas et écrits spirituels"
          description="Parcourez les Xassidas, les enseignements, la poésie et les ouvrages religieux."
        />
      )}
    </main>
  );
}