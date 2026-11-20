import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import FeaturedBookCarousel from "@/components/FeaturedBookCarousel";
import FeaturedBookSpotlight from "@/components/FeaturedBookSpotlight";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RetryButton from "@/components/RetryButton";
import {
  getStorefrontCatalog,
  isPerfumeryCategoryName,
  type Book,
} from "@/lib/catalog";

export const instant = false;

const SLOGAN = "L’héritage des écrits, la transmission du savoir.";

type FeaturedProduct = Book & { featuredCategory: string };

function isXassida(categoryName: string) {
  return /xassida|khassida/i.test(categoryName);
}

function AccessoryShelf({
  id,
  title,
  description,
  products,
  href = "/accessoires",
}: {
  id: string;
  title: string;
  description: string;
  products: Book[];
  href?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8A6A39]">
            Collection KËR KHADIM
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-[#101D35] sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#52627A]">
            {description}
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#8A6A39] transition hover:text-[#101D35]"
        >
          Voir la rubrique <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <article
            key={product.id}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8E2D6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <Link
              href={`/livres/${product.slug}`}
              aria-label={`Découvrir ${product.title}`}
              className="relative block aspect-[4/3] overflow-hidden bg-[#F5E6C8] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#8A6A39]"
            >
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={`Photo de ${product.title}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              ) : product.video_url ? (
                <video
                  src={product.video_url}
                  aria-label={`Vidéo de couverture de ${product.title}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <span className="flex h-full items-center justify-center bg-gradient-to-br from-[#F5E6C8] to-[#E8DCC2] px-4 text-center text-sm font-medium text-[#52627A]">
                  Visuel bientôt disponible
                </span>
              )}
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <Link
                href={`/livres/${product.slug}`}
                className="font-serif text-lg font-semibold leading-snug text-[#101D35] transition hover:text-[#8A6A39]"
              >
                {product.title}
              </Link>
              <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#64748B]">
                {product.description || "Description non renseignée."}
              </p>
              <div className="mt-auto pt-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="font-bold text-[#101D35]">
                    {Number(product.price).toLocaleString("fr-FR")} FCFA
                  </p>
                  <span className={product.stock > 0 ? "text-xs font-medium text-emerald-800" : "text-xs font-medium text-[#9B3434]"}>
                    {product.stock > 0 ? "Disponible" : "Épuisé"}
                  </span>
                </div>
                <AddToCartButton
                  compact
                  product={{
                    id: product.id,
                    title: product.title,
                    slug: product.slug,
                    price: Number(product.price),
                    stock: product.stock,
                    imageUrl: product.image_url,
                    videoUrl: product.video_url,
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BenefitIcon({ kind }: { kind: "selection" | "heritage" | "order" | "care" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.6,
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-6 w-6"
      {...common}
    >
      {kind === "selection" && (
        <>
          <path d="M7 6.5h15a3 3 0 0 1 3 3v16H10a3 3 0 0 1-3-3z" />
          <path d="M7 22.5a3 3 0 0 1 3-3h15M12 12h8M12 16h6" />
        </>
      )}
      {kind === "heritage" && (
        <>
          <path d="M16 27S5 21 5 12V6l11-3 11 3v6c0 9-11 15-11 15Z" />
          <path d="M11 16c2-5 8-7 11-7-1 5-4 9-9 9M12 20l8-8" />
        </>
      )}
      {kind === "order" && (
        <>
          <path d="M7 9h18l-1.5 17h-15zM12 9a4 4 0 0 1 8 0" />
          <path d="m12 17 2.5 2.5L21 13" />
        </>
      )}
      {kind === "care" && (
        <>
          <path d="M6 17v-2a10 10 0 0 1 20 0v2" />
          <path d="M6 17h3v7H8a2 2 0 0 1-2-2zM26 17h-3v7h1a2 2 0 0 0 2-2z" />
          <path d="M23 24a7 7 0 0 1-7 4h-2" />
        </>
      )}
    </svg>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ inscription?: string | string[] }>;
}) {
  const { inscription } = await searchParams;
  const signupStatus = Array.isArray(inscription) ? undefined : inscription;
  const {
    books: allBooks,
    categories: allCategories,
    error: catalogError,
  } = await getStorefrontCatalog();

  const categoryNameForBook = (book: Book) =>
    allCategories.find((category) => category.id === book.category_id)?.name ?? "";
  const isAccessoryBook = (book: Book) =>
    /accessoire|chapelet|tapis\s+de\s+pri[eè]re/i.test(categoryNameForBook(book));
  const homeAccessoryBooks = allBooks.filter(isAccessoryBook);
  const homePerfumeryBooks = allBooks.filter((book) =>
    isPerfumeryCategoryName(categoryNameForBook(book))
  );
  const latestProduct = (
    featuredCategory: string,
    matches: (book: Book) => boolean
  ): FeaturedProduct | null => {
    const book = allBooks.find(matches);
    return book ? { ...book, featuredCategory } : null;
  };
  const featuredProducts = [
    latestProduct("Xassida", (book) => isXassida(categoryNameForBook(book))),
    latestProduct("Chapelet", (book) => /chapelet/i.test(categoryNameForBook(book))),
    latestProduct("Tapis de prière", (book) =>
      /tapis\s+de\s+pri[eè]re/i.test(categoryNameForBook(book))
    ),
    latestProduct(
      "Autre accessoire",
      (book) =>
        isAccessoryBook(book) &&
        !/chapelet|tapis\s+de\s+pri[eè]re/i.test(categoryNameForBook(book))
    ),
    latestProduct("Parfum", (book) =>
      isPerfumeryCategoryName(categoryNameForBook(book))
    ),
  ].filter((book): book is FeaturedProduct => book !== null);
  const libraryBooks = allBooks.filter(
    (book) =>
      !isAccessoryBook(book) &&
      !isPerfumeryCategoryName(categoryNameForBook(book))
  );
  const accessorySections = [
    {
      id: "chapelets",
      title: "Chapelets",
      description: "Découvrez les chapelets proposés dans la boutique KËR KHADIM.",
      products: homeAccessoryBooks.filter((book) =>
        /chapelet/i.test(categoryNameForBook(book))
      ),
    },
    {
      id: "tapis-de-priere",
      title: "Tapis de prière",
      description: "Une sélection de tapis pour accompagner vos moments de prière.",
      products: homeAccessoryBooks.filter((book) =>
        /tapis\s+de\s+pri[eè]re/i.test(categoryNameForBook(book))
      ),
    },
    {
      id: "autres-accessoires",
      title: "Autres accessoires",
      description: "Retrouvez les autres articles disponibles dans la boutique.",
      products: homeAccessoryBooks.filter((book) => {
        const categoryName = categoryNameForBook(book);
        return !/chapelet|tapis\s+de\s+pri[eè]re/i.test(categoryName);
      }),
    },
    {
      id: "parfumerie",
      title: "Parfumerie",
      description: "Découvrez notre sélection de parfums dans la rubrique dédiée.",
      href: "/parfumerie",
      products: homePerfumeryBooks,
    },
  ].filter((section) => section.products.length > 0);
  const homeFeaturedBooks = [
    ...libraryBooks.filter((book) => book.video_url),
    ...libraryBooks.filter((book) => !book.video_url),
  ].slice(0, 4);
  return (
    <main id="accueil" className="min-h-screen bg-[#FFFEFA]">
      <Navbar />

      {signupStatus === "confirmation" && (
        <div
          role="status"
          className="border-b border-[#D5BD91]/60 bg-[#F5E6C8] px-5 py-4 text-[#101D35]"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6">
              Votre compte est créé. Confirmez l’inscription depuis l’e-mail
              reçu pour pouvoir vous connecter. Pensez à vérifier vos courriers
              indésirables.
            </p>
            <Link
              href="/connexion"
              className="shrink-0 text-sm font-semibold text-[#263D5B] underline underline-offset-4"
            >
              Aller à la connexion
            </Link>
          </div>
        </div>
      )}
      {signupStatus === "success" && (
        <div
          role="status"
          className="border-b border-[#D5BD91]/60 bg-[#F5E6C8] px-5 py-4 text-[#101D35]"
        >
          <p className="mx-auto max-w-7xl text-sm leading-6">
            Votre compte est créé et vous êtes connecté. Bienvenue chez KËR
            KHADIM.
          </p>
        </div>
      )}

      <section className="home-hero-section relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="home-hero-background pointer-events-none absolute inset-0 -z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-0 -z-10 h-[520px] w-[520px] rounded-full border border-[#B08D57]/10"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10 lg:py-16">
          <div className="animate-fade-up max-w-2xl">
            <p className="home-hero-eyebrow inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] sm:text-sm">
              <span className="home-hero-eyebrow-rule h-px w-8" />
              Bibliothèque de savoir & de transmission
            </p>
            <p className="home-hero-eyebrow mt-6 text-[10px] font-bold uppercase tracking-[0.24em]">
              KËR KHADIM · LES ÉCRITS DE SERIGNE TOUBA
            </p>
            <h1 className="home-hero-title mt-3 font-serif text-4xl font-medium leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Découvrez l’héritage des écrits de{" "}
              <span className="home-hero-title-accent">Serigne Touba</span>
            </h1>
            <p className="home-hero-description mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8">
              Retrouvez les Xassidas et les ouvrages de Cheikh Ahmadou Bamba,
              sélectionnés pour faire vivre un patrimoine de savoir et de
              spiritualité.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/ouvrages"
                className="home-explore-button inline-flex min-h-12 items-center justify-center rounded-full bg-[#D5BD91] px-7 py-3 text-sm font-bold shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#F5E6C8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5BD91]"
              >
                Explorer la bibliothèque
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
              <Link
                href="#bibliotheque"
                className="home-hero-secondary-button inline-flex min-h-12 items-center justify-center rounded-full border px-7 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5BD91]"
              >
                Voir les ouvrages
              </Link>
            </div>
            <p className="home-hero-slogan mt-8 border-l-2 border-[#D5BD91] pl-3 text-sm italic">
              {SLOGAN}
            </p>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <FeaturedBookCarousel books={libraryBooks} />
          </div>
        </div>
        <div className="home-hero-message-bar border-t">
          <div className="mx-auto max-w-7xl px-5 py-5 text-center sm:px-8 lg:px-10">
            <p className="home-hero-message-title font-serif text-lg sm:text-xl">
              Des écrits précieux, une transmission vivante
            </p>
            <p className="home-hero-message-subtitle mt-1 text-xs tracking-wide">
              Une bibliothèque dédiée aux œuvres de Serigne Touba
            </p>
          </div>
        </div>
      </section>

      <section id="bibliotheque" className="bg-[#F8F5EF] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8A6A39]">
                La bibliothèque KËR KHADIM
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium text-[#101D35] sm:text-4xl">
                Une sélection d’ouvrages
              </h2>
            </div>
            <Link
              href="/ouvrages"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8A6A39] hover:text-[#101D35]"
            >
              Parcourir tous les ouvrages <span aria-hidden="true">→</span>
            </Link>
          </div>

          {catalogError ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-white p-6 text-[#7F1D1D] shadow-sm"
            >
              <p>La sélection est momentanément indisponible.</p>
              <RetryButton />
            </div>
          ) : libraryBooks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {homeFeaturedBooks.map((book) => {
                const categoryName = allCategories.find(
                  (category) => category.id === book.category_id
                )?.name;

                return (
                  <article
                    key={book.id}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8E2D6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link
                      href={`/livres/${book.slug}`}
                      aria-label={`Découvrir ${book.title}`}
                      className="relative block aspect-[5/6] overflow-hidden bg-[#F5E6C8] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#8A6A39]"
                    >
                      {book.image_url ? (
                        <Image
                          src={book.image_url}
                          alt={`Couverture de ${book.title}`}
                          fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
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
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center bg-gradient-to-br from-[#F5E6C8] to-[#E8DCC2] text-sm font-medium text-[#52627A]">
                          Couverture indisponible
                        </span>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col p-4">
                      {categoryName && (
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8A6A39]">
                          {categoryName}
                        </p>
                      )}
                      <Link
                        href={`/livres/${book.slug}`}
                        className="mt-2 font-serif text-lg font-semibold leading-snug text-[#101D35] hover:text-[#8A6A39]"
                      >
                        {book.title}
                      </Link>
                      <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#64748B]">
                        {book.description || "Description non renseignée."}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="font-bold text-[#101D35]">
                          {Number(book.price).toLocaleString("fr-FR")}{" "}
                          <span className="text-xs font-semibold text-[#64748B]">
                            FCFA
                          </span>
                        </p>
                        <span
                          className={`text-xs font-medium ${
                            book.stock > 0 ? "text-emerald-800" : "text-[#9B3434]"
                          }`}
                        >
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
                            videoUrl: book.video_url,
                          }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-[#E8DCC2] bg-white p-6 text-[#52627A]">
              Aucun ouvrage n’est actuellement publié.
            </p>
          )}
        </div>
      </section>


      {accessorySections.length > 0 && (
        <section id="accessoires" className="bg-[#F8F5EF] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-7xl space-y-16 sm:space-y-20">
            {accessorySections.map((section) => (
              <AccessoryShelf
                key={section.id}
                id={section.id}
                title={section.title}
                description={section.description}
                products={section.products}
              />
            ))}
          </div>
        </section>
      )}

      <section className="home-experience-section relative overflow-hidden border-y border-[#E8DFD0] bg-gradient-to-b from-[#FFFEFA] via-[#FAF8F3] to-[#F7F1E7] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div
          aria-hidden="true"
          className="home-experience-glow pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/70 to-transparent"
        />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-10">
          <FeaturedBookSpotlight books={featuredProducts} />

          <div className="min-w-0">
            <div className="mb-7 max-w-2xl">
              <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6A39]">
                <span aria-hidden="true" className="h-px w-7 bg-[#D5BD91]" />
                L’expérience KËR KHADIM
              </p>
              <h2 className="mt-4 max-w-xl font-serif text-3xl font-medium tracking-tight text-[#101D35] sm:text-4xl lg:text-[2.7rem] lg:leading-[1.12]">
                La librairie, pensée pour vous
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#52627A] sm:text-base">
                Une expérience attentive à la richesse des écrits et à la simplicité de votre lecture.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  number: "01",
                  kind: "selection" as const,
                  title: "Des ouvrages sélectionnés",
                  text: "Un catalogue consacré aux publications de la librairie.",
                },
                {
                  number: "02",
                  kind: "heritage" as const,
                  title: "Un patrimoine vivant",
                  text: "Une bibliothèque dédiée aux écrits de Serigne Touba.",
                },
                {
                  number: "03",
                  kind: "order" as const,
                  title: "Une commande simple",
                  text: "Retrouvez vos ouvrages et suivez votre commande en ligne.",
                },
                {
                  number: "04",
                  kind: "care" as const,
                  title: "À votre écoute",
                  text: "Notre équipe vous accompagne dans votre expérience.",
                },
              ].map((benefit) => (
                <article
                  key={benefit.title}
                  className="group relative flex min-h-[12.5rem] flex-col overflow-hidden rounded-[1.5rem] border border-[#E8DCC2] bg-white p-6 shadow-[0_10px_30px_rgba(16,29,53,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#D5BD91] hover:shadow-[0_20px_42px_rgba(16,29,53,0.1)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-5 flex size-7 items-center justify-center rounded-full bg-[#F7F1E7] text-[9px] font-semibold tracking-[0.12em] text-[#8A6A39]"
                  >
                    {benefit.number}
                  </span>
                  <span className="relative inline-flex size-11 items-center justify-center rounded-full border border-[#E8DCC2] bg-[#FCF7EE] text-[#8A6A39]">
                    <BenefitIcon kind={benefit.kind} />
                  </span>
                  <h3 className="mt-5 max-w-full font-serif text-lg font-semibold leading-snug text-[#101D35] sm:text-xl">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#52627A]">
                    {benefit.text}
                  </p>
                  <span
                    aria-hidden="true"
                    className="mt-auto block h-px w-9 bg-[#D5BD91] pt-0 transition-all duration-300 group-hover:w-14"
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
