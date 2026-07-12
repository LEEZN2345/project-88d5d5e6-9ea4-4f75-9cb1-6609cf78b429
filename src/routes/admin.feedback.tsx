import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { ORDERS, SHOPS, STATUS_LABEL, formatKRW, type OrderStatus } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Upload, PackageCheck, PackageX, Clock, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({ meta: [{ title: "订单反馈管理 · 运营后台" }] }),
  component: AdminFeedback,
});

type StockState = "pending" | "in_stock" | "out_of_stock";

type FeedbackRow = {
  orderId: string;
  status: OrderStatus;
  receiptUrl?: string;
  stock: StockState;
  cycleDays: number; // 预定周期（天）
  note: string;
  updatedAt?: string;
};

const STOCK_LABEL: Record<StockState, string> = {
  pending: "待入库",
  in_stock: "已入库",
  out_of_stock: "缺货",
};

const STOCK_BADGE: Record<StockState, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  in_stock: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  out_of_stock: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

function initRows(): Record<string, FeedbackRow> {
  const m: Record<string, FeedbackRow> = {};
  ORDERS.forEach((o, i) => {
    const stock: StockState =
      o.status === "in_transit" || o.status === "delivered"
        ? "in_stock"
        : o.status === "paid_locked"
          ? "pending"
          : "pending";
    m[o.id] = {
      orderId: o.id,
      status: o.status,
      receiptUrl: o.receiptUrl,
      stock,
      cycleDays: 5 + (i % 4) * 2,
      note: "",
      updatedAt: o.receiptUrl ? o.createdAt : undefined,
    };
  });
  return m;
}

