import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Clock, Users, TrendingDown, Shield, HelpCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/invite-rules")({
  head: () => ({ meta: [{ title: "邀请分销规则 · 东大门订货通" }] }),
  component: InviteRules,
});

const TIERS = [
  { d: "散客（无邀请码）", fee: "4.0%", ship: "9800", note: "不进入分销体系" },
  { d: "0（凭邀请码注册）", fee: "3.5%", ship: "9500", note: "受邀新客默认入门档" },
  { d: "1 人", fee: "3.0%", ship: "9500", note: "种子用户标准" },
  { d: "2 人", fee: "2.8%", ship: "9500", note: "" },
  { d: "3 人", fee: "2.7%", ship: "9500", note: "" },
  { d: "4 人", fee: "2.6%", ship: "9500", note: "" },
  { d: "5 人及以上", fee: "2.5%", ship: "9500", note: "最低封顶" },
];

const FAQ = [
  {
    q: "什么算「有效下线」？",
    a: "该下线在「滚动 90 天」内累计补货金额（以平台已代付完成金额为准）≥ 500 万 KRW，即记为你的 1 个有效下线。每天按北京时间 00:00 重新核算。",
  },
  {
    q: "滚动 90 天具体怎么算？",
    a: "以当天北京时间为终点，向前推 90 天为窗口。窗口外的旧订单会自动滑出统计，掉出后该下线状态回落为「未达标」。",
  },
  {
    q: "我的档位会自动上升吗？",
    a: "下线达标会立即让你降档；但档位「只降不升」——下线状态掉出窗口后，你当前档位不会被回调上去。",
  },
  {
    q: "我升档后，我的下线会跟着一起便宜吗？",
    a: "不会。新下线一律从 3.5% 起步，自己拉够 1 个有效下线才能进 3.0% 种子档。邀请人的档位只作用于自己，不下沉、不继承。",
  },
  {
    q: "档位什么时候生效？",
    a: "所有档位变动按北京时间次日 00:00 全量复算并切档。当日订单仍按下单时的档位结算。",
  },
  {
    q: "小票上的时间为什么是韩国时间？",
    a: "平台代付韩元小票按 KST（韩国标准时间）原样展示，避免与现场票据不一致；档位/订单结算时间统一按北京时间（UTC+8）。",
  },
  {
    q: "邀请码从哪里来？",
    a: "邀请码由平台统一生成并下发，非平台生成的邀请码无效。如需邀请码请联系客服。",
  },
  {
    q: "可以邀请自己的小号吗？",
    a: "不可以。同设备指纹 / 同收货地址 / 同微信支付实名 / 同 KYC 身份证，命中任意 2 项即视为关联账号，关联账号之间互邀不计入有效下线。",
  },
];

export default function InviteRules() {
  return (
    <MobileShell>
      <MobileHeader title="邀请分销规则" back />

      <div className="space-y-4 p-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-4 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Sparkles className="h-4 w-4" /> 邀请越多，费率越低
          </div>
          <div className="mt-2 text-2xl font-semibold">最低可享 2.5% 服务费</div>
          <div className="mt-1 text-xs opacity-80">运费 ₩9500/kg（散客 ₩9800/kg）</div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <TrendingDown className="h-4 w-4 text-primary" /> 档位表
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-12 bg-muted px-3 py-2 text-[11px] font-medium text-muted-foreground">
              <div className="col-span-5">有效下线</div>
              <div className="col-span-3 text-right">服务费</div>
              <div className="col-span-4 text-right">运费₩/kg</div>
            </div>
            {TIERS.map((t) => (
              <div key={t.d} className="grid grid-cols-12 items-center border-t border-border px-3 py-2 text-xs">
                <div className="col-span-5">
                  <div>{t.d}</div>
                  {t.note && <div className="text-[10px] text-muted-foreground">{t.note}</div>}
                </div>
                <div className="col-span-3 text-right font-semibold tabular-nums">{t.fee}</div>
                <div className="col-span-4 text-right tabular-nums">{t.ship}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <RuleCard
            icon={Users}
            title="有效下线 · 判定口径"
            lines={[
              "滚动 90 天内累计补货 ≥ 500 万 KRW",
              "以平台已代付完成金额为准",
              "窗口外金额掉出 → 该下线回落为未达标",
            ]}
          />
          <RuleCard
            icon={TrendingDown}
            title="档位 · 只降不升"
            lines={[
              "下线达标后次日 00:00 自动降档",
              "下线掉出后档位不上调",
              "新下线一律从 3.5% 起步，不继承邀请人档位",
            ]}
          />
          <RuleCard
            icon={Clock}
            title="时间口径"
            lines={[
              "档位计算 / 切档：北京时间 (UTC+8) 次日 00:00",
              "韩元付款小票：KST 原样展示",
              "订单结算时间统一按北京时间",
            ]}
          />
          <RuleCard
            icon={Shield}
            title="反作弊"
            lines={[
              "同设备 / 同地址 / 同微信支付 / 同 KYC，命中任意 2 项即判定为关联账号",
              "关联账号互邀不计入有效下线",
              "异常账号平台保留人工冻结与调档权利",
            ]}
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <HelpCircle className="h-4 w-4 text-primary" /> 常见问题
          </div>
          <div className="divide-y divide-border">
            {FAQ.map((f, i) => (
              <details key={i} className="group py-3">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-2 text-xs font-medium">
                  <span>{f.q}</span>
                  <span className="text-muted-foreground transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

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

function RuleCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof Clock;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </div>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {lines.map((l) => (
          <li key={l} className="flex gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{l}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}