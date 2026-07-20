import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/ColorPicker";
import { PRODUCTS, SHOPS, formatKRW } from "@/lib/mock-data";
import { ArrowLeft, Upload, X, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/$id")({
  head: () => ({ meta: [{ title: "商品编辑 · 运营后台" }] }),
  component: ProductEdit,
});

function ProductEdit() {
  const { id } = Route.useParams();
  const p = PRODUCTS.find((x) => x.id === id) ?? PRODUCTS[0]!;
  const shop = SHOPS.find((s) => s.id === p.shopId);
  const [active, setActive] = useState(true);
  const [colors, setColors] = useState<string[]>(p.colors);
  const [sizes, setSizes] = useState<string[]>(p.sizes);
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");

  const save = () => toast.success("商品信息已保存");

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/products" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回商品列表
        </Link>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            上架 <Switch checked={active} onCheckedChange={setActive} />
          </label>
          <Button size="sm" onClick={save}><Save className="mr-1 h-4 w-4" />保存</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="text-xl font-semibold">{p.name}</h1>
        <Badge variant="outline" className="font-mono">{p.internalCode}</Badge>
        {shop && <span className="text-xs text-muted-foreground">{shop.building} · {shop.floor} · {shop.name}</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2 space-y-4">
          <div>
            <Label className="text-xs">商品图片</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {p.images.map((src, i) => (
                <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded border border-border">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button className="absolute right-1 top-1 hidden rounded bg-black/60 p-1 text-white group-hover:block">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button className="flex aspect-[3/4] items-center justify-center rounded border border-dashed border-border text-xs text-muted-foreground hover:bg-accent">
                <Upload className="mr-1 h-4 w-4" />添加
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">商品名</Label>
              <Input defaultValue={p.name} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">内部款号</Label>
              <Input defaultValue={p.internalCode} className="mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs">分类</Label>
              <Input defaultValue={p.category} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">韩币价格</Label>
              <Input type="number" defaultValue={p.priceKRW} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">制造国</Label>
              <Input defaultValue={p.originCountry ?? ""} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">折扣（%）</Label>
              <Input type="number" defaultValue={p.discount ?? 0} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs flex items-center justify-between">
                <span>单件净重（克） <span className="text-rose-500">*</span></span>
                <span className="text-[10px] font-normal text-muted-foreground">用于国际运费计算</span>
              </Label>
              <Input
                type="number"
                min={0}
                step={10}
                defaultValue={p.weightGrams ?? ""}
                placeholder="例如 680"
                className="mt-1"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                请填写含吊牌 / 包装的实测重量。未填写将无法自动核算国际运费，下单时会拦截提示。
              </p>
            </div>
          </div>

          <div>
            <Label className="text-xs">购买条件</Label>
            <Textarea defaultValue={p.purchaseCondition ?? ""} className="mt-1" rows={2} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">颜色 / 尺码矩阵</div>
            <div className="mb-3">
              <Label className="text-xs">颜色</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {colors.map((c) => (
                  <Badge key={c} variant="outline" className="gap-1">{c}
                    <button onClick={() => setColors((p) => p.filter((x) => x !== c))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex gap-1">
                <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="新增颜色" className="h-8 text-xs" />
                <Button size="sm" variant="outline" onClick={() => { if (newColor) { setColors((p) => [...p, newColor]); setNewColor(""); } }}>+</Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">尺码</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {sizes.map((s) => (
                  <Badge key={s} variant="outline" className="gap-1">{s}
                    <button onClick={() => setSizes((p) => p.filter((x) => x !== s))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex gap-1">
                <Input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="新增尺码" className="h-8 text-xs" />
                <Button size="sm" variant="outline" onClick={() => { if (newSize) { setSizes((p) => [...p, newSize]); setNewSize(""); } }}>+</Button>
              </div>
            </div>
          </Card>
          <Card className="p-4 text-xs">
            <div className="mb-2 text-sm font-semibold">运营数据</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>展示单价：{formatKRW(p.priceKRW)}</li>
              <li>登记重量：{p.weightGrams ? `${p.weightGrams} g` : <span className="text-rose-500">未填写</span>}</li>
              <li>上新日期：{p.uploadedAt}</li>
              <li>近 30 日销量：128 件</li>
              <li>收藏数：42</li>
            </ul>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}