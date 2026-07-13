import { useEffect, useState } from "react";

// 平台通用 Banner 配置：所有涉及横幅位的入口集中在这里管理。
// 使用 localStorage 做持久化，模拟后台可编辑上传能力（本项目暂无真实后端）。

export type BannerSlot = {
  id: string;
  name: string; // 后台显示的名称
  description: string; // 位置说明
  image: string; // 图片 URL 或 dataURL
  title?: string;
  subtitle?: string;
  link?: string; // 点击跳转
  enabled: boolean;
};

const STORAGE_KEY = "platform_banners_v1";

export const DEFAULT_BANNERS: BannerSlot[] = [
  {
    id: "home_hero",
    name: "首页顶部横幅",
    description: "买手端首页顶部主视觉横幅",
    image: "https://picsum.photos/seed/home-hero/1200/480",
    title: "东大门订货通",
    subtitle: "档口直采 · 一键代购 · 全程跟踪",
    link: "/shops",
    enabled: true,
  },
  {
    id: "shops_hero",
    name: "档口列表商场横幅",
    description: "档口列表页各商场顶部大图（未单独设置则统一使用此图）",
    image: "https://picsum.photos/seed/shops-hero/1200/480",
    title: "购物中心",
    subtitle: "Market Premium Select",
    enabled: true,
  },
  {
    id: "shop_member",
    name: "档口详情·会员专享",
    description: "档口详情页会员抢先预定横幅",
    image: "",
    title: "快人一步，档口新款抢先预定",
    subtitle: "会员专享 · 独家上新提前锁定",
    link: "/points",
    enabled: true,
  },
];

function readStorage(): BannerSlot[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw) as BannerSlot[];
    // 合并默认，兼容后续新增位
    return DEFAULT_BANNERS.map((d) => arr.find((x) => x.id === d.id) ?? d);
  } catch {
    return null;
  }
}

export function getBanners(): BannerSlot[] {
  return readStorage() ?? DEFAULT_BANNERS;
}

export function getBanner(id: string): BannerSlot | undefined {
  return getBanners().find((b) => b.id === id);
}

export function saveBanners(list: BannerSlot[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("platform-banners-updated"));
}

export function useBanner(id: string): BannerSlot | undefined {
  const [banner, setBanner] = useState<BannerSlot | undefined>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_BANNERS.find((b) => b.id === id);
    }
    return getBanner(id);
  });
  useEffect(() => {
    const sync = () => setBanner(getBanner(id));
    sync();
    window.addEventListener("platform-banners-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("platform-banners-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);
  return banner;
}