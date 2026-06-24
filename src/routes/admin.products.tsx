import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { PRODUCTS, SHOPS, formatKRW } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, ImagePlus } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "商品 / 档口录入 · 运营后台" }] }),
  component: AdminProducts,
});

function AdminProducts() {
  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">商品 / 档口录入</h1>
          <p className="text-xs text-muted-foreground">内部款号唯一,一码一商品。支持批量上传 + 自动加水印。</p>
        </div>
        <div className="flex gap-2">
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
                <Th>图</Th><Th>内部款号</Th><Th>名称</Th><Th>档口</Th><Th>品类</Th><Th>价格</Th><Th>状态</Th><Th>操作</Th>
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
                    <Td className="text-xs">{shop?.name}</Td>
                    <Td className="text-xs">{p.category}</Td>
                    <Td>{formatKRW(p.priceKRW)}</Td>
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
          <ImagePlus className="h-4 w-4" /> 录入工具(M1 计划)
        </div>
        <ul className="list-disc space-y-0.5 pl-5">
          <li>批量粘贴图片 → 自动加平台水印</li>
          <li>内部款号唯一性校验,重复跳转到原商品</li>
          <li>Excel 批量导入(款号 / 名称 / 档口 / 品类 / KRW 价 / 颜色 / 尺码)</li>
          <li>档口原始款号作为参考字段保留,不参与去重</li>
        </ul>
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;