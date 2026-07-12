import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { PRODUCTS, SHOPS, formatKRW } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, ImagePlus, Download } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "商品 / 档口录入 · 运营后台" }] }),
  component: AdminProducts,
});

function AdminProducts() {
  const downloadTemplate = () => {
    const headers = [
      "档口名称",
      "档口位置",
      "商店ID",
      "标题",
      "商品图片(多张用 | 分隔)",
      "价格(KRW)",
      "详情信息",
      "制造国",
      "颜色(多个用 / 分隔)",
      "尺寸(多个用 / 分隔)",
      "成分",
      "购买条件",
    ];
    const sample = [
      "MILK 女装",
      "Migliore 2F-A41",
      "s1",
      "羊毛混纺翻领长大衣",
      "https://.../a.jpg|https://.../b.jpg",
      "168000",
      "落肩廓形 / 内里加绒 / 建议搭配高领针织",
      "韩国",
      "奶白/燕麦/炭灰",
      "FREE",
      "羊毛 70% 涤纶 30%",
      "2件起订 · 不可换色 · 到货 7 天内可退",
    ];
    const csv = "\ufeff" + [headers, sample].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "商品导入模板.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">商品 / 档口录入</h1>
          <p className="text-xs text-muted-foreground">内部款号唯一,一码一商品。支持批量上传 + 自动加水印。</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadTemplate}><Download className="mr-1 h-4 w-4" />下载导入模板</Button>
          <Button size="sm" variant="outline"><Upload className="mr-1 h-4 w-4" />批量 Excel</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />新增商品</Button>
        </div>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">在售商品</div>
          <div className="mt-1 text-2xl font-semibold">{PRODUCTS.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">合作档口</div>
          <div className="mt-1 text-2xl font-semibold">{SHOPS.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">本周上新</div>
          <div className="mt-1 text-2xl font-semibold">{PRODUCTS.filter((p) => p.isNew).length}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input placeholder="搜索内部款号 / 商品名" className="max-w-xs" />
          <Button size="sm" variant="outline">所有档口</Button>
          <Button size="sm" variant="outline">所有品类</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>图</Th><Th>内部款号</Th><Th>名称</Th><Th>档口名称</Th><Th>档口位置</Th><Th>品类</Th><Th>价格</Th><Th>颜色</Th><Th>尺寸</Th><Th>制造国</Th><Th>成分</Th><Th>状态</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => {
                const shop = SHOPS.find((s) => s.id === p.shopId);
                return (
                  <tr key={p.id} className="border-t border-border">
                    <Td><img src={p.images[0]} className="h-12 w-12 rounded object-cover" alt="" /></Td>
                    <Td className="font-mono text-xs">{p.internalCode}</Td>
                    <Td className="max-w-[200px] truncate">{p.name}</Td>
                    <Td className="text-xs">
                      <div>{shop?.name}</div>
                      <div className="text-[11px] text-muted-foreground">{shop?.building} {shop?.floor}</div>
                    </Td>
                    <Td className="text-xs">{p.category}</Td>
                    <Td>{formatKRW(p.priceKRW)}</Td>
                    <Td className="text-xs">{p.colors.join(" / ")}</Td>
                    <Td className="text-xs">{p.sizes.join(" / ")}</Td>
                    <Td className="text-xs">{p.originCountry ?? "—"}</Td>
                    <Td className="max-w-[160px] truncate text-xs text-muted-foreground">{p.composition ?? "—"}</Td>
                    <Td>
                      {p.isNew && <Badge className="mr-1 bg-blue-500 text-white">新</Badge>}
                      {p.discount && <Badge className="bg-rose-500 text-white">-{p.discount}%</Badge>}
                    </Td>
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
          <ImagePlus className="h-4 w-4" /> 商品导入模板字段
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="bg-muted/40 text-[11px] text-muted-foreground">
              <tr>
                <Th>字段</Th><Th>说明</Th><Th>示例</Th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {[
                ["档口名称", "档口中文名（用于展示）", "MILK 女装"],
                ["档口位置", "建筑 + 楼层铺号", "Migliore 2F-A41"],
                ["商店ID", "已存在档口的内部 ID（新档口留空,系统按名称新建）", "s1"],
                ["标题", "商品名称", "羊毛混纺翻领长大衣"],
                ["商品图片", "1-9 张图,多张用 | 分隔,系统自动加水印", "https://.../a.jpg | b.jpg"],
                ["价格", "档口韩币零售价（KRW,整数）", "168000"],
                ["详情信息", "面料 / 版型 / 搭配建议等自由描述", "落肩廓形 / 内里加绒"],
                ["制造国", "MADE IN 国家", "韩国"],
                ["颜色", "多个用 / 分隔", "奶白/燕麦/炭灰"],
                ["尺寸", "多个用 / 分隔", "S/M/L 或 FREE"],
                ["成分", "材质构成", "羊毛 70% 涤纶 30%"],
                ["购买条件", "起订量 / 换色 / 退换规则", "2件起订 · 不可换色"],
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
        <div className="mt-3 space-y-0.5">
          <div>· 内部款号由系统自动生成（DD-YYYY-XXXX）,同档口重复标题会提示合并。</div>
          <div>· 图片上传后统一走 CDN + 平台水印,原图仅运营可下载。</div>
          <div>· 档口位置和商店ID 二选一即可,系统优先匹配 ID。</div>
        </div>
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;