import { useSyncExternalStore } from "react";
import { ORDERS, PRODUCTS, PAY_METHODS, REFERENCE_RATE, krwToCny, type Order, type OrderChannel } from "./mock-data";
import { cart, type CartItem } from "./cart-store";

export type PendingItem = {
  productId: string;
  color: string;
  size: string;
  qty: number;
  tier: "solo" | "group" | "bulk";
};

type PendingState = {
  items: PendingItem[];
  source: "buy" | "cart";
  /** 用于结算成功后清理购物车 */
  cartKeys?: string[];
  /** 首次进入结算的时间戳，用于恢复提示 */
  createdAt?: number;
};

const PENDING_KEY = "ddth_checkout_pending_v1";
const ORDERS_KEY = "ddth_orders_v1";
/** pending 最长保留时长（24h 后视为过期，自动清理） */
export const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

function loadPending(): PendingState {
  if (typeof window === "undefined") return { items: [], source: "buy" };
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return { items: [], source: "buy" };
    const parsed = JSON.parse(raw) as PendingState;
    if (parsed.createdAt && Date.now() - parsed.createdAt > PENDING_TTL_MS) {
      localStorage.removeItem(PENDING_KEY);
      return { items: [], source: "buy" };
    }
    return parsed;
  } catch {
    return { items: [], source: "buy" };
  }
}
function persistPending() {
  if (typeof window !== "undefined") {
    if (state.items.length === 0) {
      localStorage.removeItem(PENDING_KEY);
    } else {
      localStorage.setItem(PENDING_KEY, JSON.stringify(state));
    }
  }
  listeners.forEach((l) => l());
}

let state: PendingState = loadPending();
const listeners = new Set<() => void>();

export const checkoutStore = {
  setBuyNow(item: PendingItem) {
    state = { items: [item], source: "buy", createdAt: Date.now() };
    persistPending();
  },
  setFromCart(items: (CartItem & { key: string })[]) {
    state = {
      items: items.map(({ productId, color, size, qty, tier }) => ({
        productId,
        color,
        size,
        qty,
        tier: tier ?? "solo",
      })),
      source: "cart",
      cartKeys: items.map((i) => i.key),
      createdAt: Date.now(),
    };
    persistPending();
  },
  clear() {
    state = { items: [], source: "buy" };
    persistPending();
  },
  get() {
    return state;
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  return state;
}
export function usePendingCheckout() {
  return useSyncExternalStore(subscribe, snapshot, () => ({ items: [], source: "buy" } as PendingState));
}

// ============ Orders 持久化 ============

function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function persistOrders(list: Order[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  }
}

// 启动时把已存订单合并进 ORDERS(避免刷新丢失)
if (typeof window !== "undefined") {
  const saved = loadOrders();
  for (const o of saved) {
    if (!ORDERS.some((x) => x.id === o.id)) ORDERS.unshift(o);
  }
}

export function createOrderFromPending(opts: {
  channelId: string;
  channelLabel: string;
  totalKRW: number;
  totalCNY: number;
}): Order | null {
  const pending = checkoutStore.get();
  if (!pending.items.length) return null;

  const items = pending.items
    .map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.productId);
      return p ? { product: p, qty: i.qty, color: i.color, size: i.size } : null;
    })
    .filter(Boolean) as Order["items"];

  const tierToChannel: Record<PendingItem["tier"], OrderChannel> = {
    solo: "single",
    group: "group",
    bulk: "moq2",
  };

  const payAcc = PAY_METHODS.find((m) => m.id === opts.channelId);
  const id = "DD" + new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

  const order: Order = {
    id,
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    items,
    totalKRW: opts.totalKRW,
    totalCNY: opts.totalCNY,
    snapshotRate: REFERENCE_RATE,
    status: "paid_pending_proxy",
    channel: tierToChannel[pending.items[0]!.tier],
    paymentAccount: {
      name: payAcc?.label ?? "平台收款",
      channel: opts.channelId.startsWith("alipay") ? "alipay" : "wechat",
      holder: "平台代收",
    },
    buyer: {
      name: "张老板",
      phone: "138****6621",
      address: "广东省 广州市 白云区 沙河服装批发市场 B 栋 318 档",
    },
  };

  ORDERS.unshift(order);
  const savedList = loadOrders();
  savedList.unshift(order);
  persistOrders(savedList);

  // 清理购物车里对应的行
  if (pending.source === "cart" && pending.cartKeys?.length) {
    cart.removeByKeys(pending.cartKeys);
  }
  checkoutStore.clear();
  return order;
}

// 只是为了避免 tree-shaking 时 krwToCny 变成未使用告警
void krwToCny;