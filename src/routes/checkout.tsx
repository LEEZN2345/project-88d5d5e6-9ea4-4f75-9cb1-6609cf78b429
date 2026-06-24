import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, PAYMENT_ACCOUNTS, REFERENCE_RATE, formatKRW, formatCNY, krwToCny } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin, Wallet, Truck } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "提交订单 · 东大门订货通" }] }),
  component: Checkout,
});

const ITEMS = [
  { product: PRODUCTS[0]!, qty: 1, color: "奶白", size: "FREE" },
  { product: PRODUCTS[1]!, qty: 2, color: "米色", size: "FREE" },
  { product: PRODUCTS[2]!, qty: 1, color: "黑", size: "M" },
];

function Checkout() {
  const totalKRW = ITEMS.reduce((s, i) => s + i.product.priceKRW * i.qty, 0);
  // 模拟"剩余额度最大"分配
  const assigned = PAYMENT_ACCOUNTS.filter((a) => a.status === "active")
    .sort((a, b) => b.dailyLimit - b.todayReceived - (a.dailyLimit - a.todayReceived))[0]!;
  const grouped = SHOPS.map((s) => ({
    shop: s,
    items: ITEMS.filter((i) => i.product.shopId === s.id),
  })).filter((g) => g.items.length > 0);

  return (
    <MobileShell>
      <MobileHeader title="提交订单" back />

      <Link to="/addresses" className="mx-4 mt-3 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <MapPin className="mt-0.5 h-4 w-4 text-primary" />
        <div className="flex-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">张老板</span>
            <span className="text-muted-foreground">138****6621</span>
            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">默认</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            广东省 广州市 白云区 沙河服装批发市场 B 栋 318 档
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      <div className="mx-4 mt-3 space-y-3">
        {grouped.map(({ shop, items }) => (
          <Card key={shop.id} className="p-3">
            <div className="border-b border-border pb-2 text-sm font-medium">{shop.name}</div>
            {items.map((i) => (
              <div key={i.product.id} className="mt-2 flex gap-3">
                <img src={i.product.images[0]} className="h-14 w-14 rounded object-cover" alt="" />
                <div className="flex-1 text-xs">
                  <div className="line-clamp-2">{i.product.name}</div>
                  <div className="text-muted-foreground">{i.color} / {i.size}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>{formatKRW(i.product.priceKRW)} × {i.qty}</span>
                    <span className="text-muted-foreground">≈ {formatCNY(krwToCny(i.product.priceKRW * i.qty))}</span>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Card className="mx-4 mt-3 p-3 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <Wallet className="h-4 w-4" /> 分配收款账户
        </div>
        <div className="mt-2 flex items-center gap-3 rounded-md bg-muted/40 p-2 text-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-background text-[9px] text-muted-foreground">QR</div>
          <div className="flex-1">
            <div className="font-medium">
              {assigned.channel === "wechat" ? "微信" : "支付宝"} · {assigned.holder}
            </div>
            <div className="text-muted-foreground">
              今日剩余额度 {formatCNY(assigned.dailyLimit - assigned.todayReceived)}
            </div>
          </div>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">系统按「剩余额度最大」策略自动分配,达上限将切换。</div>
      </Card>

      <Card className="mx-4 mt-3 p-3 text-xs">
        <Row k="商品总额 (韩币)" v={formatKRW(totalKRW)} />
        <Row k="参考汇率" v={`1 KRW ≈ ${REFERENCE_RATE} CNY`} sub />
        <Row k="预估人民币" v={formatCNY(krwToCny(totalKRW))} />
        <Row k="基础物流服务费" v={formatCNY(28)} />
        <Row k="国内派送" v="顺丰到付" sub />
        <div className="my-2 border-t border-border" />
        <Row k="合计 (预估)" v={formatCNY(krwToCny(totalKRW) + 28)} bold />
        <div className="mt-1 text-[11px] text-muted-foreground">
          实际人民币金额 = 平台代付时锁定汇率 × 韩币 + 服务费,以订单详情为准。
        </div>
      </Card>

      <div className="mx-4 mt-3 mb-24 flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
        <Truck className="h-4 w-4" />
        预计 5-7 天到货 · 韩国仓集货 1-2 天 + 跨境 3-5 天 + 国内派送 1-3 天
      </div>

      <div className="fixed bottom-16 left-1/2 z-40 flex w-full max-w-[480px] -translate-x-1/2 items-center gap-3 border-t border-border bg-background/95 px-4 py-2 backdrop-blur">
        <div className="text-right text-xs">
          <div className="text-base font-semibold">≈ {formatCNY(krwToCny(totalKRW) + 28)}</div>
          <div className="text-[10px] text-muted-foreground">{formatKRW(totalKRW)} + 服务费</div>
        </div>
        <Button className="ml-auto flex-1" asChild>
          <Link to="/orders/$id" params={{ id: "DD20251128001" }}>提交订单</Link>
        </Button>
      </div>
    </MobileShell>
  );
}

function Row({ k, v, sub, bold }: { k: string; v: string; sub?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${sub ? "text-[11px] text-muted-foreground" : ""} ${bold ? "text-sm font-semibold" : ""}`}>
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}