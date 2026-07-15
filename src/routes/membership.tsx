import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Crown, Check, Truck, Percent, Gift, Headphones, Sparkles, Star, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/membership")({
  head: () => ({ meta: [{ title: "会员等级权益 · 东大门订货通" }] }),
  component: Membership,
});

type Tier = {
  key: string;
  name: string;
  cn: string;
  threshold: string;
  color: string;
  ring: string;
  discount: string;
  benefits: string[];
};

const TIERS: Tier[] = [
  {
    key: "bronze",
    name: "Bronze",
    cn: "青铜买手",
    threshold: "注册即得",
    color: "from-amber-700/80 to-amber-500/70",
    ring: "ring-amber-400/40",
    discount: "积分 1x · 满 ¥300 包邮",
    benefits: ["每日签到得积分", "参与拼单广场", "享受平台售后保障"],
  },
  {
    key: "silver",
    name: "Silver",
    cn: "白银买手",
    threshold: "近 12 月累计消费 ≥ ¥2,000",
    color: "from-slate-400 to-slate-300",
    ring: "ring-slate-300/60",
    discount: "积分 1.2x · 满 ¥200 包邮",
    benefits: ["积分 1.2 倍加成", "生日双倍积分", "客服 8h 响应"],
  },
  {
    key: "gold",
    name: "Gold",
    cn: "黄金买手",
    threshold: "近 12 月累计消费 ≥ ¥10,000",
    color: "from-amber-400 to-yellow-300",
    ring: "ring-amber-300/70",
    discount: "积分 1.5x · 满 ¥100 包邮",
    benefits: ["积分 1.5 倍加成", "档口私密价 / 独家新款", "拼单免起订门槛", "客服 2h 响应"],
  },
  {
    key: "diamond",
    name: "Diamond",
    cn: "钻石买手",
    threshold: "近 12 月累计消费 ≥ ¥100,000",
    color: "from-sky-400 via-cyan-300 to-fuchsia-300",
    ring: "ring-cyan-300/70",
    discount: "积分 2x · 全场包邮",
    benefits: ["积分 2 倍加成", "1v1 专属买手顾问", "首尔看货 / 展会邀请", "订单账期支持（T+7）"],
  },
];

const CURRENT = "gold";

function Membership() {
  const current = TIERS.find((t) => t.key === CURRENT)!;
  const nextIndex = TIERS.findIndex((t) => t.key === CURRENT) + 1;
  const next = TIERS[nextIndex];
  const progress = 62;

  return (
    <MobileShell>
      <MobileHeader title="会员等级权益" back />

      <div className="px-4 pt-4">
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${current.color} p-4 text-white shadow-lg ring-1 ${current.ring}`}
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest opacity-90">
            <Crown className="h-3.5 w-3.5" /> Current Tier
          </div>
          <div className="mt-1 flex items-end justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight">{current.cn}</div>
              <div className="text-xs opacity-90">{current.name} · 有效期至 2026-12-31</div>
            </div>
            <div className="text-right text-[11px] opacity-90">
              <div>本月成交</div>
              <div className="text-base font-semibold tabular-nums">¥ 32,140</div>
            </div>
          </div>

          {next && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] opacity-90">
                <span>距离 {next.cn}</span>
                <span>还差 ¥ 17,860</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-rose-500" /> 你当前享有
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { i: Gift, l: "积分 1.5x" },
            { i: Truck, l: "满 ¥100 包邮" },
            { i: Percent, l: "档口私密价" },
            { i: Headphones, l: "2h 客服" },
          ].map((b) => (
            <div key={b.l} className="rounded-xl border border-border bg-card p-2">
              <b.i className="mx-auto h-4 w-4 text-rose-500" />
              <div className="mt-1 text-[11px] text-muted-foreground">{b.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="mb-2 text-sm font-semibold">全部等级</div>
        <div className="space-y-3">
          {TIERS.map((t) => {
            const isCurrent = t.key === CURRENT;
            return (
              <div
                key={t.key}
                className={`rounded-2xl border bg-card p-4 ${isCurrent ? "border-rose-300 ring-1 ring-rose-200" : "border-border"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-white`}
                    >
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        {t.cn}
                        {isCurrent && (
                          <span className="ml-2 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-500">
                            当前
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{t.threshold}</div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">{t.name}</div>
                </div>

                <div className="mt-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-[11px] font-medium text-foreground">
                  {t.discount}
                </div>

                <ul className="mt-3 space-y-1.5">
                  {t.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[12px] text-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Shield className="h-4 w-4 text-rose-500" /> 升级 & 保级规则
        </div>
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-[12px] leading-relaxed text-muted-foreground">
          <p>· 等级依据 <b className="text-foreground">近 12 个月累计消费金额</b> 动态更新，每日凌晨自动结算。</p>
          <p>· 达标后立即升级，权益即时生效。</p>
          <p>· 每个自然年重新评估，不达标降 <b className="text-foreground">1 级</b>（非归零），给你缓冲空间。</p>
          <p>· 退款订单不计入消费额；虚假交易一经发现降级并冻结。</p>
        </div>
      </div>

      <div className="px-4 py-6">
        <Link
          to="/points"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
        >
          <Zap className="h-4 w-4" /> 去下单冲刺下一等级
        </Link>
      </div>
    </MobileShell>
  );
}
