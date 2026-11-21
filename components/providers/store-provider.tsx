"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import type { ProductCardData } from "@/lib/products";
import type { ServerShopState } from "@/app/actions/shop";
import {
  clearSearchHistoryAction,
  mergeGuestActivity,
  recordProductView,
  recordSearch,
  syncShopState,
} from "@/app/actions/shop";
import type {
  CartLine,
  StoreUser,
  ToastItem,
  ToastTone,
} from "@/lib/store-types";
import type { ShippingConfig } from "@/lib/shipping";

const GUEST_KEY = "omnexa.guest.v1";

type GuestState = {
  cart: CartLine[];
  wishlist: ProductCardData[];
  searchHistory: string[];
  recentlyViewed: ProductCardData[];
};

type StoreContextValue = {
  user: StoreUser | null;
  cart: CartLine[];
  wishlist: ProductCardData[];
  searchHistory: string[];
  recentlyViewed: ProductCardData[];
  cartCount: number;
  wishlistCount: number;
  shipping: ShippingConfig;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (
    product: ProductCardData,
    options?: { quantity?: number; variant?: string; silent?: boolean },
  ) => void;
  removeFromCart: (productId: string, variant: string) => void;
  updateQuantity: (productId: string, variant: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  toggleWishlist: (product: ProductCardData) => void;
  isWishlisted: (productId: string) => boolean;
  addSearch: (query: string) => void;
  clearSearchHistory: () => Promise<void>;
  addRecentlyViewed: (product: ProductCardData) => void;
  toast: (message: string, tone?: ToastTone) => void;
  toasts: ToastItem[];
  dismissToast: (id: number) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function readGuestState(): GuestState {
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    if (!raw) return emptyGuest();
    const parsed = JSON.parse(raw) as Partial<GuestState>;
    return {
      cart: Array.isArray(parsed.cart)
        ? parsed.cart.filter(
            (line) =>
              line &&
              typeof line.productId === "string" &&
              typeof line.quantity === "number",
          )
        : [],
      wishlist: Array.isArray(parsed.wishlist)
        ? parsed.wishlist.filter((item) => item && typeof item.id === "string")
        : [],
      searchHistory: Array.isArray(parsed.searchHistory)
        ? parsed.searchHistory.filter((item) => typeof item === "string").slice(0, 10)
        : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed)
        ? parsed.recentlyViewed
            .filter((item) => item && typeof item.id === "string")
            .slice(0, 8)
        : [],
    };
  } catch {
    return emptyGuest();
  }
}

function emptyGuest(): GuestState {
  return { cart: [], wishlist: [], searchHistory: [], recentlyViewed: [] };
}

function mergeUniqueWishlist(
  first: ProductCardData[],
  second: ProductCardData[],
) {
  const map = new Map<string, ProductCardData>();
  for (const item of [...first, ...second]) map.set(item.id, item);
  return Array.from(map.values()).slice(0, 100);
}

function mergeSearchHistory(first: string[], second: string[]) {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const item of [...first, ...second]) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged.slice(0, 8);
}

function mergeRecentlyViewed(
  first: ProductCardData[],
  second: ProductCardData[],
) {
  const map = new Map<string, ProductCardData>();
  for (const item of [...first, ...second]) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return Array.from(map.values()).slice(0, 8);
}

