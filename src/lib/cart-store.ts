import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  color: string;
  size: string;
  qty: number;
  tier?: "solo" | "group" | "bulk";
};

export function cartItemKey(i: Pick<CartItem, "productId" | "color" | "size" | "tier">) {
  return `${i.productId}|${i.color}|${i.size}|${i.tier ?? "solo"}`;
}

const KEY = "ddth_cart_v1";
const EMPTY_CART: CartItem[] = [];
let items: CartItem[] = load();
const listeners = new Set<() => void>();

function load(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return EMPTY_CART;
  }
}
function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(items));
  }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  return items;
}
function getServerSnapshot() {
  return EMPTY_CART;
}

export function useCart() {
  return useSyncExternalStore(subscribe, snapshot, getServerSnapshot);
}

export function useCartCount() {
  const list = useCart();
  return list.reduce((n, i) => n + i.qty, 0);
}

export const cart = {
  add(item: CartItem) {
    const idx = items.findIndex(
      (i) =>
        i.productId === item.productId &&
        i.color === item.color &&
        i.size === item.size &&
        (i.tier ?? "solo") === (item.tier ?? "solo"),
    );
    if (idx >= 0) items[idx] = { ...items[idx]!, qty: items[idx]!.qty + item.qty };
    else items = [...items, item];
    persist();
  },
  setQty(idx: number, qty: number) {
    if (qty <= 0) {
      items = items.filter((_, i) => i !== idx);
    } else {
      items = items.map((it, i) => (i === idx ? { ...it, qty } : it));
    }
    persist();
  },
  remove(idx: number) {
    items = items.filter((_, i) => i !== idx);
    persist();
  },
  removeByKeys(keys: string[]) {
    const set = new Set(keys);
    items = items.filter((it) => !set.has(cartItemKey(it)));
    persist();
  },
  clear() {
    items = [];
    persist();
  },
};