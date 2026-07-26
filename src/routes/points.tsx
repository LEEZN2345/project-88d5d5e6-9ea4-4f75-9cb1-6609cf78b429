import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Flame, Gift, Share2, ChevronRight, Sparkles, Clock } from "lucide-react";

export const Route = createFileRoute("/points")({
  head: () => ({ meta: [{ title: "积分广场 · 东大门蚂蚁" }] }),
  component: PointsMall,
});

// ——— Mock 数据 ———
const MY_POINTS = 2580;

const FLASH = {
  name: "时尚针织开衫",
  cover: "https://picsum.photos/seed/flash-knit/600/600",
  orig: 3000,
  now: 1500,
  stock: 8,
  endsAt: "本周日 24:00",
};

type Item = { id: string; name: string; cover: string; cost: number; note?: string };

const ZONES: { key: string; title: string; sub: string; items: Item[] }[] = [
  {
    key: "starter",
    title: "🎀 上手兑换",
    sub: "200–500 积分 · 低门槛试试手气",
    items: [
      { id: "e1", name: "珍珠耳环", cover: "https://picsum.photos/seed/ear1/300/300", cost: 200 },
      { id: "e2", name: "缎面发带", cover: "https://picsum.photos/seed/hair1/300/300", cost: 350 },
      { id: "e3", name: "帆布托特包挂件", cover: "https://picsum.photos/seed/bag1/300/300", cost: 500 },
    ],
  },
  {
    key: "main",
    title: "👚 打底衫专区",
    sub: "1000–2000 积分 · 主力兑换区",
    items: [
      { id: "t1", name: "纯棉打底 T", cover: "https://picsum.photos/seed/tee2/300/300", cost: 1200 },
      { id: "t2", name: "泡泡袖雪纺衬衫", cover: "https://picsum.photos/seed/blouse-p/300/300", cost: 1800, note: "本月热门" },
      { id: "t3", name: "复古格纹半身裙", cover: "https://picsum.photos/seed/skirt-p/300/300", cost: 2000 },
    ],
  },
  {
    key: "premium",
    title: "💎 高价值专区",
    sub: "3000–5000 积分 · 攒一攒能换大件",
    items: [
      { id: "p1", name: "小香风短外套", cover: "https://picsum.photos/seed/jacket-p/300/300", cost: 3500 },
      { id: "p2", name: "羊毛混纺大衣", cover: "https://picsum.photos/seed/coat-p/300/300", cost: 5000, note: "邀请榜赠品同款" },
    ],
  },
];

function PointsMall() {
  return (
    <MobileShell>
      <MobileHeader title="积分广场" back />

      <div className="space-y-4 p-4">
        {/* 顶部积分余额 */}
        <section className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-400 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 text-xs opacity-90">
                <Sparkles className="h-3 w-3" /> 我的积分
              </div>
              <div className="mt-1 text-3xl font-semibold tabular-nums">{MY_POINTS.toLocaleString()}</div>
              <div className="mt-1 text-[11px] opacity-80">100 积分 = ¥10 等值商品</div>
            </div>
            <Link
              to="/points/history"
              className="rounded-full bg-white/20 px-3 py-1.5 text-[11px] backdrop-blur-sm"
            >
              积分明细 →
            </Link>
          </div>
        </section>

        {/* 限时秒杀 */}
        <section className="overflow-hidden rounded-2xl border border-orange-300/60 bg-gradient-to-br from-orange-50 to-rose-50">
          <div className="flex items-center justify-between px-4 pt-3 text-xs">
            <div className="flex items-center gap-1 font-semibold text-orange-600">
              <Flame className="h-4 w-4" /> 限时秒杀
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Clock className="h-3 w-3" /> 截止 {FLASH.endsAt}
            </div>
          </div>
          <div className="flex gap-3 p-3">
            <img src={FLASH.cover} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="text-sm font-medium">{FLASH.name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                库存仅剩 <span className="font-semibold text-orange-600">{FLASH.stock} 件</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold tabular-nums text-orange-600">{FLASH.now}</span>
                <span className="text-[11px] text-muted-foreground">积分</span>
                <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                  原 {FLASH.orig}
                </span>
              </div>
              <Button
                size="sm"
                className="mt-auto self-start bg-orange-500 hover:bg-orange-500/90"
              >
                立即兑换
              </Button>
            </div>
          </div>
        </section>

        {/* 三档兑换专区 */}
        {ZONES.map((z) => (
          <section key={z.key} className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-1 text-sm font-semibold">{z.title}</div>
            <div className="mb-3 text-[11px] text-muted-foreground">{z.sub}</div>
            <div className="grid grid-cols-3 gap-2">
              {z.items.map((it) => {
                const affordable = MY_POINTS >= it.cost;
                return (
                  <div key={it.id} className="overflow-hidden rounded-xl border border-border bg-background">
                    <div className="relative aspect-square">
                      <img src={it.cover} alt="" className="h-full w-full object-cover" />
                      {it.note && (
                        <div className="absolute left-1 top-1 rounded bg-rose-500/90 px-1.5 py-0.5 text-[9px] text-white">
                          {it.note}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="truncate text-[11px]">{it.name}</div>
                      <div className="mt-0.5 flex items-baseline gap-0.5">
                        <span className={`text-sm font-semibold tabular-nums ${affordable ? "text-rose-500" : "text-muted-foreground"}`}>
                          {it.cost}
                        </span>
                        <span className="text-[10px] text-muted-foreground">分</span>
                      </div>
                      <button
                        disabled={!affordable}
                        className={`mt-1.5 w-full rounded-md py-1 text-[11px] font-medium ${
                          affordable
                            ? "bg-rose-500 text-white hover:bg-rose-500/90"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {affordable ? "兑换" : "积分不足"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* 邀请入口 */}
        <Link
          to="/points-rules"
          className="flex items-center gap-3 rounded-2xl border border-dashed border-rose-300 bg-rose-50/60 p-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white">
            <Share2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-rose-600">邀请好友赚积分</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              好友首单返 10% · 已邀 4 人 · 距下一档还差 1 人
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-rose-500" />
        </Link>

        <Link
          to="/points-rules"
          className="block rounded-xl border border-border bg-card p-3 text-center text-xs text-muted-foreground"
        >
          <Gift className="mr-1 inline h-3 w-3" /> 查看完整积分规则 →
        </Link>
      </div>
    </MobileShell>
  );
}
