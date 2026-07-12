import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { ArrowUpRight, ArrowDownRight, Gift, ShoppingBag, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/points/history")({
  head: () => ({ meta: [{ title: "积分明细 · 东大门订货通" }] }),
  component: PointsHistory,
});

type Entry = {
  id: string;
  type: "in" | "out";
  source: "consume" | "invite_signup" | "invite_first" | "invite_repeat" | "exchange" | "signup_bonus" | "first_order_bonus";
  amount: number;
  desc: string;
  time: string;
};

const ICONS: Record<Entry["source"], typeof Gift> = {
  consume: ShoppingBag,
  invite_signup: Users,
  invite_first: Users,
  invite_repeat: Users,
  exchange: Gift,
  signup_bonus: Sparkles,
  first_order_bonus: Sparkles,
};

const LABELS: Record<Entry["source"], string> = {
  consume: "消费积分",
  invite_signup: "邀请注册奖励",
  invite_first: "好友首单返利",
  invite_repeat: "好友复购返利",
  exchange: "积分兑换",
  signup_bonus: "注册奖励",
  first_order_bonus: "首单奖励",
};

const ENTRIES: Entry[] = [
  { id: "h1", type: "in", source: "invite_first", amount: 20, desc: "好友 @wang** 首单 ¥200 · 10%", time: "2026-07-11 14:22" },
  { id: "h2", type: "in", source: "consume", amount: 3, desc: "订单 DD20260711 · ¥328", time: "2026-07-11 10:05" },
  { id: "h3", type: "out", source: "exchange", amount: 2000, desc: "兑换：复古格纹半身裙", time: "2026-07-08 21:14" },
  { id: "h4", type: "in", source: "invite_signup", amount: 50, desc: "好友 @zhou** 使用邀请码注册", time: "2026-07-05 16:40" },
  { id: "h5", type: "in", source: "invite_repeat", amount: 8, desc: "好友 @li** 复购 ¥160 · 5%", time: "2026-06-28 12:18" },
  { id: "h6", type: "in", source: "first_order_bonus", amount: 200, desc: "完成首单奖励", time: "2026-06-15 20:03" },
  { id: "h7", type: "in", source: "signup_bonus", amount: 100, desc: "使用邀请码注册奖励", time: "2026-06-15 19:58" },
];

function PointsHistory() {
  const totalIn = ENTRIES.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
  const totalOut = ENTRIES.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);

  return (
    <MobileShell>
      <MobileHeader title="积分明细" back />

      <div className="grid grid-cols-2 gap-2 p-4 pb-2">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[11px] text-muted-foreground">累计获得</div>
          <div className="mt-1 text-lg font-semibold tabular-nums text-emerald-600">+{totalIn}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[11px] text-muted-foreground">累计消耗</div>
          <div className="mt-1 text-lg font-semibold tabular-nums text-rose-500">−{totalOut}</div>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 mx-4 my-2 px-3 py-2 text-[11px] text-amber-700">
        ⚠️ 有 <span className="font-semibold">830</span> 积分将于 <span className="font-semibold">2026-10-31</span> 到期，请及时使用
      </div>

      <div className="px-4 pb-6">
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {ENTRIES.map((e) => {
            const Icon = ICONS[e.source];
            return (
              <div key={e.id} className="flex items-center gap-3 px-3 py-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    e.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {LABELS[e.source]}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{e.desc}</div>
                  <div className="text-[10px] text-muted-foreground">{e.time}</div>
                </div>
                <div
                  className={`flex shrink-0 items-center gap-0.5 text-sm font-semibold tabular-nums ${
                    e.type === "in" ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {e.type === "in" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {e.type === "in" ? "+" : "−"}{e.amount}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
