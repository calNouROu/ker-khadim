"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ker-khadim-cart-v1";

export type CartItem = {
  productId: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  videoUrl?: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  isReady: boolean;
  storageError: string | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const EMPTY_ITEMS: CartItem[] = [];

type CartSnapshot = {
  items: CartItem[];
  isReady: boolean;
  storageError: string | null;
};

const SERVER_SNAPSHOT: CartSnapshot = {
  items: EMPTY_ITEMS,
  isReady: false,
  storageError: null,
};

let browserSnapshot: CartSnapshot | null = null;
const listeners = new Set<() => void>();

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.productId === "string" &&
    typeof item.title === "string" &&
    typeof item.slug === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.stock === "number" &&
    Number.isInteger(item.stock) &&
    item.stock >= 0 &&
    (typeof item.imageUrl === "string" || item.imageUrl === null) &&
    (item.videoUrl === undefined ||
      typeof item.videoUrl === "string" ||
      item.videoUrl === null) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

function getBrowserSnapshot(): CartSnapshot {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  if (browserSnapshot) return browserSnapshot;

  let items: CartItem[] = [];
  let storageError: string | null = null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every(isCartItem)) {
        items = parsed;
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
        storageError =
          "Le panier enregistré était invalide et a été réinitialisé.";
      }
    }
  } catch (error) {
    console.error("Impossible de charger le panier enregistré.", error);
    storageError = "Le panier ne peut pas être chargé depuis cet appareil.";
  }

  browserSnapshot = { items, isReady: true, storageError };
  return browserSnapshot;
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  function handleStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    browserSnapshot = null;
    notifyListeners();
  }

  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function saveItems(items: CartItem[]) {
  let storageError: string | null = null;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Impossible d'enregistrer le panier.", error);
    storageError = "Le panier ne peut pas être enregistré sur cet appareil.";
  }

  browserSnapshot = { items, isReady: true, storageError };
  notifyListeners();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getBrowserSnapshot,
    () => SERVER_SNAPSHOT
  );
  const { items, isReady, storageError } = snapshot;

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number) => {
      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > item.stock ||
        !Number.isFinite(item.price) ||
        item.price < 0
      ) {
        return false;
      }

      const current = getBrowserSnapshot().items;
      const existing = current.find(
        (cartItem) => cartItem.productId === item.productId
      );
      const nextItems = existing
        ? current.map((cartItem) =>
            cartItem.productId === item.productId
              ? {
                  ...cartItem,
                  ...item,
                  quantity: Math.min(existing.quantity + quantity, item.stock),
                }
              : cartItem
          )
        : [...current, { ...item, quantity }];

      saveItems(nextItems);

      return true;
    },
    []
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (!Number.isFinite(quantity) || !Number.isInteger(quantity)) return;

    const current = getBrowserSnapshot().items;
    const nextItems = current
      .map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.min(Math.max(1, quantity), item.stock),
            }
          : item
      )
      .filter((item) => item.stock > 0);
    saveItems(nextItems);
  }, []);

  const removeItem = useCallback((productId: string) => {
    saveItems(
      getBrowserSnapshot().items.filter(
        (item) => item.productId !== productId
      )
    );
  }, []);

  const clearCart = useCallback(() => saveItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      items,
      itemCount,
      total,
      isReady,
      storageError,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [
    items,
    isReady,
    storageError,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé dans un CartProvider.");
  }
  return context;
}
