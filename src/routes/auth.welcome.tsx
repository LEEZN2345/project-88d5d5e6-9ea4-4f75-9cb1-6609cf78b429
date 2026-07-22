import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PLANS, type MembershipTier } from "@/lib/membership";
import {
  PartyPopper, Check, ShoppingBag, Sparkles, Truck, Tag, Coins, Gift,
  PenSquare, Users, Wallet, Compass, ArrowRight,
} from "lucide-react";

const search = z.object({ tier: z.enum(["normal", "creator"]) });

export const Route = createFileRoute("/auth/welcome")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "开卡成功 · 欢迎加入会员" },
      { name: "description", content: "开卡成功，查看你的专属权益与可用功能，一键开始使用。" },
      { property: "og:title", content: "开卡成功 · 欢迎加入会员" },
      { property: "og:description", content: "查看你的会员权益与常用入口，立即开始体验。" },
    ],
  }),
  component: WelcomePage,
});

type Feature = {
  icon: typeof ShoppingBag;
  title: string;
  desc: string;
  to: string;
  cta: string;
};

function featuresFor(tier: MembershipTier): Feature[] {
  const common: Feature[] = [
    { icon: ShoppingBag, title: "去逛首页", desc: "东大门今日上新 & 楼层档口", to: "/", cta: "开始逛" },
    { icon: Compass, title: "发现好物", desc: "看真实买家实拍，一键跟买", to: "/discover", cta: "去看看" },
    { icon: Gift, title: "积分商城", desc: "开卡礼积分立即兑换好物", to: "/points", cta: "去兑换" },
    { icon: Tag, title: "会员专享价", desc: "9.5 折精选款，仅会员可见", to: "/", cta: "去挑选" },
    { icon: Truck, title: "全场包邮", desc: "国内段免运费，跨境按重计算", to: "/guide", cta: "看规则" },
    { icon: Coins, title: "我的资产", desc: "积分 / 佣金 / 优惠券一览", to: "/me", cta: "查看" },
  ];
  if (tier === "creator") {
    return [
      { icon: PenSquare, title: "发第一篇好物", desc: "引用订单发帖，赚 3% 创作返佣", to: "/discover/new", cta: "去发布" },
      { icon: Users, title: "邀请返佣", desc: "L1 0.5% / L2 0.2%，好友消费即分成", to: "/me/promo-links", cta: "生成链接" },
      { icon: Wallet, title: "提现账户", desc: "配置微信 / 支付宝 / 银行卡", to: "/withdraw", cta: "去配置" },
      ...common,
    ];
  }
  return common;
}

function WelcomePage() {
  const { tier } = Route.useSearch();
  const plan = PLANS.find((p) => p.key === tier)!;
  const features = featuresFor(tier as MembershipTier);
  const primary = tier === "creator" ? "/discover/new" : "/points";
  const primaryLabel = tier === "creator" ? "去发第一篇好物" : "去积分商城";

  return (
    <MobileShell>
      <MobileHeader title="开卡成功" />
      <div className="px-4 pt-4 pb-28">
        {/* Hero */}
        <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${plan.color} p-5 text-white shadow-lg`}>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest opacity-90">
            <PartyPopper className="h-3.5 w-3.5" /> 欢迎加入
          </div>
          <div className="mt-1 text-2xl font-black">{plan.name}</div>
          <div className="mt-1 text-xs opacity-90">{plan.desc}</div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px]">
            <Sparkles className="h-3.5 w-3.5" /> 开卡礼 +{plan.bonusPoints} 积分 已到账
          </div>
        </div>

        {/* Rights */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold">你的专属权益</div>
            <Link to="/membership" className="text-[11px] text-muted-foreground">查看全部 →</Link>
          </div>
          <div className="space-y-2 rounded-2xl border bg-card p-4">
            {plan.highlights.map((h) => (
              <div key={h} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-5">
          <div className="mb-2 text-sm font-semibold">可用功能，即刻开始</div>
          <div className="grid grid-cols-2 gap-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.title}
                  to={f.to}
                  className="group rounded-2xl border bg-card p-3 transition active:scale-[0.99]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/10 to-orange-400/10 text-rose-500">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="mt-2 text-sm font-semibold">{f.title}</div>
                  <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{f.desc}</div>
                  <div className="mt-2 inline-flex items-center gap-0.5 text-[11px] font-medium text-rose-500">
                    {f.cta} <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-5 rounded-2xl border border-dashed bg-muted/30 p-4 text-[11px] leading-relaxed text-muted-foreground">
          小贴士：会员身份已生效，全站折扣与返佣将在下单时自动应用；如需了解结算与提现规则，请查看
          <Link to="/guide" className="mx-1 text-rose-500">使用指引</Link>。
        </div>
      </div>

      {/* Sticky CTAs */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Link to="/" className="rounded-xl border py-3 text-center text-sm font-medium">去逛首页</Link>
        <Link
          to={primary}
          className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-center text-sm font-semibold text-white shadow-lg"
        >
          {primaryLabel}
        </Link>
      </div>
    </MobileShell>
  );
}