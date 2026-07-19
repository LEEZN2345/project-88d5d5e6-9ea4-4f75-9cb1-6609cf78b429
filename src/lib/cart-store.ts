import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  color: string;
  size: string;
  qty: number;
  tier?: "solo" | "group" | "bulk";
};

const KEY = "ddth_cart_v1";
let items: CartItem[] = load();
const listeners = new Set<() => void>();

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
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

export function useCart() {
  return useSyncExternalStore(subscribe, snapshot, () => [] as CartItem[]);
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
  clear() {
    items = [];
    persist();
  },
};