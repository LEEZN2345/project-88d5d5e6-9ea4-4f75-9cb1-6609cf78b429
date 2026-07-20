import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, formatKRW, krwToCny, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Compass, Flame, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "发现好物 · 东大门订货通" }] }),
  component: Discover,
});

const TABS = [
  { key: "hot", label: "爆款热卖", icon: Flame },
  { key: "new", label: "今日上新", icon: Sparkles },
  { key: "trend", label: "趋势预测", icon: TrendingUp },
] as const;

function Discover() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("hot");

  const list =
    tab === "new"
      ? PRODUCTS.filter((p) => p.isNew)
      : tab === "trend"
        ? [...PRODUCTS].reverse()
        : [...PRODUCTS].sort((a, b) => (b.priceKRW ?? 0) - (a.priceKRW ?? 0));

  return (
    <MobileShell>
      <MobileHeader title="发现好物" />
      <div className="bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 px-4 pb-4 pt-4 text-white">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5" />
          <span className="text-base font-semibold">档口好物精选</span>
        </div>
        <div className="mt-1 text-xs opacity-90">买手甄选 · 每日刷新 · 热销 / 新款 / 趋势一站直达</div>
      </div>

      <div className="sticky top-12 z-30 flex gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition",
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-4 pb-6">
        {list.map((p) => (
          <Link
            key={p.id}
            to="/products/$id"
            params={{ id: p.id }}
            className="block overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[3/4]">
              <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              {p.isNew && (
                <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">新款</Badge>
              )}
              {tab === "hot" && (
                <Badge className="absolute right-2 top-2 bg-rose-500 text-white">HOT</Badge>
              )}
            </div>
            <div className="p-2">
              <div className="line-clamp-1 text-xs">{p.name}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm font-semibold">{formatKRW(p.priceKRW)}</span>
                <span className="text-[10px] text-muted-foreground">≈{formatCNY(krwToCny(p.priceKRW))}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{p.internalCode}</div>
            </div>
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}