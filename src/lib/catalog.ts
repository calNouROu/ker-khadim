
import { createClient } from "@/lib/supabase-server";

export type Book = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  video_url: string | null;
  category_id: string | null;
};

export type Category = {
  id: string;
  name: string;
};

function isMissingVideoColumn(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("video_url") &&
    (normalized.includes("does not exist") || normalized.includes("schema cache"))
  );
}

export function isPerfumeryCategoryName(name: string) {
  return /parfum|musc|encens|oud|huile\s+parfum|fragrance|\b(?:homme|femme)\b/i.test(name);
}

export async function getStorefrontCatalog() {
  const hasSupabaseConfig =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasSupabaseConfig) {
    return {
      books: [] as Book[],
      categories: [] as Category[],
      error: "La connexion au catalogue n’est pas configurée.",
    };
  }

  const supabase = await createClient();

  const [booksWithVideoResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, title, slug, description, price, stock, image_url, video_url, category_id"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false }),

    supabase
      .from("categories")
      .select("id, name")
      .order("name"),
  ]);

  let books: Book[] = (booksWithVideoResult.data || []) as Book[];
  let booksError = booksWithVideoResult.error?.message || null;

  if (
    booksWithVideoResult.error &&
    isMissingVideoColumn(booksWithVideoResult.error.message)
  ) {
    const legacyBooksResult = await supabase
      .from("products")
      .select(
        "id, title, slug, description, price, stock, image_url, category_id"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    books = (legacyBooksResult.data || []).map((book) => ({
      ...book,
      video_url: null,
    })) as Book[];
    booksError = legacyBooksResult.error?.message || null;
  }

  return {
    books,
    categories: (categoriesResult.data || []) as Category[],
    error: booksError || categoriesResult.error?.message || null,
  };
}
