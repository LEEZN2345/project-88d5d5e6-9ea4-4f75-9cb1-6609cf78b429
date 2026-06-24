import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, formatKRW, krwToCny, formatCNY, REFERENCE_RATE } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "购物车 · 东大门订货通" }] }),
  component: Cart,
});

// Mock 多档口购物车
const CART = [
  { product: PRODUCTS[0]!, qty: 1, color: "奶白", size: "FREE" },
  { product: PRODUCTS[1]!, qty: 2, color: "米色", size: "FREE" },
  { product: PRODUCTS[2]!, qty: 1, color: "黑", size: "M" },
  { product: PRODUCTS[5]!, qty: 1, color: "原色", size: "26" },
];

function Cart() {
  // 按 shop 分组
  const grouped = SHOPS.map((s) => ({
    shop: s,
    items: CART.filter((c) => c.product.shopId === s.id),
  })).filter((g) => g.items.length > 0);

  const totalKRW = CART.reduce((sum, i) => sum + i.product.priceKRW * i.qty, 0);

  return (
    <MobileShell>
      <MobileHeader title="购物车" right={<button className="text-xs text-muted-foreground">编辑</button>} />

      <div className="space-y-3 px-4 pt-3">
        {grouped.map(({ shop, items }) => (
          <div key={shop.id} className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Checkbox defaultChecked />
              <Link to="/shops/$id" params={{ id: shop.id }} className="flex-1 text-sm font-medium">{shop.name}</Link>
              <span className="text-xs text-muted-foreground">{shop.building}</span>
            </div>
            {items.map((i) => (
              <div key={i.product.id} className="flex gap-3 px-3 py-3">
                <Checkbox defaultChecked className="mt-10" />
                <img src={i.product.images[0]} className="h-20 w-20 rounded-md object-cover" alt="" />
                <div className="flex flex-1 flex-col">
                  <div className="line-clamp-2 text-sm">{i.product.name}</div>
                  <div className="text-[11px] text-muted-foreground">{i.color} / {i.size} · {i.product.internalCode}</div>
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{formatKRW(i.product.priceKRW)}</div>
                      <div className="text-[10px] text-muted-foreground">≈ {formatCNY(krwToCny(i.product.priceKRW))}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex h-6 w-6 items-center justify-center rounded border border-border"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm">{i.qty}</span>
                      <button className="flex h-6 w-6 items-center justify-center rounded border border-border"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
                <button><Trash2 className="h-4 w-4 text-muted-foreground" /></button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="px-4 py-4 text-xs text-muted-foreground">
        参考汇率 1 KRW ≈ {REFERENCE_RATE} CNY,实际 RMB 金额以平台代付时锁定为准。
      </div>

      <div className="fixed bottom-16 left-1/2 z-40 flex w-full max-w-[480px] -translate-x-1/2 items-center gap-3 border-t border-border bg-background/95 px-4 py-2 backdrop-blur">
        <Checkbox defaultChecked />
        <span className="text-xs">全选</span>
        <div className="ml-auto text-right">
          <div className="text-sm font-semibold">{formatKRW(totalKRW)}</div>
          <div className="text-[10px] text-muted-foreground">≈ {formatCNY(krwToCny(totalKRW))}</div>
        </div>
        <Button>提交订单</Button>
      </div>
    </MobileShell>
  );
}