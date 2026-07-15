import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCSV } from "@/lib/track";
import { toast } from "sonner";
import { ArrowUpRight, ArrowDownRight, Download } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "运营看板 · 运营后台" }] }),
  component: Analytics,
});

const PRODUCTS = [
  { rank: 1, name: "复古格纹半身裙", shop: "Molly女装", qty: 128, gmv: 41984 },
  { rank: 2, name: "韩系针织开衫", shop: "doota-2F-A41", qty: 96, gmv: 28800 },
  { rank: 3, name: "小香风外套", shop: "migliore-B1", qty: 82, gmv: 65600 },
  { rank: 4, name: "白色棉质T恤", shop: "apm-3F", qty: 74, gmv: 8880 },
  { rank: 5, name: "宽松工装裤", shop: "doota-2F-A41", qty: 61, gmv: 24400 },
];

const SHOPS = [
  { rank: 1, name: "Molly女装", building: "doota", gmv: 128400, orders: 342 },
  { rank: 2, name: "韩姐女装", building: "migliore", gmv: 96800, orders: 218 },
  { rank: 3, name: "Nana Studio", building: "apm", gmv: 78200, orders: 195 },
  { rank: 4, name: "东大门直营", building: "doota", gmv: 65400, orders: 168 },
];

const USERS = [
  { rank: 1, nick: "小李", phone: "138****2311", level: "钻石", spend: 24800, orders: 42 },
  { rank: 2, nick: "买手-Nana", phone: "158****3333", level: "黄金", spend: 18600, orders: 31 },
  { rank: 3, nick: "韩姐女装", phone: "139****8877", level: "白银", spend: 12400, orders: 22 },
];

const INVITES = [
  { rank: 1, nick: "买手-Nana", phone: "158****3333", invited: 24, valid: 18 },
  { rank: 2, nick: "小李", phone: "138****2311", invited: 12, valid: 6 },
];

function Analytics() {
  const [range, setRange] = useState("7d");

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">运营看板</h1>
          <p className="text-xs text-muted-foreground">核心指标、排行榜、导出。数据源：埋点事件 + 订单快照。</p>
        </div>
        <div className="flex gap-1">
          {[
            { k: "today", label: "今日" },
            { k: "yesterday", label: "昨日" },
            { k: "7d", label: "近 7 日" },
            { k: "30d", label: "近 30 日" },
          ].map((r) => (
            <Button key={r.k} size="sm" variant={range === r.k ? "default" : "outline"} onClick={() => setRange(r.k)}>
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="GMV" value="¥328,400" delta={12.4} />
        <Metric label="订单数" value="1,284" delta={8.1} />
        <Metric label="支付用户数" value="612" delta={-2.3} />
        <Metric label="客单价" value="¥256" delta={4.7} />
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">商品销量 Top</TabsTrigger>
          <TabsTrigger value="shops">档口成交额 Top</TabsTrigger>
          <TabsTrigger value="users">用户消费 Top</TabsTrigger>
          <TabsTrigger value="invites">邀请拉新 Top</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <RankCard
            title="商品销量 Top 20"
            columns={["排名", "商品", "档口", "销量", "GMV"]}
            rows={PRODUCTS.map((p) => [String(p.rank), p.name, p.shop, `${p.qty} 件`, `¥${p.gmv.toLocaleString()}`])}
            onExport={() => {
              downloadCSV(`商品销量Top_${range}.csv`, PRODUCTS);
              toast.success("已导出 CSV");
            }}
          />
        </TabsContent>
        <TabsContent value="shops" className="mt-4">
          <RankCard
            title="档口成交额 Top 20"
            columns={["排名", "档口", "商圈", "GMV", "订单"]}
            rows={SHOPS.map((s) => [String(s.rank), s.name, s.building, `¥${s.gmv.toLocaleString()}`, String(s.orders)])}
            onExport={() => {
              downloadCSV(`档口成交_${range}.csv`, SHOPS);
              toast.success("已导出 CSV");
            }}
          />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <RankCard
            title="用户消费 Top 20"
            columns={["排名", "昵称", "手机", "等级", "消费", "订单"]}
            rows={USERS.map((u) => [String(u.rank), u.nick, u.phone, u.level, `¥${u.spend.toLocaleString()}`, String(u.orders)])}
            onExport={() => {
              downloadCSV(`用户消费_${range}.csv`, USERS);
              toast.success("已导出 CSV");
            }}
          />
        </TabsContent>
        <TabsContent value="invites" className="mt-4">
          <RankCard
            title="邀请拉新 Top 20"
            columns={["排名", "昵称", "手机", "邀请数", "有效数"]}
            rows={INVITES.map((i) => [String(i.rank), i.nick, i.phone, String(i.invited), String(i.valid)])}
            onExport={() => {
              downloadCSV(`邀请拉新_${range}.csv`, INVITES);
              toast.success("已导出 CSV");
            }}
          />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

function Metric({ label, value, delta }: { label: string; value: string; delta: number }) {
  const up = delta >= 0;
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className={`mt-1 flex items-center gap-1 text-xs ${up ? "text-emerald-600" : "text-rose-500"}`}>
        {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(delta)}% 环比
      </div>
    </Card>
  );
}

function RankCard({
  title,
  columns,
  rows,
  onExport,
}: {
  title: string;
  columns: string[];
  rows: string[][];
  onExport: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <Button size="sm" variant="outline" onClick={onExport}>
          <Download className="mr-1 h-3 w-3" />导出 CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>{columns.map((c) => <th key={c} className="px-3 py-2 text-left font-medium">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-border">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2">
                    {j === 0 ? <Badge variant={i < 3 ? "default" : "outline"}>{cell}</Badge> : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}