import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Crown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/membership")({
  head: () => ({ meta: [{ title: "会员等级 · 运营后台" }] }),
  component: AdminMembership,
});

const TIERS = [
  { key: "bronze", cn: "青铜", threshold: 0, mult: 1.0, ship: 300, count: 8421, color: "bg-amber-700/80" },
  { key: "silver", cn: "白银", threshold: 2000, mult: 1.2, ship: 200, count: 1284, color: "bg-slate-400" },
  { key: "gold", cn: "黄金", threshold: 10000, mult: 1.5, ship: 100, count: 356, color: "bg-amber-400" },
  { key: "diamond", cn: "钻石", threshold: 100000, mult: 2.0, ship: 0, count: 42, color: "bg-cyan-400" },
];

function AdminMembership() {
  const total = TIERS.reduce((s, t) => s + t.count, 0);
  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">会员等级</h1>
          <p className="text-xs text-muted-foreground">按近 12 个月累计消费自动升降级。每日凌晨定时任务重算，降级只降一级不归零。</p>
        </div>
        <Button size="sm" onClick={() => toast.success("等级配置已保存")}><Save className="mr-1 h-4 w-4" />保存</Button>
      </div>

      {/* 用户分布 */}
      <Card className="mb-4 p-4">
        <div className="mb-2 text-sm font-medium">用户等级分布（{total.toLocaleString()} 人）</div>
        <div className="flex h-6 overflow-hidden rounded-full">
          {TIERS.map((t) => (
            <div key={t.key} className={t.color} style={{ width: `${(t.count / total) * 100}%` }} title={`${t.cn} ${t.count}`} />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
          {TIERS.map((t) => (
            <div key={t.key} className="rounded-lg border border-border p-2">
              <div className="flex items-center gap-1"><span className={`inline-block h-2 w-2 rounded-full ${t.color}`} />{t.cn}</div>
              <div className="mt-1 text-lg font-semibold tabular-nums">{t.count.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">{((t.count / total) * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 权益配置表 */}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-xs">
            <tr>
              <th className="p-3 text-left">等级</th>
              <th className="p-3 text-left">升级门槛（近 12 月累计消费）</th>
              <th className="p-3 text-left">积分加速</th>
              <th className="p-3 text-left">包邮门槛</th>
              <th className="p-3 text-left">保级规则</th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((t) => (
              <tr key={t.key} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-white ${t.color}`}><Crown className="h-3.5 w-3.5" /></div>
                    <div className="font-medium">{t.cn}</div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    ¥<Input type="number" defaultValue={t.threshold} className="max-w-[120px]" />
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Input type="number" step="0.1" defaultValue={t.mult} className="max-w-[80px]" />x
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    满 ¥<Input type="number" defaultValue={t.ship} className="max-w-[100px]" />
                  </div>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {t.key === "bronze" ? "无需保级" : "达标保级 · 不达标降 1 级"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">等级计算</div>
          <Field label="统计窗口" defaultValue="近 12 个月" />
          <Field label="计算触发" defaultValue="每日 03:00" />
          <Field label="等级有效期" defaultValue="1 年" />
        </Card>
        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">运营提醒</div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>• 升级触发即时推送 + 站内信 + 微信模板消息</div>
            <div>• 降级前 15 天预警："还差 ¥X 可保级"</div>
            <div>• 生日月享额外 10% 积分加成（可配）</div>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <Label className="text-xs">{label}</Label>
      <Input defaultValue={defaultValue} className="max-w-[180px]" />
    </div>
  );
}