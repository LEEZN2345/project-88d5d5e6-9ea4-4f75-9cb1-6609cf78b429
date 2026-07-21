import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, krwToCny, formatCNY } from "@/lib/mock-data";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  ScrollText,
  Eye,
  ShoppingCart,
  Coins,
  Hourglass,
  Users as UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
      const sold = status === "live" ? 3 + i * 4 : 0;
      const earned = status === "live" ? Math.round(priceCNY * 0.1 * sold * 100) / 100 : 0;
      const pending = status === "live" ? Math.round(priceCNY * 0.1 * Math.max(1, Math.round(sold / 3)) * 100) / 100 : 0;
      const views = status === "live" ? 180 + i * 90 : status === "pending" ? 0 : 32;
      return {
        id: p.id,
        caption: CAPTIONS[i % CAPTIONS.length],
        cover: p.images[0],
        shop: shop?.name ?? "档口",
        priceCNY,
        commission: Math.round(priceCNY * 0.1 * 100) / 100,
        status,
        views,
        sold,
        earned,
        pending,
        createdAt: `2026-07-${21 - i}`,
      };
    });
  }, []);

  const list = tab === "all" ? posts : posts.filter((p) => p.status === tab);
  const totalEarned = posts.reduce((s, p) => s + p.earned, 0);
  const totalPending = posts.reduce((s, p) => s + p.pending, 0);
  const withdrawable = Math.max(0, Math.round((totalEarned - totalPending) * 100) / 100);
  const todayNew = 45; // mock
  const publishedCount = posts.filter((p) => p.status !== "rejected").length;
  const fans = 156;

  return (
    <MobileShell>
      <MobileHeader title="我的分销" />

      {/* 个人资料卡 */}
      <div className="mx-3 mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-orange-400 text-lg font-black text-white">
          A
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">小A</span>
            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
              东大门种草官
            </span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            已发布 <span className="font-semibold text-foreground">{publishedCount}</span> 篇 ·
            粉丝 <span className="font-semibold text-foreground">{fans}</span>
          </div>
        </div>
        <Link
          to="/discover/new"
          className="rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow"
        >
          <Sparkles className="mr-1 inline h-3.5 w-3.5" />
          去发布
        </Link>
      </div>

      {/* 收益看板 */}
      <div className="mx-3 mt-3 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-4 text-white shadow">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[11px] opacity-90">总收益</div>
            <div className="mt-0.5 text-xl font-black leading-none">{formatCNY(totalEarned)}</div>
          </div>
          <div className="border-x border-white/25">
            <div className="text-[11px] opacity-90">可提现</div>
            <div className="mt-0.5 text-xl font-black leading-none">{formatCNY(withdrawable)}</div>
          </div>
          <div>
            <div className="text-[11px] opacity-90">今日新增</div>
            <div className="mt-0.5 text-xl font-black leading-none">{formatCNY(todayNew)}</div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() =>
              withdrawable > 0
                ? toast.success(`提现申请已提交 · ${formatCNY(withdrawable)}`)
                : toast.info("暂无可提现金额")
            }
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white py-2 text-sm font-bold text-rose-600 shadow"
          >
            <Wallet className="h-4 w-4" /> 提现
          </button>
          <Link
            to="/me/points"
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/15 py-2 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur"
          >
            <ScrollText className="h-4 w-4" /> 收益明细
          </Link>
        </div>
        <Link
          to="/me/promo-links"
          className="mt-2 flex items-center justify-center gap-1 rounded-full bg-white/15 py-2 text-xs font-semibold text-white ring-1 ring-white/40 backdrop-blur"
        >
          🔗 我的推广链接（复制 / 二维码）
        </Link>
      </div>

      {/* Tabs */}
      <div className="sticky top-12 z-30 mt-3 flex gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
        <div className="mr-auto flex items-center text-xs font-semibold text-muted-foreground">
          📊 我的推广效果
        </div>
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
          <Link
            key={p.id}
            to="/discover/$postId"
            params={{ postId: p.id }}
            className="block rounded-2xl border border-border bg-card p-3 shadow-sm active:opacity-80"
          >
            <div className="flex gap-3">
              <img src={p.cover} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="line-clamp-2 text-sm font-medium">📸 {p.caption}</div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  🏢 {p.shop} · {p.createdAt}
                </div>
                <div className="mt-1 text-xs">
                  <span className="font-semibold text-rose-600">{formatCNY(p.priceCNY)}</span>
                  <span className="ml-1 text-[10px] text-muted-foreground">拼单价</span>
                </div>
              </div>
            </div>

            {/* 转化漏斗：浏览 → 成交 → 收益 → 待结算 */}
            <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-muted/50 p-2 text-center">
              <FunnelCell icon={Eye} label="浏览" value={p.views.toLocaleString()} />
              <FunnelCell icon={ShoppingCart} label="成交" value={`${p.sold}单`} />
              <FunnelCell icon={Coins} label="收益" value={formatCNY(p.earned)} highlight="amber" />
              <FunnelCell icon={Hourglass} label="待结算" value={formatCNY(p.pending)} highlight="rose" />
            </div>
          </Link>
        ))}

        {/* 底部空提示 */}
        {list.length > 0 && (
          <div className="pt-2 text-center text-[11px] text-muted-foreground">
            <UsersIcon className="mr-1 inline h-3 w-3" />
            数据每小时更新一次，佣金 T+7 结算
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function FunnelCell({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: "amber" | "rose";
}) {
  return (
    <div>
      <div className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-[13px] font-bold leading-tight",
          highlight === "amber" && "text-amber-600",
          highlight === "rose" && "text-rose-600",
        )}
      >
        {value}
      </div>
    </div>
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