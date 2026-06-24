import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, formatKRW, krwToCny, formatCNY, REFERENCE_RATE } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Heart, Store, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
  notFoundComponent: () => <MobileShell><div className="p-8 text-center text-sm">商品不存在</div></MobileShell>,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw notFound();
  const shop = SHOPS.find((s) => s.id === p.shopId)!;
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState(p.sizes[0]);
  const finalKRW = p.discount ? Math.round(p.priceKRW * (1 - p.discount / 100)) : p.priceKRW;

  return (
    <MobileShell>
      <MobileHeader title="商品详情" back />
      <div className="relative aspect-square">
        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
        {p.isNew && <Badge className="absolute left-3 top-3 bg-blue-500 text-white">新款</Badge>}
        {p.discount && <Badge className="absolute left-3 top-3 bg-rose-500 text-white">折扣 -{p.discount}%</Badge>}
      </div>

      <div className="px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{formatKRW(finalKRW)}</span>
          {p.discount && <span className="text-sm text-muted-foreground line-through">{formatKRW(p.priceKRW)}</span>}
          <span className="text-xs text-muted-foreground">≈ {formatCNY(krwToCny(finalKRW))}</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">参考汇率 1 KRW ≈ {REFERENCE_RATE} CNY · 实际汇率以平台代付时锁定为准</div>
        <h1 className="mt-2 text-base font-semibold">{p.name}</h1>
        <div className="mt-1 text-xs text-muted-foreground">内部款号 {p.internalCode}</div>
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

      <div className="mt-4 px-4">
        <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <div className="mb-1 font-medium text-foreground">说明</div>
          代购流程:加购 → 下单 → 平台分配收款码 → 你付款 → 平台代付韩币(锁定汇率,上传小票) → 韩国仓集货 → 跨境运输 → 国内派送。
        </div>
      </div>

      <div className="fixed bottom-16 left-1/2 z-40 flex w-full max-w-[480px] -translate-x-1/2 items-center gap-2 border-t border-border bg-background/95 px-4 py-2 backdrop-blur">
        <Button variant="outline" size="icon"><Heart className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon"><MessageCircle className="h-4 w-4" /></Button>
        <Button className="flex-1" variant="outline">加入购物车</Button>
        <Button className="flex-1">立即下单</Button>
      </div>
      <div className="h-16" />
    </MobileShell>
  );
}