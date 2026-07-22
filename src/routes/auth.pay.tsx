import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PLANS, setTier, type MembershipTier } from "@/lib/membership";
import { Check, Wallet, QrCode, Timer, PartyPopper } from "lucide-react";
import { toast } from "sonner";

const search = z.object({
  tier: z.enum(["normal", "creator"]),
});

export const Route = createFileRoute("/auth/pay")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "开通会员 · 东大门订货通" },
      { name: "description", content: "微信 / 支付宝 / 银行卡开通会员，支付成功即刻到账开卡礼积分。" },
    ],
  }),
  component: PayPage,
});

function PayPage() {
  const { tier } = Route.useSearch();
  const navigate = useNavigate();
  const plan = PLANS.find((p) => p.key === tier)!;
  const [method, setMethod] = useState<"wechat" | "alipay" | "card">("wechat");
  const [left, setLeft] = useState(15 * 60);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (paid) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [paid]);

  useEffect(() => {
    if (left === 0 && !paid) toast.error("支付超时，请重新选择方案");
  }, [left, paid]);

  const pay = () => {
    if (left === 0) return;
    // 演示：模拟支付
    setTimeout(() => {
      setTier(tier as MembershipTier);
      setPaid(true);
      navigate({ to: "/auth/welcome", search: { tier } });
    }, 800);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  if (paid) {
    return (
      <MobileShell>
        <MobileHeader title="开通成功" />
        <div className="flex flex-col items-center px-6 pt-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-lg">
            <PartyPopper className="h-8 w-8" />
          </div>
          <div className="mt-4 text-xl font-bold">欢迎加入 {plan.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">开卡礼 +{plan.bonusPoints} 积分已到账</div>

          <div className="mt-6 w-full space-y-2 rounded-2xl border bg-card p-4 text-left text-sm">
            {plan.highlights.map((h) => (
              <div key={h} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid w-full grid-cols-2 gap-2">
            <Link
              to="/"
              className="rounded-xl border py-3 text-center text-sm font-medium"
            >
              去逛首页
            </Link>
            <Link
              to={tier === "creator" ? "/discover/new" : "/points"}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-center text-sm font-semibold text-white"
            >
              {tier === "creator" ? "发第一篇好物" : "去看积分商城"}
            </Link>
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <MobileHeader title="开通会员" back />

      <div className="px-4 pt-4">
        <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${plan.color} p-4 text-white`}>
          <div className="text-[11px] uppercase tracking-widest opacity-90">当前订单</div>
          <div className="mt-1 flex items-end justify-between">
            <div>
              <div className="text-lg font-bold">{plan.name}</div>
              <div className="text-xs opacity-90">有效期 12 个月，开卡礼 {plan.bonusPoints} 积分</div>
            </div>
            <div className="text-2xl font-black tabular-nums">{plan.price}</div>
          </div>
          <div className="mt-3 flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-[11px]">
            <Timer className="h-3.5 w-3.5" /> 支付倒计时 {mm}:{ss}
          </div>
        </div>
      </div>

      <div className="mt-4 px-4">
        <div className="mb-2 text-sm font-semibold">选择支付方式</div>
        <div className="space-y-2">
          {[
            { k: "wechat", label: "微信支付", icon: QrCode, hint: "推荐 · 秒到账" },
            { k: "alipay", label: "支付宝", icon: QrCode, hint: "扫码支付" },
            { k: "card", label: "银行卡", icon: Wallet, hint: "支持储蓄卡 / 信用卡" },
          ].map((m) => {
            const active = method === m.k;
            const Icon = m.icon;
            return (
              <button
                key={m.k}
                onClick={() => setMethod(m.k as typeof method)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  active ? "border-rose-400 bg-rose-50/50" : "border-border"
                }`}
              >
                <Icon className="h-5 w-5 text-rose-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-[11px] text-muted-foreground">{m.hint}</div>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${active ? "border-rose-500 bg-rose-500" : "border-muted-foreground/40"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 px-4 text-[11px] leading-relaxed text-muted-foreground">
        · 会员费一次性购买，成功后立即生效。<br />
        · 因政策原因会员费不支持退款；如账户异常请联系客服。<br />
        · 支付失败或取消不会影响你的账号，可随时在「我的 → 会员」重开。
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <button
          onClick={pay}
          disabled={left === 0}
          className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-sm font-semibold text-white shadow-lg active:scale-[0.99] disabled:opacity-50"
        >
          {left === 0 ? "支付超时" : `确认支付 ${plan.price}`}
        </button>
      </div>
    </MobileShell>
  );
}
