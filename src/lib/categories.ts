import { useEffect, useState } from "react";

// 商品属性分类（两级）：一级=频道（男装/女装/女鞋…），二级=细分品类。
// 后台可编辑，前端首页九宫格 & 品类列表页共用。localStorage 持久化，模拟后端。

export type SubCategory = {
  id: string;
  name: string;
  nameKo?: string;
  enabled: boolean;
};

export type ProductCategory = {
  id: string;
  name: string;
  nameKo?: string;
  icon?: string; // emoji
  sort: number;
  enabled: boolean;
  subs: SubCategory[];
};

const STORAGE_KEY = "platform_product_categories_v2";

const sub = (id: string, name: string, nameKo?: string): SubCategory => ({
  id,
  name,
  nameKo,
  enabled: true,
});

export const DEFAULT_CATEGORIES: ProductCategory[] = [
  {
    id: "men",
    name: "男装",
    nameKo: "남성의류",
    icon: "👔",
    sort: 10,
    enabled: true,
    subs: [
      sub("men-outer", "外套", "아우터"),
      sub("men-tee", "T恤", "티셔츠"),
      sub("men-knit", "针织/毛衣", "니트/스웨터"),
      sub("men-shirt", "衬衫", "셔츠"),
      sub("men-hoodie", "卫衣/连帽衫", "후드"),
      sub("men-denim", "牛仔裤", "데님"),
      sub("men-pants", "裤子", "팬츠"),
      sub("men-suit", "西装/套装", "슈트/셋업"),
    ],
  },
  {
    id: "women",
    name: "女装",
    nameKo: "여성의류",
    icon: "👗",
    sort: 20,
    enabled: true,
    subs: [
      sub("women-top", "上衣", "상의"),
      sub("women-dress", "连衣裙", "원피스"),
      sub("women-pants", "裤子/打底裤", "팬츠/레깅스"),
      sub("women-skirt", "裙子", "스커트"),
      sub("women-outer", "外套", "아우터"),
      sub("women-set", "套装", "셋업"),
      sub("women-loungewear", "内衣/家居服", "이너/홈웨어"),
    ],
  },
  {
    id: "wshoes",
    name: "女鞋",
    nameKo: "여성화",
    icon: "👠",
    sort: 30,
    enabled: true,
    subs: [
      sub("wshoes-heel", "高跟鞋", "힐"),
      sub("wshoes-flat", "平底鞋", "플랫"),
      sub("wshoes-sneaker", "运动鞋", "스니커즈"),
      sub("wshoes-boot", "靴子", "부츠"),
      sub("wshoes-sandal", "凉鞋/拖鞋", "샌들/슬리퍼"),
    ],
  },
  {
    id: "wbag",
    name: "女包",
    nameKo: "여성가방",
    icon: "👜",
    sort: 40,
    enabled: true,
    subs: [
      sub("wbag-shoulder", "单肩包", "숄더백"),
      sub("wbag-cross", "斜挎包", "크로스백"),
      sub("wbag-tote", "手提包", "토트백"),
      sub("wbag-backpack", "双肩包", "백팩"),
      sub("wbag-wallet", "钱包", "지갑"),
    ],
  },
  {
    id: "jewelry",
    name: "首饰",
    nameKo: "주얼리",
    icon: "💍",
    sort: 50,
    enabled: true,
    subs: [
      sub("jw-necklace", "项链", "목걸이"),
      sub("jw-earring", "耳饰", "귀걸이"),
      sub("jw-ring", "戒指", "반지"),
      sub("jw-bracelet", "手链", "팔찌"),
    ],
  },
  {
    id: "acc",
    name: "饰品",
    nameKo: "액세서리",
    icon: "🧣",
    sort: 60,
    enabled: true,
    subs: [
      sub("acc-hat", "帽子", "모자"),
      sub("acc-scarf", "围巾/丝巾", "스카프"),
      sub("acc-belt", "腰带", "벨트"),
      sub("acc-hair", "发饰", "헤어"),
      sub("acc-sun", "墨镜", "선글라스"),
    ],
  },
  {
    id: "home",
    name: "居家服",
    nameKo: "홈웨어",
    icon: "🥿",
    sort: 70,
    enabled: true,
    subs: [
      sub("home-pajama", "睡衣套装", "잠옷"),
      sub("home-robe", "浴袍", "가운"),
      sub("home-slipper", "室内鞋", "실내화"),
    ],
  },
  {
    id: "bedding",
    name: "床品",
    nameKo: "침구",
    icon: "🛏️",
    sort: 80,
    enabled: true,
    subs: [
      sub("bed-set", "四件套", "침구세트"),
      sub("bed-quilt", "被芯", "이불속"),
      sub("bed-pillow", "枕芯", "베개속"),
      sub("bed-mat", "凉席/床垫", "매트"),
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
