import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { MALLS } from "@/lib/buildings";
import { Search, ShoppingCart, MoreHorizontal } from "lucide-react";
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
  const dongdaemun = MALLS.find((m) => m.city === "东大门")!;
  // Only include buildings that actually have floors for this UI
  const buildings = useMemo(
    () => dongdaemun.buildings.filter((b) => b.floors.length > 0),
    [dongdaemun]
  );
  const [activeBuilding, setActiveBuilding] = useState<string>(buildings[0].name);
  const current = buildings.find((b) => b.name === activeBuilding)!;
  const [activeFloor, setActiveFloor] = useState<string>(current.floors[0]);

  const onPickBuilding = (name: string) => {
    const b = buildings.find((x) => x.name === name)!;
    setActiveBuilding(name);
    setActiveFloor(b.floors[0]);
  };

  const tiles = tilesFor(activeBuilding, activeFloor);
  const shopCount = 80 + ((activeBuilding.length * 7 + activeFloor.length * 13) % 90);

  return (
    <MobileShell>
      <MobileHeader
        title="分类"
        back
        right={
          <div className="flex items-center gap-3 text-muted-foreground">
            <MoreHorizontal className="h-5 w-5" />
            <ShoppingCart className="h-5 w-5" />
          </div>
        }
      />

      {/* Search bar */}
      <div className="border-b border-border bg-background px-3 py-2">
        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索档口、货号..."
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex min-h-[560px]">
        {/* Left rail */}
        <aside className="w-24 shrink-0 overflow-y-auto border-r border-border bg-muted/40">
          <nav className="flex flex-col">
            {buildings.map((b) => {
              const isActive = b.name === activeBuilding;
              return (
                <div
                  key={b.name}
                  className={cn(
                    isActive && "border-l-4 border-foreground bg-background"
                  )}
                >
                  <button
                    onClick={() => onPickBuilding(b.name)}
                    className={cn(
                      "w-full px-3 py-3.5 text-left text-[12px] uppercase tracking-tight",
                      isActive
                        ? "font-bold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="block truncate">{b.name}</span>
                  </button>
                  {isActive && (
                    <div className="flex flex-col bg-muted/40">
                      {b.floors.map((f) => {
                        const fa = f === activeFloor;
                        return (
                          <button
                            key={f}
                            onClick={() => setActiveFloor(f)}
                            className={cn(
                              "px-4 py-2 text-left text-[11px]",
                              fa
                                ? "bg-background font-bold text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Right pane */}
        <section className="flex-1 overflow-y-auto bg-background">
          {/* Hero banner */}
          <div className="p-3">
            <div className="relative h-28 overflow-hidden rounded-xl bg-muted">
              <img
                src={HERO_IMG(activeBuilding)}
                alt={activeBuilding}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/55 via-black/10 to-transparent p-3">
                <h2 className="text-base font-bold text-white">
                  {activeBuilding} 购物中心
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-white/80">
                  Market Premium Select
                </p>
              </div>
            </div>
          </div>

          {/* Sticky floor header */}
          <div className="sticky top-0 z-10 flex items-baseline justify-between bg-background px-3 py-2">
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-black text-foreground">{activeFloor}</h3>
              <span className="text-[10px] text-muted-foreground">
                本层共 {shopCount} 个档口
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/70">
              Sorted by popularity
            </span>
          </div>

          {/* 3-col shop grid */}
          <div className="grid grid-cols-3 gap-x-2 gap-y-4 px-3 pb-6 pt-1">
            {tiles.map((t) => (
              <Link
                key={t.code}
                to="/shops/$id"
                params={{ id: "s1" }}
                className="group flex flex-col gap-1.5"
              >
                <div className="aspect-square overflow-hidden rounded-md border border-border bg-muted">
                  <img
                    src={t.cover}
                    alt={t.name}
                    className="h-full w-full object-cover transition group-active:scale-95"
                  />
                </div>
                <div className="leading-tight">
                  <p className="truncate text-[11px] font-bold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-[9px] font-medium tracking-tight text-muted-foreground">
                    {t.code}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}