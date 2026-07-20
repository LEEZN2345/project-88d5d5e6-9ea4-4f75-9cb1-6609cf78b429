import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, formatKRW, krwToCny, formatCNY, REFERENCE_RATE } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { cart, cartItemKey, useCart } from "@/lib/cart-store";
import { checkoutStore } from "@/lib/checkout-store";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "购物车 · 东大门订货通" }] }),
  component: Cart,
});

function Cart() {
  const items = useCart();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<number>>(() => new Set(items.map((_, i) => i)));

  const rows = useMemo(
    () =>
      items.map((it, index) => {
        const product = PRODUCTS.find((p) => p.id === it.productId);
        return { index, item: it, product };
      }).filter((r) => r.product),
    [items],
  );

  const grouped = SHOPS.map((s) => ({
    shop: s,
    rows: rows.filter((r) => r.product!.shopId === s.id),
  })).filter((g) => g.rows.length > 0);

  const totalKRW = rows
    .filter((r) => selected.has(r.index))
    .reduce((sum, r) => sum + r.product!.priceKRW * r.item.qty, 0);
  const totalQty = rows
    .filter((r) => selected.has(r.index))
    .reduce((n, r) => n + r.item.qty, 0);

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.index));
  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.index)));
  };

  if (rows.length === 0) {
    return (
      <MobileShell>
        <MobileHeader title="购物车" />
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
          <ShoppingCart className="h-14 w-14 text-muted-foreground/40" />
          <div className="text-sm text-muted-foreground">购物车还是空的</div>
          <Button asChild size="sm"><Link to="/">去逛逛</Link></Button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <MobileHeader title="购物车" right={<button className="text-xs text-muted-foreground">编辑</button>} />

      <div className="space-y-3 px-4 pt-3">
        {grouped.map(({ shop, rows: shopRows }) => (
          <div key={shop.id} className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Checkbox
                checked={shopRows.every((r) => selected.has(r.index))}
                onCheckedChange={() => {
                  const allShopChecked = shopRows.every((r) => selected.has(r.index));
                  setSelected((prev) => {
                    const next = new Set(prev);
                    shopRows.forEach((r) => (allShopChecked ? next.delete(r.index) : next.add(r.index)));
                    return next;
                  });
                }}
              />
              <Link to="/shops/$id" params={{ id: shop.id }} className="flex-1 text-sm font-medium">{shop.name}</Link>
              <span className="text-xs text-muted-foreground">{shop.building}</span>
            </div>
            {shopRows.map(({ index, item, product }) => (
              <div key={index} className="flex gap-3 px-3 py-3">
                <Checkbox
                  checked={selected.has(index)}
                  onCheckedChange={() => toggle(index)}
                  className="mt-10"
                />
                <img src={product!.images[0]} className="h-20 w-20 rounded-md object-cover" alt="" />
                <div className="flex flex-1 flex-col">
                  <div className="line-clamp-2 text-sm">{product!.name}</div>
                  <div className="text-[11px] text-muted-foreground">{item.color} / {item.size} · {product!.internalCode}</div>
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{formatKRW(product!.priceKRW)}</div>
                      <div className="text-[10px] text-muted-foreground">≈ {formatCNY(krwToCny(product!.priceKRW))}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => cart.setQty(index, item.qty - 1)} className="flex h-6 w-6 items-center justify-center rounded border border-border"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button onClick={() => cart.setQty(index, item.qty + 1)} className="flex h-6 w-6 items-center justify-center rounded border border-border"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
                <button onClick={() => cart.remove(index)}><Trash2 className="h-4 w-4 text-muted-foreground" /></button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="px-4 py-4 text-xs text-muted-foreground">
        参考汇率 1 KRW ≈ {REFERENCE_RATE} CNY,实际 RMB 金额以平台代付时锁定为准。
      </div>

      <div className="fixed bottom-16 left-1/2 z-40 flex w-full max-w-[480px] -translate-x-1/2 items-center gap-3 border-t border-border bg-background/95 px-4 py-2 backdrop-blur">
        <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
        <span className="text-xs">全选</span>
        <div className="ml-auto text-right">
          <div className="text-sm font-semibold">{formatKRW(totalKRW)}</div>
          <div className="text-[10px] text-muted-foreground">≈ {formatCNY(krwToCny(totalKRW))}</div>
        </div>
        <Button
          disabled={totalQty === 0}
          onClick={() => {
            const picked = rows
              .filter((r) => selected.has(r.index))
              .map((r) => ({
                productId: r.item.productId,
                color: r.item.color,
                size: r.item.size,
                qty: r.item.qty,
                tier: r.item.tier,
                key: cartItemKey(r.item),
              }));
            if (!picked.length) return;
            checkoutStore.setFromCart(picked);
            navigate({ to: "/checkout" });
          }}
        >
          结算 ({totalQty})
        </Button>
      </div>
    </MobileShell>
  );
}