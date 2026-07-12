import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import {
  ORDERS,
  SHOPS,
  STOCK_ITEMS,
  SHIP_STATUS_LABEL,
  findStockMatch,
  type ShipStatus,
  type ShipSource,
  formatKRW,
} from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState } from "react";
import { PackageCheck, Truck, Warehouse } from "lucide-react";

export const Route = createFileRoute("/admin/shipping")({
  head: () => ({ meta: [{ title: "发货管理 · 运营后台" }] }),
  component: AdminShipping,
});

type ShipRow = {
  key: string;
  orderId: string;
  createdAt: string;
  buyer: string;
  phone: string;
  address: string;
  shopName: string;
  shopLoc: string;
  productName: string;
  internalCode: string;
  image: string;
  color: string;
  size: string;
  qty: number;
  priceKRW: number;
  source: ShipSource;
  status: ShipStatus;
};

function buildRows(): ShipRow[] {
  const paid = ORDERS.filter((o) => o.status !== "pending_payment");
  const rows: ShipRow[] = [];
  paid.forEach((o) => {
    o.items.forEach((it, idx) => {
      const shop = SHOPS.find((s) => s.id === it.product.shopId);
      const isBulk = shop?.minOrderQty === 2;
      const isSolo = isBulk && it.qty === 1;
      const stock = findStockMatch(it.product.id, it.color, it.size);
      const source: ShipSource = isSolo && stock ? "stock" : "new_order";
      rows.push({
        key: `${o.id}#${idx}`,
        orderId: o.id,
        createdAt: o.createdAt,
        buyer: o.buyer.name,
        phone: o.buyer.phone,
        address: o.buyer.address,
        shopName: shop?.name ?? "",
        shopLoc: `${shop?.building ?? ""} · ${shop?.floor ?? ""} · ${shop?.position ?? ""}`,
        productName: it.product.name,
        internalCode: it.product.internalCode,
        image: it.product.images[0]!,
        color: it.color,
        size: it.size,
        qty: it.qty,
        priceKRW: it.product.priceKRW,
        source,
        status: "pending",
      });
    });
  });
  return rows;
}

