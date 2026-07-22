import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Crown, Check, Sparkles, Shield, Zap, X } from "lucide-react";

export const Route = createFileRoute("/membership")({
  head: () => ({ meta: [{ title: "会员权益 · 东大门订货通" }] }),
  component: Membership,
});

type Plan = {
  key: "normal" | "creator";
  name: string;
  price: string;
  tag: string;
  color: string;
  ring: string;
  desc: string;
};

const PLANS: Plan[] = [
  {
    key: "normal",
    name: "普通会员",
    price: "¥99 / 年",
    tag: "自用党首选",
    color: "from-slate-500 to-slate-400",
    ring: "ring-slate-300/60",
    desc: "赚返佣抵扣自己订单，越买越省",
  },
  {
    key: "creator",
    name: "创作者会员",
    price: "¥199 / 年",
    tag: "分享党推荐",
    color: "from-rose-500 via-orange-400 to-amber-400",
    ring: "ring-rose-300/70",
    desc: "返佣可提现到微信 / 支付宝，T+1 到账",
  },
];

// (权益项, 普通会员, 创作者会员)
const RIGHTS: [string, string | boolean, string | boolean][] = [
  ["下单基础积分", "1x", "1.5x"],
  ["生日双倍积分", true, true],
  ["满 ¥100 包邮", true, true],
  ["档口私密价 / 上新优先", false, true],
  ["创作返佣 3%（自购也返）", "✅ 仅可抵扣订单", "✅ 可抵扣 & 可提现"],
  ["邀请返佣 L1 0.5% / L2 0.2%", "✅ 仅可抵扣订单", "✅ 可抵扣 & 可提现"],
  ["提现权限", false, "满 ¥50 起提，T+1"],
  ["专属客服", "8h 内响应", "2h 内响应"],
];

const CURRENT: Plan["key"] = "normal";

function Membership() {
  return (
    <MobileShell>
      <MobileHeader title="会员权益" back />

      {/* 当前会员卡 */}
      <div className="px-4 pt-4">
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${PLANS[0].color} p-4 text-white shadow-lg ring-1 ${PLANS[0].ring}`}>
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest opacity-90">
            <Crown className="h-3.5 w-3.5" /> Current Plan
          </div>
          <div className="mt-1 flex items-end justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight">普通会员</div>
              <div className="text-xs opacity-90">¥99 · 有效期至 2026-12-31</div>
            </div>
            <div className="text-right text-[11px] opacity-90">
              <div>今年累计返佣</div>
              <div className="text-base font-semibold tabular-nums">¥ 168.20</div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] leading-relaxed">
            升级为创作者会员 → 返佣可提现到微信零钱，¥50 起提
          </div>
        </div>
      </div>

      {/* 两个方案卡 */}
      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-rose-500" /> 会员方案
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PLANS.map((p) => (
            <div
              key={p.key}
              className={`relative overflow-hidden rounded-2xl border p-3 ${p.key === CURRENT ? "border-rose-300 ring-1 ring-rose-200" : "border-border"}`}
            >
              <div className={`inline-block rounded-full bg-gradient-to-r ${p.color} px-2 py-0.5 text-[10px] font-semibold text-white`}>{p.tag}</div>
              <div className="mt-2 text-base font-bold">{p.name}</div>
              <div className="mt-0.5 text-lg font-black tabular-nums text-rose-600">{p.price}</div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{p.desc}</p>
              <button
                disabled={p.key === CURRENT}
                className={`mt-2 w-full rounded-lg py-1.5 text-xs font-semibold ${
                  p.key === CURRENT
                    ? "bg-muted text-muted-foreground"
                    : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow"
                }`}
              >
                {p.key === CURRENT ? "当前方案" : "立即升级"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 权益对比 */}
      <div className="px-4 pt-6">
        <div className="mb-2 text-sm font-semibold">权益对比</div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] text-muted-foreground">
                <th className="p-2 text-left font-medium">权益</th>
                <th className="p-2 text-center font-medium">普通 ¥99</th>
                <th className="p-2 text-center font-medium text-rose-600">创作者 ¥199</th>
              </tr>
            </thead>
            <tbody>
              {RIGHTS.map(([label, a, b]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <td className="p-2 text-foreground">{label}</td>
                  <td className="p-2 text-center text-muted-foreground">{renderCell(a)}</td>
                  <td className="p-2 text-center text-foreground">{renderCell(b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 规则说明 */}
      <div className="px-4 pt-6">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Shield className="h-4 w-4 text-rose-500" /> 会员规则
        </div>
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-[12px] leading-relaxed text-muted-foreground">
          <p>· 会员年费一次性购买，有效期 <b className="text-foreground">12 个月</b>，到期自动降级为普通用户。</p>
          <p>· 「引用订单发帖」：一笔已购订单只能发一篇帖子；帖子链接下单归 <b className="text-foreground">创作返佣（3%）</b>。</p>
          <p>· 帖子链接归因 <b className="text-foreground">优先于邀请关系</b>；两者不叠加。</p>
          <p>· 同款自购复购返佣上限 <b className="text-foreground">2 单</b>，第 3 单起不发放（防刷单）。</p>
          <p>· 退款订单冲销对应返佣；虚假晒单直接封禁并追回历史返佣。</p>
        </div>
      </div>

      <div className="px-4 py-6">
        <Link
          to="/discover"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
        >
          <Zap className="h-4 w-4" /> 去分享心得赚返佣
        </Link>
      </div>
    </MobileShell>
  );
}

function renderCell(v: string | boolean) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-emerald-500" />;
  if (v === false) return <X className="mx-auto h-3.5 w-3.5 text-muted-foreground/50" />;
  return <span>{v}</span>;
}