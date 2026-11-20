import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import VideoFeed, { type VideoBook } from "@/components/VideoFeed";
import { getStorefrontCatalog, isPerfumeryCategoryName } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Vidéos des ouvrages — KËR KHADIM",
  description:
    "Découvrez les ouvrages KËR KHADIM en vidéo et ajoutez vos titres préférés au panier.",
};

export const instant = false;

export default async function VideosPage() {
  const { books: catalogBooks, categories, error } = await getStorefrontCatalog();
  const perfumeCategoryIds = new Set(
    categories
      .filter((category) => isPerfumeryCategoryName(category.name))
      .map((category) => category.id)
  );
  const books: VideoBook[] = catalogBooks.flatMap((book) =>
    book.video_url && (!book.category_id || !perfumeCategoryIds.has(book.category_id))
      ? [{ ...book, video_url: book.video_url }]
      : []
  );

  return (
    <main className="min-h-screen bg-[#FFFEFA] text-[#101D35]">
      <Navbar />

      {error ? (
        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p role="alert" className="rounded-2xl border border-[#E8E2D6] bg-white p-6 text-sm leading-6 text-[#52627A]">
            La page vidéo n’est pas encore configurée. Appliquez la migration Supabase des vidéos, puis téléversez une vidéo sur un ouvrage depuis l’administration.
          </p>
        </section>
      ) : books.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <p className="mb-8 text-center text-sm text-[#64748B]">
            {books.length} vidéo{books.length > 1 ? "s" : ""} à découvrir
          </p>
          <VideoFeed books={books} />
        </section>
      ) : (
        <section className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="font-serif text-2xl font-bold text-[#101D35]">
            Les présentations arrivent bientôt
          </h2>
          <p className="mt-3 leading-7 text-[#52627A]">
            Les ouvrages apparaîtront ici dès qu’une vidéo leur sera associée dans l’administration.
          </p>
        </section>
      )}

    </main>
  );
}
