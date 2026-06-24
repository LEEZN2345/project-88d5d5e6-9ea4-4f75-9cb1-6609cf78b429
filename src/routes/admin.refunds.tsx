import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { REFUNDS, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/admin/refunds")({
  head: () => ({ meta: [{ title: "退款工单 · 运营后台" }] }),
  component: AdminRefunds,
});

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  cs_pending: { label: "待客服提单", variant: "destructive" },
  finance_pending: { label: "待财务复核", variant: "default" },
  paid: { label: "已打款", variant: "secondary" },
  rejected: { label: "已驳回", variant: "outline" },
};

function AdminRefunds() {
  return (
    <AdminShell>
      <h1 className="mb-1 text-xl font-semibold">退款工单</h1>
      <p className="mb-4 text-xs text-muted-foreground">两级审核:客服提单 → 财务复核 → 打款。两级操作人分别落库。</p>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>工单号</Th><Th>关联订单</Th><Th>退款金额</Th><Th>原因</Th><Th>客服</Th><Th>财务</Th><Th>提交时间</Th><Th>状态</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {REFUNDS.map((r) => {
              const s = STATUS_BADGE[r.status];
              return (
                <tr key={r.id} className="border-t border-border">
                  <Td className="font-mono text-xs">{r.id}</Td>
                  <Td className="font-mono text-xs">{r.orderId}</Td>
                  <Td className="font-semibold">{formatCNY(r.amountCNY)}</Td>
                  <Td className="max-w-[240px] truncate text-xs">{r.reason}</Td>
                  <Td className="text-xs">{r.csUser ?? "—"}</Td>
                  <Td className="text-xs">{r.financeUser ?? "—"}</Td>
                  <Td className="text-xs">{r.createdAt}</Td>
                  <Td>{s && <Badge variant={s.variant}>{s.label}</Badge>}</Td>
                  <Td>
                    {r.status === "cs_pending" && <Button size="sm">客服提单</Button>}
                    {r.status === "finance_pending" && (
                      <div className="flex gap-1">
                        <Button size="sm">复核打款</Button>
                        <Button size="sm" variant="outline">驳回</Button>
                      </div>
                    )}
                    {(r.status === "paid" || r.status === "rejected") && <Button size="sm" variant="ghost">查看</Button>}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">退款必填字段</div>
        退款金额(CNY) / 退款账户(微信/支付宝) / 退款流水号 / 回执截图 / 两级操作人(自动记录登录账号)。
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;