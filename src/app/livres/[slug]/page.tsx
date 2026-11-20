import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import Navbar from "@/components/Navbar";
import { isPerfumeryCategoryName } from "@/lib/catalog";
import { createClient } from "@/lib/supabase-server";

export const instant = false;

type Props = {
  params: Promise<{ slug: string }>;
};

type Book = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  video_url: string | null;
  categories: { name: string } | { name: string }[] | null;
};

function isMissingVideoColumn(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("video_url") &&
    (normalized.includes("does not exist") || normalized.includes("schema cache"))
  );
}

export default async function LivreDetail({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const productResult = await supabase
    .from("products")
    .select(`
      id,
      title,
      slug,
      description,
      price,
      stock,
      image_url,
      video_url,
      categories (
        name
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  let data: unknown = productResult.data;
  let error: { message: string } | null = productResult.error;
  if (productResult.error && isMissingVideoColumn(productResult.error.message)) {
    const legacyResult = await supabase
      .from("products")
      .select(`
        id,
        title,
        slug,
        description,
        price,
        stock,
        image_url,
        categories (
          name
        )
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    data = legacyResult.data
      ? { ...legacyResult.data, video_url: null }
      : null;
    error = legacyResult.error;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#FFFEFA] px-6 py-16">
        <p role="alert" className="mx-auto max-w-3xl text-center text-red-700">
          Impossible de charger ce livre : {error.message}
        </p>
        <Link
          href="/"
          className="mx-auto mt-6 block w-fit text-sm font-semibold text-[#8A6A39] hover:underline"
        >
          Retour à la boutique
        </Link>
      </main>
    );
  }

  if (!data) {
    notFound();
  }

  const book = data as Book;
  const category = Array.isArray(book.categories)
    ? book.categories[0]?.name
    : book.categories?.name;
  const isPerfume = isPerfumeryCategoryName(category || "");
  const isAccessory = /accessoire|chapelet|tapis\s+de\s+pri[eè]re/i.test(category || "");
  const visualLabel = isPerfume || isAccessory
    ? "Photo"
    : "Couverture";

  return (
    <main className="min-h-screen bg-[#FFFEFA]">
      <Navbar />

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl bg-[#F5E6C8] p-6 shadow-sm">
          {book.image_url ? (
            <div className="relative aspect-[3/4] h-[450px] w-full max-w-sm sm:h-[520px]">
              <Image
                src={book.image_url}
                alt={`${visualLabel} de ${book.title}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 450px"
                className="rounded-lg object-contain"
              />
            </div>
          ) : book.video_url ? (
            <video
              src={book.video_url}
              aria-label={`Vidéo de couverture de ${book.title}`}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="aspect-[3/4] h-[450px] w-full max-w-sm rounded-lg object-contain sm:h-[520px]"
            />
          ) : (
            <p className="self-center text-[#101D35]">
              Couverture indisponible
            </p>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#B08D57]">
            {category || "Collection KËR KHADIM"}
          </p>

          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#101D35] md:text-5xl">
            {book.title}
          </h1>

          <p className="mt-6 leading-8 text-gray-600">
            {book.description || "Découvrez cet ouvrage de Serigne Touba."}
          </p>

          <p className="mt-8 text-3xl font-bold text-[#101D35]">
            {Number(book.price).toLocaleString("fr-FR")} FCFA
          </p>

          <p className="mt-3 text-sm text-gray-500">
            {book.stock > 0
              ? `${book.stock} exemplaire(s) disponible(s)`
              : "Rupture de stock"}
          </p>

          <AddToCartButton
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

          <Link
            href={isPerfume ? "/parfumerie" : isAccessory ? "/accessoires" : "/ouvrages"}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8A6A39] transition hover:text-[#101D35]"
          >
            ← Continuer la découverte {isPerfume ? "des parfums" : isAccessory ? "des accessoires" : "des ouvrages"}
          </Link>
        </div>
      </section>

    </main>
  );
}
