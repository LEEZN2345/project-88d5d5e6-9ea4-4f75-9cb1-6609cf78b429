import type { Shop } from "./mock-data";
import { APM_SHOPS } from "./apm-shops";

// 将 APM 视频抓取的档口转换为统一 Shop 结构，接入档口管理
// APM 楼宇的 floor 使用 B1/1F/.../7F，与 buildings.ts 已配置的楼层一致。
export const APM_AS_SHOPS: Shop[] = APM_SHOPS.map((s) => {
  // 分离韩文/英文：以第一个空格 + 韩文块拆分
  const raw = s.name.trim();
  const koMatch = raw.match(/[\uac00-\ud7a3][\uac00-\ud7a3 ]*$/);
  const nameKo = koMatch ? koMatch[0].trim() : raw;
  const nameEn = koMatch ? raw.slice(0, koMatch.index).trim() : "";
  const displayEn = nameEn || nameKo;
  return {
    id: `apm-${s.floor}-${s.number}`,
    name: displayEn,
    nameKo,
    building: "APM",
    floor: s.floor,
    position: String(s.number),
    tags: s.uncertain ? ["待核对"] : [],
    minOrderQty: 2,
    cover: `https://picsum.photos/seed/apm-${s.floor}-${s.number}/320/200`,
    productCount: 0,
  } satisfies Shop;
});