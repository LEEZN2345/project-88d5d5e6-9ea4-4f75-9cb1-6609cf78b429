import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Wallet, Users, ArrowRight, Info, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/commission")({
  head: () => ({ meta: [{ title: "邀请分佣 · 东大门蚂蚁" }] }),
  component: Commission,
});

type Flow = { id: string; type: "L1" | "L2" | "withdraw" | "refund"; amount: number; desc: string; status: "settled" | "pending" | "paid" | "rejected"; time: string };

const FLOW: Flow[] = [
  { id: "c1", type: "L1", amount: 4.2, desc: "@wang** 订单 DD26071155 ¥600 · 0.7%", status: "settled", time: "2026-07-12 10:22" },
  { id: "c2", type: "L2", amount: 1.5, desc: "@wang** 邀请的 @li** 订单 ¥500 · 0.3%", status: "pending", time: "2026-07-11 20:41" },
  { id: "c3", type: "L1", amount: 9.8, desc: "@zhou** 订单 DD26070938 ¥1400 · 0.7%", status: "pending", time: "2026-07-09 15:05" },
  { id: "c4", type: "withdraw", amount: -30, desc: "提现到微信零钱", status: "paid", time: "2026-06-28 09:10" },
  { id: "c5", type: "refund", amount: -2.1, desc: "@li** 退款 冲销 L1 分佣", status: "settled", time: "2026-06-20 14:00" },
];

function Commission() {
  const withdrawable = 46.7;
  const pending = 128.4;
  const total = 312.9;
  const navigate = useNavigate();

  return (
    <MobileShell>
      <MobileHeader title="邀请分佣" back />

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-4 pb-5 pt-4 text-white">
        <div className="flex items-center gap-1.5 text-xs opacity-90"><Wallet className="h-3.5 w-3.5" /> 可提现佣金</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-4xl font-bold tabular-nums">¥{withdrawable.toFixed(2)}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
            <div className="flex items-center gap-1 text-[10px] opacity-85"><Clock className="h-3 w-3" /> 待结算</div>
            <div className="mt-0.5 text-base font-semibold tabular-nums">¥{pending.toFixed(2)}</div>
            <div className="text-[10px] opacity-75">签收 14 天后释放</div>
          </div>
          <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
            <div className="flex items-center gap-1 text-[10px] opacity-85"><TrendingUp className="h-3 w-3" /> 累计到账</div>
            <div className="mt-0.5 text-base font-semibold tabular-nums">¥{total.toFixed(2)}</div>
            <div className="text-[10px] opacity-75">邀请 12 人 · 有效 8 人</div>
          </div>
        </div>
        <Button
          onClick={() => navigate({ to: "/withdraw" })}
          className="mt-3 w-full bg-white text-emerald-700 hover:bg-white/90"
          disabled={withdrawable < 10}
        >
          立即提现（门槛 ¥10）
        </Button>
      </div>

      {/* 规则简述 */}
      <div className="mx-4 mt-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-[11px] text-emerald-800">
        <div className="flex items-center gap-1 font-medium"><Info className="h-3 w-3" /> 分佣规则</div>
        <ul className="mt-1 space-y-0.5 pl-4 [list-style:disc]">
          <li>一级邀请：直接邀请的好友订单实付 × <b>0.7%</b></li>
          <li>二级邀请：好友再邀请的人订单实付 × <b>0.3%</b></li>
          <li>好友订单签收 14 天后（售后期结束）自动结算</li>
          <li>好友退款则冲销对应分佣</li>
        </ul>
        <Link to="/invite-rules" className="mt-1.5 flex items-center gap-0.5 text-emerald-700">
          查看完整规则 <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 我的邀请 */}
      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-medium"><Users className="h-4 w-4 text-emerald-500" /> 我的邀请</div>
          <Link to="/points-rules" className="text-xs text-muted-foreground">邀请海报 →</Link>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { l: "邀请人数", v: "12" },
            { l: "有效邀请", v: "8", note: "已下过单" },
            { l: "本月新增", v: "3" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border bg-card p-2.5">
              <div className="text-lg font-semibold tabular-nums">{s.v}</div>
              <div className="text-[10px] text-muted-foreground">{s.l}</div>
              {s.note && <div className="text-[9px] text-emerald-600">{s.note}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* 流水 */}
      <div className="px-4 pt-4 pb-6">
        <div className="mb-2 text-sm font-medium">佣金流水</div>
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
              <div className={`text-sm font-semibold tabular-nums ${f.amount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {f.amount > 0 ? "+" : ""}¥{f.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function FlowIcon({ type, status }: { type: Flow["type"]; status: Flow["status"] }) {
  const cls =
    status === "paid" ? "bg-emerald-50 text-emerald-600"
    : status === "rejected" ? "bg-rose-50 text-rose-500"
    : type === "withdraw" ? "bg-primary/10 text-primary"
    : type === "refund" ? "bg-rose-50 text-rose-500"
    : "bg-emerald-50 text-emerald-600";
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