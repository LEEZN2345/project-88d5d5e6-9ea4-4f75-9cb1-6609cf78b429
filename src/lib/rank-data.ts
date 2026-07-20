export interface RankShop {
  rank: number;
  name: string;
  location: string;
}

// 东大门 apM 集团档口销量排行榜（节选 Top 30）
export const APM_RANK: RankShop[] = [
  { rank: 1, name: "Wearable", location: "apMLuxe-1F-106" },
  { rank: 2, name: "BREATHE", location: "apM-1F-123" },
  { rank: 3, name: "erume", location: "apM-B1-B103" },
  { rank: 4, name: "Tempting", location: "apM-B1-B119" },
  { rank: 5, name: "LAKE", location: "apM-1F-128" },
  { rank: 6, name: "atmosphere", location: "apM-2F-223" },
  { rank: 7, name: "UNDERSON", location: "apM-B1-B135" },
  { rank: 8, name: "JS.NY", location: "apMLuxe-5F-506" },
  { rank: 9, name: "ENVY", location: "apMLuxe-1F-113" },
  { rank: 10, name: "BLACK FRIDAY", location: "apM-1F-118" },
  { rank: 11, name: "Blue ID", location: "apMPLACE-5F-509" },
  { rank: 12, name: "ORRD", location: "apM-1F-132" },
  { rank: 13, name: "light and salt", location: "apMPLACE-1F-116" },
  { rank: 14, name: "novus", location: "apMPLACE-4F-442" },
  { rank: 15, name: "BPLAN", location: "apMPLACE-6F-609" },
  { rank: 16, name: "Fox", location: "apMLuxe-B1-B113" },
  { rank: 17, name: "ONE MONE", location: "apM-1F-134" },
  { rank: 18, name: "UM", location: "apM-B1-B133" },
  { rank: 19, name: "Fizz", location: "apMLuxe-5F-531" },
  { rank: 20, name: "marke", location: "apMPLACE-4F-423" },
  { rank: 21, name: "AWEAR", location: "apM-1F-117" },
  { rank: 22, name: "Top Queen", location: "apMLuxe-1F-114" },
  { rank: 23, name: "AGO", location: "apMPLACE-5F-519" },
  { rank: 24, name: "FLOWER", location: "apMLuxe-1F-110" },
  { rank: 25, name: "veve", location: "apMPLACE-B1-B112" },
  { rank: 26, name: "DEAR.M", location: "apMPLACE-B1-B139" },
  { rank: 27, name: "London-flat", location: "apM-B1-B123" },
  { rank: 28, name: "LaMagie famme", location: "apM-B1-B112" },
  { rank: 29, name: "MUCH MORE", location: "apM-B1-B105" },
  { rank: 30, name: "4K RUBY", location: "apMLuxe-B1-B127" },
];

// 实体店热门拿货档口（线下买手店补货高频 TOP）
export const OFFLINE_HOT: RankShop[] = [
  { rank: 1, name: "Wearable", location: "apMLuxe-1F-106" },
  { rank: 2, name: "LAKE", location: "apM-1F-128" },
  { rank: 3, name: "ENVY", location: "apMLuxe-1F-113" },
  { rank: 4, name: "atmosphere", location: "apM-2F-223" },
  { rank: 5, name: "Blue ID", location: "apMPLACE-5F-509" },
  { rank: 6, name: "FLOWER", location: "apMLuxe-1F-110" },
  { rank: 7, name: "BPLAN", location: "apMPLACE-6F-609" },
  { rank: 8, name: "ORRD", location: "apM-1F-132" },
  { rank: 9, name: "Top Queen", location: "apMLuxe-1F-114" },
  { rank: 10, name: "novus", location: "apMPLACE-4F-442" },
  { rank: 11, name: "Fizz", location: "apMLuxe-5F-531" },
  { rank: 12, name: "MUCH MORE", location: "apM-B1-B105" },
];

// 把 location 解析成 building / floor / code,便于按区域分组检索
export type IndexedShop = {
  name: string;
  building: string; // 与 MALLS 中 building.name 对齐
  floor: string; // 与 MALLS 中 floors[i] 对齐
  code: string; // 档口号
  rank?: number; // 若来自榜单
  hot?: boolean; // 实体店热门
};

const BUILDING_MAP: Record<string, string> = {
  apm: "APM",
  apmluxe: "APM Luxe",
  apmplace: "APM Place",
};

function parseLocation(loc: string): { building: string; floor: string; code: string } | null {
  const parts = loc.split("-");
  if (parts.length < 3) return null;
  const key = parts[0]!.toLowerCase();
  const building = BUILDING_MAP[key];
  if (!building) return null;
  return { building, floor: parts[1]!, code: parts[2]! };
}

import { CPW_SHOPS } from "./chungpyunghwa-shops";
import { APM_SHOPS } from "./apm-shops";
import { APM_PLACE_SHOPS } from "./apm-place-shops";

const indexed: IndexedShop[] = [];
const hotNames = new Set(OFFLINE_HOT.map((s) => s.name));
for (const s of APM_RANK) {
  const p = parseLocation(s.location);
  if (!p) continue;
  indexed.push({ name: s.name, ...p, rank: s.rank, hot: hotNames.has(s.name) });
}
// OFFLINE_HOT 已在 APM_RANK 出现过,不再重复加入

// 清平和市场（ChungPyungHwa）档口 - 用「区号(가/나/다/라/마/바/신관)」充当楼层维度
for (const s of CPW_SHOPS) {
  indexed.push({
    name: s.nameEn ? `${s.nameKo} ${s.nameEn}` : s.nameKo,
    building: "ChungPyungHwa",
    floor: s.section,
    code: String(s.number),
  });
}

// APM 视频抓取档口 - floor 与 buildings.ts 的 B1/1F/.../7F 对齐
for (const s of APM_SHOPS) {
  indexed.push({
    name: s.name,
    building: "APM",
    floor: s.floor,
    code: String(s.number),
  });
}

// APM Place 2026 新整理档口位置表（1F–8F）
for (const s of APM_PLACE_SHOPS) {
  indexed.push({
    name: s.nameKo ? `${s.name} ${s.nameKo}` : s.name,
    building: "APM Place",
    floor: s.floor,
    code: s.number,
  });
}

export const INDEXED_SHOPS: IndexedShop[] = indexed;

export function shopsByBuildingFloor(building: string, floor: string): IndexedShop[] {
  return INDEXED_SHOPS.filter((s) => s.building === building && s.floor === floor).sort(
    (a, b) => (a.rank ?? 999) - (b.rank ?? 999)
  );
}

export function buildingHasShops(building: string): boolean {
  return INDEXED_SHOPS.some((s) => s.building === building);
}

export function floorsWithShops(building: string): Set<string> {
  const set = new Set<string>();
  INDEXED_SHOPS.forEach((s) => {
    if (s.building === building) set.add(s.floor);
  });
  return set;
}