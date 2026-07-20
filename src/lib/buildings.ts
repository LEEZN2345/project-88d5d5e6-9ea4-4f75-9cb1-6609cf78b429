export type Mall = {
  city: "东大门";
  buildings: { name: string; floors: string[] }[];
};

export const MALLS: Mall[] = [
  {
    city: "东大门",
    buildings: [
      { name: "THEOT", floors: ["B1", "B2", "1F", "2F", "3F", "4F", "5F"] },
      { name: "NUZZON", floors: ["B1", "B2", "1F", "2F", "3F", "4F", "5F", "6F", "SIDE"] },
      { name: "APM", floors: ["B1", "1F", "2F", "3F", "4F", "5F", "6F", "7F"] },
      { name: "Queen's Square", floors: ["B1", "1F", "2F", "3F", "4F", "5F"] },
      { name: "Belpost", floors: ["B1", "1F", "2F", "3F"] },
      { name: "APM Luxe", floors: ["B1", "B2", "1F", "2F", "3F", "4F", "5F", "6F", "7F"] },
      { name: "DDP(U:US)", floors: ["1F", "2F", "3F"] },
      { name: "APM Place", floors: ["B1", "B2", "1F", "2F", "3F", "4F", "5F", "6F", "7F", "8F"] },
      { name: "ChungPyungHwa", floors: ["가", "나", "다", "라", "마", "바", "신관"] },
    ],
  },
];