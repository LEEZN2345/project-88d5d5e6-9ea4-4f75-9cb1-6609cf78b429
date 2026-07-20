import { useEffect, useState } from "react";

// 商品属性分类（最多三级）
// - 一级：频道（女装 / 男装 / 女鞋 …）用于首页九宫格
// - 二级：分类（上衣 / 外套 …）用于品类页顶部横向标签
// - 三级：细分（可选，如 上衣 → T恤 / 衬衫 / 卫衣），用于品类页下的芯片筛选
// 后台可编辑，localStorage 持久化。

export type LeafCategory = {
  id: string;
  name: string;
  nameKo?: string;
  enabled: boolean;
};

export type SubCategory = {
  id: string;
  name: string;
  nameKo?: string;
  enabled: boolean;
  leafs?: LeafCategory[];
};

export type ProductCategory = {
  id: string;
  name: string;
  nameKo?: string;
  icon?: string;
  sort: number;
  enabled: boolean;
  subs: SubCategory[];
};

const STORAGE_KEY = "platform_product_categories_v3";

export const DEFAULT_CATEGORIES: ProductCategory[] = [
  {
    id: "c1",
    name: "女装",
    icon: "👗",
    sort: 10,
    enabled: true,
    subs: [
      { id: "c12", name: "上衣", enabled: true, leafs: [{ id: "c89", name: "T恤", enabled: true }, { id: "c90", name: "罩衫", enabled: true }, { id: "c91", name: "衬衫", enabled: true }, { id: "c92", name: "卫衣/连帽衫", enabled: true }, { id: "c93", name: "针织/毛衣", enabled: true }, { id: "c94", name: "背心", enabled: true }] },
      { id: "c13", name: "连衣裙", enabled: true, leafs: [{ id: "c95", name: "迷你连衣裙", enabled: true }, { id: "c96", name: "中长连衣裙", enabled: true }, { id: "c97", name: "长连衣裙", enabled: true }, { id: "c98", name: "连体裤", enabled: true }] },
      { id: "c14", name: "裤子/打底裤", enabled: true, leafs: [{ id: "c99", name: "牛仔裤", enabled: true }, { id: "c100", name: "休闲裤", enabled: true }, { id: "c101", name: "棉裤", enabled: true }, { id: "c102", name: "短裤", enabled: true }, { id: "c103", name: "运动裤", enabled: true }, { id: "c104", name: "打底裤", enabled: true }, { id: "c121", name: "裤裙", enabled: true }, { id: "c122", name: "背带裤", enabled: true }, { id: "c123", name: "其他", enabled: true }] },
      { id: "c15", name: "裙子", enabled: true, leafs: [{ id: "c105", name: "迷你裙", enabled: true }, { id: "c106", name: "中/长裙", enabled: true }] },
      { id: "c16", name: "外套", enabled: true, leafs: [{ id: "c107", name: "马甲", enabled: true }, { id: "c108", name: "大衣", enabled: true }, { id: "c109", name: "夹克", enabled: true }, { id: "c110", name: "军装式", enabled: true }, { id: "c111", name: "羽绒", enabled: true }, { id: "c112", name: "背心", enabled: true }] },
      { id: "c17", name: "套装", enabled: true, leafs: [{ id: "c113", name: "两件套", enabled: true }] },
      { id: "c18", name: "内衣/家居服", enabled: true, leafs: [{ id: "c114", name: "内衣", enabled: true }, { id: "c115", name: "睡衣/家居服", enabled: true }] },
      { id: "c19", name: "大码", enabled: true, leafs: [{ id: "c116", name: "外套", enabled: true }, { id: "c117", name: "上衣", enabled: true }, { id: "c118", name: "下衣", enabled: true }, { id: "c119", name: "连衣裙", enabled: true }] },
      { id: "c20", name: "沙滩装", enabled: true, leafs: [{ id: "c120", name: "沙滩装", enabled: true }] },
    ],
  },
  {
    id: "c2",
    name: "男装",
    icon: "👔",
    sort: 20,
    enabled: true,
    subs: [
      { id: "c21", name: "外套", enabled: true },
      { id: "c22", name: "T恤", enabled: true },
      { id: "c23", name: "针织/毛衣", enabled: true },
      { id: "c24", name: "衬衫", enabled: true },
      { id: "c25", name: "卫衣/连帽衫", enabled: true },
      { id: "c26", name: "牛仔裤", enabled: true },
      { id: "c27", name: "裤子", enabled: true },
      { id: "c28", name: "西装/套装", enabled: true },
    ],
  },
  {
    id: "c3",
    name: "女鞋",
    icon: "👠",
    sort: 30,
    enabled: true,
    subs: [
      { id: "c29", name: "平底鞋/乐福鞋", enabled: true },
      { id: "c30", name: "高跟鞋", enabled: true },
      { id: "c31", name: "凉鞋/拖鞋/人字拖", enabled: true },
      { id: "c32", name: "运动鞋", enabled: true },
      { id: "c33", name: "靴子", enabled: true },
    ],
  },
  {
    id: "c4",
    name: "女包",
    icon: "👜",
    sort: 40,
    enabled: true,
    subs: [
      { id: "c34", name: "斜挎包", enabled: true },
      { id: "c35", name: "单肩包", enabled: true },
      { id: "c36", name: "手提包", enabled: true },
      { id: "c37", name: "迷你包", enabled: true },
      { id: "c38", name: "环保袋/帆布袋", enabled: true },
      { id: "c39", name: "手拿包/钱包/收纳包", enabled: true },
      { id: "c40", name: "背包", enabled: true },
      { id: "c41", name: "其他", enabled: true },
    ],
  },
  {
    id: "c5",
    name: "女士珠宝首饰",
    icon: "💍",
    sort: 50,
    enabled: true,
    subs: [
      { id: "c42", name: "耳饰", enabled: true },
      { id: "c43", name: "项链", enabled: true },
      { id: "c44", name: "戒指", enabled: true },
      { id: "c45", name: "手链/脚链", enabled: true },
    ],
  },
  {
    id: "c6",
    name: "女士饰品",
    icon: "🧣",
    sort: 60,
    enabled: true,
    subs: [
      { id: "c46", name: "发饰", enabled: true },
      { id: "c47", name: "手机配饰", enabled: true },
      { id: "c48", name: "帽子", enabled: true },
      { id: "c49", name: "袜子/丝袜", enabled: true },
      { id: "c50", name: "腰带", enabled: true },
      { id: "c51", name: "手表", enabled: true },
      { id: "c52", name: "围巾", enabled: true },
      { id: "c53", name: "墨镜/眼镜", enabled: true },
      { id: "c54", name: "其他", enabled: true },
    ],
  },
  {
    id: "c7",
    name: "男鞋",
    icon: "👞",
    sort: 70,
    enabled: true,
    subs: [
      { id: "c55", name: "乐福鞋/单鞋", enabled: true },
      { id: "c56", name: "运动鞋", enabled: true },
      { id: "c57", name: "凉鞋/拖鞋/人字拖", enabled: true },
      { id: "c58", name: "正装皮鞋", enabled: true },
      { id: "c59", name: "靴子", enabled: true },
    ],
  },
  {
    id: "c8",
    name: "男包",
    icon: "🎒",
    sort: 80,
    enabled: true,
    subs: [
      { id: "c60", name: "单肩包/手提包", enabled: true },
      { id: "c61", name: "挎包/邮差包", enabled: true },
      { id: "c62", name: "背包", enabled: true },
      { id: "c63", name: "手拿包", enabled: true },
      { id: "c64", name: "钱包", enabled: true },
      { id: "c65", name: "商务包", enabled: true },
      { id: "c66", name: "其他", enabled: true },
    ],
  },
  {
    id: "c9",
    name: "男士饰品",
    icon: "🕶️",
    sort: 90,
    enabled: true,
    subs: [
      { id: "c67", name: "首饰", enabled: true },
      { id: "c68", name: "帽子", enabled: true },
      { id: "c69", name: "墨镜/眼镜", enabled: true },
      { id: "c70", name: "腰带", enabled: true },
      { id: "c71", name: "手表", enabled: true },
      { id: "c72", name: "其他", enabled: true },
    ],
  },
  {
    id: "c10",
    name: "童装",
    icon: "👶",
    sort: 100,
    enabled: true,
    subs: [
      { id: "c73", name: "外套", enabled: true },
      { id: "c74", name: "上衣", enabled: true },
      { id: "c75", name: "连衣裙", enabled: true },
      { id: "c76", name: "上下套装", enabled: true },
      { id: "c77", name: "裤子", enabled: true },
      { id: "c78", name: "裙子", enabled: true },
    ],
  },
  {
    id: "c11",
    name: "儿童饰品",
    icon: "🎀",
    sort: 110,
    enabled: true,
    subs: [
      { id: "c79", name: "儿童鞋", enabled: true },
      { id: "c80", name: "皮鞋/单鞋", enabled: true },
      { id: "c81", name: "运动鞋", enabled: true },
      { id: "c82", name: "凉鞋/果冻鞋", enabled: true },
      { id: "c83", name: "靴子", enabled: true },
      { id: "c84", name: "室内鞋/鞋套/袜子", enabled: true },
      { id: "c85", name: "包", enabled: true },
      { id: "c86", name: "帽子", enabled: true },
      { id: "c87", name: "发饰", enabled: true },
      { id: "c88", name: "其他", enabled: true },
    ],
  },
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
  return (readStorage() ?? DEFAULT_CATEGORIES)
    .slice()
    .sort((a, b) => a.sort - b.sort);
}

export function getCategoryById(id: string): ProductCategory | undefined {
  return getCategories().find((c) => c.id === id);
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
