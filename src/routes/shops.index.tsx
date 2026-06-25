import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { MALLS } from "@/lib/buildings";
import {
  APM_RANK,
  OFFLINE_HOT,
  shopsByBuildingFloor,
  floorsWithShops,
  buildingHasShops,
  type RankShop,
  type IndexedShop,
} from "@/lib/rank-data";
import {
  Search,
  ShoppingCart,
  MoreHorizontal,
  MapPinned,
  Trophy,
  Crown,
  Flame,
  Store,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
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

const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/300`;

const HERO_IMG = (b: string) => `https://picsum.photos/seed/hero-${b}/800/420`;

type TabKey = "area" | "rank";

function ShopsIndex() {
  const [tab, setTab] = useState<TabKey>("area");

  return (
    <MobileShell>
      <MobileHeader
        title="档口"
        back
        right={
          <div className="flex items-center gap-3 text-muted-foreground">
            <MoreHorizontal className="h-5 w-5" />
            <ShoppingCart className="h-5 w-5" />
          </div>
        }
      />

      {/* Card switcher */}
      <div className="grid grid-cols-2 gap-2 border-b border-border bg-background px-3 py-3">
        <TabCard
          active={tab === "area"}
          onClick={() => setTab("area")}
          icon={<MapPinned className="h-4 w-4" />}
          title="按区域逛"
          subtitle="商场 · 楼层 · 档口"
          tone="dark"
        />
        <TabCard
          active={tab === "rank"}
          onClick={() => setTab("rank")}
          icon={<Trophy className="h-4 w-4" />}
          title="拿货排行榜"
          subtitle="销量 · 实体店热门"
          tone="amber"
        />
      </div>

      {tab === "area" ? <AreaView /> : <RankView />}
    </MobileShell>
  );
}

function TabCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "dark" | "amber";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border px-3 py-2.5 text-left transition",
        active
          ? tone === "dark"
            ? "border-foreground bg-foreground text-background"
            : "border-amber-500 bg-gradient-to-br from-amber-400 to-orange-500 text-white"
          : "border-border bg-muted/40 text-muted-foreground"
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[13px] font-bold">{title}</span>
      </div>
      <p
        className={cn(
          "mt-0.5 text-[10px]",
          active ? "opacity-90" : "text-muted-foreground"
        )}
      >
        {subtitle}
      </p>
    </button>
  );
}

function AreaView() {
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
    <>
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
    </>
  );
}

function RankView() {
  return (
    <div className="space-y-4 bg-muted/20 px-3 py-4">
      <RankSection
        title="东大门排行榜"
        subtitle="apM 集团档口 · 近 30 天销量 TOP"
        icon={<Crown className="h-4 w-4" />}
        accent="from-amber-400 to-orange-500"
        data={APM_RANK}
        badge="TOP 30"
      />
      <RankSection
        title="实体店热门拿货档口"
        subtitle="线下买手店 · 高频补货榜"
        icon={<Store className="h-4 w-4" />}
        accent="from-rose-500 to-red-500"
        data={OFFLINE_HOT}
        badge="实体精选"
      />
      <p className="pb-4 text-center text-[10px] text-muted-foreground">
        数据每日 00:00 北京时间更新 · 仅供参考
      </p>
    </div>
  );
}

function RankSection({
  title,
  subtitle,
  icon,
  accent,
  data,
  badge,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  data: RankShop[];
  badge: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      {/* Card header */}
      <div className={cn("relative bg-gradient-to-r px-4 py-3 text-white", accent)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-bold leading-none">{title}</h3>
              <p className="mt-1 text-[10px] opacity-90">{subtitle}</p>
            </div>
          </div>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
            {badge}
          </span>
        </div>
      </div>

      {/* List */}
      <ul className="divide-y divide-border">
        {data.map((s) => (
          <li key={`${title}-${s.rank}`}>
            <Link
              to="/shops/$id"
              params={{ id: "s1" }}
              className="flex items-center gap-3 px-3 py-2.5 active:bg-muted/50"
            >
              <RankBadge rank={s.rank} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-foreground">
                  {s.name}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {s.location}
                </p>
              </div>
              {s.rank <= 3 && (
                <Flame className="h-3.5 w-3.5 text-orange-500" />
              )}
              {s.rank > 3 && s.rank <= 10 && (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const top = rank <= 3;
  const tone =
    rank === 1
      ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-white"
      : rank === 2
      ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
      : rank === 3
      ? "bg-gradient-to-br from-orange-400 to-orange-700 text-white"
      : "bg-muted text-muted-foreground";
  return (
    <div
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-black tabular-nums",
        tone,
        top && "shadow-sm"
      )}
    >
      {rank}
    </div>
  );
}