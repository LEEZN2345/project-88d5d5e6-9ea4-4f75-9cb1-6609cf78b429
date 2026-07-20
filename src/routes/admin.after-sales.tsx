import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EXCHANGES,
  EXCHANGE_STATUS_LABEL,
  EXCHANGE_REASON_LABEL,
  EXCHANGE_WAREHOUSE,
  REFUNDS,
  formatCNY,
  type ExchangeStatus,
} from "@/lib/mock-data";
import { PackageCheck, Warehouse, Plane, RefreshCcw, Undo2 } from "lucide-react";

export const Route = createFileRoute("/admin/after-sales")({
  head: () => ({ meta: [{ title: "售后管理 · 运营后台" }] }),
  component: AdminAfterSales,
});

type Tab = "exchanges" | "refunds";

function AdminAfterSales() {
  const [tab, setTab] = useState<Tab>("exchanges");
  return (
    <AdminShell>
      <h1 className="mb-1 text-xl font-semibold">售后管理</h1>
      <p className="mb-4 text-xs text-muted-foreground">
        换货与退款工单已合并管理。平台仅支持换货（不支持退货）；退款仅受理「订单断货」与「平台主动联系退款」两类场景。
      </p>

      <div className="mb-4 flex gap-2 border-b border-border">
        <TabBtn active={tab === "exchanges"} onClick={() => setTab("exchanges")} icon={<RefreshCcw className="h-4 w-4" />}>
          售后换货 <span className="ml-1 text-xs text-muted-foreground">({EXCHANGES.length})</span>
        </TabBtn>
        <TabBtn active={tab === "refunds"} onClick={() => setTab("refunds")} icon={<Undo2 className="h-4 w-4" />}>
          退款工单 <span className="ml-1 text-xs text-muted-foreground">({REFUNDS.length})</span>
        </TabBtn>
      </div>

      {tab === "exchanges" ? <ExchangesPanel /> : <RefundsPanel />}
    </AdminShell>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex items-center gap-1 border-b-2 px-3 py-2 text-sm ${
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

/* ================== 换货面板 ================== */

const EX_VARIANT: Record<ExchangeStatus, "default" | "secondary" | "outline" | "destructive"> = {
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

function ExchangesPanel() {
  return (
    <>
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
                  <Badge variant={EX_VARIANT[e.status]}>{EXCHANGE_STATUS_LABEL[e.status]}</Badge>
                </Td>
                <Td className="text-xs">{e.createdAt}</Td>
                <Td>
                  <Link to="/admin/exchanges/$id" params={{ id: e.id }}>
                    <Button size="sm" variant="outline">处理</Button>
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
    </>
  );
}

/* ================== 退款面板 ================== */

const RF_STATUS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  cs_pending: { label: "待客服提单", variant: "destructive" },
  finance_pending: { label: "待财务复核", variant: "default" },
  paid: { label: "已打款", variant: "secondary" },
  rejected: { label: "已驳回", variant: "outline" },
};

const RF_SCENARIO: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  out_of_stock: { label: "订单断货", variant: "destructive" },
  platform_initiated: { label: "平台主动联系", variant: "secondary" },
};

function RefundsPanel() {
  return (
    <>
      <p className="mb-3 text-xs text-destructive">
        平台仅受理两类退款场景：<strong>订单断货</strong> 与 <strong>平台主动联系退款</strong>；不支持买手主观意愿的退款申请。
      </p>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>工单号</Th><Th>关联订单</Th><Th>退款金额</Th><Th>退款场景</Th><Th>原因</Th><Th>客服</Th><Th>财务</Th><Th>提交时间</Th><Th>状态</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {REFUNDS.map((r) => {
              const s = RF_STATUS[r.status];
              const sc = RF_SCENARIO[r.scenario];
              return (
                <tr key={r.id} className="border-t border-border">
                  <Td className="font-mono text-xs">{r.id}</Td>
                  <Td className="font-mono text-xs">{r.orderId}</Td>
                  <Td className="font-semibold">{formatCNY(r.amountCNY)}</Td>
                  <Td>{sc && <Badge variant={sc.variant}>{sc.label}</Badge>}</Td>
                  <Td className="max-w-[240px] truncate text-xs">{r.reason}</Td>
                  <Td className="text-xs">{r.csUser ?? "—"}</Td>
                  <Td className="text-xs">{r.financeUser ?? "—"}</Td>
                  <Td className="text-xs">{r.createdAt}</Td>
                  <Td>{s && <Badge variant={s.variant}>{s.label}</Badge>}</Td>
                  <Td>
                    <Link to="/admin/refunds/$id" params={{ id: r.id }}>
                      <Button size="sm" variant="outline">处理</Button>
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">退款必填字段</div>
        退款场景（订单断货 / 平台主动联系）/ 退款金额(CNY) / 退款账户(微信/支付宝) / 退款流水号 / 回执截图 / 两级操作人(自动记录登录账号)。
      </Card>
    </>
  );
}

/* ================== 复用小组件 ================== */

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