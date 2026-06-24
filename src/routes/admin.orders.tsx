import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { ORDERS, STATUS_LABEL, formatKRW, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "订单管理 · 运营后台" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">订单管理</h1>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>订单号</Th><Th>下单时间</Th><Th>件数</Th><Th>韩币</Th><Th>汇率</Th><Th>人民币</Th><Th>收款账户</Th><Th>状态</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <Td className="font-mono text-xs">{o.id}</Td>
                <Td className="text-xs">{o.createdAt}</Td>
                <Td>{o.items.reduce((s, i) => s + i.qty, 0)}</Td>
                <Td>{formatKRW(o.totalKRW)}</Td>
                <Td>{o.snapshotRate ?? "—"}</Td>
                <Td>{o.totalCNY ? formatCNY(o.totalCNY) : "—"}</Td>
                <Td className="text-xs">{o.paymentAccount.name}</Td>
                <Td><Badge>{STATUS_LABEL[o.status]}</Badge></Td>
                <Td>
                  {!o.snapshotRate ? (
                    <Button size="sm">代付 + 锁汇率</Button>
                  ) : (
                    <Button size="sm" variant="outline">查看</Button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        点击「代付 + 锁汇率」会弹窗:上传韩币付款小票图片 → 输入当时实际汇率 → 系统写入 order.snapshot_rate + payment_receipt_url,买手端订单详情立刻显示。
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;