import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Users, Sparkles, ArrowRight, Wallet, Shield, Info } from "lucide-react";

export const Route = createFileRoute("/invite-rules")({
  head: () => ({ meta: [{ title: "邀请分佣规则 · 东大门蚂蚁" }] }),
  component: InviteRules,
});

function InviteRules() {
  return (
    <MobileShell>
      <MobileHeader title="邀请分佣规则" back />

      <div className="space-y-4 p-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-4 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Sparkles className="h-4 w-4" /> 二级分佣 · 长期收益
          </div>
          <div className="mt-2 text-2xl font-semibold">L1 0.5% + L2 0.2%</div>
          <div className="mt-1 text-xs opacity-80">好友「直接下单」你才拿佣金；若走了他人帖子链接，归创作者，你不拿</div>
          <Link to="/commission" className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">
            <Wallet className="h-3 w-3" /> 我的分佣钱包 <ArrowRight className="h-3 w-3" />
          </Link>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-primary" /> 分佣层级
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
              <div className="text-[11px] text-primary">一级邀请（你直接拉的）</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-primary">0.5%</div>
              <div className="text-[11px] text-muted-foreground">好友每笔实付 × 0.5%</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <div className="text-[11px] text-muted-foreground">二级邀请（好友的好友）</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">0.2%</div>
              <div className="text-[11px] text-muted-foreground">间接下线实付 × 0.2%</div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            <b className="text-foreground">举例：</b>你拉了小王，小王拉了小李。小李下 ¥1,000 单 → 你得 ¥2（L2），小王得 ¥5（L1）。两层可同时拿。
          </div>
          <div className="mt-2 rounded-lg border border-dashed border-rose-300 bg-rose-50 px-3 py-2 text-[11px] leading-relaxed text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            <b>与创作返佣互斥：</b>如果被邀人是通过某篇帖子链接下单的，归属该帖作者（3% 创作返佣），你不再拿邀请返佣。
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Wallet className="h-4 w-4 text-primary" /> 结算 & 提现
          </div>
          <ul className="space-y-2 text-[12px] leading-relaxed text-muted-foreground">
            <li>· <b className="text-foreground">好友注册</b> 不产生佣金（防刷）</li>
            <li>· <b className="text-foreground">好友下单支付成功</b> 进入待结算池，不可提现</li>
            <li>· 订单「<b className="text-foreground">已签收</b>」满 <b className="text-foreground">14 天</b> → 自动结算为可提现</li>
            <li>· 好友退款则冲销对应分佣</li>
            <li>· 可提现 ≥ <b className="text-foreground">¥10</b> 起提，微信/支付宝，T+1 到账，平台承担手续费</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-primary" /> 分佣 & 拼单可以叠加吗？
          </div>
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
            <div className="flex items-start gap-1">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              <div>
                <b className="text-foreground">可以叠加。</b>分佣是「用户级裂变」，拼单是「订单级裂变」，两条平行线。你拉的好友若参加你发起的拼单——你既享拼团价，又拿分佣。
              </div>
            </div>
          </div>
        </section>

        <Link to="/support" className="block rounded-xl border border-border bg-card p-3 text-center text-xs text-muted-foreground">
          有疑问？联系客服 →
        </Link>
      </div>
    </MobileShell>
  );
}