import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/sign-in")({
  head: () => ({ meta: [{ title: "签到管理 · 运营后台" }] }),
  component: SignIn,
});

type Rule = { day: number; points: number };

const INITIAL_RULES: Rule[] = [
  { day: 1, points: 2 },
  { day: 2, points: 3 },
  { day: 3, points: 5 },
  { day: 7, points: 20 },
  { day: 15, points: 50 },
  { day: 30, points: 200 },
];

const RECORDS = [
  { id: "s1", user: "小李 U1001", date: "2026-07-15", streak: 12, points: 3 },
  { id: "s2", user: "买手Nana U1005", date: "2026-07-15", streak: 45, points: 3 },
  { id: "s3", user: "小李 U1001", date: "2026-07-14", streak: 11, points: 3 },
  { id: "s4", user: "Molly档口 U1003", date: "2026-07-14", streak: 7, points: 20 },
  { id: "s5", user: "买手Nana U1005", date: "2026-07-14", streak: 44, points: 3 },
];

const ANOMALIES = [
  { id: "a1", user: "刷单可疑账号 U1004", type: "跨设备签到", detail: "同账号 3 台设备当日签到", time: "2026-07-15 09:12" },
  { id: "a2", user: "U1099", type: "IP 频繁切换", detail: "近 7 日 12 个不同 IP", time: "2026-07-14 22:01" },
];

function SignIn() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [resetOnBreak, setResetOnBreak] = useState(true);
  const [monthlyBonus, setMonthlyBonus] = useState(500);

  return (
    <AdminShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">签到管理</h1>
        <p className="text-xs text-muted-foreground">配置签到奖励规则、查看签到明细、发现异常账号。</p>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">规则配置</TabsTrigger>
          <TabsTrigger value="records">签到记录</TabsTrigger>
          <TabsTrigger value="anomaly">异常 ({ANOMALIES.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="mb-3 text-sm font-semibold">连续签到奖励表</div>
            <div className="grid gap-2 md:grid-cols-3">
              {rules.map((r, i) => (
                <div key={r.day} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                  <span className="w-14 text-xs text-muted-foreground">第 {r.day} 天</span>
                  <Input
                    type="number"
                    value={r.points}
                    onChange={(e) => {
                      const next = [...rules];
                      next[i] = { ...r, points: Number(e.target.value) };
                      setRules(next);
                    }}
                  />
                  <span className="text-xs text-muted-foreground">积分</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 text-sm font-semibold">其他规则</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div>断签重置连续天数</div>
                  <div className="text-xs text-muted-foreground">关闭后，断签仅暂停累计，不清零</div>
                </div>
                <Switch checked={resetOnBreak} onCheckedChange={setResetOnBreak} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-40">月度全勤额外奖励</span>
                <Input type="number" value={monthlyBonus} onChange={(e) => setMonthlyBonus(Number(e.target.value))} className="w-40" />
                <span className="text-xs text-muted-foreground">积分</span>
              </div>
            </div>
            <div className="mt-4 text-right">
              <Button onClick={() => toast.success("规则已保存")}>保存规则</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="mt-4">
          <Card className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Input placeholder="搜索用户 / ID" className="max-w-xs" />
              <Input type="date" className="max-w-40" />
              <Button size="sm" variant="outline">导出</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr><Th>用户</Th><Th>签到日</Th><Th>连续天数</Th><Th>获得积分</Th></tr>
                </thead>
                <tbody>
                  {RECORDS.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <Td>{r.user}</Td>
                      <Td className="text-xs">{r.date}</Td>
                      <Td>{r.streak} 天</Td>
                      <Td className="text-emerald-600">+{r.points}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="anomaly" className="mt-4">
          <Card className="p-4">
            <div className="space-y-2">
              {ANOMALIES.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{a.user}</span>
                      <Badge variant="destructive">{a.type}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{a.detail} · {a.time}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.warning("已冻结该账号签到功能")}>冻结签到</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;