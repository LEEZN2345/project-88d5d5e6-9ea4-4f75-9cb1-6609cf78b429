import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { PAYMENT_ACCOUNTS, formatCNY } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/payment-accounts")({
  head: () => ({ meta: [{ title: "收款账户管理 · 运营后台" }] }),
  component: PaymentAccounts,
});

function PaymentAccounts() {
  const allFull = PAYMENT_ACCOUNTS.filter((a) => a.status === "active").every(
    (a) => a.todayReceived >= a.dailyLimit,
  );
  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">收款账户管理</h1>
          <p className="text-xs text-muted-foreground">下单按「剩余额度最大」自动分配;达上限自动切换。全部超限时短信告警运营。</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />新增账户</Button>
      </div>

      {allFull && (
        <Card className="mb-4 border-rose-500/40 bg-rose-50 p-3 text-sm dark:bg-rose-950/30">
          <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4 text-rose-500" />全部账户已达每日上限</div>
          <div className="mt-1 text-xs text-muted-foreground">已通过短信通知运营管理员。新订单将进入「等待收款账户」状态。</div>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>渠道</Th><Th>户主</Th><Th>二维码</Th><Th>日上限</Th><Th>今日已收</Th><Th>剩余额度</Th><Th>状态</Th><Th>最近使用</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {PAYMENT_ACCOUNTS.map((a) => {
              const remain = a.dailyLimit - a.todayReceived;
              const full = remain <= 0;
              return (
                <tr key={a.id} className="border-t border-border">
                  <Td><Badge variant={a.channel === "wechat" ? "default" : "secondary"}>{a.channel === "wechat" ? "微信" : "支付宝"}</Badge></Td>
                  <Td>{a.holder}</Td>
                  <Td><img src={a.qrUrl} className="h-10 w-10 rounded" alt="" /></Td>
                  <Td>{formatCNY(a.dailyLimit)}</Td>
                  <Td>{formatCNY(a.todayReceived)}</Td>
                  <Td className={full ? "text-rose-500" : ""}>{formatCNY(Math.max(0, remain))}</Td>
                  <Td><Badge variant={a.status === "active" ? "default" : "outline"}>{a.status === "active" ? (full ? "已满" : "启用") : "停用"}</Badge></Td>
                  <Td className="text-xs text-muted-foreground">{a.lastUsedAt ?? "—"}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">编辑</Button>
                      <Button size="sm" variant="ghost">{a.status === "active" ? "停用" : "启用"}</Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">分配规则</div>
        <ol className="mt-1 list-decimal space-y-1 pl-4">
          <li>过滤:状态=启用 且 (今日已收 + 订单金额) ≤ 日上限</li>
          <li>排序:按「剩余额度最大」选取</li>
          <li>若无可用账户 → 订单进入「等待收款账户」状态,触发短信告警</li>
          <li>所有变更(新增/停启用/上限调整)写入限额变更历史,可审计</li>
        </ol>
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;