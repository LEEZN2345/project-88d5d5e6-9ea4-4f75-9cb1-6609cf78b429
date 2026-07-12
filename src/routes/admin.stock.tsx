import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { STOCK_ITEMS, SHOPS, PRODUCTS, type StockItem } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { Plus, Minus, Trash2, Search, Warehouse } from "lucide-react";

export const Route = createFileRoute("/admin/stock")({
  head: () => ({ meta: [{ title: "现货管理 · 运营后台" }] }),
  component: AdminStock;
});

function AdminStock() {
  const [items, setItems] = useState<StockItem[]>(() => STOCK_ITEMS.map((s) => ({ ...s })));
  const [q, setQ] = useState("");
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);

  const [newForm, setNewForm] = useState({
    productId: "",
    color: "",
    size: "",
    qty: 1,
  });

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return items.filter((s) => {
      if (shopFilter !== "all" && s.shopId !== shopFilter) return false;
      if (!kw) return true;
      const p = PRODUCTS.find((x) => x.id === s.productId);
      return (
        s.productId.toLowerCase().includes(kw) ||
        p?.name.toLowerCase().includes(kw) ||
        p?.internalCode.toLowerCase().includes(kw) ||
        s.color.toLowerCase().includes(kw) ||
        s.sourceOrderId.toLowerCase().includes(kw)
      );
    });
  }, [items, q, shopFilter]);

  const totals = useMemo(() => {
    const total = items.reduce((s, i) => s + i.qty, 0);
    const skus = items.length;
    const shops = new Set(items.map((i) => i.shopId)).size;
    return { total, skus, shops };
  }, [items]);

  const adjust = (id: string, delta: number) => {
    setItems((rs) =>
      rs
        .map((r) => (r.id === id ? { ...r, qty: Math.max(0, r.qty + delta) } : r))
        .filter((r) => r.qty > 0),
    );
  };
  const remove = (id: string) => setItems((rs) => rs.filter((r) => r.id !== id));

  const addStock = () => {
    const p = PRODUCTS.find((x) => x.id === newForm.productId);
    if (!p || !newForm.color || !newForm.size || newForm.qty < 1) return;
    setItems((rs) => [
      {
        id: `stk_${Date.now()}`,
        productId: p.id,
        shopId: p.shopId,
        color: newForm.color,
        size: newForm.size,
        qty: newForm.qty,
        sourceOrderId: "手动录入",
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      },
      ...rs,
    ]);
    setAddOpen(false);
    setNewForm({ productId: "", color: "", size: "", qty: 1 });
  };

  const selectedProduct = PRODUCTS.find((p) => p.id === newForm.productId);

  return (
    <AdminShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          <Warehouse className="mr-1 inline h-5 w-5" /> 现货管理
        </h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> 手动入库
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3">
        <Stat label="现货总件数" value={totals.total} tone="emerald" />
        <Stat label="SKU 数" value={totals.skus} />
        <Stat label="覆盖档口" value={totals.shops} />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索款式 / 款号 / 颜色 / 来源订单"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 w-64 pl-7 text-xs"
          />
        </div>
        <Select value={shopFilter} onValueChange={setShopFilter}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="档口" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部档口</SelectItem>
            {SHOPS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>商品</Th>
              <Th>档口</Th>
              <Th>颜色 / 尺寸</Th>
              <Th>库存数量</Th>
              <Th>来源订单</Th>
              <Th>入库时间</Th>
              <Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const shop = SHOPS.find((x) => x.id === s.shopId);
              const p = PRODUCTS.find((x) => x.id === s.productId);
              return (
                <tr key={s.id} className="border-t border-border">
                  <Td>
                    <div className="flex items-center gap-2">
                      {p && (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div className="text-xs">
                        <div>{p?.name ?? s.productId}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {p?.internalCode}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-xs">
                    <div>{shop?.name}</div>
                    <div className="text-muted-foreground">
                      {shop?.building} · {shop?.floor} · {shop?.position}
                    </div>
                  </Td>
                  <Td className="text-xs">
                    {s.color} / {s.size}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => adjust(s.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="min-w-8 rounded-md bg-emerald-500/15 px-2 py-0.5 text-center text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        {s.qty}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => adjust(s.id, +1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs">{s.sourceOrderId}</Td>
                  <Td className="text-xs text-muted-foreground">{s.createdAt}</Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] text-rose-600 hover:text-rose-700"
                      onClick={() => remove(s.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> 删除
                    </Button>
                  </Td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-xs text-muted-foreground">
                  暂无符合条件的现货
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">现货管理说明</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li><b>自动入库</b>：档口 2 件起拍时用户下 1 件，系统代订 2 件；发货后剩余的 1 件自动入库到现货库。</li>
          <li><b>手动入库</b>：客服 / 采购可手动补录现货（例如档口赠品、促销库存）。</li>
          <li><b>库存出库</b>：在<span className="text-foreground">新订单管理</span>命中现货时选择「发现货」，或在<span className="text-foreground">发货管理</span>推进已发货，会自动扣减此处库存。</li>
          <li><b>数量调整</b>：直接 +/- 或删除；本页所有变更均记录到库存流水（M2 上线）。</li>
        </ul>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>手动入库</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">商品</label>
              <Select
                value={newForm.productId}
                onValueChange={(v) =>
                  setNewForm((f) => ({
                    ...f,
                    productId: v,
                    color: PRODUCTS.find((p) => p.id === v)?.colors[0] ?? "",
                    size: PRODUCTS.find((p) => p.id === v)?.sizes[0] ?? "",
                  }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="选择商品" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.internalCode} · {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">颜色</label>
                <Select
                  value={newForm.color}
                  onValueChange={(v) => setNewForm((f) => ({ ...f, color: v }))}
                  disabled={!selectedProduct}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="颜色" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct?.colors.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">尺寸</label>
                <Select
                  value={newForm.size}
                  onValueChange={(v) => setNewForm((f) => ({ ...f, size: v }))}
                  disabled={!selectedProduct}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="尺寸" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct?.sizes.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">数量</label>
              <Input
                type="number"
                min={1}
                value={newForm.qty}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, qty: Math.max(1, Number(e.target.value) || 1) }))
                }
                className="h-9 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
            <Button onClick={addStock}>确定入库</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

const Th = ({ children }: { children?: React.ReactNode }) => (
  <th className="px-3 py-2 text-left font-medium">{children}</th>
);
const Td = ({
  children,
  className = "",
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}) => (
  <td colSpan={colSpan} className={`px-3 py-2 ${className}`}>
    {children}
  </td>
);

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "emerald";
}) {
  const toneClass =
    tone === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground";
  return (
    <Card className="p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${toneClass}`}>{value}</div>
    </Card>
  );
}