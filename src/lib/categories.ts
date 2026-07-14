import { useEffect, useState } from "react";

// 商品属性分类（品类）：可在后台编辑，前端筛选器可复用。
// 使用 localStorage 做持久化，模拟后端 CRUD。

export type ProductCategory = {
  id: string;
  name: string; // 中文名
  nameKo?: string; // 韩文名（可选）
  icon?: string; // emoji 或短字符
  sort: number;
  enabled: boolean;
};

const STORAGE_KEY = "platform_product_categories_v1";

export const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: "outer", name: "外套", nameKo: "아우터", icon: "🧥", sort: 10, enabled: true },
  { id: "knit", name: "针织", nameKo: "니트", icon: "🧶", sort: 20, enabled: true },
  { id: "shirt", name: "衬衫", nameKo: "셔츠", icon: "👔", sort: 30, enabled: true },
  { id: "tee", name: "T 恤", nameKo: "티셔츠", icon: "👕", sort: 40, enabled: true },
  { id: "dress", name: "连衣裙", nameKo: "원피스", icon: "👗", sort: 50, enabled: true },
  { id: "skirt", name: "半身裙", nameKo: "스커트", icon: "👚", sort: 60, enabled: true },
  { id: "pants", name: "裤装", nameKo: "팬츠", icon: "👖", sort: 70, enabled: true },
  { id: "shoes", name: "鞋", nameKo: "슈즈", icon: "👟", sort: 80, enabled: true },
  { id: "bag", name: "包袋", nameKo: "가방", icon: "👜", sort: 90, enabled: true },
  { id: "acc", name: "配饰", nameKo: "액세서리", icon: "💍", sort: 100, enabled: true },
];

function readStorage(): ProductCategory[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProductCategory[];
  } catch {
    return null;
  }
}

export function getCategories(): ProductCategory[] {
  return (readStorage() ?? DEFAULT_CATEGORIES).slice().sort((a, b) => a.sort - b.sort);
}

export function saveCategories(list: ProductCategory[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("platform-categories-updated"));
}

export function useCategories(): ProductCategory[] {
  const [list, setList] = useState<ProductCategory[]>(() =>
    typeof window === "undefined" ? DEFAULT_CATEGORIES : getCategories(),
  );
  useEffect(() => {
    const sync = () => setList(getCategories());
    sync();
    window.addEventListener("platform-categories-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("platform-categories-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
