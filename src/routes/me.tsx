import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHOPS } from "@/lib/mock-data";
import { ChevronRight, MapPin, Heart, MessageSquare, Settings, Shield, Gift, ShoppingBag, ClipboardList, Store, Sparkles, Share2, BookOpen, Crown, RefreshCcw, Wallet, TrendingUp, Truck, BadgeCheck, Clock, PackageCheck, Plane, Undo2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/me")({
  head: () => ({ meta: [{ title: "我的 · 东大门订货通" }] }),
  component: Me,
});

function getFavShopIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("fav_shops") || "[]") as string[];
  } catch {
    return [];
  }
}

function Me() {
  const [favShopIds, setFavShopIds] = useState<string[]>([]);

  useEffect(() => {
    setFavShopIds(getFavShopIds());
  }, []);
  return (
    <MobileShell>
      <MobileHeader title="我的" />
      {/* 商家档案卡：身份 + 本月经营数据 + 订单流程 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 px-4 pb-5 pt-4 text-primary-foreground">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background/20 text-xl ring-2 ring-white/30">👤</div>
            <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-1.5 py-[1px] text-[9px] font-bold text-amber-900 shadow">
              <Crown className="h-2.5 w-2.5" />G
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-base font-semibold">张老板</span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-400/25 px-1.5 py-[1px] text-[9px] font-medium text-emerald-50 ring-1 ring-emerald-300/40">
                <BadgeCheck className="h-2.5 w-2.5" />已认证
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] opacity-90">
              <span>黄金买手</span>
              <span className="opacity-50">·</span>
              <span>ID 20260615</span>
            </div>
            {/* 升级进度条 */}
            <div className="mt-2">
              <div className="mb-0.5 flex justify-between text-[10px] opacity-90">
                <span>距钻石买手</span>
                <span className="tabular-nums">¥32,140 / ¥200,000</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-white" style={{ width: "16%" }} />
              </div>
            </div>
          </div>
          <Link to="/membership" className="shrink-0 self-start rounded-full bg-white/15 px-2 py-1 text-[10px] backdrop-blur">
            权益 <ChevronRight className="inline h-2.5 w-2.5" />
          </Link>
        </div>

        {/* 本月经营三联数据 */}
        <div className="relative mt-4 grid grid-cols-3 divide-x divide-white/15 rounded-xl bg-white/10 py-2.5 text-center backdrop-blur">
          <div>
            <div className="text-base font-bold tabular-nums">¥32,140</div>
            <div className="mt-0.5 text-[10px] opacity-80">本月成交</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-0.5 text-base font-bold tabular-nums">
              <Truck className="h-3.5 w-3.5 opacity-80" />¥964
            </div>
            <div className="mt-0.5 text-[10px] opacity-80">物流已省 -3%</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-0.5 text-base font-bold tabular-nums">
              <TrendingUp className="h-3.5 w-3.5 opacity-80" />24
            </div>
            <div className="mt-0.5 text-[10px] opacity-80">本月订单</div>
          </div>
        </div>

      </div>

      {/* 会员资产卡：积分 + 兑换入口 */}
      <div className="px-4 pt-3">
        <div className="overflow-hidden rounded-2xl border border-rose-100 bg-card shadow-sm">
          <div className="flex items-stretch">
            <div className="flex-1 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-3.5">
              <div className="flex items-center gap-1 text-[10px] text-rose-500">
                <Sparkles className="h-3 w-3" /> 我的积分
                <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-[1px] text-[9px] font-medium text-amber-700">黄金 1.5x</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums text-rose-600">2,580</span>
                <span className="text-[10px] text-muted-foreground">分</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="text-emerald-600">本月 +186</span>
                <span>·</span>
                <span>100 分 = ¥10</span>
              </div>
            </div>
            <Link
              to="/points"
              className="flex w-[92px] flex-col items-center justify-center gap-1 bg-gradient-to-br from-rose-500 to-rose-600 text-center text-white active:scale-[0.99]"
            >
              <Gift className="h-5 w-5" />
              <span className="text-xs font-semibold leading-tight">积分广场<br />立即兑换</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 border-t border-rose-100/80 bg-amber-50/60 px-3.5 py-2 text-[11px] text-amber-700">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="flex-1 truncate">830 分将于 2026-10-31 过期</span>
            <Link to="/points/history" className="rounded-full bg-white px-2 py-0.5 text-[10px] text-amber-700 ring-1 ring-amber-200">
              明细
            </Link>
            <Link to="/points-rules" className="rounded-full bg-white px-2 py-0.5 text-[10px] text-amber-700 ring-1 ring-amber-200">
              攻略
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-4 pt-4">
        <Item to="/orders" icon={ClipboardList} label="我的订单" right="全部订单" />
        <Item to="/cart" icon={ShoppingBag} label="购物车" />
        <Item to="/favorites" icon={Heart} label="我的收藏" />
        <Item to="/exchanges" icon={RefreshCcw} label="售后 / 换货" right="仅支持换货" />
        <Item to="/addresses" icon={MapPin} label="收货地址" />
        <Item to="/points" icon={Gift} label="积分广场" right="2,580 分" />
        <Item to="/commission" icon={Wallet} label="我的分佣钱包" right="可提现 ¥46.7" />
        <Item to="/invite-rules" icon={Share2} label="邀请分佣规则" right="L1 0.7% + L2 0.3%" />
        <Item to="/membership" icon={Crown} label="会员等级权益" right="黄金买手" />
        <Item to="/guide" icon={BookOpen} label="使用指引" right="新手必看" />
        <Item to="/support" icon={MessageSquare} label="联系客服" />
        <Item to="/kyc" icon={Shield} label="实名认证" right="未认证" />
        <Item to="/settings" icon={Settings} label="设置" />
      </div>

      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Store className="h-4 w-4 text-rose-500" />
            收藏档口
          </div>
          <Link to="/favorites" className="text-xs text-muted-foreground">
            查看全部
          </Link>
        </div>
        {favShopIds.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
            暂无收藏档口，去档口详情页点击收藏
          </div>
        ) : (
          <div className="space-y-2">
            {SHOPS.filter((s) => favShopIds.includes(s.id)).map((s) => (
              <Link
                key={s.id}
                to="/shops/$id"
                params={{ id: s.id }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <img src={s.cover} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{s.brand || s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.building} · {s.floor}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <Link to="/admin" className="block rounded-xl border border-dashed border-border bg-card p-3 text-center text-xs text-muted-foreground">
          (内部入口) 进入运营后台 →
        </Link>
      </div>
      <div className="px-4 pt-2">
        <Link to="/auth" className="block rounded-xl border border-border bg-card p-3 text-center text-xs text-muted-foreground">
          切换账号 / 登录
        </Link>
      </div>
    </MobileShell>
  );
}

function Item({ to, icon: Icon, label, right }: { to: string; icon: typeof MapPin; label: string; right?: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm">{label}</span>
      {right && <span className="text-xs text-muted-foreground">{right}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}