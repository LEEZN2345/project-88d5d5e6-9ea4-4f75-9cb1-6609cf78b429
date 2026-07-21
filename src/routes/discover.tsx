import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, krwToCny, formatCNY } from "@/lib/mock-data";
import { Search, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "发现好物 · 东大门订货通" }] }),
  component: Discover,
});

// 频道标签：推荐 / 服饰 / 鞋包 / 饰品 / 帽子
const TABS = [
  { key: "all", label: "推荐" },
  { key: "apparel", label: "服饰", match: ["女装", "男装", "童装"] },
  { key: "shoesbag", label: "鞋包", match: ["女鞋", "男鞋", "女包", "男包"] },
  { key: "jewelry", label: "饰品", match: ["首饰", "饰品", "珠宝"] },
  { key: "hat", label: "帽子", match: ["帽"] },
] as const;

// 分享笔记标题池（配合商品图，模拟种草文案）
const CAPTIONS = [
  "东大门新款碎花裙太仙了",
  "这个包百搭绝了",
  "小众设计感耳环 百搭款",
  "通勤西装外套推荐",
  "东大门爆款T恤 三色入",
  "夏日百搭凉鞋分享",
  "显瘦神器 直筒牛仔裤",
  "韩系温柔风针织开衫",
  "出街闪光单品 迷你链条包",
  "复古风格小方巾 巨好搭",
  "早春上新 蕾丝拼接连衣裙",
  "本命色 焦糖色乐福鞋",
];

const AUTHORS = ["小A", "小B", "小C", "小D", "小E", "小F", "小K", "阿May", "Luna", "小七"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function Discover() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [kw, setKw] = useState("");

  const posts = useMemo(() => {
    return PRODUCTS.map((p, i) => {
      const shop = SHOPS.find((s) => s.id === p.shopId);
      const h = hash(p.id);
      return {
        id: p.id,
        product: p,
        shop,
        caption: CAPTIONS[(h + i) % CAPTIONS.length],
        author: AUTHORS[h % AUTHORS.length],
        soldCount: 3 + (h % 80),
        priceCNY: krwToCny(p.priceKRW),
        // 图片高度错落，形成瀑布流
        ratio: h % 3 === 0 ? "aspect-[3/4]" : h % 3 === 1 ? "aspect-square" : "aspect-[4/5]",
      };
    });
  }, []);

  const list = useMemo(() => {
    const cur = TABS.find((t) => t.key === tab);
    const match = (cur as any)?.match as string[] | undefined;
    return posts.filter((p) => {
      if (match && match.length) {
        const cat = p.product.category || "";
        if (!match.some((m) => cat.includes(m))) return false;
      }
      if (kw.trim()) {
        const q = kw.trim().toLowerCase();
        const bag = `${p.caption} ${p.product.name} ${p.shop?.name ?? ""} ${p.author}`.toLowerCase();
        if (!bag.includes(q)) return false;
      }
      return true;
    });
  }, [posts, tab, kw]);

  const totalEarn = useMemo(
    () => posts.reduce((s, p) => s + Math.round(p.priceCNY * 0.05 * (p.soldCount / 4)), 0),
    [posts],
  );

  return (
    <MobileShell>
      <MobileHeader title="发现好物" />

      {/* 顶部激励 Banner */}
      <div className="px-4 pt-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 p-4 text-white shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-base font-bold">
                <Sparkles className="h-4 w-4" />
                好物分享，佣金拿到手软！
              </div>
              <div className="mt-1 text-xs opacity-95">发帖挂链接，躺赚分佣</div>
              <div className="mt-2 text-[11px] opacity-90">
                达人 <span className="font-semibold">@小七</span> 已赚：
                <span className="text-base font-black tracking-wide">{formatCNY(totalEarn)}</span>
              </div>
            </div>
            <TrendingUp className="h-10 w-10 opacity-30" />
          </div>
          <Link
            to="/discover/new"
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow"
          >
            立即发布赚佣金 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="搜档口 / 商品 / 用户…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* 分类 Tab */}
      <div className="sticky top-12 z-30 mt-3 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                tab === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 双列瀑布流 */}
      <div className="px-3 pb-8 pt-3">
        {list.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">暂无相关好物</div>
        ) : (
          <div className="columns-2 gap-2 [column-fill:_balance]">
            {list.map((p) => (
              <Link
                key={p.id}
                to="/discover/$postId"
                params={{ postId: p.product.id }}
                className="mb-2 block break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition active:scale-[0.98]"
              >
                <div className={cn("relative w-full overflow-hidden bg-muted", p.ratio)}>
                  <img
                    src={p.product.images[0]}
                    alt={p.caption}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1.5 p-2">
                  <div className="line-clamp-2 text-[13px] font-medium leading-snug">
                    {p.caption}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-orange-400 text-[9px] font-bold text-white">
                      {p.author.slice(-1)}
                    </span>
                    <span className="truncate">{p.author}</span>
                    <span className="mx-0.5">·</span>
                    <span className="truncate">🏢 {p.shop?.name ?? "档口"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-sm font-bold text-rose-600">
                      {formatCNY(p.priceCNY)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      已售 {p.soldCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="pt-2 text-center text-[11px] text-muted-foreground">
          — 上拉加载更多 —
        </div>
      </div>
    </MobileShell>
  );
}