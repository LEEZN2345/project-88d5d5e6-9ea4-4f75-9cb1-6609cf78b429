import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { ORDERS, STATUS_LABEL, formatKRW, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Truck, Receipt, Wallet, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetail,
  notFoundComponent: () => <MobileShell><div className="p-8 text-center text-sm">订单不存在</div></MobileShell>,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const o = ORDERS.find((x) => x.id === id);
  if (!o) throw notFound();

  return (
    <MobileShell>
      <MobileHeader title="订单详情" back />
      <div className="bg-primary px-4 py-5 text-primary-foreground">
        <Badge variant="secondary" className="mb-2">{STATUS_LABEL[o.status]}</Badge>
        <div className="text-xs opacity-80">{o.id} · {o.createdAt}</div>
      </div>

      {o.status === "pending_payment" && (
        <div className="mx-4 mt-3 rounded-xl border border-rose-500/30 bg-rose-50 p-3 dark:bg-rose-950/30">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="h-4 w-4" /> 请向以下账户付款 {formatKRW(o.totalKRW)}(参考)
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-24 w-24 items-center justify-center rounded-md bg-background text-[10px] text-muted-foreground">收款二维码</div>
            <div className="text-xs">
              <div>渠道:{o.paymentAccount.channel === "wechat" ? "微信" : "支付宝"}</div>
              <div>户主:{o.paymentAccount.holder}</div>
              <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                账户:{o.paymentAccount.name} <Copy className="h-3 w-3" />
              </div>
            </div>
          </div>
          <Button size="sm" className="mt-3 w-full">上传付款凭证截图</Button>
          <div className="mt-1 text-[11px] text-muted-foreground">付款后请上传截图,平台审核后代付韩币并锁定汇率。</div>
        </div>
      )}

      {o.snapshotRate && (
        <div className="mx-4 mt-3 rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-sm font-medium"><Receipt className="h-4 w-4" /> 汇率快照(平台代付时锁定)</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <Cell label="韩币总额" value={formatKRW(o.totalKRW)} />
            <Cell label="锁定汇率" value={`1 KRW = ${o.snapshotRate}`} />
            <Cell label="人民币" value={formatCNY(o.totalCNY!)} highlight />
          </div>
          <div className="mt-3 flex gap-2">
            {o.paymentProofUrl && <ProofThumb label="付款凭证" url={o.paymentProofUrl} />}
            {o.receiptUrl && <ProofThumb label="韩币小票" url={o.receiptUrl} />}
          </div>
        </div>
      )}

      <div className="mx-4 mt-3 rounded-xl border border-border bg-card p-3">
        <div className="text-sm font-medium">商品 ({o.items.length})</div>
        <div className="mt-2 space-y-3">
          {o.items.map((i) => (
            <div key={i.product.id} className="flex gap-3">
              <img src={i.product.images[0]} className="h-16 w-16 rounded-md object-cover" alt="" />
              <div className="flex flex-1 flex-col">
                <div className="line-clamp-2 text-xs">{i.product.name}</div>
                <div className="text-[10px] text-muted-foreground">{i.color} / {i.size} · {i.product.internalCode}</div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs">{formatKRW(i.product.priceKRW)} × {i.qty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {o.logisticsNo && (
        <Link to="/logistics/$id" params={{ id: o.logisticsNo }} className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 text-sm">
            <div className="font-medium">物流跟踪</div>
            <div className="text-xs text-muted-foreground">{o.logisticsNo}</div>
          </div>
          <span className="text-xs text-muted-foreground">查看 →</span>
        </Link>
      )}

      {o.status === "delivered" && (
        <Link
          to="/orders/$id/exchange"
          params={{ id: o.id }}
          className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 dark:bg-rose-950/30"
        >
          <RefreshCcw className="h-4 w-4 text-rose-600" />
          <div className="flex-1 text-sm">
            <div className="font-medium text-rose-700 dark:text-rose-300">申请换货</div>
            <div className="text-xs text-rose-600/80 dark:text-rose-400">
              签收 7 天内可申请 · 平台仅支持换货，不支持退货
            </div>
          </div>
          <span className="text-xs text-rose-600">前往 →</span>
        </Link>
      )}

      <div className="mx-4 mt-3 mb-6 rounded-xl border border-border bg-card p-3 text-xs">
        <Row k="实收账户" v={`${o.paymentAccount.name} · ${o.paymentAccount.holder}`} />
        <Row k="支付渠道" v={o.paymentAccount.channel === "wechat" ? "微信" : "支付宝"} />
        <Row k="下单时间" v={o.createdAt} />
      </div>
    </MobileShell>
  );
}

function Cell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-md bg-muted/50 p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-sm ${highlight ? "font-semibold text-primary" : ""}`}>{value}</div>
    </div>
  );
}
function ProofThumb({ label, url }: { label: string; url: string }) {
  return (
    <div className="text-center">
      <img src={url} className="h-16 w-16 rounded-md object-cover" alt={label} />
      <div className="mt-1 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border py-1 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}