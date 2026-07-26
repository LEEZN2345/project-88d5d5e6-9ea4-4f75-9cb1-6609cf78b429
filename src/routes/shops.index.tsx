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
import { useBanner } from "@/lib/banners";
import { SignBoard } from "@/components/SignBoard";

function brandVariant(name: string): "apm" | "place" | "luxe" {
  const n = name.toLowerCase();
  if (n.includes("place")) return "place";
  if (n.includes("luxe")) return "luxe";
  return "apm";
}

export const Route = createFileRoute("/shops/")({
  head: () => ({
    meta: [
      { title: "档口列表 · 东大门蚂蚁" },
      { name: "description", content: "浏览东大门核心商场档口的全量货源。" },
    ],
  }),
  component: ShopsIndex,
});

const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/300`;

// 部分档口支持单件购买（示例数据：档口名 hash 决定）
function supportsSingleBuy(name: string): boolean {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return h % 3 !== 0; // 约 2/3 支持单件
}

type TabKey = "area" | "rank" | "hot";

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
      <div className="grid grid-cols-3 gap-2 border-b border-border bg-background px-3 py-3">
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
        <TabCard
          active={tab === "hot"}
          onClick={() => setTab("hot")}
          icon={<Flame className="h-4 w-4" />}
          title="热门档口"
          subtitle="人气 · 大图速览"
          tone="amber"
        />
      </div>

      {tab === "area" ? <AreaView /> : tab === "rank" ? <RankView /> : <HotShopsView />}
    </MobileShell>
  );
}

function HotShopsView() {
  return (
    <div className="space-y-3 px-4 py-3">
      {SHOPS.map((s) => (
        <Link
          key={s.id}
          to="/shops/$id"
          params={{ id: s.id }}
          className="block overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <img src={s.cover} alt={s.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{s.name}</div>
              <div className="text-xs text-muted-foreground">
                {s.building} · {s.floor}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {s.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="shrink-0 self-center text-xs text-muted-foreground">
              {s.productCount} 款
            </div>
          </div>
        </Link>
      ))}
    </div>
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
  const heroBanner = useBanner("shops_hero");
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

  const shops = shopsByBuildingFloor(activeBuilding, activeFloor);
  const floorsCovered = floorsWithShops(activeBuilding);
  const hasIndexed = buildingHasShops(activeBuilding);
  const shopCount = shops.length;

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

      {/* Top building chip strip (replaces left rail) */}
      {/* Building signboard strip — mimics physical stall plates */}
      <div className="border-b border-border bg-neutral-950">
        <div className="flex flex-wrap gap-2 px-3 py-3">
          {buildings.map((b) => {
            const isActive = b.name === activeBuilding;
            const has = buildingHasShops(b.name);
            return (
              <SignBoard
                key={b.name}
                label={b.name.replace(/^APM\s*/i, "").trim() || "apM"}
                code={has ? "●" : undefined}
                variant={brandVariant(b.name)}
                active={isActive}
                onClick={() => onPickBuilding(b.name)}
                className=""
              />
            );
          })}
        </div>
      </div>

      {/* Full-width content */}
      <section className="bg-background">
        {/* Hero banner full-width */}
        {heroBanner?.enabled !== false && (
        <div className="relative h-36 overflow-hidden bg-muted">
          <img
            src={heroBanner?.image || `https://picsum.photos/seed/hero-${activeBuilding}/800/420`}
            alt={activeBuilding}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/15 to-transparent p-4">
            <h2 className="text-lg font-bold text-white">
              {activeBuilding} {heroBanner?.title || "购物中心"}
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-white/80">
              {heroBanner?.subtitle || "Market Premium Select"}
            </p>
          </div>
        </div>
        )}

        {/* Secondary floor strip (kept) */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex flex-wrap gap-1.5 px-3 py-2">
            {current.floors.map((f) => {
              const fa = f === activeFloor;
              const has = shopsByBuildingFloor(activeBuilding, f).length > 0;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFloor(f)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[12px] font-bold tabular-nums transition",
                    fa
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {f}
                  {has && !fa && (
                    <span className="ml-1 inline-block h-1 w-1 rounded-full bg-amber-500 align-middle" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Floor meta */}
        <div className="flex items-baseline justify-between px-3 pb-1 pt-3">
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-black text-foreground">{activeFloor}</h3>
            <span className="text-[10px] text-muted-foreground">
              {shopCount > 0 ? `已收录 ${shopCount} 个档口` : "暂未收录档口"}
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/70">
            Sorted by rank
          </span>
        </div>

        {/* Full-width shop grid */}
        {shops.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-2 gap-y-4 px-3 pb-6 pt-2">
            {shops.map((s: IndexedShop) => (
              <Link
                key={`${s.building}-${s.floor}-${s.code}`}
                to="/shops/$id"
                params={{ id: "s1" }}
                className="group flex flex-col gap-1.5"
              >
                <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
                  <img
                    src={img(`${s.building}-${s.code}-${s.name}`)}
                    alt={s.name}
                    className="h-full w-full object-cover transition group-active:scale-95"
                  />
                  {s.rank && s.rank <= 10 && (
                    <span className="absolute left-1 top-1 rounded bg-gradient-to-br from-amber-400 to-orange-500 px-1 py-0.5 text-[9px] font-black text-white shadow">
                      TOP{s.rank}
                    </span>
                  )}
                  {s.hot && (
                    <span className="absolute right-1 top-1 rounded bg-rose-500 px-1 py-0.5 text-[8px] font-bold text-white">
                      实体热
                    </span>
                  )}
                </div>
                <div className="leading-tight">
                  <p className="truncate text-[12px] font-bold text-foreground">
                    {s.name}
                  </p>
                  <p className="text-[10px] font-medium tracking-tight text-muted-foreground">
                    {s.building} · {s.floor}-{s.code}
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded px-1 py-0.5 text-[9px] font-bold",
                      supportsSingleBuy(s.name)
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-amber-500/15 text-amber-600",
                    )}
                  >
                    {supportsSingleBuy(s.name) ? "1件可购" : "2件起批"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mx-3 mb-6 mt-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <p className="text-[12px] font-semibold text-foreground">
              本层档口正在收录中
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {hasIndexed
                ? `${activeBuilding} 已收录楼层: ${[...floorsCovered].join(" · ")}`
                : "该商场尚未录入档口数据,敬请期待"}
            </p>
          </div>
        )}
      </section>
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