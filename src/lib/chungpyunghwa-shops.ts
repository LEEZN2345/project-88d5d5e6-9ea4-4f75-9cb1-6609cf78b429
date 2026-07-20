// 从清平和市场视频中提取的档口清单（ChungPyungHwa）
// 位置格式：清平和 · <区(가/나/다/라/마/바/신관)><号>
// 名称已尽量修正 OCR 误识；末尾带 ? 表示视频内文字模糊，需要复核。

export interface CpwShop {
  /** 档口号（含区号），如 "가12" */
  code: string;
  /** 区号（가=A / 나=B / 다=C / 라=D / 마=E / 바=F / 신관=新馆） */
  section: "가" | "나" | "다" | "라" | "마" | "바" | "신관";
  /** 档口号（区内编号） */
  number: number;
  /** 韩文原名 */
  nameKo: string;
  /** 英文/罗马字名（若视频内提供） */
  nameEn?: string;
  /** OCR 存在不确定 */
  uncertain?: boolean;
}

export const CPW_SHOPS: CpwShop[] = [
  // ─── 가 区 ───
  { code: "가1",  section: "가", number: 1,  nameKo: "키키" },
  { code: "가4",  section: "가", number: 4,  nameKo: "모모", nameEn: "momo" },
  { code: "가5",  section: "가", number: 5,  nameKo: "디어진", uncertain: true },
  { code: "가6",  section: "가", number: 6,  nameKo: "더 포엠", nameEn: "The Poeme" },
  { code: "가7",  section: "가", number: 7,  nameKo: "로지아" },
  { code: "가8",  section: "가", number: 8,  nameKo: "카노조", nameEn: "KANOZO" },
  { code: "가9",  section: "가", number: 9,  nameKo: "MUN" },
  { code: "가10", section: "가", number: 10, nameKo: "블루아이" },
  { code: "가11", section: "가", number: 11, nameKo: "인디고블루", nameEn: "INDIGO BLUE" },
  { code: "가12", section: "가", number: 12, nameKo: "르무드 SNJ", nameEn: "le mood" },
  { code: "가14", section: "가", number: 14, nameKo: "디디", nameEn: "D&D" },
  { code: "가15", section: "가", number: 15, nameKo: "모리" },
  { code: "가16", section: "가", number: 16, nameKo: "블론디" },
  { code: "가17", section: "가", number: 17, nameKo: "위드미" },
  { code: "가18", section: "가", number: 18, nameKo: "쿠키", nameEn: "cookie" },
  { code: "가19", section: "가", number: 19, nameKo: "럭키럭키" },
  { code: "가20", section: "가", number: 20, nameKo: "미모", nameEn: "mimo" },
  { code: "가21", section: "가", number: 21, nameKo: "리치트리", nameEn: "richtree", uncertain: true },
  { code: "가22", section: "가", number: 22, nameKo: "르쿠마리" },
  { code: "가23", section: "가", number: 23, nameKo: "헤레스" },
  { code: "가24", section: "가", number: 24, nameKo: "리더제이" },
  { code: "가25", section: "가", number: 25, nameKo: "라라로미" },
  { code: "가26", section: "가", number: 26, nameKo: "마롱", uncertain: true },
  { code: "가27", section: "가", number: 27, nameKo: "아베크" },
  { code: "가28", section: "가", number: 28, nameKo: "스카이 & 스텔라" },
  { code: "가29", section: "가", number: 29, nameKo: "드레스코드" },
  { code: "가30", section: "가", number: 30, nameKo: "한나네" },
  { code: "가31", section: "가", number: 31, nameKo: "바바톤", nameEn: "babaton" },
  { code: "가32", section: "가", number: 32, nameKo: "밀크베이지" },
  { code: "가33", section: "가", number: 33, nameKo: "에이치오샵", nameEn: "H.O.Shop" },
  { code: "가34", section: "가", number: 34, nameKo: "로빈" },
  { code: "가35", section: "가", number: 35, nameKo: "오프로드" },
  { code: "가37", section: "가", number: 37, nameKo: "loNe", uncertain: true },

  // ─── 나 区 ───
  { code: "나2",  section: "나", number: 2,  nameKo: "애플" },
  { code: "나3",  section: "나", number: 3,  nameKo: "하루" },
  { code: "나4",  section: "나", number: 4,  nameKo: "르네" },
  { code: "나5",  section: "나", number: 5,  nameKo: "이너비" },
  { code: "나6",  section: "나", number: 6,  nameKo: "무드멘토" },
  { code: "나7",  section: "나", number: 7,  nameKo: "스테이블", nameEn: "stable" },
  { code: "나8",  section: "나", number: 8,  nameKo: "더멜로 & 마시멜로" },
  { code: "나10", section: "나", number: 10, nameKo: "다이아" },
  { code: "나11", section: "나", number: 11, nameKo: "주머니" },
  { code: "나12", section: "나", number: 12, nameKo: "이합사" },
  { code: "나13", section: "나", number: 13, nameKo: "제이코코", nameEn: "Jcoco" },
  { code: "나14", section: "나", number: 14, nameKo: "바이진" },
  { code: "나15", section: "나", number: 15, nameKo: "시즈" },
  { code: "나16", section: "나", number: 16, nameKo: "에이라운드" },
  { code: "나17", section: "나", number: 17, nameKo: "오벨리아" },
  { code: "나18", section: "나", number: 18, nameKo: "제이컨셉" },
  { code: "나19", section: "나", number: 19, nameKo: "티나" },
  { code: "나20", section: "나", number: 20, nameKo: "더마니", uncertain: true },
  { code: "나21", section: "나", number: 21, nameKo: "제이클로짓" },
  { code: "나22", section: "나", number: 22, nameKo: "센치미터" },
  { code: "나23", section: "나", number: 23, nameKo: "랑송" },
  { code: "나24", section: "나", number: 24, nameKo: "미코앤코" },
  { code: "나25", section: "나", number: 25, nameKo: "루미너스" },
  { code: "나26", section: "나", number: 26, nameKo: "그랑플러스" },
  { code: "나27", section: "나", number: 27, nameKo: "지오맘", nameEn: "G.O.mom" },
  { code: "나28", section: "나", number: 28, nameKo: "달달" },
  { code: "나29", section: "나", number: 29, nameKo: "코코듀" },
  { code: "나30", section: "나", number: 30, nameKo: "리아", uncertain: true },
  { code: "나31", section: "나", number: 31, nameKo: "밀라노" },
  { code: "나32", section: "나", number: 32, nameKo: "볼터치", nameEn: "boll touch" },
  { code: "나33", section: "나", number: 33, nameKo: "불걸", nameEn: "bulgirl" },

  // ─── 다 区 ───
  { code: "다1",  section: "다", number: 1,  nameKo: "홀리엘" },
  { code: "다3",  section: "다", number: 3,  nameKo: "현진상사" },
  { code: "다4",  section: "다", number: 4,  nameKo: "더더블유", nameEn: "The W" },
  { code: "다6",  section: "다", number: 6,  nameKo: "샤마르", uncertain: true },
  { code: "다8",  section: "다", number: 8,  nameKo: "아우라피" },
  { code: "다11", section: "다", number: 11, nameKo: "심플", nameEn: "SIMPLE", uncertain: true },
  { code: "다12", section: "다", number: 12, nameKo: "웨이팅" },
  { code: "다13", section: "다", number: 13, nameKo: "마르마르" },
  { code: "다14", section: "다", number: 14, nameKo: "애니코튼" },
  { code: "다15", section: "다", number: 15, nameKo: "모아", nameEn: "Moare" },
  { code: "다16", section: "다", number: 16, nameKo: "앙비" },
  { code: "다17", section: "다", number: 17, nameKo: "블랙다이아몬드" },
  { code: "다18", section: "다", number: 18, nameKo: "어반앤드", nameEn: "urban and" },
  { code: "다19", section: "다", number: 19, nameKo: "옐로우베이지", nameEn: "Yellow beige" },
  { code: "다20", section: "다", number: 20, nameKo: "청평화 브라보" },
  { code: "다21", section: "다", number: 21, nameKo: "렌느" },
  { code: "다22", section: "다", number: 22, nameKo: "루시" },
  { code: "다24", section: "다", number: 24, nameKo: "미카", nameEn: "mika" },
  { code: "다25", section: "다", number: 25, nameKo: "수" },

  // ─── 라 区 ───
  { code: "라1",  section: "라", number: 1,  nameKo: "플로라" },
  { code: "라4",  section: "라", number: 4,  nameKo: "노마드" },
  { code: "라5",  section: "라", number: 5,  nameKo: "다니엘" },
  { code: "라6",  section: "라", number: 6,  nameKo: "파운드", nameEn: "Found" },
  { code: "라7",  section: "라", number: 7,  nameKo: "밍크", nameEn: "MINK" },
  { code: "라8",  section: "라", number: 8,  nameKo: "제이케이", nameEn: "J.K" },
  { code: "라9",  section: "라", number: 9,  nameKo: "르레브", nameEn: "le rêve" },
  { code: "라10", section: "라", number: 10, nameKo: "마르" },
  { code: "라11", section: "라", number: 11, nameKo: "트위기" },
  { code: "라12", section: "라", number: 12, nameKo: "제이토크" },
  { code: "라13", section: "라", number: 13, nameKo: "핑크아이" },
  { code: "라14", section: "라", number: 14, nameKo: "루시마린" },
  { code: "라15", section: "라", number: 15, nameKo: "셀럽리티", nameEn: "celebrity" },
  { code: "라16", section: "라", number: 16, nameKo: "메자에", nameEn: "mejae" },
  { code: "라17", section: "라", number: 17, nameKo: "스위티" },
  { code: "라20", section: "라", number: 20, nameKo: "빨강집게" },
  { code: "라21", section: "라", number: 21, nameKo: "라모드", nameEn: "La Mode" },
  { code: "라22", section: "라", number: 22, nameKo: "자바" },
  { code: "라23", section: "라", number: 23, nameKo: "제이런", nameEn: "J-run" },
  { code: "라25", section: "라", number: 25, nameKo: "리다" },
  { code: "라26", section: "라", number: 26, nameKo: "히피스토리", nameEn: "hippie story" },

  // ─── 마 区 ───
  { code: "마1",  section: "마", number: 1,  nameKo: "키키샵", nameEn: "kikishop" },
  { code: "마2",  section: "마", number: 2,  nameKo: "아네모네", nameEn: "anemone" },

  // ─── 바 区 ───
  { code: "바1",  section: "바", number: 1,  nameKo: "민정" },
  { code: "바2",  section: "바", number: 2,  nameKo: "마스", uncertain: true },
  { code: "바3",  section: "바", number: 3,  nameKo: "미주아", nameEn: "MIJUA" },
  { code: "바4",  section: "바", number: 4,  nameKo: "우앤아", nameEn: "ooh and aah" },
  { code: "바5",  section: "바", number: 5,  nameKo: "붐", nameEn: "boom" },
  { code: "바6",  section: "바", number: 6,  nameKo: "제이플로우", nameEn: "J flow" },
  { code: "바7",  section: "바", number: 7,  nameKo: "밍키" },
  { code: "바8",  section: "바", number: 8,  nameKo: "미니몽키" },
  { code: "바9",  section: "바", number: 9,  nameKo: "라주", nameEn: "RaJu" },
  { code: "바10", section: "바", number: 10, nameKo: "로우게이지" },
  { code: "바11", section: "바", number: 11, nameKo: "니트니", nameEn: "NITNI" },

  // ─── 新馆 신관 ───
  { code: "신관1", section: "신관", number: 1, nameKo: "스타일샵" },
  { code: "신관2", section: "신관", number: 2, nameKo: "옥스" },
  { code: "신관3", section: "신관", number: 3, nameKo: "에스루비" },
];

/** 按区号分组 */
export function cpwShopsBySection() {
  const map = new Map<string, CpwShop[]>();
  for (const s of CPW_SHOPS) {
    if (!map.has(s.section)) map.set(s.section, []);
    map.get(s.section)!.push(s);
  }
  for (const arr of map.values()) arr.sort((a, b) => a.number - b.number);
  return map;
}