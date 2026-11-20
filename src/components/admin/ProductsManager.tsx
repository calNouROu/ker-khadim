"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  video_url: string | null;
  category_id: string | null;
  is_active: boolean;
};

type ProductDraft = {
  title: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  video_url: string;
  category_id: string;
  is_active: boolean;
};

function emptyProductDraft(): ProductDraft {
  return { title: "", description: "", price: "", stock: "0", image_url: "", video_url: "", category_id: "", is_active: false };
}

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeUniqueSlug(value: string, existingSlugs: string[]) {
  const baseSlug = makeSlug(value);
  const usedSlugs = new Set(existingSlugs);
  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function isValidVideoUrl(value: string) {
  if (!value) return true;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isMissingVideoColumn(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("video_url") &&
    (normalized.includes("does not exist") || normalized.includes("schema cache"))
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return "erreur inconnue";

  const value = error as Record<string, unknown>;
  const details = [value.message, value.details, value.hint]
    .filter((part): part is string => typeof part === "string" && part.length > 0);
  if (typeof value.code === "string" && value.code.length > 0) {
    details.push(`code ${value.code}`);
  }
  return [...new Set(details)].join(" — ") || "erreur inconnue";
}

function coverPathFromPublicUrl(imageUrl: string | null) {
  if (!imageUrl) return null;
  const marker = "/storage/v1/object/public/book-covers/";
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex < 0) return null;

  try {
    return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

function videoPathFromPublicUrl(videoUrl: string | null) {
  if (!videoUrl) return null;
  const marker = "/storage/v1/object/public/product-videos/";
  const markerIndex = videoUrl.indexOf(marker);
  if (markerIndex < 0) return null;

  try {
    return decodeURIComponent(videoUrl.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

const MAX_COVER_SIZE = 5 * 1024 * 1024;
const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm"];

function validateCover(file: File) {
  if (!COVER_TYPES.includes(file.type)) return "Choisissez une image JPG, PNG ou WebP.";
  if (file.size > MAX_COVER_SIZE) return "La photo ne doit pas dépasser 5 Mo.";
  return null;
}

function validateVideo(file: File) {
  if (!VIDEO_TYPES.includes(file.type)) return "Choisissez une vidéo MP4 ou WebM.";
  if (file.size > MAX_VIDEO_SIZE) return "La vidéo ne doit pas dépasser 50 Mo.";
  return null;
}

async function uploadCover(file: File) {
  if (!supabase) throw new Error("Configuration Supabase manquante.");

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("La session administrateur n’est pas reconnue par le navigateur. Reconnectez-vous.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (profile?.role !== "admin") {
    throw new Error("Le compte connecté n’a pas le rôle administrateur dans Supabase.");
  }

  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${crypto.randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage
    .from("book-covers")
    .upload(path, file, { contentType: file.type, cacheControl: "3600" });
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from("book-covers")
    .getPublicUrl(data.path);
  return { path: data.path, publicUrl: urlData.publicUrl };
}

async function uploadVideo(file: File) {
  if (!supabase) throw new Error("Configuration Supabase manquante.");

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("La session administrateur n’est pas reconnue par le navigateur. Reconnectez-vous.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (profile?.role !== "admin") {
    throw new Error("Le compte connecté n’a pas le rôle administrateur dans Supabase.");
  }

  const extension = file.type === "video/mp4" ? "mp4" : "webm";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage
    .from("product-videos")
    .upload(path, file, { contentType: file.type, cacheControl: "3600" });
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from("product-videos")
    .getPublicUrl(data.path);
  return { path: data.path, publicUrl: urlData.publicUrl };
}
type Category = { id: string; name: string };
type CatalogMode = "ouvrages" | "accessoires" | "parfumerie";

const accessoryCategoryPattern =
  /accessoire|chapelet|tapis\s+de\s+pri[eè]re/i;
const genericAccessoryCategoryPattern =
  /^accessoires?(?:\s+de\s+lecture)?$/i;
const perfumeCategoryPattern =
  /parfum|musc|encens|oud|huile\s+parfum|fragrance|\b(?:homme|femme)\b/i;

function displayCategoryName(name: string) {
  const gender = name.trim().match(/^parfums?\s+(femme|homme)$/i)?.[1];
  return gender
    ? `${gender.charAt(0).toUpperCase()}${gender.slice(1).toLowerCase()}`
    : name;
}

export default function ProductsManager({
  refreshKey,
  mode = "ouvrages",
}: {
  refreshKey: number;
  mode?: CatalogMode;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createDraft, setCreateDraft] = useState<ProductDraft>(emptyProductDraft);
  const [creating, setCreating] = useState(false);
  const [createCoverFile, setCreateCoverFile] = useState<File | null>(null);
  const [coverFiles, setCoverFiles] = useState<Record<string, File | null>>({});
  const [createVideoFile, setCreateVideoFile] = useState<File | null>(null);
  const [videoFiles, setVideoFiles] = useState<Record<string, File | null>>({});
  const [videoColumnAvailable, setVideoColumnAvailable] = useState(true);
  const isAccessoryMode = mode === "accessoires";
  const isPerfumeryMode = mode === "parfumerie";
  const singularLabel = isAccessoryMode
    ? "accessoire"
    : isPerfumeryMode
      ? "article de parfumerie"
      : "ouvrage";
  const pluralLabel = isAccessoryMode
    ? "accessoires"
    : isPerfumeryMode
      ? "articles de parfumerie"
      : "ouvrages";
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
  const scopedCategories = isAccessoryMode
    ? [
        ...categories.filter(
          (category) =>
            accessoryCategoryPattern.test(category.name) &&
          !perfumeCategoryPattern.test(category.name) &&
            !genericAccessoryCategoryPattern.test(category.name.trim()) &&
            category.id !== otherAccessoriesCategory?.id
        ),
        ...(otherAccessoriesCategory ? [otherAccessoriesCategory] : []),
      ]
    : isPerfumeryMode
      ? categories.filter((category) => perfumeCategoryPattern.test(category.name))
      : categories.filter(
        (category) =>
          !perfumeCategoryPattern.test(category.name) &&
          !accessoryCategoryPattern.test(category.name)
      );
  const scopedProducts = products.filter((product) => {
    const categoryName =
      categories.find((category) => category.id === product.category_id)?.name || "";
    if (isPerfumeryMode) return perfumeCategoryPattern.test(categoryName);
    if (isAccessoryMode) {
      return (
        accessoryCategoryPattern.test(categoryName) &&
        !perfumeCategoryPattern.test(categoryName)
      );
    }
    return (
      !accessoryCategoryPattern.test(categoryName) &&
      !perfumeCategoryPattern.test(categoryName)
    );
  });

  useEffect(() => {
    async function loadProducts() {
      if (!supabase) {
        setMessage("Configuration Supabase manquante.");
        setLoading(false);
        return;
      }

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      const loadedCategories = categoriesData || [];
      if (categoriesError) {
        setMessage("Impossible de charger les catégories : " + categoriesError.message);
      } else {
        setCategories(loadedCategories);
      }

      const productsResult = await supabase
        .from("products")
        .select("id, title, slug, description, price, stock, image_url, video_url, category_id, is_active")
        .order("created_at", { ascending: false });

      let productRows: Product[] | null = null;
      let productLoadError: string | null = null;
      if (productsResult.error && isMissingVideoColumn(productsResult.error.message)) {
        setVideoColumnAvailable(false);
        const fallback = await supabase
          .from("products")
          .select("id, title, slug, description, price, stock, image_url, category_id, is_active")
          .order("created_at", { ascending: false });
        productRows = (fallback.data || []) as Product[];
        productLoadError = fallback.error?.message || null;
      } else {
        setVideoColumnAvailable(true);
        productRows = (productsResult.data || []) as Product[];
        productLoadError = productsResult.error?.message || null;
      }

      if (productLoadError) {
        setMessage(`Impossible de charger les ${pluralLabel} : ${productLoadError}`);
        setLoading(false);
        return;
      }

      const genericCategoryIds = new Set(
        loadedCategories
          .filter((category) =>
            genericAccessoryCategoryPattern.test(category.name.trim())
          )
          .map((category) => category.id)
      );
      const otherAccessoriesId =
        loadedCategories.find((category) =>
          /^autres accessoires$/i.test(category.name.trim())
        )?.id || loadedCategories.find((category) => genericCategoryIds.has(category.id))?.id;
      const nextProducts = (productRows || []).map((product) => ({
        ...product,
        category_id:
          isAccessoryMode &&
          otherAccessoriesId &&
          genericCategoryIds.has(product.category_id || "")
            ? otherAccessoriesId
            : product.category_id,
        video_url: product.video_url || null,
      })) as Product[];
      setProducts(nextProducts);
      setDrafts(
        Object.fromEntries(
          nextProducts.map((product) => [
            product.id,
            {
              title: product.title,
              description: product.description || "",
              price: String(product.price),
              stock: String(product.stock),
              image_url: product.image_url || "",
              video_url: product.video_url || "",
              category_id: product.category_id || "",
              is_active: product.is_active,
            },
          ])
        )
      );
      setLoading(false);
    }

    void loadProducts();
  }, [refreshKey, pluralLabel, isAccessoryMode]);

  function updateDraft(
    productId: string,
    field: keyof ProductDraft,
    value: string | boolean
  ) {
    setDrafts((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value,
      },
    }));
  }

  async function saveProduct(product: Product) {
    if (!supabase) {
      setMessage("Configuration Supabase manquante.");
      return;
    }

    const draft = drafts[product.id];
    const price = Number(draft.price);
    const stock = Number(draft.stock);
    const title = draft.title.trim();
    const videoUrl = draft.video_url.trim();
    const slug = makeUniqueSlug(
      title,
      products
        .filter((item) => item.id !== product.id)
        .map((item) => item.slug)
    );
    const coverFile = coverFiles[product.id];
    const videoFile = videoFiles[product.id];

    if (!title || !slug || !Number.isFinite(price) || price < 0) {
      setMessage(`Vérifiez le titre et le prix de l’${singularLabel}.`);
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setMessage("Le stock doit être un nombre entier positif ou nul.");
      return;
    }
    if (!videoFile && !isValidVideoUrl(videoUrl)) {
      setMessage("Ajoutez un lien HTTPS valide vers une vidéo MP4 ou WebM.");
      return;
    }
    if (coverFile) {
      const validationError = validateCover(coverFile);
      if (validationError) {
        setMessage(validationError);
        return;
      }
    }
    if (videoFile) {
      const validationError = validateVideo(videoFile);
      if (validationError) {
        setMessage(validationError);
        return;
      }
    }

    setBusyProductId(product.id);
    setMessage("");
    let uploadedPath: string | null = null;
    let uploadedVideoPath: string | null = null;
    let imageUrl = product.image_url;
    let nextVideoUrl: string | null = videoUrl || null;
    let stage = "la modification de la fiche dans products";

    try {
      if (coverFile) {
        const uploaded = await uploadCover(coverFile);
        uploadedPath = uploaded.path;
        imageUrl = uploaded.publicUrl;
      }
      if (videoFile && videoColumnAvailable) {
        stage = "l’envoi de la vidéo dans le bucket product-videos";
        const uploaded = await uploadVideo(videoFile);
        uploadedVideoPath = uploaded.path;
        nextVideoUrl = uploaded.publicUrl;
      }

      stage = "la mise à jour de la fiche dans products";
      const { data, error } = await supabase
        .from("products")
        .update({
          title,
          slug,
          description: draft.description.trim() || null,
          price,
          stock,
          image_url: imageUrl,
          ...(videoColumnAvailable ? { video_url: nextVideoUrl } : {}),
          category_id: draft.category_id || null,
          is_active: draft.is_active,
        })
        .eq("id", product.id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error(`Aucun ${singularLabel} modifié. Vérifiez vos droits administrateur.`);

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                title,
                slug,
                description: draft.description.trim() || null,
                price,
                stock,
                image_url: imageUrl,
                video_url: videoColumnAvailable ? nextVideoUrl : item.video_url,
                category_id: draft.category_id || null,
                is_active: draft.is_active,
              }
            : item
        )
      );
      setCoverFiles((current) => ({ ...current, [product.id]: null }));
      setVideoFiles((current) => ({ ...current, [product.id]: null }));
      if (videoColumnAvailable) {
        setDrafts((current) => ({
          ...current,
          [product.id]: {
            ...current[product.id],
            video_url: nextVideoUrl || "",
          },
        }));
      }

      if (uploadedPath) {
        const oldPath = coverPathFromPublicUrl(product.image_url);
        if (oldPath) {
          const { error: removeError } = await supabase.storage
            .from("book-covers")
            .remove([oldPath]);
          if (removeError) {
            setMessage(`${isAccessoryMode ? "Accessoire" : isPerfumeryMode ? "Parfum" : "Ouvrage"} modifié, mais l’ancienne photo n’a pas pu être supprimée.`);
            return;
          }
        }
      }
      if (videoColumnAvailable) {
        const oldVideoPath = videoPathFromPublicUrl(product.video_url);
        if (oldVideoPath && product.video_url !== nextVideoUrl) {
          const { error: removeError } = await supabase.storage
            .from("product-videos")
            .remove([oldVideoPath]);
          if (removeError) {
            setMessage(`${isAccessoryMode ? "Accessoire" : isPerfumeryMode ? "Parfum" : "Ouvrage"} modifié, mais l’ancienne vidéo n’a pas pu être supprimée.`);
            return;
          }
        }
      }
    setMessage(`${isAccessoryMode ? "Accessoire" : isPerfumeryMode ? "Parfum" : "Ouvrage"} mis à jour.`);
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from("book-covers").remove([uploadedPath]);
      }
      if (uploadedVideoPath) {
        await supabase.storage.from("product-videos").remove([uploadedVideoPath]);
      }
      const details = getErrorMessage(error);
      const policyHint = details.toLowerCase().includes("row-level security")
        ? stage.includes("product-videos")
          ? " Appliquez la politique product_videos_admin_insert de la migration Supabase."
          : " Vérifiez la politique products_admin_manage dans Supabase."
        : "";
      setMessage(`Échec lors de ${stage} : ${details}.${policyHint}`);
    } finally {
      setBusyProductId(null);
    }
  }
  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Configuration Supabase manquante.");
      return;
    }

    const title = createDraft.title.trim();
    const slug = makeUniqueSlug(
      title,
      products.map((product) => product.slug)
    );
    const price = Number(createDraft.price);
    const stock = Number(createDraft.stock);
    const videoUrl = createDraft.video_url.trim();
    const categoryId = createDraft.category_id;
    const videoFile = createVideoFile;

    if (!title || !slug || !Number.isFinite(price) || price < 0) {
      setMessage(`Vérifiez le titre et le prix de l’${singularLabel}.`);
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setMessage("Le stock doit être un nombre entier positif ou nul.");
      return;
    }
    if (!videoFile && !isValidVideoUrl(videoUrl)) {
      setMessage("Ajoutez un lien HTTPS valide vers une vidéo MP4 ou WebM.");
      return;
    }
    if (createCoverFile) {
      const validationError = validateCover(createCoverFile);
      if (validationError) {
        setMessage(validationError);
        return;
      }
    }
    if (videoFile) {
      const validationError = validateVideo(videoFile);
      if (validationError) {
        setMessage(validationError);
        return;
      }
    }

    setCreating(true);
    setMessage("");
    let uploadedPath: string | null = null;
    let uploadedVideoPath: string | null = null;
    let stage = "l’insertion de la fiche dans products";

    try {
      let imageUrl: string | null = null;
      let nextVideoUrl: string | null = videoUrl || null;
      if (createCoverFile) {
        stage = "l’envoi de la photo dans le bucket book-covers";
        const uploaded = await uploadCover(createCoverFile);
        uploadedPath = uploaded.path;
        imageUrl = uploaded.publicUrl;
      }
      if (videoFile && videoColumnAvailable) {
        stage = "l’envoi de la vidéo dans le bucket product-videos";
        const uploaded = await uploadVideo(videoFile);
        uploadedVideoPath = uploaded.path;
        nextVideoUrl = uploaded.publicUrl;
      }

      stage = "l’insertion de la fiche dans products";
      const { data, error } = await supabase
        .from("products")
        .insert({
          title,
          slug,
          description: createDraft.description.trim() || null,
          price,
          stock,
          image_url: imageUrl,
          ...(videoColumnAvailable ? { video_url: nextVideoUrl } : {}),
          category_id: categoryId,
          is_active: createDraft.is_active,
        })
        .select(
          videoColumnAvailable
            ? "id, title, slug, description, price, stock, image_url, video_url, category_id, is_active"
            : "id, title, slug, description, price, stock, image_url, category_id, is_active"
        )
        .single();
      if (error) throw error;

      const inserted = data as unknown as Product;
      const product = { ...inserted, video_url: inserted.video_url || null };
      setProducts((current) => [product, ...current]);
      setDrafts((current) => ({
        ...current,
        [product.id]: {
          title: product.title,
          description: product.description || "",
          price: String(product.price),
          stock: String(product.stock),
          image_url: product.image_url || "",
          video_url: product.video_url || "",
          category_id: product.category_id || "",
          is_active: product.is_active,
        },
      }));
      setCreateDraft(emptyProductDraft());
      setCreateCoverFile(null);
      setCreateVideoFile(null);
      setShowCreateForm(false);
      setMessage(`${isAccessoryMode ? "Accessoire" : isPerfumeryMode ? "Parfum" : "Ouvrage"} ajouté.`);
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from("book-covers").remove([uploadedPath]);
      }
      if (uploadedVideoPath) {
        await supabase.storage.from("product-videos").remove([uploadedVideoPath]);
      }
      const details = getErrorMessage(error);
      const policyHint = details.toLowerCase().includes("row-level security")
        ? stage.includes("product-videos")
          ? " Appliquez la politique product_videos_admin_insert de la migration Supabase sur le projet utilisé par le site."
          : stage.includes("book-covers")
          ? " Appliquez la politique book_covers_admin_insert de la migration Supabase sur le projet utilisé par le site."
          : " Appliquez la politique products_admin_manage de la migration Supabase sur le projet utilisé par le site."
        : "";
      setMessage(`Échec lors de ${stage} : ${details}.${policyHint}`);
    } finally {
      setCreating(false);
    }
  }
  async function deleteProduct(product: Product) {
    if (
      !window.confirm(
        `Supprimer « ${product.title} » ? Cette action est définitive.`
      )
    ) {
      return;
    }
    if (!supabase) {
      setMessage("Configuration Supabase manquante.");
      return;
    }

    setBusyProductId(product.id);
    setMessage("");
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)
      .select("id")
      .maybeSingle();
    setBusyProductId(null);

    if (error) {
      setMessage(`Impossible de supprimer l’${singularLabel} : ` + error.message);
      return;
    }
    if (!data) {
      setMessage(`Aucun ${singularLabel} supprimé. Vérifiez vos droits administrateur.`);
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
    setDrafts((current) => {
      const next = { ...current };
      delete next[product.id];
      return next;
    });

    const coverPath = coverPathFromPublicUrl(product.image_url);
    if (coverPath) {
      const { error: storageError } = await supabase.storage
        .from("book-covers")
        .remove([coverPath]);
      if (storageError) {
        setMessage(
          `${isAccessoryMode ? "Accessoire" : isPerfumeryMode ? "Parfum" : "Ouvrage"} supprimé, mais sa couverture n’a pas pu être supprimée : ` +
            storageError.message
        );
        return;
      }
    }

    const videoPath = videoPathFromPublicUrl(product.video_url);
    if (videoPath) {
      const { error: storageError } = await supabase.storage
        .from("product-videos")
        .remove([videoPath]);
      if (storageError) {
        setMessage(
          `${isAccessoryMode ? "Accessoire" : isPerfumeryMode ? "Parfum" : "Ouvrage"} supprimé, mais sa vidéo n’a pas pu être supprimée : ` +
            storageError.message
        );
        return;
      }
    }

    setMessage(`${isAccessoryMode ? "Accessoire" : isPerfumeryMode ? "Parfum" : "Ouvrage"} supprimé.`);
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#101D35]">
            {isAccessoryMode
              ? "Catalogue des accessoires"
              : isPerfumeryMode
                ? "Catalogue de la parfumerie"
                : "Ouvrages du catalogue"}
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            {scopedProducts.length} {pluralLabel} dans le catalogue
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm((current) => !current)}
          className="rounded-lg bg-[#101D35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#263D5B]"
        >
          {showCreateForm
            ? "Fermer le formulaire"
            : `Ajouter ${isAccessoryMode ? "un accessoire" : isPerfumeryMode ? "un parfum" : "un ouvrage"}`}
        </button>
      </div>
      {!loading && !videoColumnAvailable && (
        <p className="mb-5 rounded-xl border border-[#E8DCC2] bg-[#F5E6C8]/50 p-4 text-sm leading-6 text-[#52627A]">
          Les vidéos seront activées après l’application de la migration
          {" « 20261118000100_product_videos.sql » "}dans Supabase. Le catalogue reste utilisable en attendant.
        </p>
      )}
      {showCreateForm && (
        <form onSubmit={createProduct} className="mb-6 grid gap-4 rounded-2xl bg-white p-5 shadow sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Titre
            <input required maxLength={200} value={createDraft.title} onChange={(event) => setCreateDraft((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full rounded border p-2 font-normal" />
          </label>
          <label className="text-sm font-semibold">
            Prix (FCFA)
            <input required type="number" min="0" step="1" value={createDraft.price} onChange={(event) => setCreateDraft((current) => ({ ...current, price: event.target.value }))} className="mt-1 w-full rounded border p-2 font-normal" />
          </label>
          <label className="text-sm font-semibold">
            {isAccessoryMode
              ? "Catégorie d’accessoire"
              : isPerfumeryMode
                ? "Catégorie de parfum"
                : "Type d’ouvrage"}
            <select required value={createDraft.category_id} onChange={(event) => setCreateDraft((current) => ({ ...current, category_id: event.target.value }))} className="mt-1 w-full rounded border p-2 font-normal">
              <option value="">Choisir un type</option>
              {scopedCategories.map((category) => <option key={category.id} value={category.id}>{displayCategoryName(category.name)}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Stock
            <input required type="number" min="0" step="1" value={createDraft.stock} onChange={(event) => setCreateDraft((current) => ({ ...current, stock: event.target.value }))} className="mt-1 w-full rounded border p-2 font-normal" />
          </label>
          <label className="text-sm font-semibold">
            Photo de l’{singularLabel}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setCreateCoverFile(event.target.files?.[0] || null)} className="mt-1 w-full rounded border p-2 font-normal" />
            <span className="mt-1 block text-xs font-normal text-gray-500">JPG, PNG ou WebP, 5 Mo maximum</span>
            {videoColumnAvailable && (
              <span className="mt-1 block text-xs font-normal text-gray-500">
                Facultative si une vidéo est ajoutée : elle servira de couverture.
              </span>
            )}
          </label>
          {videoColumnAvailable && (
            <div className="text-sm font-semibold">
              Vidéo de présentation
              <input type="file" accept="video/mp4,video/webm" onChange={(event) => setCreateVideoFile(event.target.files?.[0] || null)} className="mt-1 w-full rounded border p-2 font-normal" />
              {createVideoFile && (
                <span className="mt-1 block text-xs font-normal text-gray-500">Vidéo sélectionnée : {createVideoFile.name}</span>
              )}
              <span className="mt-1 block text-xs font-normal text-gray-500">MP4 ou WebM, 50 Mo maximum. Vous pouvez aussi coller un lien HTTPS direct :</span>
              <input type="url" value={createDraft.video_url} onChange={(event) => setCreateDraft((current) => ({ ...current, video_url: event.target.value }))} placeholder={`https://…/${singularLabel}.mp4`} className="mt-1 w-full rounded border p-2 font-normal" />
            </div>
          )}
          <label className="text-sm font-semibold sm:col-span-2">
            Description
            <textarea maxLength={5000} rows={3} value={createDraft.description} onChange={(event) => setCreateDraft((current) => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded border p-2 font-normal" />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
            <input type="checkbox" checked={createDraft.is_active} onChange={(event) => setCreateDraft((current) => ({ ...current, is_active: event.target.checked }))} />
            Publier dans la boutique
          </label>
          {scopedCategories.length === 0 && (
            <p className="text-sm text-amber-800 sm:col-span-2">
              {isAccessoryMode
                ? "Les catégories d’accessoires ne sont pas disponibles. Appliquez la migration 20261119000200_accessory_types.sql dans Supabase."
                : isPerfumeryMode
                  ? "Les catégories de parfumerie ne sont pas disponibles. Appliquez la migration 20261119000300_perfumery_categories.sql dans Supabase."
                  : "Aucune catégorie n’est disponible. Ajoutez d’abord un type dans la table categories de Supabase."}
            </p>
          )}
          <button type="submit" disabled={creating || scopedCategories.length === 0} className="w-fit rounded-lg bg-[#101D35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#263D5B] disabled:opacity-50">
            {creating ? "Création en cours…" : `Créer l’${singularLabel}`}
          </button>
        </form>
      )}
      {message && (
        <p role="status" className="mb-4 rounded-lg bg-white p-4 text-sm text-[#263D5B]">
          {message}
        </p>
      )}
      {loading ? (
        <p className="text-[#263D5B]">Chargement des {pluralLabel}...</p>
      ) : scopedProducts.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-gray-600">
          Aucun {singularLabel} enregistré.
        </p>
      ) : (
        <ul className="space-y-5">
          {scopedProducts.map((product) => {
            const draft = drafts[product.id];
            if (!draft) return null;

            return (
              <li
                key={product.id}
                className="grid gap-5 rounded-2xl bg-white p-5 shadow md:grid-cols-[8rem_minmax(0,1fr)]"
              >
                {product.image_url ? (
                  <div className="relative h-40 w-32 shrink-0 overflow-hidden rounded bg-[#F5E6C8]">
                    <Image
                      src={product.image_url}
                      alt={`${isAccessoryMode || isPerfumeryMode ? "Photo" : "Couverture"} de ${product.title}`}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                ) : product.video_url ? (
                  <video
                    src={product.video_url}
                    aria-label={`Vidéo servant de couverture pour ${product.title}`}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    className="h-40 w-32 shrink-0 rounded bg-[#F5E6C8] object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-32 items-center justify-center rounded bg-[#F5E6C8] text-center text-xs">
                    Aucun visuel
                  </div>
                )}
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Titre
                    <input value={draft.title} maxLength={200} onChange={(event) => updateDraft(product.id, "title", event.target.value)} className="mt-1 w-full rounded border p-2 font-normal" />
                  </label>
                  <label className="text-sm font-semibold">
                    Prix (FCFA)
                    <input type="number" min="0" step="1" value={draft.price} onChange={(event) => updateDraft(product.id, "price", event.target.value)} className="mt-1 w-full rounded border p-2 font-normal" />
                  </label>
                  <label className="text-sm font-semibold">
                    {isAccessoryMode
                      ? "Catégorie d’accessoire"
                      : isPerfumeryMode
                        ? "Catégorie de parfum"
                        : "Type d’ouvrage"}
                    <select value={draft.category_id} onChange={(event) => updateDraft(product.id, "category_id", event.target.value)} className="mt-1 w-full rounded border p-2 font-normal">
                      <option value="">Sans catégorie</option>
                      {scopedCategories.map((category) => <option key={category.id} value={category.id}>{displayCategoryName(category.name)}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Stock
                    <input type="number" min="0" step="1" value={draft.stock} onChange={(event) => updateDraft(product.id, "stock", event.target.value)} className="mt-1 w-full rounded border p-2 font-normal" />
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={draft.is_active} onChange={(event) => updateDraft(product.id, "is_active", event.target.checked)} />
                    Publié dans la boutique
                  </label>
                  <label className="text-sm font-semibold md:col-span-2">
                    Remplacer la photo de l’{singularLabel}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setCoverFiles((current) => ({ ...current, [product.id]: event.target.files?.[0] || null }))} className="mt-1 w-full rounded border p-2 font-normal" />
                    {coverFiles[product.id] && (
                      <span className="mt-1 block text-xs font-normal text-gray-500">Photo sélectionnée : {coverFiles[product.id]?.name}</span>
                    )}
                  </label>
                  {videoColumnAvailable && (
                    <div className="text-sm font-semibold md:col-span-2">
                      Lien de la vidéo de présentation
                      <input type="file" accept="video/mp4,video/webm" onChange={(event) => setVideoFiles((current) => ({ ...current, [product.id]: event.target.files?.[0] || null }))} className="mt-1 w-full rounded border p-2 font-normal" />
                      {videoFiles[product.id] && (
                        <span className="mt-1 block text-xs font-normal text-gray-500">Nouvelle vidéo sélectionnée : {videoFiles[product.id]?.name}</span>
                      )}
                      <span className="mt-1 block text-xs font-normal text-gray-500">MP4 ou WebM, 50 Mo maximum. Vous pouvez aussi conserver ou coller un lien HTTPS direct :</span>
                      <input type="url" value={draft.video_url} onChange={(event) => updateDraft(product.id, "video_url", event.target.value)} placeholder={`https://…/${singularLabel}.mp4`} className="mt-1 w-full rounded border p-2 font-normal" />
                      <span className="mt-1 block text-xs font-normal text-gray-500">Laissez le lien vide et n’ajoutez pas de fichier pour retirer la vidéo.</span>
                    </div>
                  )}
                  <label className="text-sm font-semibold md:col-span-2">
                    Description
                    <textarea value={draft.description} maxLength={5000} rows={3} onChange={(event) => updateDraft(product.id, "description", event.target.value)} className="mt-1 w-full rounded border p-2 font-normal" />
                  </label>
                  <div className="flex flex-wrap gap-4 md:col-span-2">
                    <button type="button" disabled={busyProductId === product.id} onClick={() => saveProduct(product)} className="rounded-lg bg-[#101D35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#263D5B] disabled:opacity-50">
                      Enregistrer
                    </button>
                    <button type="button" disabled={busyProductId === product.id} onClick={() => deleteProduct(product)} className="rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                      Supprimer l’{singularLabel}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
