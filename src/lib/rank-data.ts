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