function AdminFeedback() {
  const [rows, setRows] = useState<Record<string, FeedbackRow>>(() => initRows());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stockFilter, setStockFilter] = useState<StockState | "all">("all");
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkStock, setBulkStock] = useState<StockState>("in_stock");
  const [bulkCycle, setBulkCycle] = useState<number | "">("");

  const list = useMemo(() => {
    return ORDERS.map((o) => ({ order: o, fb: rows[o.id] })).filter(({ order, fb }) => {
      if (stockFilter !== "all" && fb.stock !== stockFilter) return false;
      if (keyword && !order.id.toLowerCase().includes(keyword.toLowerCase()) && !order.buyer.name.includes(keyword))
        return false;
      return true;
    });
  }, [rows, stockFilter, keyword]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () => {
    if (selected.size === list.length) setSelected(new Set());
    else setSelected(new Set(list.map((l) => l.order.id)));
  };

  const patch = (id: string, p: Partial<FeedbackRow>) =>
    setRows((r) => ({ ...r, [id]: { ...r[id], ...p, updatedAt: nowStr() } }));

  const uploadReceipt = (id: string) => {
    // 模拟上传：随机图片
    const url = `https://picsum.photos/seed/${id}-receipt/400/600`;
    patch(id, { receiptUrl: url });
  };

  const applyBulk = () => {
    setRows((r) => {
      const n = { ...r };
      selected.forEach((id) => {
        n[id] = {
          ...n[id],
          stock: bulkStock,
          ...(typeof bulkCycle === "number" ? { cycleDays: bulkCycle } : {}),
          updatedAt: nowStr(),
        };
      });
      return n;
    });
    setBulkOpen(false);
    setSelected(new Set());
  };

  const bulkUploadReceipts = () => {
    setRows((r) => {
      const n = { ...r };
      selected.forEach((id) => {
        n[id] = { ...n[id], receiptUrl: `https://picsum.photos/seed/${id}-receipt/400/600`, updatedAt: nowStr() };
      });
      return n;
    });
    setSelected(new Set());
  };

  const stats = {
    total: ORDERS.length,
    pending: Object.values(rows).filter((r) => r.stock === "pending").length,
    in_stock: Object.values(rows).filter((r) => r.stock === "in_stock").length,
    with_receipt: Object.values(rows).filter((r) => r.receiptUrl).length,
  };

  const editRow = editing ? rows[editing] : null;
  const editOrder = editing ? ORDERS.find((o) => o.id === editing) : null;

  return (
    <AdminShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">订单反馈管理</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            维护订单进度、购物小票、入库状态与预定周期，买手端将实时同步展示。
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Stat label="订单总数" value={stats.total} />
        <Stat label="待入库" value={stats.pending} tone="amber" />
        <Stat label="已入库" value={stats.in_stock} tone="emerald" />
        <Stat label="已上传小票" value={stats.with_receipt} tone="sky" />
      </div>

      <Card className="mb-3 flex flex-wrap items-center gap-2 p-3">
        <Input
          placeholder="按订单号 / 会员搜索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="h-8 w-56"
        />
        <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockState | "all")}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部入库状态</SelectItem>
            <SelectItem value="pending">待入库</SelectItem>
            <SelectItem value="in_stock">已入库</SelectItem>
            <SelectItem value="out_of_stock">缺货</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">已选 {selected.size}</span>
          <Button size="sm" variant="outline" disabled={!selected.size} onClick={bulkUploadReceipts}>
            <Upload className="mr-1 h-4 w-4" />批量上传小票
          </Button>
          <Button size="sm" disabled={!selected.size} onClick={() => setBulkOpen(true)}>
            <PackageCheck className="mr-1 h-4 w-4" />批量更新入库 / 周期
          </Button>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>
                <input
                  type="checkbox"
                  checked={selected.size === list.length && list.length > 0}
                  onChange={toggleAll}
                />
              </Th>
              <Th>订单号</Th>
              <Th>会员</Th>
              <Th>档口</Th>
              <Th>件数 / 金额</Th>
              <Th>订单状态</Th>
              <Th>购物小票</Th>
              <Th>是否入库</Th>
              <Th>预定周期</Th>
              <Th>最近更新</Th>
              <Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {list.map(({ order, fb }) => {
              const shopIds = Array.from(new Set(order.items.map((i) => i.product.shopId)));
              return (
                <tr key={order.id} className="border-t border-border">
                  <Td>
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggle(order.id)}
                    />
                  </Td>
                  <Td className="font-mono text-xs">{order.id}</Td>
                  <Td className="text-xs">
                    <div>{order.buyer.name}</div>
                    <div className="text-muted-foreground">{order.buyer.phone}</div>
                  </Td>
                  <Td className="text-xs">
                    {shopIds
                      .map((sid) => SHOPS.find((s) => s.id === sid))
                      .filter(Boolean)
                      .map((s) => `${s!.name}`)
                      .join(" / ")}
                  </Td>
                  <Td className="text-xs">
                    <div>× {order.items.reduce((s, i) => s + i.qty, 0)}</div>
                    <div className="text-muted-foreground">{formatKRW(order.totalKRW)}</div>
                  </Td>
                  <Td>
                    <Badge variant="outline" className="text-[11px]">
                      {STATUS_LABEL[fb.status]}
                    </Badge>
                  </Td>
                  <Td>
                    {fb.receiptUrl ? (
                      <a
                        href={fb.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <img src={fb.receiptUrl} alt="" className="h-8 w-8 rounded object-cover" />
                        查看 <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => uploadReceipt(order.id)}>
                        <Upload className="mr-1 h-3.5 w-3.5" />上传
                      </Button>
                    )}
                  </Td>
                  <Td>
                    <Select
                      value={fb.stock}
                      onValueChange={(v) => patch(order.id, { stock: v as StockState })}
                    >
                      <SelectTrigger className={`h-7 w-28 text-xs ${STOCK_BADGE[fb.stock]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待入库</SelectItem>
                        <SelectItem value="in_stock">已入库</SelectItem>
                        <SelectItem value="out_of_stock">缺货</SelectItem>
                      </SelectContent>
                    </Select>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={1}
                        value={fb.cycleDays}
                        onChange={(e) => patch(order.id, { cycleDays: Number(e.target.value) || 0 })}
                        className="h-7 w-16 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">天</span>
                    </div>
                  </Td>
                  <Td className="text-[11px] text-muted-foreground">
                    {fb.updatedAt ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {fb.updatedAt}
                      </span>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(order.id)}>
                      编辑
                    </Button>
                  </Td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={11} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  暂无匹配订单
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">使用说明</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>
            <b>手动操作</b>：直接在行内修改「是否入库 / 预定周期」，或点击「上传」补充购物小票；改动会实时同步给下单买手。
          </li>
          <li>
            <b>批量操作</b>：勾选左侧复选框后使用「批量更新入库 / 周期」或「批量上传小票」；适合同一批到货、同一档口拿货的场景。
          </li>
          <li>
            <b>编辑</b>：可写入内部备注（仅运营可见）与详细状态调整。
          </li>
        </ul>
      </Card>

      {/* 编辑弹窗 */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>反馈详情 · {editing}</DialogTitle>
          </DialogHeader>
          {editRow && editOrder && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-muted/50 p-3 text-xs">
                <div>会员：{editOrder.buyer.name} · {editOrder.buyer.phone}</div>
                <div className="text-muted-foreground">地址：{editOrder.buyer.address}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">是否入库</label>
                  <Select
                    value={editRow.stock}
                    onValueChange={(v) => patch(editing!, { stock: v as StockState })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">待入库</SelectItem>
                      <SelectItem value="in_stock">已入库</SelectItem>
                      <SelectItem value="out_of_stock">缺货</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">预定周期（天）</label>
                  <Input
                    type="number"
                    min={1}
                    value={editRow.cycleDays}
                    onChange={(e) => patch(editing!, { cycleDays: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">购物小票</label>
                {editRow.receiptUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={editRow.receiptUrl} alt="" className="h-24 w-24 rounded object-cover" />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => uploadReceipt(editing!)}>
                        <Upload className="mr-1 h-3.5 w-3.5" />替换
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => patch(editing!, { receiptUrl: undefined })}
                      >
                        <PackageX className="mr-1 h-3.5 w-3.5" />移除
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => uploadReceipt(editing!)}>
                    <Upload className="mr-1 h-3.5 w-3.5" />上传小票
                  </Button>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">内部备注</label>
                <Textarea
                  rows={3}
                  value={editRow.note}
                  onChange={(e) => patch(editing!, { note: e.target.value })}
                  placeholder="仅运营可见"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              关闭
            </Button>
            <Button onClick={() => setEditing(null)}>
              <CheckCircle2 className="mr-1 h-4 w-4" />保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量弹窗 */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>批量更新 · 已选 {selected.size} 单</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">入库状态</label>
              <Select value={bulkStock} onValueChange={(v) => setBulkStock(v as StockState)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待入库</SelectItem>
                  <SelectItem value="in_stock">已入库</SelectItem>
                  <SelectItem value="out_of_stock">缺货</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">预定周期（天） · 留空表示不修改</label>
              <Input
                type="number"
                min={1}
                value={bulkCycle}
                onChange={(e) => setBulkCycle(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="例如 7"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>取消</Button>
            <Button onClick={applyBulk}>应用到 {selected.size} 单</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "amber" | "emerald" | "sky";
}) {
  const cls =
    tone === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : tone === "emerald"
        ? "text-emerald-600 dark:text-emerald-400"
        : tone === "sky"
          ? "text-sky-600 dark:text-sky-400"
          : "text-foreground";
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
    </Card>
  );
}

function nowStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  <td colSpan={colSpan} className={`px-3 py-2 align-middle ${className}`}>
    {children}
  </td>
);