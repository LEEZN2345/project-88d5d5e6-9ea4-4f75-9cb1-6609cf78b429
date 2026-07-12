import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { ORDERS, MERCHANT_ACCOUNTS, REFUNDS, formatCNY } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "运营后台 · 概览" }] }),
  component: AdminHome,
});

function AdminHome() {
  const todayReceived = MERCHANT_ACCOUNTS.reduce((s, a) => s + a.todayReceived, 0);
  const csPending = REFUNDS.filter((r) => r.status === "cs_pending").length;
  const finPending = REFUNDS.filter((r) => r.status === "finance_pending").length;
  const pendingProxy = ORDERS.filter((o) => o.status === "paid_pending_proxy" || o.status === "pending_payment").length;

  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">今日概览</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="今日收款" value={formatCNY(todayReceived)} hint="全部商户号合计" />
        <Stat label="待代付订单" value={String(pendingProxy)} hint="平台向档口付款环节" />
        <Stat label="待客服处理退款" value={String(csPending)} />
        <Stat label="待财务复核退款" value={String(finPending)} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-2 text-sm font-semibold">商户号入账</div>
          <div className="space-y-2">
            {MERCHANT_ACCOUNTS.map((a) => {
              const pct = Math.min(100, Math.round((a.todayReceived / a.dailyAlert) * 100));
              return (
                <div key={a.id} className="text-xs">
                  <div className="flex justify-between">
                    <span>{a.channel === "wechat" ? "微信" : "支付宝"} · {a.merchantName}</span>
                    <span className={pct >= 100 ? "text-rose-500" : "text-muted-foreground"}>
                      {formatCNY(a.todayReceived)} / {formatCNY(a.dailyAlert)} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded bg-muted">
                    <div className={`h-full ${pct >= 100 ? "bg-rose-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/admin/payment-accounts" className="mt-3 inline-block text-xs text-primary">管理商户号 →</Link>
        </Card>

        <Card className="p-4">
          <div className="mb-2 text-sm font-semibold">快捷操作</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link to="/admin/orders" className="rounded-md border border-border p-3 hover:bg-accent">订单管理</Link>
            <Link to="/admin/logistics" className="rounded-md border border-border p-3 hover:bg-accent">物流 Excel 上传</Link>
            <Link to="/admin/refunds" className="rounded-md border border-border p-3 hover:bg-accent">退款工单</Link>
            <Link to="/admin/products" className="rounded-md border border-border p-3 hover:bg-accent">商品/档口录入</Link>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </Card>
  );
}