import { useEffect, useState } from "react";
import { APM_RANK, OFFLINE_HOT } from "./rank-data";
import { SHOPS } from "./mock-data";

// 「拿货排行榜」与「热门档口」的后台配置（localStorage 持久化，模拟后端）

export type RankEntry = { name: string; location: string };
export type RankBoard = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  enabled: boolean;
  items: RankEntry[];
};
export type RankConfig = {
  boards: RankBoard[];
  /** 热门档口：SHOPS 中的 id，顺序即展示顺序 */
  hotShopIds: string[];
  hotNote: string;
};

const STORAGE_KEY = "platform_rank_config_v1";
const EVENT = "platform-rank-config-updated";

export const DEFAULT_RANK_CONFIG: RankConfig = {
  boards: [
    {
      id: "apm",
      title: "东大门排行榜",
      subtitle: "apM 集团档口 · 近 30 天销量 TOP",
      badge: "TOP 30",
      enabled: true,
      items: APM_RANK.map((s) => ({ name: s.name, location: s.location })),
    },
    {
      id: "offline",
      title: "实体店热门拿货档口",
      subtitle: "线下买手店 · 高频补货榜",
      badge: "实体精选",
      enabled: true,
      items: OFFLINE_HOT.map((s) => ({ name: s.name, location: s.location })),
    },
  ],
  hotShopIds: SHOPS.map((s) => s.id),
  hotNote: "数据每日 00:00 北京时间更新 · 仅供参考",
};

export function getRankConfig(): RankConfig {
  if (typeof window === "undefined") return DEFAULT_RANK_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RANK_CONFIG;
    const parsed = JSON.parse(raw) as Partial<RankConfig>;
    return {
      boards: parsed.boards?.length ? parsed.boards : DEFAULT_RANK_CONFIG.boards,
      hotShopIds: parsed.hotShopIds ?? DEFAULT_RANK_CONFIG.hotShopIds,
      hotNote: parsed.hotNote ?? DEFAULT_RANK_CONFIG.hotNote,
    };
  } catch {
    return DEFAULT_RANK_CONFIG;
  }
}

export function saveRankConfig(cfg: RankConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event(EVENT));
}

export function resetRankConfig() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useRankConfig(): RankConfig {
  const [cfg, setCfg] = useState<RankConfig>(() => getRankConfig());
  useEffect(() => {
    const sync = () => setCfg(getRankConfig());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return cfg;
}

/** 热门档口：按配置顺序返回 SHOPS 对象 */
export function useHotShops() {
  const cfg = useRankConfig();
  return cfg.hotShopIds
    .map((id) => SHOPS.find((s) => s.id === id))
    .filter((s): s is (typeof SHOPS)[number] => Boolean(s));
}
