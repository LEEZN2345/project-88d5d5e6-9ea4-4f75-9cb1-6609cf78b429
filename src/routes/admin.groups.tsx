import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users2 } from "lucide-react";

export const Route = createFileRoute("/admin/groups")({
  head: () => ({ meta: [{ title: "拼单管理 · 运营后台" }] }),
  component: AdminGroups,
});

type GroupStatus = "active" | "success" | "failed";
type GroupRow = {
  id: string;
  product: string;
  shop: string;
  target: number;
  joined: number;
  priceKRW: number;
  endsAt: string;
  status: GroupStatus;
  source: "档口滞销库存" | "常规商品";
};

const MOCK: GroupRow[] = [
  { id: "GP2410-001", product: "羊毛混纺西装外套", shop: "THEOT · 3F · 韩姐女装", target: 5, joined: 3, priceKRW: 68000, endsAt: "2026-07-14 20:00", status: "active", source: "档口滞销库存" },
  { id: "GP2410-002", product: "碎花雪纺连衣裙", shop: "APM · 2F · Nana Style", target: 10, joined: 10, priceKRW: 42000, endsAt: "2026-07-11 22:00", status: "success", source: "常规商品" },
  { id: "GP2410-003", product: "针织开衫（米白）", shop: "NUZZON · 4F · Molly", target: 8, joined: 2, priceKRW: 35000, endsAt: "2026-07-10 20:00", status: "failed", source: "档口滞销库存" },
];

const BADGE: Record<GroupStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  active: { label: "进行中", variant: "default" },
  success: { label: "已成团", variant: "secondary" },
  failed: { label: "流团 · 待退款", variant: "destructive" },
};

function AdminGroups() {
  const active = MOCK.filter((g) => g.status === "active").length;
  const success = MOCK.filter((g) => g.status === "success").length;
  const failed = MOCK.filter((g) => g.status === "failed").length;
  const rate = Math.round((success / (success + failed || 1)) * 100);

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">拼单管理</h1>
          <p className="text-xs text-muted-foreground">用档口滞销库存做拼单，成团出货，流团自动退款。</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />创建拼单</Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="进行中" value={String(active)} />
        <Stat label="已成团" value={String(success)} />
        <Stat label="流团待退" value={String(failed)} />
        <Stat label="成团率" value={`${rate}%`} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>拼单号</Th><Th>商品</Th><Th>档口</Th><Th>拼单价</Th><Th>进度</Th><Th>截止</Th><Th>来源</Th><Th>状态</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {MOCK.map((g) => {
              const s = BADGE[g.status];
              const pct = Math.round((g.joined / g.target) * 100);
              return (
                <tr key={g.id} className="border-t border-border">
                  <Td className="font-mono text-xs">{g.id}</Td>
                  <Td className="max-w-[180px] truncate">{g.product}</Td>
                  <Td className="text-xs">{g.shop}</Td>
                  <Td>₩{g.priceKRW.toLocaleString()}</Td>
                  <Td className="text-xs">
                    <div className="flex items-center gap-1"><Users2 className="h-3 w-3" />{g.joined}/{g.target}</div>
                    <div className="mt-1 h-1 w-24 overflow-hidden rounded bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </Td>
                  <Td className="text-xs">{g.endsAt}</Td>
                  <Td className="text-xs">{g.source === "档口滞销库存" ? <Badge variant="outline">滞销库存</Badge> : "常规"}</Td>
                  <Td><Badge variant={s.variant}>{s.label}</Badge></Td>
                  <Td>
                    {g.status === "active" && <Button size="sm" variant="outline">强制关团</Button>}
                    {g.status === "failed" && <Button size="sm">触发退款</Button>}
                    {g.status === "success" && <Button size="sm" variant="ghost">查看订单</Button>}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">规则</div>
        <ol className="mt-1 list-decimal space-y-1 pl-4">
          <li>创建拼单：选商品 → 设成团人数、拼单价、有效期。滞销库存商品自动打「滞销」标签，前端优先曝光。</li>
          <li>成团：达到目标人数后订单自动进入代付流程，走常规履约链路。</li>
          <li>流团：到期未成团 → 一键触发退款工单，进入客服/财务两级审核。</li>
        </ol>
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