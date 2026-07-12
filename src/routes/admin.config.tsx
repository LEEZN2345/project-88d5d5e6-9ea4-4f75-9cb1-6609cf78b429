import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/config")({
  head: () => ({ meta: [{ title: "汇率与配置 · 运营后台" }] }),
  component: AdminConfig,
});

function AdminConfig() {
  return (
    <AdminShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">汇率与配置中心</h1>
        <p className="text-xs text-muted-foreground">所有平台可调参数集中管理，避免硬编码。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 汇率 */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">东大门实时汇率</div>
            <Badge variant="outline">今日已录入</Badge>
          </div>
          <div className="space-y-3">
            <Field label="今日 KRW → CNY">
              <Input defaultValue="0.00525" className="max-w-[160px]" />
              <span className="text-xs text-muted-foreground">即 1 万韩币 ≈ ¥52.5</span>
            </Field>
            <Field label="展示浮动缓冲">
              <Input defaultValue="1.5" className="max-w-[80px]" />
              <span className="text-xs text-muted-foreground">% · 用于 ≈RMB 展示，避免代付时倒挂</span>
            </Field>
            <Button size="sm">保存今日汇率</Button>
            <div className="mt-2 text-xs text-muted-foreground">近 7 日：0.00521 / 0.00523 / 0.00524 / 0.00522 / 0.00525 / 0.00525 / 0.00525</div>
          </div>
        </Card>

        {/* 运费与服务费 */}
        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">代购服务费 · 国际运费</div>
          <div className="space-y-3">
            <Field label="代购服务费率（普通买手）">
              <Input defaultValue="2.9" className="max-w-[80px]" />
              <span className="text-xs text-muted-foreground">%</span>
            </Field>
            <Field label="服务费封顶（单笔）">
              <Input defaultValue="9000" className="max-w-[120px]" />
              <span className="text-xs text-muted-foreground">CNY</span>
            </Field>
            <Field label="国际运费（¥/kg）">
              <Input defaultValue="42" className="max-w-[80px]" />
            </Field>
            <Field label="首重（kg）">
              <Input defaultValue="1" className="max-w-[80px]" />
            </Field>
            <Button size="sm">保存</Button>
          </div>
        </Card>

        {/* 邀请分销参数（B） */}
        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">实体店（B）邀请分销</div>
          <div className="space-y-3">
            <Field label="有效下线定义（90 天补货 ≥）">
              <Input defaultValue="5000000" className="max-w-[140px]" />
              <span className="text-xs text-muted-foreground">KRW</span>
            </Field>
            <Field label="费率档位">
              <span className="text-xs text-muted-foreground">0→5 人有效：2.9% → 2.5%</span>
            </Field>
            <Field label="滑档窗口">
              <Input defaultValue="90" className="max-w-[80px]" />
              <span className="text-xs text-muted-foreground">天</span>
            </Field>
            <Button size="sm">保存</Button>
          </div>
        </Card>

        {/* 邀请分销参数（C） */}
        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">散客（C）邀请与积分</div>
          <div className="space-y-3">
            <Field label="有效好友门槛（首单 ≥）">
              <Input defaultValue="100" className="max-w-[80px]" />
              <span className="text-xs text-muted-foreground">CNY</span>
            </Field>
            <Field label="返利系数档位">
              <span className="text-xs text-muted-foreground">0→10 人：10% → 15%（封顶）</span>
            </Field>
            <Field label="积分有效期">
              <Input defaultValue="12" className="max-w-[80px]" />
              <span className="text-xs text-muted-foreground">个月</span>
            </Field>
            <Field label="被邀请者首单奖励">
              <Input defaultValue="100" className="max-w-[80px]" />
              <span className="text-xs text-muted-foreground">积分</span>
            </Field>
            <Field label="邀请者一次性奖励">
              <Input defaultValue="50" className="max-w-[80px]" />
              <span className="text-xs text-muted-foreground">积分 / 有效好友</span>
            </Field>
            <Button size="sm">保存</Button>
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        所有变更写入「配置变更日志」（M2 上线权限模块后启用），可审计。
      </Card>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}