function mergeCart(server: CartLine[], guest: CartLine[]) {
  const map = new Map<string, CartLine>();
  for (const line of server) {
    map.set(`${line.productId}::${line.variant}`, line);
  }
  for (const line of guest) {
    const key = `${line.productId}::${line.variant}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity = Math.min(
        Math.max(existing.stock, 1),
        existing.quantity + line.quantity,
      );
    } else {
      map.set(key, line);
    }
  }
  return Array.from(map.values());
}

export function StoreProvider({
  children,
  initialUser,
  initialState,
  shipping,
}: {
  children: React.ReactNode;
  initialUser: StoreUser | null;
  initialState: ServerShopState | null;
  shipping: ShippingConfig;
}) {
  const user = initialUser;
  const [cart, setCart] = useState<CartLine[]>(() => initialState?.cart ?? []);
  const [wishlist, setWishlist] = useState<ProductCardData[]>(
    () => initialState?.wishlist ?? [],
  );
  const [searchHistory, setSearchHistory] = useState<string[]>(
    () => initialState?.searchHistory ?? [],
  );
  const [recentlyViewed, setRecentlyViewed] = useState<ProductCardData[]>(
    () => initialState?.recentlyViewed ?? [],
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [ready, setReady] = useState(false);

  const router = useRouter();
  const toastId = useRef(0);
  const timers = useRef<number[]>([]);
  const guestMergedFor = useRef<string | null>(null);
  const guestMergePending = useRef(false);
  const guestActivityMerged = useRef(false);
  const guestShopSynced = useRef(true);
  const lastSynced = useRef<string>(
    JSON.stringify({
      cart: initialState?.cart ?? [],
      wishlist: (initialState?.wishlist ?? []).map((item) => item.id),
    }),
  );

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3800);
    timers.current.push(timer);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const completeGuestMerge = useCallback(() => {
    if (
      !guestMergePending.current ||
      !guestActivityMerged.current ||
      !guestShopSynced.current
    ) {
      return;
    }

    guestMergePending.current = false;
    try {
      window.localStorage.removeItem(GUEST_KEY);
    } catch {
      // Ignore storage failures.
    }
    router.refresh();
    toast(
      "Your saved bag, wishlist and browsing history have been added to your account.",
      "info",
    );
  }, [router, toast]);

  useEffect(() => {
    return () => {
      for (const timer of timers.current) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      const payload: GuestState = {
        cart,
        wishlist,
        searchHistory,
        recentlyViewed,
      };
      try {
        window.localStorage.setItem(GUEST_KEY, JSON.stringify(payload));
      } catch {
        // Storage can be unavailable in private browsing modes.
      }
      return;
    }

    const signature = JSON.stringify({
      cart,
      wishlist: wishlist.map((item) => item.id),
    });
    if (signature === lastSynced.current) {
      if (guestMergePending.current) {
        guestShopSynced.current = true;
        completeGuestMerge();
      }
      return;
    }

    const timer = window.setTimeout(async () => {
      const result = await syncShopState({
        cart: cart.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          variant: line.variant,
        })),
        wishlist: wishlist.map((item) => item.id),
      });
      if (result.status === "error") {
        toast("Your bag could not be synced. Please sign in again.", "error");
      } else {
        lastSynced.current = signature;
        if (guestMergePending.current) {
          guestShopSynced.current = true;
          completeGuestMerge();
        }
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [
    cart,
    wishlist,
    ready,
    user,
    toast,
    searchHistory,
    recentlyViewed,
    completeGuestMerge,
  ]);

  useEffect(() => {
    let guest: GuestState | null = null;
    try {
      guest = readGuestState();
    } catch {
      guest = null;
    }

    if (user) {
      if (guestMergedFor.current === user.id) {
        setReady(true);
        return;
      }
      guestMergedFor.current = user.id;

      const hasGuestActivity = Boolean(
        guest &&
          (guest.cart.length > 0 ||
            guest.wishlist.length > 0 ||
            guest.searchHistory.length > 0 ||
            guest.recentlyViewed.length > 0),
      );

      if (guest && hasGuestActivity) {
        guestMergePending.current = true;
        guestActivityMerged.current = false;
        guestShopSynced.current =
          guest.cart.length === 0 && guest.wishlist.length === 0;

        if (guest.cart.length > 0) {
          setCart((current) => mergeCart(current, guest!.cart));
        }
        if (guest.wishlist.length > 0) {
          setWishlist((current) =>
            mergeUniqueWishlist(current, guest!.wishlist),
          );
        }
        if (guest.searchHistory.length > 0) {
          setSearchHistory((current) =>
            mergeSearchHistory(guest!.searchHistory, current),
          );
        }
        if (guest.recentlyViewed.length > 0) {
          setRecentlyViewed((current) =>
            mergeRecentlyViewed(guest!.recentlyViewed, current),
          );
        }

        const guestActivity = {
          searchHistory: guest.searchHistory,
          recentlyViewed: guest.recentlyViewed.map((item) => item.id),
        };

        void (async () => {
          try {
            const result = await mergeGuestActivity(guestActivity);
            if (result.status !== "success") {
              toast(
                "Your saved bag and wishlist were merged, but your browsing history could not be saved yet. It remains in this browser.",
                "error",
              );
              return;
            }
            guestActivityMerged.current = true;
            completeGuestMerge();
          } catch {
            toast(
              "Your saved bag and wishlist were merged, but your browsing history could not be saved yet. It remains in this browser.",
              "error",
            );
          }
        })();
      }
    } else if (guest) {
      setCart(guest.cart);
      setWishlist(guest.wishlist);
      setSearchHistory(guest.searchHistory);
      setRecentlyViewed(guest.recentlyViewed);
    }
    setReady(true);
    // Guest data is merged once per signed-in session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, completeGuestMerge, toast]);

  const addToCart = useCallback<StoreContextValue["addToCart"]>(
    (product, options) => {
      if (product.status !== "AVAILABLE" || product.stock < 1) {
        toast(
          product.status === "COMING_SOON"
            ? "This piece is coming soon. Join the notification list."
            : "This piece is currently sold out.",
          "error",
        );
        return;
      }

      const variant =
        options?.variant ||
        (product.variantLabel && product.variantOptions.length > 0
          ? product.variantOptions[0]
          : "");
      const quantity = Math.max(1, options?.quantity ?? 1);

      setCart((current) => {
        const index = current.findIndex(
          (line) =>
            line.productId === product.id && line.variant === variant,
        );

        if (index >= 0) {
          const next = [...current];
          const line = next[index];
          const nextQuantity = Math.min(
            line.stock,
            line.quantity + quantity,
          );
          if (nextQuantity === line.quantity) {
            toast(`Only ${line.stock} of ${line.name} are available.`, "error");
            return current;
          }
          next[index] = { ...line, quantity: nextQuantity };
          return next;
        }

        return [
          ...current,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            stock: product.stock,
            status: product.status,
            quantity: Math.min(product.stock, quantity),
            variant,
          },
        ];
      });

      if (!options?.silent) {
        toast(`${product.name} added to your bag.`);
        setCartOpen(true);
      }
    },
    [toast],
  );

  const removeFromCart = useCallback((productId: string, variant: string) => {
    setCart((current) =>
      current.filter(
        (line) => !(line.productId === productId && line.variant === variant),
      ),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variant: string, quantity: number) => {
      setCart((current) =>
        current.map((line) => {
          if (line.productId !== productId || line.variant !== variant) {
            return line;
          }
          return {
            ...line,
            quantity: Math.max(1, Math.min(line.stock, quantity)),
          };
        }),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setCart([]), []);

  const isInCart = useCallback(
    (productId: string) => cart.some((line) => line.productId === productId),
    [cart],
  );

  const toggleWishlist = useCallback<StoreContextValue["toggleWishlist"]>(
    (product) => {
      setWishlist((current) => {
        const exists = current.some((item) => item.id === product.id);
        if (exists) {
          toast("Removed from your wishlist.", "info");
          return current.filter((item) => item.id !== product.id);
        }
        toast("Saved to your wishlist.");
        return [product, ...current];
      });
    },
    [toast],
  );

  const isWishlisted = useCallback(
    (productId: string) =>
      wishlist.some((item) => item.id === productId),
    [wishlist],
  );

  const addSearch = useCallback(
    (query: string) => {
      const clean = query.trim();
      if (clean.length < 2) return;
      setSearchHistory((current) => {
        const next = [
          clean,
          ...current.filter(
            (item) => item.toLowerCase() !== clean.toLowerCase(),
          ),
        ].slice(0, 8);
        return next;
      });
      if (user) void recordSearch(clean);
    },
    [user],
  );

  const clearSearchHistory = useCallback(async () => {
    if (user) {
      const result = await clearSearchHistoryAction();
      if (result.status === "error") {
        toast(result.message || "Could not clear your search history.", "error");
        return;
      }
    }
    setSearchHistory([]);
    toast("Search history cleared.", "info");
  }, [user, toast]);

  const addRecentlyViewed = useCallback((product: ProductCardData) => {
    setRecentlyViewed((current) => [
      product,
      ...current.filter((item) => item.id !== product.id),
    ].slice(0, 8));
    if (user) void recordProductView(product.id);
  }, [user]);

  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  );
  const wishlistCount = wishlist.length;

  const value: StoreContextValue = {
    user,
    cart,
    wishlist,
    searchHistory,
    recentlyViewed,
    cartCount,
    wishlistCount,
    shipping,
    cartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    toggleWishlist,
    isWishlisted,
    addSearch,
    clearSearchHistory,
    addRecentlyViewed,
    toast,
    toasts,
    dismissToast,
  };

  return (
    <StoreContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
}
