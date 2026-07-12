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
  // Demo: 前 1/3 走在线支付，其余走转账制
  const payChannelOf = (idx: number): { label: string; kind: "online" | "transfer" } =>
    idx % 3 === 0
      ? { label: "微信 · 在线", kind: "online" }
      : idx % 3 === 1
        ? { label: "支付宝 · 在线", kind: "online" }
        : { label: "转账 · 待核验", kind: "transfer" };
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">订单管理</h1>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>订单号</Th><Th>下单时间</Th><Th>件数</Th><Th>韩币</Th><Th>锁定汇率</Th><Th>人民币</Th><Th>支付渠道</Th><Th>收款账户</Th><Th>状态</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o, i) => {
              const pc = payChannelOf(i);
              return (
              <tr key={o.id} className="border-t border-border">
                <Td className="font-mono text-xs">{o.id}</Td>
                <Td className="text-xs">{o.createdAt}</Td>
                <Td>{o.items.reduce((s, i) => s + i.qty, 0)}</Td>
                <Td>{formatKRW(o.totalKRW)}</Td>
                <Td className="text-xs">
                  {o.snapshotRate ? (
                    <span className="font-mono">{o.snapshotRate}</span>
                  ) : (
                    <span className="text-muted-foreground">待支付</span>
                  )}
                </Td>
                <Td>{o.totalCNY ? formatCNY(o.totalCNY) : "—"}</Td>
                <Td className="text-xs">
                  <Badge variant={pc.kind === "online" ? "default" : "outline"}>{pc.label}</Badge>
                </Td>
                <Td className="text-xs">{o.paymentAccount.name}</Td>
                <Td><Badge>{STATUS_LABEL[o.status]}</Badge></Td>
                <Td>
                  <div className="flex gap-1">
                    {pc.kind === "transfer" && !o.snapshotRate && (
                      <Button size="sm" variant="outline">核验小票</Button>
                    )}
                    {o.snapshotRate && !o.receiptUrl && (
                      <Button size="sm">标记已代付</Button>
                    )}
                    <Button size="sm" variant="ghost">查看</Button>
                  </div>
                </Td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">两种支付通道并存</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li><b>在线支付</b>（微信/支付宝商户号）：支付回调自动写入订单，无需人工核验，直接进入待代付。</li>
          <li><b>转账支付</b>（多账户轮询）：买手上传付款小票 → 客服「核验小票」通过 → 进入待代付。</li>
          <li><b>锁定汇率</b>已自动化：支付成功时按「汇率与配置」当前生效汇率快照到 order.snapshotRate，人工无需干预。</li>
          <li><b>标记已代付</b>：平台向韩国档口付款后，上传韩币付款小票 + 真实购汇成本（仅用于对账，不影响买手结算金额）。</li>
        </ul>
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;