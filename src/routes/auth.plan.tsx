import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PLANS, RIGHTS, setTier, type MembershipTier } from "@/lib/membership";
import { Check, X, Crown, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

const search = z.object({ phone: z.string().optional() });

export const Route = createFileRoute("/auth/plan")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "选择会员身份 · 东大门订货通" },
      { name: "description", content: "游客 / 普通 ¥99 / 创作者 ¥199 三档会员权益对比与开通。" },
    ],
  }),
  component: PlanPage,
});

function mask(p?: string) {
  if (!p) return "新用户";
  return p.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function PlanPage() {
  const navigate = useNavigate();
  const { phone } = Route.useSearch();
  const [selected, setSelected] = useState<MembershipTier>("creator");

  const currentPlan = PLANS.find((p) => p.key === selected)!;

  const confirm = () => {
    if (selected === "guest") {
      setTier("guest");
      toast.success("已以游客身份进入");
      navigate({ to: "/" });
    } else {
      navigate({ to: "/auth/pay", search: { tier: selected } });
    }
  };

  return (
    <MobileShell>
      <MobileHeader title="选择会员身份" />

      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 p-4 text-white shadow-lg">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest opacity-90">
            <Sparkles className="h-3.5 w-3.5" /> 欢迎加入
          </div>
          <div className="mt-1 text-lg font-bold">Hi, {mask(phone)} 🎉</div>
          <div className="text-xs opacity-90">选择一个身份，几秒即可解锁全场包邮和返佣提现</div>
        </div>
      </div>

      <div className="mt-4 space-y-3 px-4 pb-32">
        {PLANS.map((p) => {
          const active = selected === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setSelected(p.key)}
              className={`relative w-full overflow-hidden rounded-2xl border p-4 text-left transition ${
                active ? "border-rose-400 ring-2 ring-rose-200" : "border-border"
              }`}
            >
              {p.key === "creator" && (
                <div className="absolute right-3 top-3 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  推荐
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className={`inline-block rounded-full bg-gradient-to-r ${p.color} px-2 py-0.5 text-[10px] font-semibold text-white`}>
                  {p.tag}
                </div>
                {p.key !== "guest" && <Crown className="h-3.5 w-3.5 text-amber-500" />}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-base font-bold">{p.name}</div>
                <div className="text-lg font-black tabular-nums text-rose-600">{p.price}</div>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{p.desc}</div>
              <ul className="mt-3 grid grid-cols-2 gap-1.5">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-1 text-[11px]">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              {p.key === "creator" && (
                <div className="mt-3 rounded-lg bg-rose-50 px-2 py-1.5 text-[11px] text-rose-700">
                  自购年度 ≈ ¥6,700 即可回本；分享出去回本更快
                </div>
              )}
            </button>
          );
        })}

        {/* 完整权益对比 */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="w-full rounded-xl border border-dashed py-2.5 text-xs text-muted-foreground">
              查看完整权益对比 →
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>三档会员权益完整对比</SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-hidden rounded-xl border">
              <table className="w-full table-fixed text-[11px] leading-tight">
                <colgroup>
                  <col className="w-[34%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead>
                  <tr className="border-b bg-muted/40 text-[10px] text-muted-foreground">
                    <th className="px-1.5 py-1.5 text-left font-medium">权益项</th>
                    <th className="px-1 py-1.5 text-center font-medium">游客</th>
                    <th className="px-1 py-1.5 text-center font-medium">普通</th>
                    <th className="px-1 py-1.5 text-center font-medium text-rose-600">创作者</th>
                  </tr>
                </thead>
                <tbody>
                  {RIGHTS.map(([label, g, a, b]) => (
                    <tr key={label} className="border-b align-top last:border-0">
                      <td className="px-1.5 py-1.5">{label}</td>
                      <td className="px-1 py-1.5 text-center text-muted-foreground">{cell(g)}</td>
                      <td className="px-1 py-1.5 text-center text-muted-foreground">{cell(a)}</td>
                      <td className="px-1 py-1.5 text-center">{cell(b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SheetContent>
        </Sheet>

        <div className="pt-2 text-center text-[11px] text-muted-foreground">
          已经有会员？<Link to="/" className="text-rose-600">返回首页登录</Link>
        </div>
      </div>

      {/* 底部粘性 CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <button
          onClick={confirm}
          className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-sm font-semibold text-white shadow-lg active:scale-[0.99]"
        >
          {currentPlan.key === "guest"
            ? "以游客身份开始逛"
            : `${currentPlan.price} 立即开通${currentPlan.name}`}
        </button>
        <div className="mt-1 text-center text-[10px] text-muted-foreground">
          支付失败或取消不影响账号，随时可在「我的 → 会员」重新开通
        </div>
      </div>
    </MobileShell>
  );
}

function cell(v: string | boolean) {
  if (v === true) return <Check className="mx-auto h-3.5 w-3.5 text-emerald-500" />;
  if (v === false) return <X className="mx-auto h-3 w-3 text-muted-foreground/50" />;
  return <span>{v}</span>;
}
