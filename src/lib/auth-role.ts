import { useSyncExternalStore } from "react";

export type AdminRole = "super" | "orders" | "shipping";
export type AppRole = AdminRole | "user";

export const ROLE_LABEL: Record<AppRole, string> = {
  super: "总管理员",
  orders: "订单管理员",
  shipping: "发货管理员",
  user: "买手 / 客户",
};

const KEY = "app_role_v1";
const listeners = new Set<() => void>();

function read(): AppRole {
  if (typeof window === "undefined") return "super";
  const v = window.localStorage.getItem(KEY) as AppRole | null;
  return v ?? "super";
}

export function setRole(role: AppRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, role);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useRole(): AppRole {
  return useSyncExternalStore(subscribe, read, () => "super");
}

/** 各后台菜单路径对应的允许角色。总管理员默认可见全部。 */
export const ADMIN_ROUTE_ROLES: Record<string, AdminRole[]> = {
  "/admin": ["super", "orders", "shipping"],
  "/admin/guide": ["super", "orders", "shipping"],
  // 订单管理员范围
  "/admin/orders": ["super", "orders"],
  "/admin/feedback": ["super", "orders"],
  "/admin/groups": ["super", "orders"],
  // 发货管理员范围
  "/admin/shipping": ["super", "shipping"],
  // 共享
  "/admin/stock": ["super", "orders", "shipping"],
  "/admin/exchanges": ["super", "orders", "shipping"],
  // 仅总管理员
  "/admin/refunds": ["super"],
  "/admin/products": ["super"],
  "/admin/categories": ["super"],
  "/admin/shops": ["super"],
  "/admin/users": ["super"],
  "/admin/staff": ["super"],
  "/admin/user-tags": ["super"],
  "/admin/user-groups": ["super"],
  "/admin/sign-in": ["super"],
  "/admin/points-mall": ["super"],
  "/admin/points-rules": ["super"],
  "/admin/membership": ["super"],
  "/admin/commission": ["super"],
  "/admin/invites": ["super"],
  "/admin/payment-accounts": ["super"],
  "/admin/analytics": ["super"],
  "/admin/config": ["super"],
  "/admin/banners": ["super"],
  "/admin/home-decoration": ["super"],
};

export function canAccess(path: string, role: AppRole): boolean {
  if (role === "user") return false;
  if (role === "super") return true;
  const allowed = ADMIN_ROUTE_ROLES[path];
  if (!allowed) return false;
  return allowed.includes(role);
}