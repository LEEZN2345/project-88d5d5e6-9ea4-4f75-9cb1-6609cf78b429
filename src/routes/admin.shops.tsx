import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { SHOPS, PRODUCTS } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, ImagePlus, Download, Store } from "lucide-react";

export const Route = createFileRoute("/admin/shops")({
  head: () => ({ meta: [{ title: "档口管理 · 运营后台" }] }),
  component: AdminShops,
});

function AdminShops() {
  const downloadTemplate = () => {
    const headers = ["档口名称(英文)", "档口名称(韩文)", "楼宇", "层数", "档口位置", "档口背景图URL", "起订件数", "标签(多个用/分隔)"];
    const sample = ["MILK", "밀크", "Migliore", "2F", "A41", "https://.../cover.jpg", "2", "女装/上新快"];
    const csv = "\ufeff" + [headers, sample].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "档口导入模板.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">档口管理</h1>
          <p className="text-xs text-muted-foreground">维护档口基础资料：楼宇 / 层数 / 位置 / 背景图。商品在「商品管理」中录入。</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadTemplate}><Download className="mr-1 h-4 w-4" />下载导入模板</Button>
          <Button size="sm" variant="outline"><Upload className="mr-1 h-4 w-4" />批量 Excel</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />新增档口</Button>
        </div>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">合作档口</div>
          <div className="mt-1 text-2xl font-semibold">{SHOPS.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">覆盖楼宇</div>
          <div className="mt-1 text-2xl font-semibold">{new Set(SHOPS.map((s) => s.building)).size}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">支持单件</div>
          <div className="mt-1 text-2xl font-semibold">{SHOPS.filter((s) => s.minOrderQty === 1).length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">在售商品数</div>
          <div className="mt-1 text-2xl font-semibold">{PRODUCTS.length}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input placeholder="搜索档口名 / 位置" className="max-w-xs" />
          <Button size="sm" variant="outline">所有楼宇</Button>
          <Button size="sm" variant="outline">起订件数</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>背景图</Th><Th>档口名称</Th><Th>楼宇</Th><Th>层数</Th><Th>档口位置</Th><Th>起订</Th><Th>标签</Th><Th>商品数</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {SHOPS.map((s) => {
                const count = PRODUCTS.filter((p) => p.shopId === s.id).length;
                return (
                  <tr key={s.id} className="border-t border-border">
                    <Td><img src={s.cover} className="h-12 w-16 rounded object-cover" alt="" /></Td>
                    <Td>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">{s.nameKo}</div>
                    </Td>
                    <Td className="text-xs">{s.building}</Td>
                    <Td className="text-xs">{s.floor}</Td>
                    <Td className="text-xs font-mono">{s.position}</Td>
                    <Td>
                      {s.minOrderQty === 1
                        ? <Badge variant="outline">单件</Badge>
                        : <Badge className="bg-amber-500 text-white">2件起</Badge>}
                    </Td>
                    <Td className="text-xs text-muted-foreground">{s.tags.join(" / ")}</Td>
                    <Td className="text-xs">{count}</Td>
                    <Td>
                      <Button size="sm" variant="outline">编辑</Button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
          <ImagePlus className="h-4 w-4" /> 档口导入模板字段
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="bg-muted/40 text-[11px] text-muted-foreground">
              <tr><Th>字段</Th><Th>说明</Th><Th>示例</Th></tr>
            </thead>
            <tbody className="text-foreground">
              {[
                ["档口名称(英文)", "英文名，用于展示与匹配", "MILK"],
                ["档口名称(韩文)", "韩文名，展示用", "밀크"],
                ["楼宇", "所在楼宇 / 商场", "Migliore"],
                ["层数", "楼层，例如 B1 / 2F", "2F"],
                ["档口位置", "铺位号", "A41"],
                ["档口背景图URL", "档口封面图，1 张", "https://.../cover.jpg"],
                ["起订件数", "1=支持单件 / 2=同款 2 件起", "2"],
                ["标签", "多个用 / 分隔", "女装/上新快"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-border">
                  <Td className="font-medium">{row[0]}</Td>
                  <Td>{row[1]}</Td>
                  <Td className="font-mono text-[11px] text-muted-foreground">{row[2]}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-1"><Store className="h-3.5 w-3.5" />楼宇 + 层数 + 档口位置 组合唯一，用于商品导入时匹配档口。</div>
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;