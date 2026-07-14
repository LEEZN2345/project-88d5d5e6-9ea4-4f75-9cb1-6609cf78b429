import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SHOPS, PRODUCTS, formatKRW } from "@/lib/mock-data";
import { MALLS } from "@/lib/buildings";
import { ArrowLeft, Upload, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/shops/$id")({
  head: () => ({ meta: [{ title: "档口编辑 · 运营后台" }] }),
  component: ShopEdit,
});

function ShopEdit() {
  const { id } = Route.useParams();
  const shop = SHOPS.find((s) => s.id === id) ?? SHOPS[0]!;
  const products = PRODUCTS.filter((p) => p.shopId === shop.id);
  const [tags, setTags] = useState<string[]>(shop.tags);
  const [newTag, setNewTag] = useState("");

  const allBuildings = MALLS.flatMap((m) => m.buildings.map((b) => b.name));

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/shops" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回档口列表
        </Link>
        <Button size="sm" onClick={() => toast.success("档口信息已保存")}><Save className="mr-1 h-4 w-4" />保存</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="text-xl font-semibold">{shop.name}</h1>
        <Badge variant="outline">{shop.nameKo}</Badge>
        <span className="text-xs text-muted-foreground">{shop.building} · {shop.floor} · {shop.position}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2 space-y-4">
          <div>
            <Label className="text-xs">档口封面（16:9）</Label>
            <div className="mt-2 aspect-video overflow-hidden rounded-lg border border-dashed border-border bg-muted">
              {shop.cover ? <img src={shop.cover} className="h-full w-full object-cover" alt="" /> : null}
            </div>
            <Button size="sm" variant="outline" className="mt-2"><Upload className="mr-1 h-4 w-4" />替换封面</Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">档口名（中）</Label>
              <Input defaultValue={shop.name} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">档口名（韩）</Label>
              <Input defaultValue={shop.nameKo} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">品牌</Label>
              <Input defaultValue={shop.brand ?? ""} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">铺位号</Label>
              <Input defaultValue={shop.position} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">所在楼栋</Label>
              <select defaultValue={shop.building} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {allBuildings.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">楼层</Label>
              <Input defaultValue={shop.floor} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">起订量</Label>
              <select defaultValue={String(shop.minOrderQty)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="1">1 件（支持单件）</option>
                <option value="2">2 件起批</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs">标签</Label>
            <div className="mt-1 flex flex-wrap gap-1">
              {tags.map((t) => (
                <Badge key={t} variant="outline" className="gap-1">{t}
                  <button onClick={() => setTags((p) => p.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
            <div className="mt-2 flex gap-1">
              <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="新增标签" className="h-8 max-w-[200px] text-xs" />
              <Button size="sm" variant="outline" onClick={() => { if (newTag) { setTags((p) => [...p, newTag]); setNewTag(""); } }}>+</Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold">绑定商品（{products.length}）</div>
            <Link to="/admin/products" className="text-xs text-primary">全部 →</Link>
          </div>
          <div className="space-y-2">
            {products.slice(0, 8).map((p) => (
              <Link key={p.id} to="/admin/products/$id" params={{ id: p.id }} className="flex items-center gap-2 rounded-md p-1 text-xs hover:bg-accent">
                <img src={p.images[0]} className="h-10 w-10 rounded object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.internalCode}</div>
                </div>
                <div className="shrink-0 text-muted-foreground">{formatKRW(p.priceKRW)}</div>
              </Link>
            ))}
            {products.length === 0 && <div className="text-xs text-muted-foreground">该档口暂无商品</div>}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}