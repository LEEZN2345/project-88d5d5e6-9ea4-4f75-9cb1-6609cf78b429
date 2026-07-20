import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, Fragment } from "react";
import { AdminShell } from "@/components/AdminShell";
import { ORDERS, SHOPS, formatKRW, type OrderStatus } from "@/lib/mock-data";
import { useRole, ROLE_LABEL } from "@/lib/auth-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, PackageCheck, ExternalLink, ChevronRight, ChevronDown, Truck, CalendarClock, Warehouse, Lock, PackageX, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({ meta: [{ title: "订单反馈管理 · 运营后台" }] }),
  component: AdminFeedback,
});

type StockState = "pending" | "in_stock" | "out_of_stock";
type GoodsType = "in_stock" | "reserve"; // 现货 / 预定
type ItemAction = "wait_ship" | "reserve" | "to_stock" | "out_of_stock";

export type OosLogEntry = {
  id: string;
  orderId: string;
  itemIdx: number;
  skuName: string;
  skuCode?: string;
  color?: string;
  size?: string;
  qty: number;
  shopName?: string;
  reason: string;
  actor: string;
  actorRole: string;
  at: string; // ISO
  action: "mark" | "unmark";
};

const OOS_LOG_KEY = "admin_feedback_oos_log_v1";

function readOosLog(): OosLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(OOS_LOG_KEY) ?? "[]") as OosLogEntry[];
  } catch {
    return [];
  }
}
function writeOosLog(list: OosLogEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OOS_LOG_KEY, JSON.stringify(list));
}

type FeedbackRow = {
  orderId: string;
  status: OrderStatus;
  receiptUrl?: string;
  stock: StockState;
  goodsType: GoodsType; // 商品状态：现货 / 预定
  shipDate?: string; // 预定时的出货日期 YYYY-MM-DD
  note: string;
  updatedAt?: string;
  // 每个 SKU 行的锁定操作：入库等待发货 / 预定 / 现货入库
  itemActions?: Record<number, ItemAction | undefined>;
  // 每个 SKU 行的预定出货日期（仅当 itemActions[idx] === 'reserve' 时使用）
  itemShipDates?: Record<number, string | undefined>;
};

const ACTION_META: Record<ItemAction, { label: string; icon: typeof Truck; color: string }> = {
  wait_ship: {
    label: "入库等待发货",
    icon: Truck,
    color: "bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-300",
  },
  reserve: {
    label: "预定",
    icon: CalendarClock,
    color: "bg-sky-500/15 text-sky-700 border-sky-500/40 dark:text-sky-300",
  },
  to_stock: {
    label: "现货数量 1 入现货库",
    icon: Warehouse,
    color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-300",
  },
  out_of_stock: {
    label: "断货",
    icon: PackageX,
    color: "bg-rose-500/15 text-rose-700 border-rose-500/40 dark:text-rose-300",
  },
};

function initRows(): Record<string, FeedbackRow> {
  const m: Record<string, FeedbackRow> = {};
  PAID_ORDERS.forEach((o, i) => {
    const stock: StockState =
      o.status === "in_transit" || o.status === "delivered"
        ? "in_stock"
        : o.status === "paid_locked"
          ? "pending"
          : "pending";
    const goodsType: GoodsType = i % 2 === 0 ? "in_stock" : "reserve";
    const shipDate =
      goodsType === "reserve" ? addDays(new Date(), 3 + (i % 5) * 2) : undefined;
    m[o.id] = {
      orderId: o.id,
      status: o.status,
      receiptUrl: o.receiptUrl,
      stock,
      goodsType,
      shipDate,
      note: "",
      updatedAt: o.receiptUrl ? o.createdAt : undefined,
    };
  });
  return m;
}

const PAID_ORDERS = ORDERS.filter((o) => o.status !== "pending_payment");

