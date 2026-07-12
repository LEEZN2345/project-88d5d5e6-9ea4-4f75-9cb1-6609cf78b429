import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/points-mall")({
  head: () => ({ meta: [{ title: "积分商城管理 · 运营后台" }] }),
  component: AdminPointsMall,
});

type Zone = "flash" | "starter" | "basic" | "premium";
type Item = {
  id: string;
  name: string;
  zone: Zone;
  points: number;
  originalPoints?: number;
  stock: number;
  status: "on" | "off";
  source: "滞销库存" | "常规";
};

const ZONE_LABEL: Record<Zone, string> = {
  flash: "限时秒杀",
  starter: "上手兑换",
  basic: "打底衫专区",
  premium: "高价值专区",
};

const MOCK: Item[] = [
  { id: "P-001", name: "水钻发夹", zone: "starter", points: 200, stock: 320, status: "on", source: "滞销库存" },
  { id: "P-002", name: "白色纯棉T恤", zone: "basic", points: 1200, stock: 85, status: "on", source: "常规" },
  { id: "P-003", name: "羊毛开衫", zone: "premium", points: 4200, stock: 12, status: "on", source: "滞销库存" },
  { id: "P-004", name: "碎花连衣裙（限时半价）", zone: "flash", points: 1800, originalPoints: 3600, stock: 30, status: "on", source: "滞销库存" },
  { id: "P-005", name: "针织围巾", zone: "starter", points: 500, stock: 0, status: "off", source: "常规" },
];

function AdminPointsMall() {
  const totalStock = MOCK.reduce((s, i) => s + i.stock, 0);
  const onCount = MOCK.filter((i) => i.status === "on").length;

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">积分商城管理</h1>
          <p className="text-xs text-muted-foreground">四大专区兑换商品上下架 + 每月邀请榜奖励发放。</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />上架兑换商品</Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="在架商品" value={String(onCount)} />
        <Stat label="总库存" value={String(totalStock)} />
        <Stat label="本月兑换单" value="128" />
        <Stat label="本月积分消耗" value="264,500" />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input placeholder="搜索商品名 / 编号" className="max-w-xs" />
          <Button size="sm" variant="outline">所有专区</Button>
          <Button size="sm" variant="outline">在架</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>编号</Th><Th>商品</Th><Th>专区</Th><Th>所需积分</Th><Th>库存</Th><Th>来源</Th><Th>状态</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {MOCK.map((i) => (
                <tr key={i.id} className="border-t border-border">
                  <Td className="font-mono text-xs">{i.id}</Td>
                  <Td>{i.name}</Td>
                  <Td className="text-xs"><Badge variant="outline">{ZONE_LABEL[i.zone]}</Badge></Td>
                  <Td>
                    <span className="font-semibold">{i.points.toLocaleString()}</span>
                    {i.originalPoints && <span className="ml-1 text-xs text-muted-foreground line-through">{i.originalPoints.toLocaleString()}</span>}
                  </Td>
                  <Td className={i.stock === 0 ? "text-rose-500" : ""}>{i.stock}</Td>
                  <Td className="text-xs">{i.source === "滞销库存" ? <Badge className="bg-amber-500 text-white">滞销</Badge> : "常规"}</Td>
                  <Td><Badge variant={i.status === "on" ? "default" : "outline"}>{i.status === "on" ? "在架" : "下架"}</Badge></Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">编辑</Button>
                      <Button size="sm" variant="ghost">{i.status === "on" ? "下架" : "上架"}</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <div className="mb-2 text-sm font-semibold">每月邀请榜奖励</div>
        <div className="text-xs text-muted-foreground">前 10 名额外奖励。每月 1 日 00:00 结算上月排名，积分/实物二选一。</div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline">查看本月排行</Button>
          <Button size="sm">发放上月奖励</Button>
        </div>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        兑换订单与常规订单打通，走同一物流通道；用户下单后进入订单模块并标记「积分兑换」。
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