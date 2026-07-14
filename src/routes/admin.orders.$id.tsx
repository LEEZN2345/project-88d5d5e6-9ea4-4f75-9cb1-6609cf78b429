import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ORDERS, SHIPMENT_EVENTS, STATUS_LABEL, CHANNEL_LABEL, formatCNY, formatKRW } from "@/lib/mock-data";
import { ArrowLeft, Lock, CheckCircle2, Truck, Undo2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/$id")({
  head: () => ({ meta: [{ title: "订单详情 · 运营后台" }] }),
  component: AdminOrderDetail,
});

function AdminOrderDetail() {
  const { id } = Route.useParams();
  const order = ORDERS.find((o) => o.id === id) ?? ORDERS[0]!;
  const events = order.logisticsNo ? SHIPMENT_EVENTS[order.logisticsNo] ?? [] : [];

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/orders" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回订单列表
        </Link>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("已确认收款")}><CheckCircle2 className="mr-1 h-4 w-4" />确认收款</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("已锁定汇率快照")}><Lock className="mr-1 h-4 w-4" />锁汇率</Button>
          <Button size="sm" onClick={() => toast.success("已发起代付")}><Truck className="mr-1 h-4 w-4" />发起代付</Button>
          <Button size="sm" variant="destructive" onClick={() => toast.info("已进入退款流程")}><Undo2 className="mr-1 h-4 w-4" />退款</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="font-mono text-xl font-semibold">{order.id}</h1>
        <Badge>{STATUS_LABEL[order.status]}</Badge>
        <Badge variant="outline">{CHANNEL_LABEL[order.channel]}</Badge>
        <span className="text-xs text-muted-foreground">下单于 {order.createdAt}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="mb-2 text-sm font-semibold">商品明细</div>
          <div className="divide-y divide-border">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <img src={it.product.images[0]} alt={it.product.name} className="h-16 w-16 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{it.product.name}</div>
                  <div className="text-xs text-muted-foreground">{it.product.internalCode} · {it.color} / {it.size}</div>
                </div>
                <div className="text-right text-sm">
                  <div>×{it.qty}</div>
                  <div className="text-xs text-muted-foreground">{formatKRW(it.product.priceKRW)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            <Row label="韩币合计" value={formatKRW(order.totalKRW)} />
            {order.snapshotRate && <Row label="锁定汇率" value={String(order.snapshotRate)} />}
            {order.totalCNY && <Row label="人民币应付" value={formatCNY(order.totalCNY)} bold />}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">买手 / 收货</div>
            <div className="space-y-1 text-sm">
              <div>{order.buyer.name} · {order.buyer.phone}</div>
              <div className="text-xs text-muted-foreground">{order.buyer.address}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">收款账号</div>
            <div className="text-sm">{order.paymentAccount.name} · {order.paymentAccount.holder}</div>
            <div className="mt-1 text-xs text-muted-foreground">渠道：{order.paymentAccount.channel === "wechat" ? "微信" : "支付宝"}</div>
          </Card>
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">凭证</div>
            <div className="grid grid-cols-2 gap-2">
              {order.paymentProofUrl && (
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">支付凭证</div>
                  <img src={order.paymentProofUrl} className="w-full rounded border border-border object-cover" alt="proof" />
                </div>
              )}
              {order.receiptUrl && (
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">韩币小票</div>
                  <img src={order.receiptUrl} className="w-full rounded border border-border object-cover" alt="receipt" />
                </div>
              )}
              {!order.paymentProofUrl && !order.receiptUrl && <div className="text-xs text-muted-foreground">暂无凭证</div>}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-2 text-sm font-semibold">状态时间线</div>
          {events.length === 0 && <div className="text-xs text-muted-foreground">暂无物流事件</div>}
          <ol className="space-y-2">
            {events.map((e, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <div>{e.node}</div>
                  <div className="text-xs text-muted-foreground">{e.time}{e.note ? ` · ${e.note}` : ""}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>
        <Card className="p-4">
          <div className="mb-2 text-sm font-semibold">运营备注</div>
          <Textarea placeholder="内部备注，仅后台可见…" className="min-h-24" />
          <div className="mt-2 text-right">
            <Button size="sm" onClick={() => toast.success("备注已保存")}>保存备注</Button>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-semibold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}