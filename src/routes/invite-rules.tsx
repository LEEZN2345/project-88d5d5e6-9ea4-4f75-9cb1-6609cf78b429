import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Clock, Users, Sparkles, ArrowRight, Store } from "lucide-react";

export const Route = createFileRoute("/invite-rules")({
  head: () => ({ meta: [{ title: "邀请分销规则 · 东大门订货通" }] }),
  component: InviteRules,
});

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