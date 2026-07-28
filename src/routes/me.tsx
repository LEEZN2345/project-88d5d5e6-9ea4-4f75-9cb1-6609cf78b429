import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHOPS } from "@/lib/mock-data";
import { ChevronRight, MapPin, Heart, MessageSquare, Settings, Shield, Gift, ShoppingBag, ClipboardList, Store, Sparkles, Share2, BookOpen, Crown, RefreshCcw, Wallet, Truck, BadgeCheck, Clock, Percent, Headphones } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/me")({
  head: () => ({ meta: [{ title: "我的 · 东大门蚂蚁" }] }),
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
      <div className="space-y-3 px-4 pb-6 pt-3">
        {/* 会员档案卡 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/85 px-4 pb-5 pt-4 text-primary-foreground">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background/20 text-xl ring-2 ring-white/30">👤</div>
              <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-white px-1.5 py-[1px] text-[9px] font-bold text-primary shadow">
                <Crown className="h-2.5 w-2.5" />G
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-base font-semibold">张老板</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-[1px] text-[9px] font-medium text-primary-foreground ring-1 ring-white/30">
                  <BadgeCheck className="h-2.5 w-2.5" />已认证
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] opacity-90">
                <span>黄金会员</span>
                <span className="opacity-50">·</span>
                <span>ID 20260615</span>
              </div>
                          <Link to="/membership" className="shrink-0 self-start rounded-full bg-white/15 px-2 py-1 text-[10px] backdrop-blur">
              权益 <ChevronRight className="inline h-2.5 w-2.5" />
            </Link>
          </div>

          {/* 当前等级权益 */}
          <Link
            to="/membership"
            className="relative mt-4 block rounded-xl bg-white/10 p-3 backdrop-blur active:scale-[0.99]"
          >
            <div className="flex items-center justify-between text-[11px] opacity-90">
              <span className="inline-flex items-center gap-1">
                <Crown className="h-3 w-3" /> 黄金会员 · 当前权益
              </span>
              <span className="inline-flex items-center gap-0.5">查看全部 <ChevronRight className="h-3 w-3" /></span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              {[
                { i: Gift, l: "积分 1.5x" },
                { i: Truck, l: "满¥100包邮" },
                { i: Percent, l: "档口私密价" },
                { i: Headphones, l: "2h 客服" },
              ].map((b) => (
                <div key={b.l} className="rounded-lg bg-white/10 py-1.5">
                  <b.i className="mx-auto h-3.5 w-3.5" />
                  <div className="mt-0.5 text-[10px] opacity-90">{b.l}</div>
                </div>
              ))}
            </div>
          </Link>
        </div>

        {/* 会员资产卡：积分 + 兑换入口 */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-stretch">
            <div className="flex-1 bg-gradient-to-br from-primary/5 via-card to-primary/10 p-3.5">
              <div className="flex items-center gap-1 text-[10px] text-primary">
                <Sparkles className="h-3 w-3" /> 我的积分
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-[1px] text-[9px] font-medium text-primary">黄金 1.5x</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums text-primary">2,580</span>
                <span className="text-[10px] text-muted-foreground">分</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="text-primary">本月 +186</span>
                <span>·</span>
                <span>100 分 = ¥10</span>
              </div>
            </div>
            <Link
              to="/points"
              className="flex w-[92px] flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary to-primary/85 text-center text-primary-foreground active:scale-[0.99]"
            >
              <Gift className="h-5 w-5" />
              <span className="text-xs font-semibold leading-tight">积分广场<br />立即兑换</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 border-t border-border bg-muted/50 px-3.5 py-2 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="flex-1 truncate">830 分将于 2026-10-31 过期</span>
            <Link to="/points/history" className="rounded-full bg-card px-2 py-0.5 text-[10px] text-foreground ring-1 ring-border">
              明细
            </Link>
            <Link to="/points-rules" className="rounded-full bg-card px-2 py-0.5 text-[10px] text-foreground ring-1 ring-border">
              攻略
            </Link>
          </div>
        </div>

        {/* 菜单列表 */}
        <div className="space-y-2">
          <Item to="/orders" icon={ClipboardList} label="我的订单" right="全部订单" />
          <Item to="/cart" icon={ShoppingBag} label="购物车" />
          <Item to="/favorites" icon={Heart} label="我的收藏" />
          <Item to="/exchanges" icon={RefreshCcw} label="售后 / 换货" right="仅支持换货" />
          <Item to="/addresses" icon={MapPin} label="收货地址" />
          <Item to="/points" icon={Gift} label="积分广场" right="2,580 分" />
          <Item to="/commission" icon={Wallet} label="我的分佣钱包" right="可提现 ¥46.7" />
          <Item to="/me/posts" icon={Sparkles} label="我的分销数据" right="种草官" />
          <Item to="/me/promo-links" icon={Share2} label="我的推广链接" />
          <Item to="/invite-rules" icon={Share2} label="邀请分佣规则" right="L1 0.7% + L2 0.3%" />
          <Item to="/membership" icon={Crown} label="会员权益" right="黄金会员" />
          <Item to="/guide" icon={BookOpen} label="使用指引" right="新手必看" />
          <Item to="/support" icon={MessageSquare} label="联系客服" />
          <Item to="/kyc" icon={Shield} label="实名认证" right="未认证" />
          <Item to="/settings" icon={Settings} label="设置" />
        </div>

        {/* 收藏档口 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Store className="h-4 w-4 text-primary" />
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

        {/* 底部操作 */}
        <div className="space-y-2 pt-1">
          <Link to="/admin" className="block rounded-xl border border-dashed border-border bg-card p-3 text-center text-xs text-muted-foreground">
            (内部入口) 进入运营后台 →
          </Link>
          <Link to="/auth" className="block rounded-xl border border-border bg-card p-3 text-center text-xs text-muted-foreground">
            切换账号 / 登录
          </Link>
        </div>
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