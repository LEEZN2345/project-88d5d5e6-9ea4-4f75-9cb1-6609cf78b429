import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { ORDERS, STATUS_LABEL, formatKRW, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/orders/")({
  head: () => ({ meta: [{ title: "我的订单 · 东大门订货通" }] }),
  component: OrdersIndex,
});

const TABS = ["全部", "待付款", "待发货", "在途", "已签收", "售后"];

function OrdersIndex() {
  return (
    <MobileShell>
      <MobileHeader title="订单" />
      <div className="sticky top-12 z-30 flex gap-2 overflow-x-auto border-b border-border bg-background px-4 py-2">
        {TABS.map((t, i) => (
          <button key={t} className={`shrink-0 rounded-full px-3 py-1 text-xs ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-3 px-4 pt-3">
        {ORDERS.map((o) => (
          <Link key={o.id} to="/orders/$id" params={{ id: o.id }} className="block rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{o.id}</div>
              <Badge variant={o.status === "pending_payment" ? "destructive" : "secondary"}>{STATUS_LABEL[o.status]}</Badge>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {o.items.map((i) => (
                <img key={i.product.id} src={i.product.images[0]} className="h-16 w-16 shrink-0 rounded-md object-cover" alt="" />
              ))}
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-[11px] text-muted-foreground">{o.createdAt} · 共 {o.items.reduce((s, i) => s + i.qty, 0)} 件</div>
              <div className="text-right">
                <div className="text-sm font-semibold">{formatKRW(o.totalKRW)}</div>
                {o.totalCNY ? (
                  <div className="text-[10px] text-muted-foreground">已锁 {formatCNY(o.totalCNY)}</div>
                ) : (
                  <div className="text-[10px] text-muted-foreground">待锁汇率</div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}