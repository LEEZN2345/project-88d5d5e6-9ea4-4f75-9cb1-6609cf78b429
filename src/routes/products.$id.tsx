import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, formatKRW, krwToCny, formatCNY, REFERENCE_RATE } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Heart, Store, MessageCircle, Users, Clock, Share2, Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect } from "react";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
  notFoundComponent: () => <MobileShell><div className="p-8 text-center text-sm">商品不存在</div></MobileShell>,
});

type TierKey = "solo" | "group" | "bulk";
type Tier = {
  key: TierKey;
  label: string;
  unit: number; // KRW 单价
  qty: number;
  tag: string;
  hint: string;
  accentBorder: string; // 选中态边框
  accentBg: string; // 选中态背景
  accentText: string; // 徽标文字色
  accentChip: string; // 徽标背景
};

const TIERS: Tier[] = [
  {
    key: "solo",
    label: "单人直购",
    unit: 168000,
    qty: 1,
    tag: "推荐",
    hint: "现货速发",
    accentBorder: "border-emerald-500",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/30",
    accentText: "text-emerald-700 dark:text-emerald-300",
    accentChip: "bg-emerald-500 text-white",
  },
  {
    key: "group",
    label: "拼单团购",
    unit: 160000,
    qty: 1,
    tag: "性价比",
    hint: "需拉 1 人",
    accentBorder: "border-sky-500",
    accentBg: "bg-sky-50 dark:bg-sky-950/30",
    accentText: "text-sky-700 dark:text-sky-300",
    accentChip: "bg-sky-500 text-white",
  },
  {
    key: "bulk",
    label: "双件批发",
    unit: 154000,
    qty: 2,
    tag: "最低价",
    hint: "买 2 件",
    accentBorder: "border-amber-500",
    accentBg: "bg-amber-50 dark:bg-amber-950/30",
    accentText: "text-amber-700 dark:text-amber-300",
    accentChip: "bg-amber-500 text-white",
  },
];