function AdminFeedback() {
  const role = useRole();
  const [rows, setRows] = useState<Record<string, FeedbackRow>>(() => initRows());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stockFilter, setStockFilter] = useState<StockState | "all">("all");
  const [keyword, setKeyword] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkStock, setBulkStock] = useState<StockState>("in_stock");
  const [bulkGoodsType, setBulkGoodsType] = useState<GoodsType | "">("");
  const [bulkShipDate, setBulkShipDate] = useState<string>("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpand = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));
  const [oosLog, setOosLog] = useState<OosLogEntry[]>(() => readOosLog());
  const [oosDialog, setOosDialog] = useState<
    | { orderId: string; itemIdx: number }
    | null
  >(null);
  const [oosReason, setOosReason] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState("");

  const appendLog = (entry: OosLogEntry) => {
    setOosLog((prev) => {
      const next = [entry, ...prev].slice(0, 500);
      writeOosLog(next);
      return next;
    });
  };

  const list = useMemo(() => {
    return PAID_ORDERS.map((o) => ({ order: o, fb: rows[o.id] })).filter(({ order, fb }) => {
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

  const toggleItemAction = (id: string, idx: number, act: ItemAction) =>
    setRows((r) => {
      const cur = r[id]!;
      const map = { ...(cur.itemActions ?? {}) };
      const dates = { ...(cur.itemShipDates ?? {}) };
      if (map[idx] === act) {
        map[idx] = undefined;
        if (act === "reserve") dates[idx] = undefined;
        if (act === "out_of_stock") {
          const order = PAID_ORDERS.find((o) => o.id === id);
          const item = order?.items[idx];
          const shop = item ? SHOPS.find((s) => s.id === item.product.shopId) : undefined;
          appendLog({
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            orderId: id,
            itemIdx: idx,
            skuName: item?.product.name ?? "",
            skuCode: item?.product.internalCode,
            color: item?.color,
            size: item?.size,
            qty: item?.qty ?? 0,
            shopName: shop?.name,
            reason: "撤销断货标记",
            actor: ROLE_LABEL[role],
            actorRole: role,
            at: new Date().toISOString(),
            action: "unmark",
          });
          toast.message(`已撤销断货标记：${item?.product.name ?? ""}`);
        }
      } else {
        map[idx] = act;
        if (act === "reserve" && !dates[idx]) {
          dates[idx] = addDays(new Date(), 5);
        }
      }
      return { ...r, [id]: { ...cur, itemActions: map, itemShipDates: dates, updatedAt: nowStr() } };
    });

  // 断货：先弹窗要求填写原因，确认后再落状态 + 日志 + 通知
  const requestOutOfStock = (orderId: string, idx: number) => {
    const cur = rows[orderId];
    if (cur?.itemActions?.[idx] === "out_of_stock") {
      // 已是断货，直接走 toggle 撤销分支
      toggleItemAction(orderId, idx, "out_of_stock");
      return;
    }
    setOosReason("");
    setOosDialog({ orderId, itemIdx: idx });
  };

  const confirmOutOfStock = () => {
    if (!oosDialog) return;
    const { orderId, itemIdx } = oosDialog;
    const reason = oosReason.trim();
    if (!reason) {
      toast.error("请填写断货原因");
      return;
    }
    const order = PAID_ORDERS.find((o) => o.id === orderId);
    const item = order?.items[itemIdx];
    const shop = item ? SHOPS.find((s) => s.id === item.product.shopId) : undefined;
    setRows((r) => {
      const cur = r[orderId]!;
      const map = { ...(cur.itemActions ?? {}) };
      map[itemIdx] = "out_of_stock";
      return { ...r, [orderId]: { ...cur, itemActions: map, updatedAt: nowStr() } };
    });
    appendLog({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      orderId,
      itemIdx,
      skuName: item?.product.name ?? "",
      skuCode: item?.product.internalCode,
      color: item?.color,
      size: item?.size,
      qty: item?.qty ?? 0,
      shopName: shop?.name,
      reason,
      actor: ROLE_LABEL[role],
      actorRole: role,
      at: new Date().toISOString(),
      action: "mark",
    });
    toast.success(`已通知买家「${order?.buyer.name ?? ""}」：${item?.product.name ?? ""} 断货`);
    setOosDialog(null);
    setOosReason("");
  };

  const setItemShipDate = (id: string, idx: number, date: string) =>
    setRows((r) => {
      const cur = r[id]!;
      const dates = { ...(cur.itemShipDates ?? {}) };
      dates[idx] = date;
      return { ...r, [id]: { ...cur, itemShipDates: dates, updatedAt: nowStr() } };
    });

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
          ...(bulkGoodsType ? { goodsType: bulkGoodsType } : {}),
          ...(bulkGoodsType === "in_stock"
            ? { shipDate: undefined }
            : bulkShipDate
              ? { shipDate: bulkShipDate }
              : {}),
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

  const stats = (() => {
    let inStockOrders = 0;
    let reserveOrders = 0;
    let inStockItems = 0;
    let reserveItems = 0;
    Object.values(rows).forEach((r) => {
      const acts = Object.values(r.itemActions ?? {});
      const hasStock = acts.some((a) => a === "wait_ship" || a === "to_stock");
      const hasReserve = acts.some((a) => a === "reserve");
      if (hasStock) inStockOrders += 1;
      if (hasReserve) reserveOrders += 1;
      acts.forEach((a) => {
        if (a === "wait_ship" || a === "to_stock") inStockItems += 1;
        if (a === "reserve") reserveItems += 1;
      });
    });
    return {
      total: PAID_ORDERS.length,
      inStockOrders,
      reserveOrders,
      inStockItems,
      reserveItems,
    };
  })();

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

      <Card className="mb-3 flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="text-xs text-muted-foreground">
          断货操作日志 · 累计 <b className="text-foreground">{oosLog.length}</b> 条
        </div>
        <Button size="sm" variant="outline" onClick={() => setTimelineOpen(true)}>
          <History className="mr-1 h-4 w-4" />查看断货时间线
        </Button>
      </Card>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">现货订单详情</div>
          <div className="mt-1 flex items-baseline gap-3">
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.inStockOrders}
            </div>
            <div className="text-xs text-muted-foreground">
              单 · 共 <b className="text-foreground">{stats.inStockItems}</b> 件（含入库等待发货 / 现货入库）
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">预定单详情</div>
          <div className="mt-1 flex items-baseline gap-3">
            <div className="text-2xl font-semibold text-sky-600 dark:text-sky-400">
              {stats.reserveOrders}
            </div>
            <div className="text-xs text-muted-foreground">
              单 · 共 <b className="text-foreground">{stats.reserveItems}</b> 件预定商品
            </div>
          </div>
        </Card>
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
              <Th></Th>
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
              <Th>购物小票</Th>
            </tr>
          </thead>
          <tbody>
            {list.map(({ order, fb }) => {
              const shopIds = Array.from(new Set(order.items.map((i) => i.product.shopId)));
              const open = !!expanded[order.id];
              return (
                <Fragment key={order.id}>
                <tr key={order.id} className="border-t border-border">
                  <Td>
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                      aria-label={open ? "收起" : "展开明细"}
                    >
                      {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </Td>
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
                </tr>
                {open && (
                  <tr className="border-t border-border bg-muted/30">
                    <Td></Td>
                    <Td colSpan={6} className="py-2">
                      <div className="mb-1 text-[11px] font-medium text-muted-foreground">
                        订单明细（共 {order.items.length} 个 SKU · {order.items.reduce((s, i) => s + i.qty, 0)} 件）
                      </div>
                      <table className="w-full text-xs">
                        <thead className="text-muted-foreground">
                          <tr>
                            <th className="px-2 py-1 text-left font-normal">图片</th>
                            <th className="px-2 py-1 text-left font-normal">档口</th>
                            <th className="px-2 py-1 text-left font-normal">款式 / 内部款号</th>
                            <th className="px-2 py-1 text-left font-normal">颜色</th>
                            <th className="px-2 py-1 text-left font-normal">尺寸</th>
                            <th className="px-2 py-1 text-left font-normal">数量</th>
                            <th className="px-2 py-1 text-left font-normal">单价</th>
                            <th className="px-2 py-1 text-left font-normal">小计</th>
                            <th className="px-2 py-1 text-left font-normal">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((it, idx) => {
                            const shop = SHOPS.find((s) => s.id === it.product.shopId);
                            const act = fb.itemActions?.[idx];
                            const locked = !!act;
                            return (
                              <tr key={idx} className="border-t border-border/60">
                                <td className="px-2 py-1.5">
                                  <img
                                    src={it.product.images[0]}
                                    alt=""
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                </td>
                                <td className="px-2 py-1.5">
                                  <div>{shop?.name}</div>
                                  <div className="text-muted-foreground">
                                    {shop?.building} · {shop?.floor}
                                    {shop?.position ? `-${shop.position}` : ""}
                                  </div>
                                </td>
                                <td className="px-2 py-1.5">
                                  <div>{it.product.name}</div>
                                  <div className="font-mono text-[10px] text-muted-foreground">
                                    {it.product.internalCode}
                                  </div>
                                </td>
                                <td className="px-2 py-1.5">{it.color}</td>
                                <td className="px-2 py-1.5">{it.size}</td>
                                <td className="px-2 py-1.5">× {it.qty}</td>
                                <td className="px-2 py-1.5">{formatKRW(it.product.priceKRW)}</td>
                                <td className="px-2 py-1.5">
                                  {formatKRW(it.product.priceKRW * it.qty)}
                                </td>
                                <td className="px-2 py-1.5">
                                  <ActionCell
                                    action={act}
                                    locked={locked}
                                    onPick={(a) => toggleItemAction(order.id, idx, a)}
                                    shipDate={fb.itemShipDates?.[idx]}
                                    onShipDateChange={(d) => setItemShipDate(order.id, idx, d)}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Td>
                  </tr>
                )}
                </Fragment>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-sm text-muted-foreground">
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
            <b>逐条操作</b>：展开订单明细后，在每个 SKU 的「操作」列点击
            「入库等待发货 / 预定 / 现货数量 1 入现货库」中的一个按钮即可
            <b>锁定该行状态</b>；再次点击同一按钮可解除锁定。改动会实时同步给下单买手。
          </li>
          <li>
            <b>批量操作</b>：勾选左侧复选框后使用「批量更新入库 / 周期」或「批量上传小票」；适合同一批到货、同一档口拿货的场景。
          </li>
        </ul>
      </Card>

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
              <label className="mb-1 block text-xs text-muted-foreground">商品状态 · 留空不修改</label>
              <Select
                value={bulkGoodsType || "__none"}
                onValueChange={(v) => setBulkGoodsType(v === "__none" ? "" : (v as GoodsType))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">不修改</SelectItem>
                  <SelectItem value="in_stock">现货</SelectItem>
                  <SelectItem value="reserve">预定</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkGoodsType === "reserve" && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">预定出货日期</label>
                <Input
                  type="date"
                  value={bulkShipDate}
                  onChange={(e) => setBulkShipDate(e.target.value)}
                />
              </div>
            )}
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

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function CountdownBadge({ date }: { date?: string }) {
  const d = daysUntil(date);
  if (d === null)
    return <span className="text-[11px] text-muted-foreground">未设置出货日期</span>;
  if (d > 0)
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300">
        还有 {d} 天出货
      </span>
    );
  if (d === 0)
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
        今日出货
      </span>
    );
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded bg-rose-500/15 px-1.5 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-300">
      已逾期 {Math.abs(d)} 天
    </span>
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
  <td colSpan={colSpan} className={`px-3 py-2 align-middle ${className}`}>
    {children}
  </td>
);

function ActionCell({
  action,
  locked,
  onPick,
  shipDate,
  onShipDateChange,
}: {
  action: ItemAction | undefined;
  locked: boolean;
  onPick: (a: ItemAction) => void;
  shipDate?: string;
  onShipDateChange: (d: string) => void;
}) {
  const opts: ItemAction[] = ["wait_ship", "reserve", "to_stock", "out_of_stock"];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {opts.map((a) => {
        const meta = ACTION_META[a];
        const Icon = meta.icon;
        const isActive = action === a;
        const disabled = locked && !isActive;
        return (
          <button
            key={a}
            type="button"
            onClick={() => onPick(a)}
            disabled={disabled}
            title={isActive ? "已锁定 · 点击解除" : meta.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition",
              isActive
                ? `${meta.color} font-medium shadow-sm`
                : "border-border bg-background text-muted-foreground hover:bg-muted",
              disabled && "cursor-not-allowed opacity-40 hover:bg-background",
            )}
          >
            {isActive ? <Lock className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
            {meta.label}
          </button>
        );
      })}
      {action === "reserve" && (
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={shipDate ?? ""}
            onChange={(e) => onShipDateChange(e.target.value)}
            className="h-7 w-[140px] text-[11px]"
          />
          <CountdownBadge date={shipDate} />
        </div>
      )}
    </div>
  );
}