import Navbar from "@/components/Navbar";
import CatalogueClient from "@/app/ouvrages/CatalogueClient";
import { getStorefrontCatalog } from "@/lib/catalog";

export const instant = false;

const accessoryCategoryPattern =
  /accessoire|chapelet|tapis\s+de\s+pri[eè]re/i;
const genericAccessoryCategoryPattern =
  /^accessoires?(?:\s+de\s+lecture)?$/i;

export default async function AccessoiresPage() {
  const { books, categories, error } = await getStorefrontCatalog();
  const genericAccessoryCategories = categories.filter((category) =>
    genericAccessoryCategoryPattern.test(category.name.trim())
  );
  const otherAccessoriesCategory =
    categories.find((category) =>
      /^autres accessoires$/i.test(category.name.trim())
    ) ||
    (genericAccessoryCategories[0]
      ? { ...genericAccessoryCategories[0], name: "Autres accessoires" }
      : null);
  const accessoryCategories = categories.filter(
    (category) =>
      accessoryCategoryPattern.test(category.name) &&
      !genericAccessoryCategoryPattern.test(category.name.trim()) &&
      category.id !== otherAccessoriesCategory?.id
  );
  const visibleCategories = otherAccessoriesCategory
    ? [...accessoryCategories, otherAccessoriesCategory]
    : accessoryCategories;
  const accessoryCategoryIds = new Set(
    categories
      .filter((category) => accessoryCategoryPattern.test(category.name))
      .map((category) => category.id)
  );
  const genericAccessoryCategoryIds = new Set(
    genericAccessoryCategories.map((category) => category.id)
  );
  const accessoryBooks = books
    .filter((book) => book.category_id && accessoryCategoryIds.has(book.category_id))
    .map((book) =>
      otherAccessoriesCategory &&
      genericAccessoryCategoryIds.has(book.category_id || "")
        ? { ...book, category_id: otherAccessoriesCategory.id }
        : book
    );

  return (
    <main className="min-h-screen bg-[#FFFEFA] text-[#101D35]">
      <Navbar />
      {error ? (
        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-5 text-sm text-red-700"
          >
            Impossible de charger les accessoires : {error}
          </p>
        </section>
      ) : (
        <CatalogueClient
          books={accessoryBooks}
          categories={visibleCategories}
          eyebrow="La boutique KËR KHADIM"
          title="Nos accessoires"
          description="Chapelets, tapis de prière et autres accessoires. Recherchez un article ou choisissez une catégorie."
        />
      )}
    </main>
  );
}
