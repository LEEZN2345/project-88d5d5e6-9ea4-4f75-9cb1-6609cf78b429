import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PLANS, RIGHTS, setTier, type MembershipTier } from "@/lib/membership";
import { Check, X, Crown, Sparkles, Truck, Wallet, Coins, Users, PenSquare, ShieldCheck, HelpCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { n: "12,000+", l: "东大门档口" },
              { n: "3天", l: "平均到仓" },
              { n: "0元", l: "国内运费" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg bg-white/15 py-1.5">
                <div className="text-sm font-bold tabular-nums">{s.n}</div>
                <div className="text-[10px] opacity-90">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 会员能帮你做什么 */}
      <div className="mt-4 px-4">
        <div className="mb-2 text-sm font-semibold">开通会员，你能拿到</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Truck, t: "全场包邮", d: "国内段免运，跨境按重" },
            { icon: Coins, t: "购物返积分", d: "¥1=1 积分 · 1.5×加速" },
            { icon: PenSquare, t: "发帖赚返佣", d: "3% 创作 · 引用订单" },
            { icon: Users, t: "邀请分成", d: "L1 0.5% · L2 0.2%" },
            { icon: Wallet, t: "佣金可提现", d: "创作者 T+1 到账" },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.t} className="rounded-2xl border bg-card p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/10 to-orange-400/10 text-rose-500">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-2 text-xs font-semibold">{b.t}</div>
                <div className="text-[11px] text-muted-foreground">{b.d}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 px-4">
        <div className="mb-2 flex items-baseline justify-between">
          <div className="text-sm font-semibold">选择你的会员身份</div>
          <div className="text-[11px] text-muted-foreground">推荐创作者会员</div>
        </div>
      </div>

      <div className="mt-2 space-y-3 px-4 pb-32">
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

        {/* 回本示意 */}
        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50/50 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <Sparkles className="h-3.5 w-3.5" /> 会员回本参考
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-white p-2">
              <div className="text-muted-foreground">普通会员 ¥99</div>
              <div className="mt-0.5 font-semibold">≈ 17 次运费即回本</div>
              <div className="text-[10px] text-muted-foreground">按每单 ¥6 国内运费</div>
            </div>
            <div className="rounded-lg bg-white p-2">
              <div className="text-muted-foreground">创作者 ¥199</div>
              <div className="mt-0.5 font-semibold">≈ 1 篇好物 = 回本</div>
              <div className="text-[10px] text-muted-foreground">按 3% 分成、客单 ¥7,000</div>
            </div>
          </div>
        </div>

        {/* 常见问题 */}
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-3">
          <AccordionItem value="q1" className="border-b-0">
            <AccordionTrigger className="py-2.5 text-xs">
              <span className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5 text-rose-500" />可以先游客体验再升级吗？</span>
            </AccordionTrigger>
            <AccordionContent className="text-[11px] text-muted-foreground">
              可以。游客可下单，随时在「我的 → 会员」升级为普通或创作者会员，不影响历史订单。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2" className="border-b-0">
            <AccordionTrigger className="py-2.5 text-xs">
              <span className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5 text-rose-500" />会员费支持退款吗？</span>
            </AccordionTrigger>
            <AccordionContent className="text-[11px] text-muted-foreground">
              会员费一经开通即刻生效，因政策原因不支持退款；开卡礼积分即时到账。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3" className="border-b-0">
            <AccordionTrigger className="py-2.5 text-xs">
              <span className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5 text-rose-500" />普通会员和创作者的返佣区别？</span>
            </AccordionTrigger>
            <AccordionContent className="text-[11px] text-muted-foreground">
              普通会员的返佣仅用于抵扣自己订单；创作者会员的返佣满 ¥50 可提现到微信 / 支付宝 / 银行卡，T+1 到账。
            </AccordionContent>
          </AccordionItem>
        </Accordion>

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

        {/* 信任 bar */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          正品保障 · 售后无忧 · 支付信息加密
        </div>

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
