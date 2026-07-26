import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, krwToCny, formatCNY } from "@/lib/mock-data";
import { Sparkles, Wallet, ScrollText, BarChart3, Clock, CheckCircle2, CircleDollarSign, PackageCheck } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/me/posts")({
  head: () => ({ meta: [{ title: "我的发布 · 东大门蚂蚁" }] }),
  component: MyPosts,
});

const CAPTIONS = [
  "碎花裙推荐",
  "西装外套分享",
  "小方包百搭日常",
  "蕾丝拼接连衣裙",
];

function MyPosts() {
  const posts = useMemo(() => {
    return PRODUCTS.slice(0, 6).map((p, i) => {
      const shop = SHOPS.find((s) => s.id === p.shopId);
      const priceCNY = krwToCny(p.priceKRW);
      const sold = [12, 5, 8, 3, 6, 2][i] ?? 1;
      const views = [520, 230, 410, 180, 305, 96][i] ?? 100;
      const earned = Math.round(priceCNY * 0.03 * sold * 100) / 100;
      const pending = Math.round(earned * 0.3 * 100) / 100;
      return {
        id: p.id,
        caption: CAPTIONS[i % CAPTIONS.length],
        cover: p.images[0],
        shop: shop?.name ?? "档口",
        priceCNY,
        views,
        sold,
        earned,
        pending,
      };
    });
  }, []);

  const totalEarned = 1280;
  const withdrawable = 520;
  const todayNew = 45;
  const publishedCount = 23;
  const fans = 156;

  // 结算流水（引用订单发帖模式）：签收 → +14 天 = 预计结算日
  // stage: pending(待结算,冻结中) → settled(已结算,进入可提现池) → withdrawable(已到账,可发起提现)
  const today = new Date("2026-07-22");
  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const daysBetween = (a: Date, b: Date) =>
    Math.ceil((b.getTime() - a.getTime()) / 86400000);

  const settlements = [
    { orderId: "DD20251128001", caption: "碎花裙推荐", amount: 45.0, deliveredAt: "2026-07-18" },
    { orderId: "DD20251127014", caption: "西装外套分享", amount: 30.0, deliveredAt: "2026-07-10" },
    { orderId: "DD20251126008", caption: "小方包百搭日常", amount: 22.5, deliveredAt: "2026-07-05" },
    { orderId: "DD20250625012", caption: "蕾丝拼接连衣裙", amount: 68.0, deliveredAt: "2026-06-20" },
  ].map((s) => {
    const settleAt = addDays(new Date(s.deliveredAt), 14);
    const daysLeft = daysBetween(today, settleAt);
    const stage: "pending" | "settled" | "withdrawable" =
      daysLeft > 0 ? "pending" : daysLeft > -30 ? "settled" : "withdrawable";
    return { ...s, settleAt: fmtDate(settleAt), daysLeft, stage };
  });

  const poolPending = settlements
    .filter((s) => s.stage === "pending")
    .reduce((sum, s) => sum + s.amount, 0);
  const poolSettled = settlements
    .filter((s) => s.stage === "settled")
    .reduce((sum, s) => sum + s.amount, 0);
  const poolWithdrawable = settlements
    .filter((s) => s.stage === "withdrawable")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <MobileShell>
      <MobileHeader title="我的分销" back />

      <div className="space-y-3 px-4 pb-24 pt-3">
        {/* 个人资料卡 */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-lg font-black text-primary-foreground">
            A
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">小A</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
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
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow"
          >
            <Sparkles className="mr-1 inline h-3.5 w-3.5" />
            去发布
          </Link>
        </div>

        {/* 收益看板 */}
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {[
            { l: "总收益", v: formatCNY(totalEarned) },
            { l: "可提现", v: formatCNY(withdrawable), hl: true },
            { l: "今日新增", v: `+${formatCNY(todayNew)}` },
          ].map((s, i) => (
            <div
              key={s.l}
              className={`px-2 py-3 text-center ${i !== 2 ? "border-r border-border" : ""}`}
            >
              <div className="text-[11px] text-muted-foreground">{s.l}</div>
              <div className={`mt-1 text-lg font-black leading-none tabular-nums ${s.hl ? "text-primary" : "text-foreground"}`}>
                {s.v}
              </div>
            </div>
          ))}
        </div>

        {/* 结算时间线 */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Clock className="h-4 w-4 text-primary" /> 结算进度
            </div>
            <span className="text-[10px] text-muted-foreground">签收 +14 天自动结算</span>
          </div>

          {/* 三段式进度条 */}
          <div className="px-4 pt-4">
            <div className="relative flex items-start justify-between">
              <span className="absolute left-6 right-6 top-3 h-0.5 bg-border" />
              {[
                { key: "pending", label: "待结算", icon: Clock, amount: poolPending, tone: "text-amber-600 bg-amber-100 dark:bg-amber-500/20" },
                { key: "settled", label: "已结算", icon: CheckCircle2, amount: poolSettled, tone: "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20" },
                { key: "withdrawable", label: "可提现", icon: CircleDollarSign, amount: poolWithdrawable, tone: "text-primary bg-primary/10" },
              ].map((s) => (
                <div key={s.key} className="relative z-10 flex w-1/3 flex-col items-center text-center">
                  <span className={`grid h-6 w-6 place-items-center rounded-full ring-4 ring-card ${s.tone}`}>
                    <s.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="mt-1.5 text-[10px] text-muted-foreground">{s.label}</div>
                  <div className="text-sm font-bold tabular-nums text-foreground">{formatCNY(s.amount)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 明细列表 */}
          <ul className="mt-3 divide-y divide-border border-t border-border">
            {settlements.map((s) => {
              const badge =
                s.stage === "pending"
                  ? { text: "待结算", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" }
                  : s.stage === "settled"
                    ? { text: "已结算", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" }
                    : { text: "可提现", cls: "bg-primary/10 text-primary" };
              return (
                <li key={s.orderId} className="flex items-start gap-3 px-4 py-3">
                  <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">📸 {s.caption}</span>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}>{badge.text}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      订单 {s.orderId} · 签收 {s.deliveredAt}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {s.stage === "pending" ? (
                        <>
                          预计结算日：
                          <span className="font-semibold text-foreground">{s.settleAt}</span>
                          <span className="ml-1 text-amber-600">（还剩 {s.daysLeft} 天）</span>
                        </>
                      ) : (
                        <>
                          已于 <span className="font-semibold text-foreground">{s.settleAt}</span> 自动结算
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm font-bold tabular-nums text-primary">
                    +{formatCNY(s.amount)}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border bg-muted/30 px-4 py-2 text-[10px] leading-relaxed text-muted-foreground">
            规则：好友签收当日起 14 天售后期结束，返佣自动从「待结算」转入「可提现」；若发生退款则同步冲销。
          </div>
        </div>

        {/* 我的推广效果 */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3 text-sm font-semibold">
            <BarChart3 className="h-4 w-4 text-primary" /> 我的推广效果
          </div>
          <div className="divide-y divide-border">
            {posts.map((p) => (
              <Link
                key={p.id}
                to="/discover/$postId"
                params={{ postId: p.id }}
                className="block px-4 py-3 active:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <img src={p.cover} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1 text-sm font-medium">📸 {p.caption}</div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-y-1 pl-[60px] text-[12px]">
                  <div className="text-muted-foreground">👁️ 浏览 <span className="font-semibold text-foreground tabular-nums">{p.views}</span></div>
                  <div className="text-muted-foreground">🛒 成交 <span className="font-semibold text-foreground tabular-nums">{p.sold}单</span></div>
                  <div className="text-muted-foreground">💰 收益 <span className="font-semibold text-primary tabular-nums">{formatCNY(p.earned)}</span></div>
                  <div className="text-muted-foreground">⏳ 待结算 <span className="font-semibold text-amber-600 tabular-nums">{formatCNY(p.pending)}</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 底部固定操作 */}
      <div className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[480px] -translate-x-1/2 gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <button
          onClick={() =>
            withdrawable > 0
              ? toast.success(`提现申请已提交 · ${formatCNY(withdrawable)}`)
              : toast.info("暂无可提现金额")
          }
          className="flex flex-1 items-center justify-center gap-1 rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow"
        >
          <Wallet className="h-4 w-4" /> 提现
        </button>
        <Link
          to="/me/promo-links"
          className="flex flex-1 items-center justify-center gap-1 rounded-full border border-border bg-card py-2.5 text-sm font-semibold text-foreground"
        >
          <ScrollText className="h-4 w-4" /> 明细
        </Link>
      </div>
    </MobileShell>
  );
}