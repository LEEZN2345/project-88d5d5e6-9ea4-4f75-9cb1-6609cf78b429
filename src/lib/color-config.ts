/**
 * 商品颜色配置表
 * 来源：东大门档口常用韩文颜色名 + 中文对照
 * 在新增/编辑商品时作为可选颜色预设。
 */

export interface ColorOption {
  /** 韩文主名称 */
  ko: string;
  /** 中文名称 */
  zh: string;
  /** 韩文别名（/ 分隔） */
  aliases?: string[];
}

export const COLOR_PRESETS: ColorOption[] = [
  { ko: "살구", zh: "杏色" },
  { ko: "아이보리", zh: "奶白色", aliases: ["아이", "에쿠르", "백아이보리"] },
  { ko: "살색", zh: "肉色" },
  { ko: "연베이지", zh: "浅米色" },
  { ko: "베이지", zh: "米色" },
  { ko: "진베이지", zh: "深米色" },
  { ko: "모카", zh: "摩卡" },
  { ko: "밤색", zh: "栗色" },
  { ko: "초콜릿", zh: "巧克力色" },
  { ko: "브라운", zh: "棕色" },
  { ko: "딥브라운", zh: "深棕色", aliases: ["다크 브라운"] },
  { ko: "검정", zh: "黑色", aliases: ["블랙"] },
  { ko: "소라", zh: "兰色" },
  { ko: "하늘색", zh: "天蓝", aliases: ["스카이블루"] },
  { ko: "딥블루", zh: "深蓝色", aliases: ["다크 블루", "딥소라"] },
  { ko: "군청", zh: "法国蓝" },
  { ko: "블루", zh: "蓝色", aliases: ["파랑"] },
  { ko: "곤색", zh: "藏蓝色", aliases: ["네이비", "코발트"] },
  { ko: "잉크블루", zh: "墨蓝色" },
  { ko: "먹색", zh: "墨色" },
  { ko: "차콜", zh: "炭灰色" },
  { ko: "회색", zh: "灰色", aliases: ["그레이"] },
  { ko: "진그레이", zh: "深灰色" },
  { ko: "연그레이", zh: "浅灰色" },
  { ko: "오트밀", zh: "燕麦色", aliases: ["멜란지"] },
  { ko: "백염", zh: "白灰色" },
  { ko: "회 멜란지", zh: "灰混色", aliases: ["멜란지 그레이"] },
  { ko: "시멘트색", zh: "水泥色" },
  { ko: "그린", zh: "绿色", aliases: ["녹색", "초록색", "파랑"] },
  { ko: "민트", zh: "薄荷" },
  { ko: "연두색", zh: "豆沙绿" },
  { ko: "흑녹색", zh: "墨绿色", aliases: ["철색", "건푸른"] },
  { ko: "레몬색", zh: "柠檬色" },
  { ko: "라임", zh: "青柠色" },
  { ko: "형광", zh: "荧光色" },
  { ko: "수박색", zh: "西瓜色" },
  { ko: "빨간색", zh: "红色", aliases: ["레드", "빨강색"] },
  { ko: "대홍", zh: "大红" },
  { ko: "핑크", zh: "粉红", aliases: ["분홍색"] },
  { ko: "연핑크", zh: "浅粉" },
  { ko: "핫핑크", zh: "玫红/亮粉色" },
  { ko: "바이올렛", zh: "紫罗兰" },
  { ko: "연보라", zh: "香芋紫/浅紫色" },
  { ko: "보라색", zh: "紫色", aliases: ["자색", "퍼플"] },
  { ko: "주황색", zh: "橘红/朱黄色" },
  { ko: "오렌지", zh: "橘色" },
  { ko: "노랑색", zh: "黄色", aliases: ["옐로우"] },
  { ko: "노란색", zh: "鹅黄色", aliases: ["담황색"] },
  { ko: "청색", zh: "青色" },
  { ko: "올리브", zh: "橄榄绿" },
  { ko: "와인색", zh: "酒红色" },
  { ko: "벽돌색", zh: "砖红" },
  { ko: "금색", zh: "金色", aliases: ["골드"] },
  { ko: "은색", zh: "银色", aliases: ["실버"] },
  { ko: "크림", zh: "奶油色" },
  { ko: "카키", zh: "卡其色" },
  { ko: "카키베이지", zh: "卡其米黄色" },
  { ko: "라이트핑크", zh: "浅粉色" },
  { ko: "메론", zh: "哈密瓜色" },
  { ko: "브릭", zh: "巧克力色" },
  { ko: "다홍", zh: "红色" },
  { ko: "메란지", zh: "灰混色" },
  { ko: "내츄럴", zh: "自然色" },
  { ko: "샌드", zh: "沙色" },
  { ko: "아보카도", zh: "牛油果绿" },
  { ko: "더스티머스타드", zh: "芥末色" },
  { ko: "라이트브라운", zh: "浅棕色" },
  { ko: "인디핑크", zh: "亮粉色" },
  { ko: "라이트퍼플", zh: "浅紫色" },
  { ko: "라이트민트", zh: "亮薄荷" },
  { ko: "라이트그레이", zh: "浅灰色" },
  { ko: "라이트올리브", zh: "浅橄榄" },
  { ko: "딥민트", zh: "深薄荷" },
  { ko: "연청", zh: "牛仔浅蓝色" },
  { ko: "중청", zh: "牛仔中蓝色" },
  { ko: "진청", zh: "牛仔深蓝色" },
];

/** 所有可搜索的颜色标签：中文 + 韩文 + 别名 */
export const COLOR_SEARCH_LABELS = COLOR_PRESETS.map((c) => ({
  ...c,
  label: `${c.zh} / ${c.ko}${c.aliases?.length ? " / " + c.aliases.join(" / ") : ""}`,
}));

/** 按关键字过滤颜色 */
export function searchColors(keyword: string) {
  if (!keyword.trim()) return [];
  const q = keyword.toLowerCase();
  return COLOR_SEARCH_LABELS.filter(
    (c) =>
      c.zh.toLowerCase().includes(q) ||
      c.ko.toLowerCase().includes(q) ||
      c.aliases?.some((a) => a.toLowerCase().includes(q)),
  );
}

/** 根据中文或韩文返回颜色对象 */
export function findColor(value: string) {
  return COLOR_SEARCH_LABELS.find(
    (c) => c.zh === value || c.ko === value || c.aliases?.includes(value),
  );
}
