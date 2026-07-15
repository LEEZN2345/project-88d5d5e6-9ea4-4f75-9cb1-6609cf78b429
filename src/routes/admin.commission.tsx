import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Wallet, Clock, TrendingUp, Users, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/commission")({
  head: () => ({ meta: [{ title: "邀请分佣 · 运营后台" }] }),
  component: AdminCommission,
});

function AdminCommission() {
  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">邀请分佣</h1>
          <p className="text-xs text-muted-foreground">二级分佣配置 / 提现审核 / 结算流水。分佣与积分独立记账。</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi icon={Wallet} label="累计已发放" value="¥12,846" tone="text-emerald-600" />
        <Kpi icon={Clock} label="待结算池" value="¥3,204" tone="text-amber-600" />
        <Kpi icon={TrendingUp} label="本月新增邀请" value="184 人" />
        <Kpi icon={Users} label="邀请转化率" value="42.3%" tone="text-blue-600" />
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">分佣规则</TabsTrigger>
          <TabsTrigger value="withdraw">提现审核</TabsTrigger>
          <TabsTrigger value="flow">结算流水</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">一级分佣（直接邀请）</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">好友首单及以后所有订单</p>
                </div>
                <Switch defaultChecked />
              </div>
              <NumberField label="比例" defaultValue={0.7} suffix="% × 订单实付" step="0.1" />
              <NumberField label="单人单日封顶" defaultValue={0} suffix="元（0 不限）" />
            </Card>
            <Card className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">二级分佣（间接邀请）</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">好友邀请的人下单，原邀请人分成</p>
                </div>
                <Switch defaultChecked />
              </div>
              <NumberField label="比例" defaultValue={0.3} suffix="% × 订单实付" step="0.1" />
            </Card>
            <Card className="p-4">
              <div className="mb-3 text-sm font-semibold">结算 & 提现</div>
              <NumberField label="签收后结算等待" defaultValue={14} suffix="天" />
              <NumberField label="提现门槛" defaultValue={10} suffix="元" />
              <NumberField label="提现手续费（用户承担）" defaultValue={0} suffix="%" />
              <div className="mt-2 flex items-center justify-between">
                <Label className="text-xs">提现方式</Label>
                <div className="flex gap-2 text-xs">
                  <label className="flex items-center gap-1"><input type="checkbox" defaultChecked /> 微信零钱</label>
                  <label className="flex items-center gap-1"><input type="checkbox" defaultChecked /> 支付宝</label>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-3 text-sm font-semibold">风控</div>
              <NumberField label="每设备最多绑定账号" defaultValue={1} suffix="个" />
              <NumberField label="同 IP 24h 邀请上限" defaultValue={3} suffix="人" />
              <div className="mt-2 flex items-center justify-between text-xs">
                <Label className="text-xs">提现需实名认证</Label>
                <Switch defaultChecked />
              </div>
            </Card>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => toast.success("分佣规则已保存")}><Save className="mr-1 h-4 w-4" />保存全部</Button>
          </div>
        </TabsContent>

        <TabsContent value="withdraw" className="mt-4">
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs">
                <tr>
                  <th className="p-2 text-left">用户</th>
                  <th className="p-2 text-left">金额</th>
                  <th className="p-2 text-left">方式</th>
                  <th className="p-2 text-left">申请时间</th>
                  <th className="p-2 text-left">状态</th>
                  <th className="p-2 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { u: "@zhou**", a: 30, m: "微信零钱", t: "2026-07-12 10:22", s: "pending" },
                  { u: "@li**", a: 128, m: "支付宝", t: "2026-07-11 18:03", s: "pending" },
                  { u: "@wang**", a: 55, m: "微信零钱", t: "2026-07-10 12:44", s: "paid" },
                ].map((r) => (
                  <tr key={r.u + r.t} className="border-t">
                    <td className="p-2">{r.u}</td>
                    <td className="p-2 font-semibold tabular-nums">¥{r.a}</td>
                    <td className="p-2 text-xs text-muted-foreground">{r.m}</td>
                    <td className="p-2 text-xs text-muted-foreground">{r.t}</td>
                    <td className="p-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] ${r.s === "pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {r.s === "pending" ? "待审核" : "已打款"}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      {r.s === "pending" ? (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => toast.success("已通过并打款")}><Check className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => toast.error("已驳回")}><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="mt-4">
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs">
                <tr>
                  <th className="p-2 text-left">受益人</th>
                  <th className="p-2 text-left">来源用户</th>
                  <th className="p-2 text-left">层级</th>
                  <th className="p-2 text-left">订单 / 说明</th>
                  <th className="p-2 text-left">金额</th>
                  <th className="p-2 text-left">状态</th>
                  <th className="p-2 text-left">时间</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { b: "@zhang**", f: "@wang**", l: "L1", o: "DD26071155 · ¥600", a: "+¥4.20", s: "已结算", t: "2026-07-12" },
                  { b: "@zhang**", f: "@li**", l: "L2", o: "DD26071133 · ¥500", a: "+¥1.50", s: "待结算", t: "2026-07-11" },
                  { b: "@zhang**", f: "@li**", l: "L1", o: "退款冲销 DD26063050", a: "-¥2.10", s: "已结算", t: "2026-06-20" },
                ].map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{r.b}</td>
                    <td className="p-2 text-xs">{r.f}</td>
                    <td className="p-2"><span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{r.l}</span></td>
                    <td className="p-2 text-xs text-muted-foreground">{r.o}</td>
                    <td className={`p-2 font-semibold tabular-nums ${r.a.startsWith("-") ? "text-rose-500" : "text-emerald-600"}`}>{r.a}</td>
                    <td className="p-2 text-xs">{r.s}</td>
                    <td className="p-2 text-xs text-muted-foreground">{r.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Wallet; label: string; value: string; tone?: string }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${tone ?? ""}`}>{value}</div>
    </Card>
  );
}

function NumberField({ label, defaultValue, suffix, step }: { label: string; defaultValue: number; suffix?: string; step?: string }) {
  return (
    <div className="mt-2">
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <Input type="number" step={step} defaultValue={defaultValue} className="max-w-[160px]" />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}