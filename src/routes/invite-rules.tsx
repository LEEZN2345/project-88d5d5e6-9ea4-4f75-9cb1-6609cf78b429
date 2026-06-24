import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Clock, Users, TrendingDown, Shield, HelpCircle, Sparkles, ArrowRight, Store } from "lucide-react";

export const Route = createFileRoute("/invite-rules")({
  head: () => ({ meta: [{ title: "邀请分销规则 · 东大门订货通" }] }),
  component: InviteRules,
});

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
        <Store className="h-4 w-4 text-primary" /> 一个实体店老板的故事
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        把平台想成你在东大门的「专属拿货搭子」。<span className="text-foreground">服务费</span>就是每件货的「跑腿点位」，<span className="text-foreground">运费</span>就是「空运到店运费」。拉的同行越多、补货越实在，你的进货成本就越低。
      </p>

      <div className="mt-3 space-y-2">
        <Step
          n="1"
          title="王姐：杭州四季青开女装店，被同行拉进来"
          body="第一次用邀请码注册，起步价 3.0% / ₩9500/kg。比她以前找代购便宜，但还不是最低。"
        />
        <Step
          n="2"
          title="王姐把隔壁档口的李姐也拉进来（发出邀请）"
          body="平台立刻给王姐降一档：服务费 2.9% / ₩9500。光是「发出邀请」这个动作，每件货就先省一点。"
          hl
        />
        <Step
          n="3"
          title="李姐 90 天内补货满 500 万韩币（=1 个有效下线）"
          body="李姐是真在下单的同行，不是凑数小号。王姐再降一档：2.8% / ₩9400/kg，连运费一起跟着降 ₩100。"
        />
        <Step
          n="4"
          title="王姐又陆续拉来 4 个达标的实体店老板（共 5 人有效）"
          body="封顶档：2.5% / ₩9000/kg。整条街都在用，王姐的拿货成本就是这条街最低的。再拉人价格也不会更低了。"
          hl
        />
        <Step
          n="5"
          title="李姐只想自己安静拿货，不打算再拉人"
          body="没关系，她永远是 3.0% / ₩9500。王姐升到 2.5% 不会自动「带飞」李姐；李姐想再低，得自己也去发邀请。"
        />
        <Step
          n="6"
          title="如果李姐连续 3 个月不补货（掉出 90 天窗口）"
          body="她不再算王姐的有效下线，王姐的档位会自动滑回去一档。档位只降不升，掉出来就要重新拉。"
        />
      </div>

      <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">一句话：</span>
        你拿货的折扣，来自你<span className="text-foreground">亲手拉来、并且真的在补货</span>的那批实体店同行。
        他们停手不补（90 天内 500 万），你的档位就自动滑回去——所以这套规则奖励的是「真同行」，不是「人头」。
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