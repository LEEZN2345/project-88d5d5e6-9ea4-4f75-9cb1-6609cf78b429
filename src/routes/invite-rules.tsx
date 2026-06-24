import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Clock, Users, TrendingDown, Shield, HelpCircle, Sparkles, ArrowRight, Coffee } from "lucide-react";

export const Route = createFileRoute("/invite-rules")({
  head: () => ({ meta: [{ title: "邀请分销规则 · 东大门订货通" }] }),
  component: InviteRules,
});

const TIERS = [
  { d: "初始用户", fee: "3.0%", ship: "9800", note: "自然注册默认起步档" },
  { d: "受邀用户", fee: "3.0%", ship: "9500", note: "凭邀请码注册即享" },
  { d: "已发出邀请 · 0 有效", fee: "2.9%", ship: "9500", note: "拉到任意邀请即服务费 -0.1%" },
  { d: "1 人有效", fee: "2.8%", ship: "9400", note: "起：每多 1 人，服务费 -0.1% & 运费 -₩100" },
  { d: "2 人有效", fee: "2.7%", ship: "9300", note: "" },
  { d: "3 人有效", fee: "2.6%", ship: "9200", note: "" },
  { d: "4 人有效", fee: "2.5%", ship: "9100", note: "服务费已封顶 2.5%" },
  { d: "5 人及以上有效", fee: "2.5%", ship: "9000", note: "运费封顶 · 不再下探" },
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
    a: "不会。新下线一律从受邀用户 3.0% / ₩9500 开始：自己发出邀请即服务费降到 2.9%；从第 1 个有效下线起，服务费每多 1 人 -0.1%、运费每多 1 人 -₩100，封顶 2.5% / ₩9000。邀请人档位只作用于自己，不下沉、不继承。",
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
          <div className="mt-2 text-2xl font-semibold">最低 2.5% / ₩9000</div>
          <div className="mt-1 text-xs opacity-80">从 1 人有效起：服务费 -0.1% & 运费 -₩100 / 人</div>
        </section>

        <ComparisonCard />

        <StoryCard />

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
              "新下线从受邀用户 3.0% / ₩9500 起步，不继承邀请人档位",
              "邀请人发出邀请 → 服务费 2.9%（运费暂不变）",
              "从 1 人有效起：服务费每多 1 人 -0.1%，运费每多 1 人 -₩100",
              "封顶 2.5% / ₩9000，不再下探",
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

function ComparisonCard() {
  const inviter = [
    { label: "0 有效", fee: "2.9%", ship: "9500" },
    { label: "1 有效", fee: "2.8%", ship: "9400" },
    { label: "2 有效", fee: "2.7%", ship: "9300" },
    { label: "3 有效", fee: "2.6%", ship: "9200" },
    { label: "4 有效", fee: "2.5%", ship: "9100" },
    { label: "5+ 有效", fee: "2.5%", ship: "9000" },
  ];
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Users className="h-4 w-4 text-primary" /> 邀请者 vs 被邀请者
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* 被邀请者 */}
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <div className="text-[11px] text-muted-foreground">被邀请者（新注册）</div>
          <div className="mt-1 text-lg font-semibold tabular-nums">3.0%</div>
          <div className="text-[11px] text-muted-foreground">运费 ₩9500/kg</div>
          <div className="mt-2 rounded-md bg-background px-2 py-1 text-[10px] text-muted-foreground">
            想再低？→ 自己也去邀请
          </div>
        </div>

        {/* 邀请者起点 */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <div className="text-[11px] text-primary">邀请者（已发出邀请）</div>
          <div className="mt-1 text-lg font-semibold tabular-nums text-primary">2.9% 起</div>
          <div className="text-[11px] text-muted-foreground">运费 ₩9500/kg 起</div>
          <div className="mt-2 rounded-md bg-background px-2 py-1 text-[10px] text-muted-foreground">
            每 +1 有效：-0.1% & -₩100
          </div>
        </div>
      </div>

      <div className="mt-4 text-[11px] font-medium text-muted-foreground">邀请者降档路径</div>
      <div className="mt-2 flex items-stretch gap-1 overflow-x-auto">
        {inviter.map((t, i) => (
          <div key={t.label} className="flex items-center gap-1">
            <div className={`min-w-[64px] rounded-lg border px-2 py-1.5 text-center ${
              i === inviter.length - 1
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card"
            }`}>
              <div className="text-[10px] opacity-80">{t.label}</div>
              <div className="text-xs font-semibold tabular-nums">{t.fee}</div>
              <div className="text-[10px] tabular-nums opacity-80">₩{t.ship}</div>
            </div>
            {i < inviter.length - 1 && (
              <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        说明：被邀请者本身不会因邀请人档位变化而变化；只有自己也去邀请并产生「有效下线」，才能开始降档。封顶 <span className="font-semibold text-foreground">2.5% / ₩9000</span>。
      </div>
    </section>
  );
}

function StoryCard() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Coffee className="h-4 w-4 text-primary" /> 一个咖啡店的故事
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        把平台想成一家会员制咖啡馆。<span className="text-foreground">服务费</span>就是你的「单杯价」，<span className="text-foreground">运费</span>就是「打包外送费」。
      </p>

      <div className="mt-3 space-y-2">
        <Step
          n="1"
          title="小红刚下载 App（受邀注册）"
          body="坐下来点了一杯：3.0% / ₩9500。这是被邀请者的起步价。"
        />
        <Step
          n="2"
          title="小红拉了同行小白进来（发出邀请）"
          body="店长说：「介绍朋友，单杯减 0.1%。」小红立刻变成 2.9% / ₩9500。"
          hl
        />
        <Step
          n="3"
          title="小白 90 天内补货满 500 万韩币（1 人有效）"
          body="从这一刻起，外送费也开始减：小红降到 2.8% / ₩9400。"
        />
        <Step
          n="4"
          title="小红又拉来 4 个达标的朋友（5 人有效）"
          body="封顶档！2.5% / ₩9000。再继续拉人，价格也不会更低了。"
          hl
        />
        <Step
          n="5"
          title="小白只想自己用，不打算拉人"
          body="没关系，永远是 3.0% / ₩9500。小红升档不会影响小白，小白也不沾光。"
        />
      </div>

      <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">一句话：</span>
        你享受的折扣，来自你<span className="text-foreground">亲手拉来并且真在下单</span>的那群人。
        他们不补货（90 天内 500 万），你的档位就自动滑回去。
      </div>
    </section>
  );
}

function Step({ n, title, body, hl }: { n: string; title: string; body: string; hl?: boolean }) {
  return (
    <div className="flex gap-3">
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
          hl ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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