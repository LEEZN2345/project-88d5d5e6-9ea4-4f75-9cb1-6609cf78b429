import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { MALLS } from "@/lib/buildings";
import { ChevronDown, ChevronUp, Search, ShoppingCart, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shops/")({
  head: () => ({
    meta: [
      { title: "档口列表 · 东大门订货通" },
      { name: "description", content: "浏览东大门核心商场档口的全量货源。" },
    ],
  }),
  component: ShopsIndex,
});

const SHOP_POOL = [
  "LUMIPLE", "humming", "MARIE M", "LE-PPL", "FLORAL", "Ande",
  "ÁRBOL", "2DA", "PLOVER", "NOIR", "ATELIER", "MUSE",
  "OLIVE", "ROSEN", "BLANC", "SOON", "CIEL", "VERA",
];

const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/300`;

type Tile = { name: string; code: string; cover: string };

function tilesFor(building: string, floor: string): Tile[] {
  // deterministic pseudo-random offset by name length
  const offset = (building.length * 3 + floor.length) % SHOP_POOL.length;
  const count = 9;
  const floorNum = parseInt(floor.replace(/[^0-9]/g, "") || "1", 10);
  const base = (floor.startsWith("B") ? -1 : 1) * floorNum * 100 + 1;
  return Array.from({ length: count }, (_, i) => {
    const nm = SHOP_POOL[(offset + i) % SHOP_POOL.length];
    const num = base + i * 2;
    const code = `P${String(num).padStart(3, "0")}`;
    return { name: nm, code, cover: img(`${building}-${floor}-${i}`) };
  });
}

const HERO_IMG = (b: string) => `https://picsum.photos/seed/hero-${b}/800/420`;

function ShopsIndex() {
  const [tab, setTab] = useState<"档口分类" | "种类分类">("档口分类");
  const dongdaemun = MALLS.find((m) => m.city === "东大门")!;
  // Only include buildings that actually have floors for this UI
  const buildings = useMemo(
    () => dongdaemun.buildings.filter((b) => b.floors.length > 0),
    [dongdaemun]
  );
  const [activeBuilding, setActiveBuilding] = useState<string>(buildings[0].name);
  const current = buildings.find((b) => b.name === activeBuilding)!;
  const [activeFloor, setActiveFloor] = useState<string>(current.floors[0]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [buildings[0].name]: true });

  const onPickBuilding = (name: string) => {
    const b = buildings.find((x) => x.name === name)!;
    setActiveBuilding(name);
    setActiveFloor(b.floors[0]);
    setExpanded((e) => ({ ...e, [name]: true }));
  };

  const tiles = tilesFor(activeBuilding, activeFloor);

  return (
    <MobileShell>
      <MobileHeader
        title="分类"
        back
        right={
          <div className="flex items-center gap-3 text-muted-foreground">
            <MoreHorizontal className="h-5 w-5" />
            <Search className="h-5 w-5" />
            <ShoppingCart className="h-5 w-5" />
          </div>
        }
      />
      <div className="flex items-center justify-around border-b border-border bg-background px-4 pt-2">
        {(["档口分类", "种类分类"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative flex-1 pb-2 text-sm",
              tab === t ? "font-semibold text-primary" : "text-muted-foreground"
            )}
          >
            {t}
            {tab === t && (
              <span className="absolute left-1/2 -bottom-px h-0.5 w-10 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex h-[calc(100vh-3rem-3rem-4rem)] min-h-[560px]">
        {/* Left rail */}
        <aside className="w-24 shrink-0 overflow-y-auto border-r border-border bg-muted/30">
          <ul className="py-1">
            {buildings.map((b) => {
              const isOpen = !!expanded[b.name];
              const isActive = b.name === activeBuilding;
              return (
                <li key={b.name}>
                  <button
                    onClick={() => {
                      onPickBuilding(b.name);
                      setExpanded((e) => ({ ...e, [b.name]: !e[b.name] }));
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-1 px-3 py-2.5 text-left text-[13px]",
                      isActive ? "font-semibold text-foreground" : "text-foreground/80"
                    )}
                  >
                    <span className="truncate">{b.name}</span>
                    {isOpen ? (
                      <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {isOpen && isActive && (
                    <ul className="bg-background">
                      {b.floors.map((f) => {
                        const fa = f === activeFloor;
                        return (
                          <li key={f}>
                            <button
                              onClick={() => setActiveFloor(f)}
                              className={cn(
                                "relative block w-full px-3 py-2 text-left text-[13px]",
                                fa ? "font-semibold text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {f}
                              {fa && (
                                <span className="absolute bottom-1 left-3 h-0.5 w-6 rounded-full bg-gradient-to-r from-primary to-primary/40" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Right pane */}
        <section className="flex-1 overflow-y-auto bg-background">
          <div className="px-3 pt-3">
            <div className="overflow-hidden rounded-md">
              <img
                src={HERO_IMG(activeBuilding)}
                alt={activeBuilding}
                className="h-40 w-full object-cover"
              />
            </div>
            <div className="my-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="h-px w-6 bg-border" />
              <span className="font-medium text-foreground">{activeFloor}</span>
              <span className="h-px w-6 bg-border" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 px-3 pb-6">
            {tiles.map((t) => (
              <Link
                key={t.code}
                to="/shops/$id"
                params={{ id: "s1" }}
                className="group flex flex-col"
              >
                <div className="aspect-square overflow-hidden rounded-md bg-muted">
                  <img
                    src={t.cover}
                    alt={t.name}
                    className="h-full w-full object-cover transition group-active:scale-95"
                  />
                </div>
                <div className="mt-1.5 truncate text-center text-[12px] font-semibold text-foreground">
                  {t.name}
                </div>
                <div className="text-center text-[11px] text-muted-foreground">
                  ({t.code})
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}