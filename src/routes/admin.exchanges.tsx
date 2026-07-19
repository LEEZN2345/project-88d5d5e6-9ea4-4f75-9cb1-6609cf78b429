import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EXCHANGES,
  EXCHANGE_STATUS_LABEL,
  EXCHANGE_REASON_LABEL,
  EXCHANGE_WAREHOUSE,
  type ExchangeStatus,
} from "@/lib/mock-data";
import { PackageCheck, Warehouse, Plane } from "lucide-react";

export const Route = createFileRoute("/admin/exchanges")({
  head: () => ({ meta: [{ title: "售后换货 · 运营后台" }] }),
  component: AdminExchanges,
});

const VARIANT: Record<ExchangeStatus, "default" | "secondary" | "outline" | "destructive"> = {
  applied: "destructive",
  approved_wait_ship: "default",
  cn_received: "default",
  forwarded_kr: "default",
  kr_received: "default",
  shop_exchanging: "default",
  awaiting_return_fee: "destructive",
  return_fee_paid: "default",
  reshipped: "secondary",
  completed: "secondary",
  rejected: "outline",
};

const TABS: { key: "all" | ExchangeStatus; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "applied", label: "待审核" },
  { key: "approved_wait_ship", label: "待寄回" },
  { key: "cn_received", label: "集运仓已签收" },
  { key: "forwarded_kr", label: "转寄韩国" },
  { key: "kr_received", label: "韩国已签收" },
  { key: "shop_exchanging", label: "档口交换中" },
  { key: "awaiting_return_fee", label: "待补运费" },
  { key: "return_fee_paid", label: "运费已收待发货" },
  { key: "reshipped", label: "已重发" },
  { key: "completed", label: "已完成" },
  { key: "rejected", label: "已驳回" },
];

function AdminExchanges() {
  return (
    <AdminShell>
      <h1 className="mb-1 text-xl font-semibold">售后换货</h1>
      <p className="mb-4 text-xs text-muted-foreground">
        平台仅支持换货，不支持退货。买家寄回国内集运仓 → 平台转寄韩国 → 档口配货 → 重新发出。
      </p>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard icon={<PackageCheck className="h-4 w-4" />} label="待审核 / 待寄回" value="2" tone="rose" />
        <StatCard icon={<Warehouse className="h-4 w-4" />} label="集运仓在库" value="1" tone="amber" />
        <StatCard icon={<Plane className="h-4 w-4" />} label="转寄韩国在途" value="0" tone="sky" />
      </div>

      <Card className="mb-4 border-dashed p-4 text-xs">
        <div className="mb-1 flex items-center gap-2 text-sm font-medium">
          <Warehouse className="h-4 w-4" /> 国内集运仓（供买家寄回）
        </div>
        <div className="grid gap-1 text-muted-foreground md:grid-cols-2">
          <div>收件方：{EXCHANGE_WAREHOUSE.name}</div>
          <div>联系电话：{EXCHANGE_WAREHOUSE.contact}</div>
          <div className="md:col-span-2">地址：{EXCHANGE_WAREHOUSE.address}</div>
          <div>邮编：{EXCHANGE_WAREHOUSE.zip}</div>
          <div>签收时段：{EXCHANGE_WAREHOUSE.hours}</div>
        </div>
      </Card>

      <div className="mb-3 flex gap-2 overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
              i === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>工单号</Th>
              <Th>关联订单</Th>
              <Th>商品</Th>
              <Th>换货明细</Th>
              <Th>原因</Th>
              <Th>状态</Th>
              <Th>提交时间</Th>
              <Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {EXCHANGES.map((e) => (
              <tr key={e.id} className="border-t border-border align-top">
                <Td className="font-mono text-xs">{e.id}</Td>
                <Td className="font-mono text-xs">{e.orderId}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <img src={e.item.image} alt="" className="h-10 w-10 rounded object-cover" />
                    <div className="max-w-[160px] truncate text-xs">{e.item.productName}</div>
                  </div>
                </Td>
                <Td className="text-xs">
                  <div className="text-muted-foreground line-through">
                    {e.item.fromColor} / {e.item.fromSize}
                  </div>
                  <div className="font-medium">
                    {e.item.toColor} / {e.item.toSize} ×{e.item.qty}
                  </div>
                </Td>
                <Td className="text-xs">{EXCHANGE_REASON_LABEL[e.reason]}</Td>
                <Td>
                  <Badge variant={VARIANT[e.status]}>{EXCHANGE_STATUS_LABEL[e.status]}</Badge>
                </Td>
                <Td className="text-xs">{e.createdAt}</Td>
                <Td>
                  <Link to="/admin/exchanges/$id" params={{ id: e.id }}>
                    <Button size="sm" variant="outline">
                      处理
                    </Button>
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">工单节点</div>
        待审核 → 通过(通知寄回) → 集运仓签收 → 转寄韩国批次 → 韩国档口签收 → 档口配货 → 重新发出 → 完成。任一节点驳回需填写理由。
      </Card>
    </AdminShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "rose" | "amber" | "sky";
}) {
  const toneCls =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-600 dark:bg-rose-950/30"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30"
      : "border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-950/30";
  return (
    <Card className={`p-3 ${toneCls}`}>
      <div className="flex items-center gap-2 text-xs">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-3 py-2 text-left font-medium">{children}</th>
);
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-3 py-2 ${className}`}>{children}</td>
);