function ProductDetail() {
  const { id } = Route.useParams();
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw notFound();
  const shop = SHOPS.find((s) => s.id === p.shopId)!;
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState(p.sizes[0]);
  const [tierKey, setTierKey] = useState<TierKey>("group");
  const [api, setApi] = useState<CarouselApi>();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (!api) return;
    setSlide(api.selectedScrollSnap());
    const onSelect = () => setSlide(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const tier = TIERS.find((t) => t.key === tierKey)!;
  const soloUnit = TIERS[0]!.unit;
  const totalKRW = tier.unit * tier.qty;
  const savedKRW = (soloUnit - tier.unit) * tier.qty;

  return (
    <MobileShell>
      <MobileHeader title="商品详情" back />
      {/* 图片轮播 */}
      <div className="relative">
        <Carousel setApi={setApi} opts={{ loop: true }}>
          <CarouselContent>
            {p.images.map((src, i) => (
              <CarouselItem key={i} className="basis-full">
                <div className="aspect-square">
                  <img src={src} alt={`${p.name} ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {p.isNew && <Badge className="absolute left-3 top-3 bg-sky-500 text-white">新款</Badge>}
        {p.discount && <Badge className="absolute left-3 top-3 bg-rose-500 text-white">折扣 -{p.discount}%</Badge>}
        {/* 圆点指示 */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {p.images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === slide ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
            />
          ))}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
          {slide + 1}/{p.images.length}
        </div>
      </div>

      {/* 价格区（动态跟随档位） */}
      <div className="px-4 py-4 text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-3xl font-bold">{formatKRW(tier.unit)}</span>
          <span className="text-sm text-muted-foreground">≈ {formatCNY(krwToCny(tier.unit))}</span>
        </div>
        {savedKRW > 0 && (
          <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${tier.accentChip}`}>
            <Sparkles className="h-3 w-3" /> {tier.label}省 {formatKRW(savedKRW)}
          </div>
        )}
        <div className="mt-2 text-[11px] text-muted-foreground">
          参考汇率 1 KRW ≈ {REFERENCE_RATE} CNY · 平台代付时锁定
        </div>
        <h1 className="mt-3 text-base font-semibold">{p.name}</h1>
        <div className="mt-0.5 text-xs text-muted-foreground">内部款号 {p.internalCode}</div>
      </div>

      <Link to="/shops/$id" params={{ id: shop.id }} className="mx-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <Store className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-sm font-medium">{shop.name}</div>
          <div className="text-xs text-muted-foreground">{shop.building} · {shop.floor}</div>
        </div>
        <span className="text-xs text-muted-foreground">进入档口 →</span>
      </Link>

      <div className="mt-4 px-4">
        <div className="text-sm font-medium">颜色</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {p.colors.map((c) => (
            <button key={c} onClick={() => setColor(c)} className={`rounded-full border px-3 py-1 text-xs ${color === c ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{c}</button>
          ))}
        </div>
      </div>
      <div className="mt-4 px-4">
        <div className="text-sm font-medium">尺码</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {p.sizes.map((s) => (
            <button key={s} onClick={() => setSize(s)} className={`rounded-md border px-3 py-1 text-xs ${size === s ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* 购买方式三选一 */}
      <div className="mt-5 px-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">选择购买方式</div>
          <div className="text-[10px] text-muted-foreground">以下价格含税含运费</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map((t) => {
            const active = t.key === tierKey;
            const diff = (soloUnit - t.unit) * t.qty;
            return (
              <button
                key={t.key}
                onClick={() => setTierKey(t.key)}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl border-2 p-2 text-center transition ${
                  active ? `${t.accentBorder} ${t.accentBg}` : "border-border bg-card"
                }`}
              >
                <span className={`absolute -top-2 rounded-full px-1.5 py-0.5 text-[9px] ${active ? t.accentChip : "bg-muted text-muted-foreground"}`}>
                  {t.tag}
                </span>
                <div className="mt-1 text-xs font-medium">{t.label}</div>
                <div className={`text-sm font-bold ${active ? t.accentText : ""}`}>
                  {formatKRW(t.unit)}
                  {t.qty > 1 && <span className="text-[10px] font-normal">/件</span>}
                </div>
                {t.qty > 1 ? (
                  <div className="text-[10px] text-muted-foreground">总 {formatKRW(t.unit * t.qty)}</div>
                ) : diff > 0 ? (
                  <div className="text-[10px] text-muted-foreground">省 {formatKRW(diff)}</div>
                ) : (
                  <div className="text-[10px] text-muted-foreground">{t.hint}</div>
                )}
              </button>
            );
          })}
        </div>

        {/* 档位补充信息 */}
        {tierKey === "group" && (
          <div className="mt-3 rounded-xl border border-sky-500/30 bg-sky-50 p-3 text-xs dark:bg-sky-950/30">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-600" />
              <span>当前已有 <b>3</b> 人正在拼此款(还差 1 人成团)</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              拼团倒计时 23:59:12
            </div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-1">
                <Share2 className="h-3.5 w-3.5" /> 邀请好友拼单
              </Button>
              <Button size="sm" variant="outline" className="flex-1">直接付款占位</Button>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground">
              等不及？点击补差价 {formatCNY(krwToCny(soloUnit - tier.unit))} 转为直购。
            </div>
          </div>
        )}
        {tierKey === "solo" && (
          <div className="mt-2 text-right text-[11px] text-muted-foreground">无需拼单,付款即锁汇率</div>
        )}
        {tierKey === "bulk" && (
          <div className="mt-2 text-right text-[11px] text-muted-foreground">数量已锁定 2 件 · 单价最低</div>
        )}
      </div>

      <div className="mt-4 px-4">
        <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <div className="mb-1 font-medium text-foreground">说明</div>
          代购流程:加购 → 下单 → 平台分配收款码 → 你付款 → 平台代付韩币(锁定汇率,上传小票) → 韩国仓集货 → 跨境运输 → 国内派送。
        </div>
      </div>

      <div className="fixed bottom-16 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-background/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon"><Heart className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon"><MessageCircle className="h-4 w-4" /></Button>
          <Button className="flex-1 h-11 text-sm font-semibold">
            {tierKey === "bulk"
              ? `立即购 2 件 ${formatKRW(totalKRW)}`
              : tierKey === "group"
                ? `拼单下单 ${formatKRW(totalKRW)}`
                : `立即下单 ${formatKRW(totalKRW)}`}
          </Button>
        </div>
        <div className="mt-1 text-center text-[10px] text-muted-foreground">
          {tierKey === "group" ? "若拼团失败,系统将自动全额退款" : "付款后平台代付韩币并锁定汇率"}
        </div>
      </div>
      <div className="h-24" />
    </MobileShell>
  );
}