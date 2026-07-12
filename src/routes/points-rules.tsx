import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Gift, Sparkles, ArrowRight, ShoppingBag, Shield } from "lucide-react";

export const Route = createFileRoute("/points-rules")({
  head: () => ({ meta: [{ title: "邀请赚积分 · 东大门订货通" }] }),
  component: PointsRules,
});

export default function PointsRules() {
  return (
    <MobileShell>
      <MobileHeader title="邀请赚积分（散客版）" back />

      <div className="space-y-4 p-4">
        <section className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-400 p-4 text-white">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Sparkles className="h-4 w-4" /> 邀请越多，积分越多，兑换越多
          </div>
          <div className="mt-2 text-2xl font-semibold">最高 15% 返利 · 免费换衣服</div>
          <div className="mt-1 text-xs opacity-80">
            你邀请的好友每下一单，你都赚积分。积分可去兑换专区免费换现货。
          </div>
        </section>

        <RewardCard />
        <LevelCard />
        <ExchangeCard />
        <StoryCard />
        <AntiFraudCard />

        <Link
          to="/support"
          className="block rounded-xl border border-border bg-card p-3 text-center text-xs text-muted-foreground"
        >
          有疑问？联系客服 →
        </Link>
      </div>
    </MobileShell>
  );
}

function RewardCard() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Gift className="h-4 w-4 text-rose-500" /> 双向奖励机制
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <div className="text-[11px] text-muted-foreground">被邀请者（新用户）</div>
          <div className="mt-2 space-y-1.5 text-[11px]">
            <Row k="邀请码注册" v="+100 积分" />
            <Row k="首单满 ¥100" v="+200 积分" />
          </div>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
          <div className="text-[11px] text-rose-500">邀请者（老用户）</div>
          <div className="mt-2 space-y-1.5 text-[11px]">
            <Row k="好友完成注册" v="+50 积分" />
            <Row k="好友首单 ≥¥100" v="金额 × 10%" />
            <Row k="好友 90 天内复购" v="金额 × 5%" />
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        基础规则：消费 ¥100 = 1 积分（自购也算）。<br />
        兑换比例：<span className="font-semibold text-foreground">100 积分 = ¥10 等值商品</span>。<br />
        积分有效期 <span className="font-semibold text-foreground">12 个月</span>，过期清零。
      </div>
    </section>
  );
}

function LevelCard() {
  const levels = [
    { label: "0 有效", rate: "10%", mult: "1×" },
    { label: "1 有效", rate: "11%", mult: "1.1×" },
    { label: "3 有效", rate: "12%", mult: "1.2×" },
    { label: "5 有效", rate: "13%", mult: "1.3×" },
    { label: "10 有效", rate: "15%", mult: "1.5×" },
  ];
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-rose-500" /> 邀请等级路径
      </div>

      <div className="mt-2 flex items-stretch gap-1 overflow-x-auto">
        {levels.map((t, i) => (
          <div key={t.label} className="flex items-center gap-1">
            <div
              className={`min-w-[68px] rounded-lg border px-2 py-1.5 text-center ${
                i === levels.length - 1
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-border bg-card"
              }`}
            >
              <div className="text-[10px] opacity-80">{t.label}</div>
              <div className="text-xs font-semibold tabular-nums">{t.rate}</div>
              <div className="text-[10px] tabular-nums opacity-80">{t.mult}</div>
            </div>
            {i < levels.length - 1 && (
              <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        「有效好友」= 使用你的邀请码注册 且 <span className="font-semibold text-foreground">首单消费 ≥ ¥100</span>。<br />
        有效好友越多 → 你的邀请返利系数越高，基础消费积分也享受倍率加成。<br />
        封顶 <span className="font-semibold text-foreground">15% 返利 / 1.5× 积分倍率</span>。
      </div>
    </section>
  );
}

function ExchangeCard() {
  const items = [
    { k: "小配饰（耳环 / 发带）", v: "200–500 积分", note: "低门槛上手" },
    { k: "T 恤 / 打底衫", v: "1000–2000 积分", note: "主力兑换区" },
    { k: "外套 / 连衣裙", v: "3000–5000 积分", note: "高价值奖励" },
    { k: "限时半价兑换", v: "每周固定场次", note: "紧迫感" },
  ];
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ShoppingBag className="h-4 w-4 text-rose-500" /> 积分兑换专区
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.k} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
            <div className="min-w-0">
              <div className="text-xs font-medium">{it.k}</div>
              <div className="text-[10px] text-muted-foreground">{it.note}</div>
            </div>
            <div className="shrink-0 text-xs font-semibold tabular-nums text-rose-500">{it.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">兑换出口：</span>
        积分仅消耗积分，不占现金流。每月「邀请榜」前 10 名额外奖励双倍积分或免费兑换一件大衣。
      </div>
    </section>
  );
}

function StoryCard() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Gift className="h-4 w-4 text-rose-500" /> 一个上班族的故事
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        把平台想成一个「会给你返积分的衣柜」。你自己买有积分，拉朋友一起买还有额外返利。攒够了，直接去兑换区免费换新款。
      </p>

      <div className="mt-3 space-y-2">
        <Step n="1" title="小李被朋友拉进来注册" body="用邀请码注册立刻拿 100 积分。首单 ¥129 T 恤下单后再拿 200 积分 + 基础消费积分。" />
        <Step n="2" title="小李邀请同事小王" body="小王注册那一刻，小李就拿 50 积分。小王首单 ¥200 → 小李再拿 20 积分（10%）。返利系数升到 11%。" hl />
        <Step n="3" title="小李陆续拉来 3 位同事（共 4 人有效）" body="返利系数升到 12%，基础消费积分也享受 1.2× 倍率。她用累积积分在兑换专区换了一条 2000 积分的连衣裙，没花现金。" />
        <Step n="4" title="小李拉满 10 位有效好友" body="封顶档：15% 返利 / 1.5× 倍率。她成了平台的「免费推广员」，平台只花了原本卖不掉的库存。" hl />
        <Step n="5" title="如果好友 90 天不消费" body="Ta 掉出「有效好友」窗口，小李的返利系数会自动滑回去一档。想保持封顶，就要持续把关系维护起来。" />
      </div>

      <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">一句话：</span>
        你邀请的好友每下一单，你都赚积分。拉的人越多，穿得越不花钱。
      </div>
    </section>
  );
}

function AntiFraudCard() {
  const rules = [
    "被邀请人须完成首单（消费 ≥ ¥100）才算「有效好友」",
    "被邀请人须绑定手机号 + 实名认证",
    "同设备 / 同收货地址 / 同支付账号 仅算 1 位有效好友",
    "积分 12 个月有效，过期清零",
    "邀请返利仅计入好友 90 天内的消费",
  ];
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Shield className="h-4 w-4 text-rose-500" /> 防刷与合规机制
      </div>
      <ul className="space-y-1.5 text-[11px] text-muted-foreground">
        {rules.map((r) => (
          <li key={r} className="flex gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-500" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        本体系为 <span className="font-semibold text-foreground">一级邀请</span>（邀请者 & 被邀请者双方得益），不涉及多层分销。
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold tabular-nums">{v}</span>
    </div>
  );
}

function Step({ n, title, body, hl }: { n: string; title: string; body: string; hl?: boolean }) {
  return (
    <div className="flex gap-3">
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
          hl ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"
        }`}
      >
        {n}
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium">{title}</div>
        <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/points-rules')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/points-rules"!</div>
}
