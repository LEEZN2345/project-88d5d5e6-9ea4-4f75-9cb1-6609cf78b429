import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHOPS } from "@/lib/mock-data";
import { ChevronRight, MapPin, Heart, MessageSquare, Settings, Shield, Gift, ShoppingBag, ClipboardList, Store, Sparkles, Share2, BookOpen } from "lucide-react";
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
      <div className="bg-gradient-to-br from-primary to-primary/70 px-4 pb-6 pt-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/20 text-xl">👤</div>
          <div>
            <div className="text-base font-semibold">张老板 · 实体店</div>
            <div className="text-xs opacity-80">B 端会员 · 享 -3% 物流费率</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { n: "1", l: "待付款" },
            { n: "2", l: "待发货" },
            { n: "3", l: "在途" },
            { n: "0", l: "售后" },
          ].map((s) => (
            <div key={s.l} className="rounded-md bg-background/10 py-2">
              <div className="text-base font-semibold">{s.n}</div>
              <div className="opacity-80">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 我的积分卡片 */}
      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1 text-[11px] text-rose-500">
                <Sparkles className="h-3 w-3" /> 我的积分
              </div>
              <div className="mt-1 text-3xl font-semibold tabular-nums text-rose-600">2,580</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">100 积分 = ¥10 等值商品</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Link
                to="/points/history"
                className="rounded-full border border-rose-300 bg-white px-2.5 py-1 text-[10px] text-rose-500"
              >
                积分明细 →
              </Link>
              <Link
                to="/points-rules"
                className="rounded-full border border-rose-300 bg-white px-2.5 py-1 text-[10px] text-rose-500"
              >
                兑换攻略 →
              </Link>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-amber-100/70 px-2.5 py-1.5 text-[11px] text-amber-700">
            ⚠️ 830 积分将于 2026-10-31 过期，请尽早使用
          </div>

          <Link
            to="/points"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
          >
            <Gift className="h-4 w-4" /> 进入积分广场兑换
          </Link>
        </div>
      </div>

      <div className="space-y-2 px-4 pt-4">
        <Item to="/orders" icon={ClipboardList} label="我的订单" right="全部" />
        <Item to="/cart" icon={ShoppingBag} label="购物车" />
        <Item to="/addresses" icon={MapPin} label="收货地址" />
        <Item to="/favorites" icon={Heart} label="我的收藏" />
        <Item to="/points" icon={Gift} label="积分广场" right="2,580 分" />
        <Item to="/points-rules" icon={Share2} label="邀请好友赚积分" right="已邀 4 人" />
        <Item to="/invite-rules" icon={Gift} label="邀请分销规则（实体店）" right="最低 2.5%" />
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