function AdminShipping() {
  const [tab, setTab] = useState<"queue" | "stock">("queue");
  const [rows, setRows] = useState<ShipRow[]>(() => buildRows());
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [srcFilter, setSrcFilter] = useState<ShipSource | "all">("all");
  const [stFilter, setStFilter] = useState<ShipStatus | "all">("all");

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (srcFilter === "all" || r.source === srcFilter) &&
          (stFilter === "all" || r.status === stFilter),
      ),
    [rows, srcFilter, stFilter],
  );

  const allChecked = filtered.length > 0 && filtered.every((r) => checked[r.key]);
  const someChecked = filtered.some((r) => checked[r.key]);
  const toggleAll = () => {
    const next = { ...checked };
    const set = !allChecked;
    filtered.forEach((r) => (next[r.key] = set));
    setChecked(next);
  };

  const bulkAdvance = (to: ShipStatus) => {
    setRows((rs) =>
      rs.map((r) => (checked[r.key] ? { ...r, status: to } : r)),
    );
  };

  const stats = useMemo(() => {
    return {
      total: rows.length,
      newOrder: rows.filter((r) => r.source === "new_order").length,
      stock: rows.filter((r) => r.source === "stock").length,
      shipped: rows.filter((r) => r.status === "shipped").length,
    };
  }, [rows]);

  return (
    <AdminShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">发货管理</h1>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setTab("queue")}
            className={`rounded-full px-3 py-1 ${tab === "queue" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <Truck className="mr-1 inline h-3.5 w-3.5" /> 发货队列
          </button>
          <button
            onClick={() => setTab("stock")}
            className={`rounded-full px-3 py-1 ${tab === "stock" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <Warehouse className="mr-1 inline h-3.5 w-3.5" /> 现货库
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="待发货总数" value={stats.total} />
        <Stat label="新订单代订" value={stats.newOrder} />
        <Stat label="走现货库" value={stats.stock} tone="emerald" />
        <Stat label="已发货" value={stats.shipped} tone="sky" />
      </div>

      {tab === "queue" && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">来源：</span>
            {(["all", "new_order", "stock"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSrcFilter(k)}
                className={`rounded-full px-2.5 py-1 ${srcFilter === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {k === "all" ? "全部" : k === "new_order" ? "新订单代订" : "现货库出库"}
              </button>
            ))}
            <span className="ml-3 text-muted-foreground">状态：</span>
            {(["all", "pending", "picking", "packed", "shipped"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setStFilter(k)}
                className={`rounded-full px-2.5 py-1 ${stFilter === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {k === "all" ? "全部" : SHIP_STATUS_LABEL[k]}
              </button>
            ))}
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              已选 {Object.values(checked).filter(Boolean).length} 项
            </span>
            <Button size="sm" variant="outline" disabled={!someChecked} onClick={() => bulkAdvance("picking")}>
              批量：拣货中
            </Button>
            <Button size="sm" variant="outline" disabled={!someChecked} onClick={() => bulkAdvance("packed")}>
              批量：已打包
            </Button>
            <Button size="sm" disabled={!someChecked} onClick={() => bulkAdvance("shipped")}>
              批量：标记已发货
            </Button>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                  </th>
                  <Th>订单号</Th>
                  <Th>会员 / 收货</Th>
                  <Th>档口</Th>
                  <Th>商品</Th>
                  <Th>颜色 / 尺寸</Th>
                  <Th>数量</Th>
                  <Th>发货来源</Th>
                  <Th>状态</Th>
                  <Th>操作</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.key} className="border-t border-border">
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={!!checked[r.key]}
                        onCheckedChange={(v) => setChecked((c) => ({ ...c, [r.key]: !!v }))}
                      />
                    </td>
                    <Td className="font-mono text-xs">{r.orderId}</Td>
                    <Td className="text-xs">
                      <div className="font-medium text-foreground">{r.buyer}</div>
                      <div className="text-muted-foreground">{r.phone}</div>
                      <div className="max-w-[220px] truncate text-muted-foreground" title={r.address}>
                        {r.address}
                      </div>
                    </Td>
                    <Td className="text-xs">
                      <div>{r.shopName}</div>
                      <div className="text-muted-foreground">{r.shopLoc}</div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <img src={r.image} alt="" className="h-10 w-10 rounded object-cover" />
                        <div className="text-xs">
                          <div>{r.productName}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{r.internalCode}</div>
                          <div className="text-muted-foreground">{formatKRW(r.priceKRW)}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-xs">
                      <div>{r.color}</div>
                      <div className="text-muted-foreground">{r.size}</div>
                    </Td>
                    <Td>× {r.qty}</Td>
                    <Td>
                      {r.source === "stock" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                          <PackageCheck className="h-3 w-3" /> 现货库出库
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-1.5 py-0.5 text-[11px] text-sky-700 dark:text-sky-300">
                          <Truck className="h-3 w-3" /> 新订单代订
                        </span>
                      )}
                    </Td>
                    <Td>
                      <Badge variant={r.status === "shipped" ? "default" : "secondary"}>
                        {SHIP_STATUS_LABEL[r.status]}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-1">
                        {r.status !== "shipped" ? (
                          <Button
                            size="sm"
                            className="h-7 text-[11px]"
                            onClick={() =>
                              setRows((rs) =>
                                rs.map((x) =>
                                  x.key === r.key ? { ...x, status: "shipped" } : x,
                                ),
                              )
                            }
                          >
                            标记已发货
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">已完成</span>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-xs text-muted-foreground">
                      没有符合条件的发货任务
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === "stock" && (
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
              </tr>
            </thead>
            <tbody>
              {STOCK_ITEMS.map((s) => {
                const shop = SHOPS.find((x) => x.id === s.shopId);
                return (
                  <tr key={s.id} className="border-t border-border">
                    <Td>
                      <div className="text-xs">
                        <div className="font-mono text-[10px] text-muted-foreground">{s.productId}</div>
                      </div>
                    </Td>
                    <Td className="text-xs">
                      <div>{shop?.name}</div>
                      <div className="text-muted-foreground">{shop?.building} · {shop?.floor}</div>
                    </Td>
                    <Td className="text-xs">
                      {s.color} / {s.size}
                    </Td>
                    <Td>
                      <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                        {s.qty}
                      </span>
                    </Td>
                    <Td className="font-mono text-xs">{s.sourceOrderId}</Td>
                    <Td className="text-xs text-muted-foreground">{s.createdAt}</Td>
                  </tr>
                );
              })}
              {STOCK_ITEMS.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-xs text-muted-foreground">
                    暂无现货
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">发货管理说明</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li><b>新订单代订</b>：档口 2 件起拍时用户下 1 件，系统代订 2 件；1 件出库给买手，另 1 件自动入现货库。</li>
          <li><b>现货库出库</b>：在<span className="text-foreground">新订单管理</span>点「是否发现货 · 是」后，该 SKU 会自动切换到现货库出库，无需再向档口下单。</li>
          <li><b>批量操作</b>：勾选后可批量推进拣货中 / 已打包 / 已发货。</li>
        </ul>
      </Card>
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
  tone?: "emerald" | "sky";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "sky"
        ? "text-sky-600 dark:text-sky-400"
        : "text-foreground";
  return (
    <Card className="p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${toneClass}`}>{value}</div>
    </Card>
  );
}