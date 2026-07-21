import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, krwToCny, formatCNY } from "@/lib/mock-data";
import { Sparkles, Clock, CheckCircle2, XCircle, Coins } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/me/posts")({
  head: () => ({ meta: [{ title: "我的发布 · 东大门订货通" }] }),
  component: MyPosts,
});

type Status = "pending" | "live" | "rejected";

const CAPTIONS = [
  "东大门爆款碎花裙 太仙了",
  "小方包百搭日常",
  "早春上新 蕾丝拼接连衣裙",
  "通勤西装外套推荐",
];

function MyPosts() {
  const [tab, setTab] = useState<Status | "all">("all");

  const posts = useMemo(() => {
    return PRODUCTS.slice(0, 6).map((p, i) => {
      const shop = SHOPS.find((s) => s.id === p.shopId);
      const priceCNY = krwToCny(p.priceKRW);
      const status: Status = i === 0 ? "pending" : i === 5 ? "rejected" : "live";
      return {
        id: p.id,
        caption: CAPTIONS[i % CAPTIONS.length],
        cover: p.images[0],
        shop: shop?.name ?? "档口",
        priceCNY,
        commission: Math.round(priceCNY * 0.1 * 100) / 100,
        status,
        sold: status === "live" ? 3 + i * 4 : 0,
        earned: status === "live" ? Math.round(priceCNY * 0.1 * (3 + i * 4)) : 0,
        createdAt: `2026-07-${21 - i}`,
      };
    });
  }, []);

  const list = tab === "all" ? posts : posts.filter((p) => p.status === tab);
  const totalEarned = posts.reduce((s, p) => s + p.earned, 0);

  return (
    <MobileShell>
      <MobileHeader title="我的发布" />

      {/* 汇总 */}
      <div className="mx-3 mt-3 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-4 text-white shadow">
        <Coins className="h-8 w-8 opacity-80" />
        <div className="flex-1">
          <div className="text-xs opacity-90">累计佣金收入</div>
          <div className="text-2xl font-black leading-none">{formatCNY(totalEarned)}</div>
        </div>
        <Link
          to="/discover/new"
          className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow"
        >
          <Sparkles className="mr-1 inline h-3.5 w-3.5" />
          再发一篇
        </Link>
      </div>

      {/* Tabs */}
      <div className="sticky top-12 z-30 mt-3 flex gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
        {(
          [
            { k: "all", l: "全部" },
            { k: "pending", l: "审核中" },
            { k: "live", l: "已上架" },
            { k: "rejected", l: "未通过" },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium",
              tab === t.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="space-y-3 px-3 pb-8 pt-3">
        {list.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            暂无发布，去
            <Link to="/discover/new" className="mx-1 text-primary underline">
              发布好物
            </Link>
            赚佣金吧
          </div>
        )}
        {list.map((p) => (
          <div key={p.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
            <img src={p.cover} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="line-clamp-2 text-sm font-medium">{p.caption}</div>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                🏢 {p.shop} · {p.createdAt}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-rose-600 font-semibold">{formatCNY(p.priceCNY)}</span>
                {p.status === "live" ? (
                  <span className="text-muted-foreground">
                    已售 <span className="text-foreground font-semibold">{p.sold}</span> · 收入{" "}
                    <span className="text-amber-600 font-semibold">{formatCNY(p.earned)}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    预估佣金 <span className="text-amber-600 font-semibold">{formatCNY(p.commission)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map = {
    pending: { icon: Clock, label: "审核中", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" },
    live: { icon: CheckCircle2, label: "已上架", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
    rejected: { icon: XCircle, label: "未通过", cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" },
  } as const;
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", s.cls)}>
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  );
}