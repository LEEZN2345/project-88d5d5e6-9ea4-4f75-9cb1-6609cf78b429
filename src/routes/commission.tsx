import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { PRODUCTS, SHOPS, krwToCny, formatCNY } from "@/lib/mock-data";
import {
  Wallet, Users, ArrowRight, Info, Clock, CheckCircle2, XCircle,
  Sparkles, BarChart3, CircleDollarSign, PackageCheck, ScrollText,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/commission")({
  head: () => ({
    meta: [
      { title: "我的钱包 · 东大门蚂蚁" },
      { name: "description", content: "统一查看创作返佣与邀请返佣收益、结算进度与提现。" },
      { property: "og:title", content: "我的钱包 · 东大门蚂蚁" },
      { property: "og:description", content: "创作返佣与邀请返佣合并管理，一处查看结算与提现。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletPage,
});

type Flow = { id: string; type: "L1" | "L2" | "withdraw" | "refund"; amount: number; desc: string; status: "settled" | "pending" | "paid" | "rejected"; time: string };

const FLOW: Flow[] = [
  { id: "c1", type: "L1", amount: 4.2, desc: "@wang** 订单 DD26071155 ¥600 · 0.5%", status: "settled", time: "2026-07-12 10:22" },
  { id: "c2", type: "L2", amount: 1.5, desc: "@wang** 邀请的 @li** 订单 ¥500 · 0.2%", status: "pending", time: "2026-07-11 20:41" },
  { id: "c3", type: "L1", amount: 9.8, desc: "@zhou** 订单 DD26070938 ¥1400 · 0.5%", status: "pending", time: "2026-07-09 15:05" },
  { id: "c4", type: "withdraw", amount: -30, desc: "提现到微信零钱", status: "paid", time: "2026-06-28 09:10" },
  { id: "c5", type: "refund", amount: -2.1, desc: "@li** 退款 冲销 L1 分佣", status: "settled", time: "2026-06-20 14:00" },
];

const CAPTIONS = ["碎花裙推荐", "西装外套分享", "小方包百搭日常", "蕾丝拼接连衣裙"];

function WalletPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "create" | "invite">("overview");

  const posts = useMemo(
    () =>
      PRODUCTS.slice(0, 6).map((p, i) => {
        const shop = SHOPS.find((s) => s.id === p.shopId);
        const priceCNY = krwToCny(p.priceKRW);
        const sold = [12, 5, 8, 3, 6, 2][i] ?? 1;
        const views = [520, 230, 410, 180, 305, 96][i] ?? 100;
        const earned = Math.round(priceCNY * 0.03 * sold * 100) / 100;
        return { id: p.id, caption: CAPTIONS[i % CAPTIONS.length], cover: p.images[0], shop: shop?.name ?? "档口", views, sold, earned, pending: Math.round(earned * 0.3 * 100) / 100 };
      }),
    [],
  );

  const today = new Date("2026-07-22");
  const fmtDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const daysBetween = (a: Date, b: Date) => Math.ceil((b.getTime() - a.getTime()) / 86400000);

  const settlements = [
    { orderId: "DD20251128001", caption: "碎花裙推荐", amount: 45.0, deliveredAt: "2026-07-18" },
    { orderId: "DD20251127014", caption: "西装外套分享", amount: 30.0, deliveredAt: "2026-07-10" },
    { orderId: "DD20251126008", caption: "小方包百搭日常", amount: 22.5, deliveredAt: "2026-07-05" },
    { orderId: "DD20250625012", caption: "蕾丝拼接连衣裙", amount: 68.0, deliveredAt: "2026-06-20" },
  ].map((s) => {
    const settleAt = addDays(new Date(s.deliveredAt), 14);
    const daysLeft = daysBetween(today, settleAt);
    const stage: "pending" | "settled" | "withdrawable" = daysLeft > 0 ? "pending" : daysLeft > -30 ? "settled" : "withdrawable";
    return { ...s, settleAt: fmtDate(settleAt), daysLeft, stage };
  });

  const sum = (st: string) => settlements.filter((s) => s.stage === st).reduce((a, s) => a + s.amount, 0);
  const poolPending = sum("pending");
  const poolSettled = sum("settled");
  const poolWithdrawable = sum("withdrawable");

  const creatorEarned = 1280;
  const inviteEarned = 312.9;
  const withdrawable = 46.7 + poolWithdrawable;
  const pending = 128.4 + poolPending;

  return (
    <MobileShell>
      <MobileHeader title="我的钱包" back />

      {/* 余额头部 */}
      <div className="bg-gradient-to-br from-primary to-primary/80 px-4 pb-5 pt-4 text-primary-foreground">
        <div className="flex items-center gap-1.5 text-xs opacity-90"><Wallet className="h-3.5 w-3.5" /> 可提现余额（创作返佣 + 邀请返佣）</div>
        <div className="mt-1 text-4xl font-bold tabular-nums">¥{withdrawable.toFixed(2)}</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { i: Clock, l: "待结算", v: pending, s: "签收 14 天后释放" },
            { i: Sparkles, l: "创作返佣", v: creatorEarned, s: "累计 3%" },
            { i: Users, l: "邀请返佣", v: inviteEarned, s: "L1 0.5% / L2 0.2%" },
          ].map((b) => (
            <div key={b.l} className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
              <div className="flex items-center gap-1 text-[10px] opacity-85"><b.i className="h-3 w-3" /> {b.l}</div>
              <div className="mt-0.5 text-base font-semibold tabular-nums">¥{b.v.toFixed(2)}</div>
              <div className="text-[9px] opacity-75">{b.s}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={() => navigate({ to: "/withdraw" })} className="flex-1 bg-white text-primary hover:bg-white/90" disabled={withdrawable < 10}>
            立即提现（门槛 ¥10）
          </Button>
          <Button onClick={() => navigate({ to: "/discover/new" })} variant="secondary" className="bg-white/20 text-primary-foreground hover:bg-white/30">
            <Sparkles className="mr-1 h-4 w-4" /> 去发布
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-20 flex gap-1 border-b border-border bg-background px-4 py-2">
        {([
          { k: "overview", l: "收益总览" },
          { k: "create", l: "创作返佣" },
          { k: "invite", l: "邀请返佣" },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex-1 rounded-full py-1.5 text-xs font-medium ${tab === t.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-3 px-4 pb-6 pt-3">
          {/* 结算进度 */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold"><Clock className="h-4 w-4 text-primary" /> 结算进度</div>
              <span className="text-[10px] text-muted-foreground">签收 +14 天自动结算</span>
            </div>
            <div className="px-4 py-4">
              <div className="relative flex items-start justify-between">
                <span className="absolute left-6 right-6 top-3 h-0.5 bg-border" />
                {[
                  { key: "p", label: "待结算", icon: Clock, amount: poolPending, tone: "text-amber-600 bg-amber-100" },
                  { key: "s", label: "已结算", icon: CheckCircle2, amount: poolSettled, tone: "text-emerald-600 bg-emerald-100" },
                  { key: "w", label: "可提现", icon: CircleDollarSign, amount: poolWithdrawable, tone: "text-primary bg-primary/10" },
                ].map((s) => (
                  <div key={s.key} className="relative z-10 flex w-1/3 flex-col items-center text-center">
                    <span className={`grid h-6 w-6 place-items-center rounded-full ring-4 ring-card ${s.tone}`}><s.icon className="h-3.5 w-3.5" /></span>
                    <div className="mt-1.5 text-[10px] text-muted-foreground">{s.label}</div>
                    <div className="text-sm font-bold tabular-nums">{formatCNY(s.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 规则 */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-[11px] text-foreground">
            <div className="flex items-center gap-1 font-medium"><Info className="h-3 w-3" /> 返佣规则</div>
            <ul className="mt-1 space-y-0.5 pl-4 [list-style:disc] text-muted-foreground">
              <li>创作返佣：他人通过你的帖子跟买，订单实付 × <b className="text-foreground">3%</b></li>
              <li>邀请一级：直接邀请好友订单实付 × <b className="text-foreground">0.5%</b></li>
              <li>邀请二级：好友再邀请的人订单实付 × <b className="text-foreground">0.2%</b></li>
              <li>签收 14 天售后期结束后自动结算，退款则冲销</li>
              <li>黄金会员返佣转为购物抵用金，钻石会员可提现</li>
            </ul>
            <Link to="/invite-rules" className="mt-1.5 flex items-center gap-0.5 text-primary">查看完整规则 <ArrowRight className="h-3 w-3" /></Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link to="/me/promo-links" className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card py-2.5 text-xs font-medium">
              <ScrollText className="h-4 w-4 text-primary" /> 推广链接
            </Link>
            <Link to="/discover/published" className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card py-2.5 text-xs font-medium">
              <Sparkles className="h-4 w-4 text-primary" /> 我的发布
            </Link>
          </div>
        </div>
      )}

      {tab === "create" && (
        <div className="space-y-3 px-4 pb-6 pt-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-4 py-3 text-sm font-semibold">结算明细</div>
            <ul className="divide-y divide-border">
              {settlements.map((s) => {
                const badge = s.stage === "pending"
                  ? { text: "待结算", cls: "bg-amber-100 text-amber-700" }
                  : s.stage === "settled"
                    ? { text: "已结算", cls: "bg-emerald-100 text-emerald-700" }
                    : { text: "可提现", cls: "bg-primary/10 text-primary" };
                return (
                  <li key={s.orderId} className="flex items-start gap-3 px-4 py-3">
                    <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">📸 {s.caption}</span>
                        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}>{badge.text}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">订单 {s.orderId} · 签收 {s.deliveredAt}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {s.stage === "pending"
                          ? <>预计结算日：<span className="font-semibold text-foreground">{s.settleAt}</span><span className="ml-1 text-amber-600">（还剩 {s.daysLeft} 天）</span></>
                          : <>已于 <span className="font-semibold text-foreground">{s.settleAt}</span> 自动结算</>}
                      </div>
                    </div>
                    <div className="text-right text-sm font-bold tabular-nums text-primary">+{formatCNY(s.amount)}</div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" /> 我的推广效果
            </div>
            <div className="divide-y divide-border">
              {posts.map((p) => (
                <Link key={p.id} to="/discover/$postId" params={{ postId: p.id }} className="block px-4 py-3 active:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <img src={p.cover} alt={p.caption} loading="lazy" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
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
      )}

      {tab === "invite" && (
        <div className="space-y-3 px-4 pb-6 pt-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { l: "邀请人数", v: "12" },
              { l: "有效邀请", v: "8", note: "已下过单" },
              { l: "本月新增", v: "3" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-card p-2.5">
                <div className="text-lg font-semibold tabular-nums">{s.v}</div>
                <div className="text-[10px] text-muted-foreground">{s.l}</div>
                {s.note && <div className="text-[9px] text-primary">{s.note}</div>}
              </div>
            ))}
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {FLOW.map((f) => (
              <div key={f.id} className="flex items-center gap-3 px-3 py-3">
                <FlowIcon type={f.type} status={f.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {f.type === "L1" ? "一级分佣" : f.type === "L2" ? "二级分佣" : f.type === "withdraw" ? "提现" : "退款冲销"}
                    <StatusBadge status={f.status} />
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{f.desc}</div>
                  <div className="text-[10px] text-muted-foreground">{f.time}</div>
                </div>
                <div className={`text-sm font-semibold tabular-nums ${f.amount > 0 ? "text-primary" : "text-rose-500"}`}>
                  {f.amount > 0 ? "+" : ""}¥{f.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <Link to="/invite-rules" className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card py-2.5 text-xs font-medium">
            <Users className="h-4 w-4 text-primary" /> 邀请规则与海报
          </Link>
        </div>
      )}
    </MobileShell>
  );
}

function FlowIcon({ type, status }: { type: Flow["type"]; status: Flow["status"] }) {
  const cls =
    status === "rejected" ? "bg-rose-50 text-rose-500"
    : type === "withdraw" ? "bg-primary/10 text-primary"
    : type === "refund" ? "bg-rose-50 text-rose-500"
    : "bg-primary/10 text-primary";
  const Icon = type === "withdraw" ? Wallet : type === "refund" ? XCircle : status === "pending" ? Clock : CheckCircle2;
  return <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}><Icon className="h-4 w-4" /></div>;
}

function StatusBadge({ status }: { status: Flow["status"] }) {
  const map: Record<Flow["status"], { l: string; c: string }> = {
    settled: { l: "已结算", c: "bg-emerald-50 text-emerald-600" },
    pending: { l: "待结算", c: "bg-amber-50 text-amber-600" },
    paid: { l: "已到账", c: "bg-primary/10 text-primary" },
    rejected: { l: "驳回", c: "bg-rose-50 text-rose-500" },
  };
  const s = map[status];
  return <span className={`rounded px-1 py-[1px] text-[9px] ${s.c}`}>{s.l}</span>;
}
