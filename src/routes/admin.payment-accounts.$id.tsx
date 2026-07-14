import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MERCHANT_ACCOUNTS, formatCNY } from "@/lib/mock-data";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payment-accounts/$id")({
  head: () => ({ meta: [{ title: "商户号详情 · 运营后台" }] }),
  component: MerchantDetail,
});

const HISTORY = [
  { date: "2026-07-14", amount: 68420 },
  { date: "2026-07-13", amount: 82150 },
  { date: "2026-07-12", amount: 71200 },
  { date: "2026-07-11", amount: 55880 },
  { date: "2026-07-10", amount: 92040 },
  { date: "2026-07-09", amount: 43920 },
  { date: "2026-07-08", amount: 78600 },
];

function MerchantDetail() {
  const { id } = Route.useParams();
  const m = MERCHANT_ACCOUNTS.find((x) => x.id === id) ?? MERCHANT_ACCOUNTS[0]!;
  const pct = Math.min(100, Math.round((m.todayReceived / m.dailyAlert) * 100));

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/payment-accounts" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回商户号列表
        </Link>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            启用 <Switch defaultChecked={m.status === "active"} />
          </label>
          <Button size="sm" onClick={() => toast.success("已保存")}><Save className="mr-1 h-4 w-4" />保存</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <Badge>{m.channel === "wechat" ? "微信支付" : "支付宝"}</Badge>
        <h1 className="text-xl font-semibold">{m.merchantName}</h1>
        <span className="font-mono text-xs text-muted-foreground">{m.mchId}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">今日入账</div>
          <div className="mt-1 text-3xl font-semibold">{formatCNY(m.todayReceived)}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">告警阈值 {formatCNY(m.dailyAlert)}（{pct}%）</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded bg-muted">
            <div className={`h-full ${pct >= 100 ? "bg-rose-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">本月累计</div>
          <div className="mt-1 text-3xl font-semibold">{formatCNY(HISTORY.reduce((s, x) => s + x.amount, 0))}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">近 7 日展示</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">状态</div>
          <div className="mt-1 text-3xl font-semibold">
            <Badge variant={m.status === "active" ? "default" : "outline"} className="text-base">{m.status === "active" ? "运行中" : "已停用"}</Badge>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 text-sm font-semibold">配置</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">商户名</Label>
              <Input defaultValue={m.merchantName} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">商户号</Label>
              <Input defaultValue={m.mchId} className="mt-1 font-mono" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">结算账户</Label>
              <Input defaultValue={m.settleBank} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">日告警阈值</Label>
              <Input type="number" defaultValue={m.dailyAlert} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">回调 URL</Label>
              <Input defaultValue="https://api.ddt.app/pay/callback" className="mt-1 font-mono text-xs" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">近 7 日入账</div>
          <div className="space-y-2">
            {HISTORY.map((h) => (
              <div key={h.date} className="text-xs">
                <div className="flex justify-between">
                  <span>{h.date}</span>
                  <span className="text-muted-foreground">{formatCNY(h.amount)}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, (h.amount / m.dailyAlert) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}