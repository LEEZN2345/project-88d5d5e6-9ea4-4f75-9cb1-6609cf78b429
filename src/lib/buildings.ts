export type Mall = {
  city: "东大门" | "南大门" | "釜山";
  buildings: { name: string; floors: string[] }[];
};

export const MALLS: Mall[] = [
  {
    city: "东大门",
    buildings: [
      { name: "THEOT", floors: ["B1", "B2", "1F", "2F", "3F", "4F", "5F"] },
      { name: "ChungPyungHwa", floors: ["B1", "1F", "2F", "3F", "4F", "5F"] },
      { name: "NUZZON", floors: ["B1", "B2", "1F", "2F", "3F", "4F", "5F", "6F", "SIDE"] },
      { name: "APM", floors: ["B1", "1F", "2F", "3F", "4F", "5F", "6F", "7F"] },
      { name: "Nam Pyunghwa", floors: ["B1", "1F", "2F", "3F"] },
      { name: "Techno", floors: ["B1", "1F", "2F", "3F", "4F", "5F", "6F", "ANNEX", "SIDE"] },
      { name: "Jeil Pyunghwa", floors: ["B1", "1F", "2F", "3F", "4F", "5F"] },
      { name: "Dong Pyunghwa", floors: ["B1", "1F", "2F", "3F", "4F"] },
      { name: "Queen's Square", floors: ["B1", "1F", "2F", "3F", "4F", "5F"] },
      { name: "Studio W", floors: ["1F", "2F", "3F", "4F"] },
      { name: "DWP", floors: ["B1", "1F", "2F", "3F", "4F"] },
      { name: "Belpost", floors: ["1F", "2F", "3F", "4F"] },
      { name: "APM Luxe", floors: ["B1", "1F", "2F", "3F", "4F", "5F"] },
      { name: "Designer Club", floors: ["1F", "2F", "3F"] },
      { name: "DDP(U:US)", floors: ["B1", "1F", "2F", "3F"] },
      { name: "Team204", floors: ["B1", "1F", "2F", "3F", "4F"] },
    ],
  },
  {
    city: "南大门",
    buildings: [
      { name: "Mesa", floors: ["B1", "1F", "2F", "3F", "4F", "5F"] },
      { name: "Bujon", floors: ["B1", "1F", "2F", "3F", "4F"] },
      { name: "Cherrong", floors: ["1F", "2F", "3F"] },
    ],
  },
  {
    city: "釜山",
    buildings: [
      { name: "Busan Fashion Plaza", floors: ["B1", "1F", "2F", "3F", "4F"] },
      { name: "Nampo Wholesale", floors: ["1F", "2F", "3F"] },
    ],
  },
];