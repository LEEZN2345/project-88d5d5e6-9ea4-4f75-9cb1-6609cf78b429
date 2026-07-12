import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, formatKRW, formatCNY, REFERENCE_RATE } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect, type ReactNode } from "react";
import {
  Store,
  Calendar,
  Flame,
  ChevronDown,
  ChevronRight,
  Headset,
  Package,
  X,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
  notFoundComponent: () => (
    <MobileShell>
      <div className="p-8 text-center text-sm">商品不存在</div>
    </MobileShell>
  ),
});

type TierKey = "solo" | "group" | "bulk";
type Tier = {
  key: TierKey;
  label: string;
  margin: number; // 加成系数减 1
  qty: number;
  tag: string;
  cta: (total: string, unit: string) => string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  accentChip: string;
};

const TIERS: Tier[] = [
  {
    key: "solo",
    label: "单件直购",
    margin: 0.2,
    qty: 1,
    tag: "推荐",
    cta: (total) => `立即下单 ${total}`,
    accentBorder: "border-emerald-500",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/30",
    accentText: "text-emerald-700 dark:text-emerald-300",
    accentChip: "bg-emerald-500 text-white",
  },
  {
    key: "group",
    label: "拼单团购",
    margin: 0.15,
    qty: 1,
    tag: "性价比",
    cta: (total) => `发起拼单 ${total}`,
    accentBorder: "border-sky-500",
    accentBg: "bg-sky-50 dark:bg-sky-950/30",
    accentText: "text-sky-700 dark:text-sky-300",
    accentChip: "bg-sky-500 text-white",
  },
  {
    key: "bulk",
    label: "两件起批",
    margin: 0.1,
    qty: 2,
    tag: "最低价",
    cta: (_total, unit) => `批发拿货 ${unit}/件`,
    accentBorder: "border-amber-500",
    accentBg: "bg-amber-50 dark:bg-amber-950/30",
    accentText: "text-amber-700 dark:text-amber-300",
    accentChip: "bg-amber-500 text-white",
  },
];

const INTL_SHIPPING_KRW = 4500;

