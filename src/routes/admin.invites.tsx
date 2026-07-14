import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/invites")({
  head: () => ({ meta: [{ title: "邀请管理 · 运营后台" }] }),
  component: AdminInvites,
});

type Row = {
  id: string;
  inviter: string;
  code: string;
  inviteeCount: number;
  validCount: number;
  pointsEarned: number;
  createdAt: string;
};

const MOCK: Row[] = [
  { id: "IV001", inviter: "陈** (U1005)", code: "DDT-CHEN01", inviteeCount: 12, validCount: 6, pointsEarned: 3000, createdAt: "2024-03-15" },
  { id: "IV002", inviter: "Molly档口 (U1003)", code: "DDT-MOLLY", inviteeCount: 20, validCount: 8, pointsEarned: 4000, createdAt: "2024-05-20" },
  { id: "IV003", inviter: "买手-Nana (U1005)", code: "DDT-NANA88", inviteeCount: 3, validCount: 0, pointsEarned: 0, createdAt: "2026-06-01" },
];

function AdminInvites() {
  const totalInvitees = MOCK.reduce((s, r) => s + r.inviteeCount, 0);
  const totalValid = MOCK.reduce((s, r) => s + r.validCount, 0);
  const totalPoints = MOCK.reduce((s, r) => s + r.pointsEarned, 0);
  const rate = Math.round((totalValid / totalInvitees) * 100);

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">邀请管理</h1>
          <p className="text-xs text-muted-foreground">管理邀请码、追踪邀请转化，发放积分奖励规则见「积分规则」。</p>
        </div>
        <Button size="sm" onClick={() => toast.info("生成新邀请码")}><Plus className="mr-1 h-4 w-4" />生成邀请码</Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="邀请码总数" value={String(MOCK.length)} />
        <Stat label="累计被邀" value={String(totalInvitees)} />
        <Stat label="有效邀请" value={String(totalValid)} />
        <Stat label="转化率" value={`${rate}%`} />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="搜索邀请码 / 邀请人" className="w-64 pl-7" />
          </div>
          <Button size="sm" variant="outline">全部</Button>
          <Button size="sm" variant="outline">高转化</Button>
          <Button size="sm" variant="outline">近 30 天新增</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>工单号</Th><Th>邀请人</Th><Th>邀请码</Th><Th>被邀人数</Th><Th>有效数</Th><Th>累计积分</Th><Th>创建时间</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {MOCK.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <Td className="font-mono text-xs">{r.id}</Td>
                  <Td>{r.inviter}</Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.code}</code>
                      <button className="text-muted-foreground hover:text-foreground" onClick={() => { navigator.clipboard.writeText(r.code); toast.success("已复制"); }}>
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </Td>
                  <Td>{r.inviteeCount}</Td>
                  <Td><Badge variant={r.validCount > 0 ? "default" : "outline"}>{r.validCount}</Badge></Td>
                  <Td>{r.pointsEarned.toLocaleString()}</Td>
                  <Td className="text-xs">{r.createdAt}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">邀请记录</Button>
                      <Button size="sm" variant="ghost">失效</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">「有效邀请」定义</div>
        被邀人完成首单支付且 15 天内无全额退款，即计为一个有效邀请，奖励积分按「积分规则」发放。
      </Card>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;