import type { Shop } from "./mock-data";
import { CPW_SHOPS } from "./chungpyunghwa-shops";

// 韩文区号 → 简写，用于中文界面辅助识别
export const CPW_SECTION_LABEL: Record<string, string> = {
  가: "가区(A)",
  나: "나区(B)",
  다: "다区(C)",
  라: "라区(D)",
  마: "마区(E)",
  바: "바区(F)",
  신관: "新馆",
};

// 将视频抓取的清平和档口转成统一 Shop 结构，方便在档口管理页里展示/编辑
export const CPW_AS_SHOPS: Shop[] = CPW_SHOPS.map((s) => ({
  id: `cpw-${s.code}`,
  name: s.nameEn || s.nameKo,
  nameKo: s.nameKo,
  building: "ChungPyungHwa",
  floor: s.section, // 用区号充当楼层维度
  position: `${s.section}${s.number}`,
  tags: s.uncertain ? ["待核对"] : [],
  minOrderQty: 2,
  cover: `https://picsum.photos/seed/cpw-${s.code}/320/200`,
  productCount: 0,
}));