function ProductDetail() {
  const { id } = Route.useParams();
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw notFound();
  const shop = SHOPS.find((s) => s.id === p.shopId)!;
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState(p.sizes[0]);
  const [tierKey, setTierKey] = useState<TierKey>("solo");
  const [expanded, setExpanded] = useState<TierKey | null>("solo");
  const [flowOpen, setFlowOpen] = useState(false);
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);
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
  const baseKRW = p.priceKRW;
  const subtotalKRW = baseKRW + INTL_SHIPPING_KRW;
  const krwPerCny = 1 / REFERENCE_RATE;
  const costCNY = subtotalKRW * REFERENCE_RATE;
  const soloUnitCNY = costCNY * (1 + TIERS[0]!.margin);
  const tierUnitCNY = costCNY * (1 + tier.margin);
  const totalCNY = tierUnitCNY * tier.qty;

  const purchaseOptions = (
    <div className="space-y-2">
      {TIERS.map((t) => {
        const selected = t.key === tierKey;
        const isOpen = expanded === t.key;
        const tUnitCNY = costCNY * (1 + t.margin);
        const tTotalCNY = tUnitCNY * t.qty;
        const saved = (soloUnitCNY - tUnitCNY) * t.qty;
        const multiplier = (1 + t.margin).toFixed(2);
        return (
          <div
            key={t.key}
            className={`rounded-xl border-2 transition ${selected ? `${t.accentBorder} ${t.accentBg}` : "border-border bg-card"}`}
          >
            <button
              onClick={() => {
                setTierKey(t.key);
              }}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${selected ? t.accentBorder : "border-muted-foreground/40"}`}
              >
                {selected && (
                  <span className={`h-2.5 w-2.5 rounded-full ${t.accentChip}`} />
                )}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{t.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] ${selected ? t.accentChip : "bg-muted text-muted-foreground"}`}
                  >
                    {t.tag}
                  </span>
                  {t.key !== "solo" && saved > 0 && (
                    <span className="text-[10px] text-rose-500">
                      省 {formatCNY(saved)}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  到手价 <b className="text-foreground">{formatCNY(tUnitCNY)}</b>/件
                  {t.qty > 1 && <span className="ml-1">· 共 {t.qty} 件</span>}
                </div>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setTierKey(t.key);
                  setExpanded(isOpen ? null : t.key);
                }}
                className="flex items-center gap-0.5 text-[11px] text-muted-foreground"
              >
                计价明细
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </span>
            </button>

            {selected && (
              <div className="mx-3 mb-3 rounded-lg bg-background/70 p-3 text-xs">
                {isOpen && (
                  <>
                    <div className="mb-1 font-medium">📊 价格明细</div>
                    <Row label="档口批发价" value={`${baseKRW.toLocaleString()} KRW`} />
                    <Row label="国际运费" value={`+${INTL_SHIPPING_KRW.toLocaleString()} KRW`} />
                    <Divider />
                    <Row label="小计" value={`${subtotalKRW.toLocaleString()} KRW`} />
                    <Row label="实时汇率" value={krwPerCny.toFixed(2)} />
                    <Divider />
                    <Row label="人民币成本" value={formatCNY(costCNY)} />
                    <Row
                      label={`加成系数（毛利 ${Math.round(t.margin * 100)}%）`}
                      value={`${multiplier}×`}
                    />
                    <Divider />
                    <Row
                      label="最终报价"
                      value={<b className={t.accentText}>{formatCNY(tUnitCNY)}</b>}
                    />
                    <Row label="国内运费" value="包邮" />
                    <div className="mt-2 rounded-md bg-muted/60 px-2 py-1.5 text-[11px] text-muted-foreground">
                      计算公式：({baseKRW.toLocaleString()} + {INTL_SHIPPING_KRW.toLocaleString()}) ÷ {krwPerCny.toFixed(2)} × {multiplier} = {formatCNY(tUnitCNY)}
                    </div>
                  </>
                )}
                <Button
                  size="sm"
                  className={`${isOpen ? "mt-3" : ""} h-11 w-full text-sm font-semibold`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTierKey(t.key);
                    setShowPurchaseOptions(false);
                  }}
                >
                  {t.cta(formatCNY(tTotalCNY), formatCNY(tUnitCNY))}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

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
                  <img
                    src={src}
                    alt={`${p.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {p.discount && (
          <Badge className="absolute left-3 top-3 bg-rose-500 text-white">
            -{p.discount}%
          </Badge>
        )}
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

      {/* 上架 / 限时折扣 */}
      <div className="mx-4 mt-3 flex flex-wrap items-center gap-2 text-[11px]">
        <div className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
          <Calendar className="h-3 w-3" /> 上架 {p.uploadedAt}
        </div>
        {p.discount && (
          <div className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-1 font-medium text-rose-600 dark:text-rose-400">
            <Flame className="h-3 w-3" /> 限时折扣 -{p.discount}% · 剩余 2 天
          </div>
        )}
      </div>

      {/* 标题 */}
      <div className="px-4 pt-3">
        <h1 className="text-lg font-semibold">{p.name}</h1>
        <div className="mt-0.5 text-xs text-muted-foreground">
          内部款号 {p.internalCode}
        </div>
      </div>

      {/* 档口批发价卡 */}
      <div className="mx-4 mt-3 rounded-xl border border-amber-500/40 bg-amber-50/60 p-3 dark:bg-amber-950/20">
        <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
          🇰🇷 档口批发价
        </div>
        <div className="mt-1 flex items-end justify-between">
          <span className="text-3xl font-extrabold tracking-tight">
            {formatKRW(baseKRW)}
          </span>
          <span className="text-xs text-muted-foreground">
            ≈ {formatCNY(costCNY)}（含国际运费）
          </span>
        </div>
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          💱 实时汇率 {krwPerCny.toFixed(2)}（1 CNY = {krwPerCny.toFixed(2)} KRW）· 付款时锁定
        </div>
      </div>

      <Link
        to="/shops/$id"
        params={{ id: shop.id }}
        className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-border bg-card p-3"
      >
        <Store className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-sm font-medium">{shop.name}</div>
          <div className="text-xs text-muted-foreground">
            {shop.building} · {shop.floor}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">进入档口 →</span>
      </Link>

      <div className="mt-4 px-4">
        <div className="text-sm font-medium">颜色</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {p.colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`rounded-full border px-3 py-1 text-xs ${color === c ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 px-4">
        <div className="text-sm font-medium">尺码</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {p.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-md border px-3 py-1 text-xs ${size === s ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 实体店/大宗批发 */}
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border bg-card p-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-base">🏬</div>
        <div className="flex-1">
          <div className="text-sm font-medium">实体店 / 大宗批发（单款 10 件起）</div>
          <div className="text-[11px] text-muted-foreground">联系专属客服获取底价</div>
        </div>
        <Button size="sm" variant="outline" className="gap-1">
          <Headset className="h-3.5 w-3.5" /> 客服
        </Button>
      </div>

      {/* 代购流程 可折叠 */}
      <div className="mx-4 mt-3 rounded-xl border border-border bg-card">
        <button
          onClick={() => setFlowOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm"
        >
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 font-medium">代购流程</span>
          {flowOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {flowOpen && (
          <div className="border-t border-border px-3 py-2.5 text-xs text-muted-foreground">
            加购 → 下单 → 平台分配收款码 → 你付款 → 平台代付韩币（锁定汇率，上传小票）→ 韩国仓集货 → 跨境运输 → 国内派送。
          </div>
        )}
      </div>

      {/* 购买方式面板：点击立即下单后展开 */}
      {showPurchaseOptions && (
        <div className="fixed bottom-32 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 rounded-xl border border-border bg-background px-4 pb-4 pt-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">选择购买方式</div>
            <button
              onClick={() => setShowPurchaseOptions(false)}
              className="rounded-full p-1 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {purchaseOptions}
        </div>
      )}

      <div className="fixed bottom-16 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-background/95 px-4 py-2 backdrop-blur">
        <Button
          className="h-11 w-full text-sm font-semibold"
          onClick={() => setShowPurchaseOptions((v) => !v)}
        >
          立即下单 {formatCNY(totalCNY)}
        </Button>
        <div className="mt-1 text-center text-[10px] text-muted-foreground">
          {tierKey === "group"
            ? "若拼团失败，系统将自动全额退款"
            : "付款后平台代付韩币并锁定汇率"}
        </div>
      </div>
      <div className="h-24" />
    </MobileShell>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-1 border-t border-dashed border-border" />;
}
