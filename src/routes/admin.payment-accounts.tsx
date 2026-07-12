import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { MERCHANT_ACCOUNTS, formatCNY } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/payment-accounts")({
  head: () => ({ meta: [{ title: "商户号管理 · 运营后台" }] }),
  component: PaymentAccounts,
});

function PaymentAccounts() {
  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">商户号管理</h1>
          <p className="text-xs text-muted-foreground">在线支付统一走商户号回调，自动入账。开关在「汇率与配置 · 买手端支付方式」。</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />接入商户号</Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>渠道</Th><Th>商户名</Th><Th>商户号</Th><Th>结算账户</Th><Th>今日入账</Th><Th>日告警阈值</Th><Th>状态</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {MERCHANT_ACCOUNTS.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <Td><Badge variant={m.channel === "wechat" ? "default" : "secondary"}>{m.channel === "wechat" ? "微信" : "支付宝"}</Badge></Td>
                <Td>{m.merchantName}</Td>
                <Td className="font-mono text-xs">{m.mchId}</Td>
                <Td className="text-xs">{m.settleBank}</Td>
                <Td>{formatCNY(m.todayReceived)}</Td>
                <Td>{formatCNY(m.dailyAlert)}</Td>
                <Td><Badge variant={m.status === "active" ? "default" : "outline"}>{m.status === "active" ? "启用" : "停用"}</Badge></Td>
                <Td>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">编辑</Button>
                    <Button size="sm" variant="ghost">{m.status === "active" ? "停用" : "启用"}</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">入账规则</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>买手在收银台选择微信 / 支付宝支付，由对应商户号收单，回调后订单自动进入「待代付」。</li>
          <li>单日入账超过告警阈值将触发短信提醒运营。</li>
          <li>接入 / 停启用变更写入配置日志，可审计。</li>
        </ul>
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;