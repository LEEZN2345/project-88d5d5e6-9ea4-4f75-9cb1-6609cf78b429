import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import {
  ORDERS,
  SHOPS,
  findStockMatch,
  type ShipStatus,
  type ShipSource,
  formatKRW,
} from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import {
  PackageCheck,
  Truck,
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";

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
  trackingNo?: string;
  carrier?: string;
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
        trackingNo: o.logisticsNo,
      });
    });
  });
  return rows;
}

const TEMPLATE_FIELDS = [
  { name: "订单号", required: true, example: "DD20251128001" },
  { name: "运单号", required: true, example: "DDKR202511280001" },
  { name: "物流商", required: true, example: "通关社A" },
  { name: "当前节点", required: true, example: "起运" },
  { name: "节点时间", required: true, example: "2025-11-28 22:00" },
  { name: "备注", required: false, example: "航班 KE5523" },
];
const NODE_ENUM = ["韩国仓入库", "打包出库", "起运", "到港清关", "国内派送", "已签收"];
const CARRIERS = ["顺丰速运", "圆通速递", "中通快递", "韵达快递", "京东物流", "EMS", "通关社A", "通关社B"];

function AdminShipping() {
  const [tab, setTab] = useState<"queue" | "import">("queue");
  const [rows, setRows] = useState<ShipRow[]>(() => buildRows());
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [srcFilter, setSrcFilter] = useState<ShipSource | "all">("all");
  const [stFilter, setStFilter] = useState<ShipStatus | "all">("all");
  const [confirmRow, setConfirmRow] = useState<ShipRow | null>(null);
  const [formTracking, setFormTracking] = useState("");
  const [formCarrier, setFormCarrier] = useState("");
  const [formErr, setFormErr] = useState<{ t?: string; c?: string }>({});

  const openConfirm = (r: ShipRow) => {
    setConfirmRow(r);
    setFormTracking(r.trackingNo ?? "");
    setFormCarrier(r.carrier ?? "");
    setFormErr({});
  };

  const submitConfirm = () => {
    const t = formTracking.trim();
    const c = formCarrier.trim();
    const err: { t?: string; c?: string } = {};
    if (!t) err.t = "请填写运单号";
    else if (t.length > 64) err.t = "运单号过长";
    if (!c) err.c = "请选择物流方式";
    if (err.t || err.c) {
      setFormErr(err);
      return;
    }
    if (!confirmRow) return;
    setRows((rs) =>
      rs.map((x) =>
        x.key === confirmRow.key
          ? { ...x, trackingNo: t, carrier: c, status: "shipped" }
          : x,
      ),
    );
    toast.success("已确认发货", {
      description: `订单 ${confirmRow.orderId} · ${c} · ${t}，已同步至用户后台`,
    });
    setConfirmRow(null);
  };

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
      withTracking: rows.filter((r) => r.trackingNo).length,
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
            onClick={() => setTab("import")}
            className={`rounded-full px-3 py-1 ${tab === "import" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <Upload className="mr-1 inline h-3.5 w-3.5" /> 批量物流导入
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-5">
        <Stat label="待发货总数" value={stats.total} />
        <Stat label="新订单代订" value={stats.newOrder} />
        <Stat label="走现货库" value={stats.stock} tone="emerald" />
        <Stat label="已回填运单" value={stats.withTracking} />
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
            {(["all", "pending", "shipped"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setStFilter(k)}
                className={`rounded-full px-2.5 py-1 ${stFilter === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {k === "all" ? "全部" : k === "pending" ? "未发货" : "已发货"}
              </button>
            ))}
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              已选 {Object.values(checked).filter(Boolean).length} 项
            </span>
            <Button size="sm" disabled={!someChecked} onClick={() => bulkAdvance("shipped")}>
              批量：确认发货
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
                  <Th>运单号 / 物流</Th>
                  <Th>操作</Th>
                  <Th>状态</Th>
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
                    <Td className="text-xs">
                      <Input
                        value={r.trackingNo ?? ""}
                        onChange={(e) =>
                          setRows((rs) =>
                            rs.map((x) =>
                              x.key === r.key ? { ...x, trackingNo: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="待回填"
                        className="h-7 w-36 font-mono text-[11px]"
                      />
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-1">
                        {r.status !== "shipped" ? (
                          <Button
                            size="sm"
                            className="h-7 text-[11px]"
                            onClick={() => openConfirm(r)}
                          >
                            确认发货
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">已完成</span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <Badge variant={r.status === "shipped" ? "default" : "secondary"}>
                        {r.status === "shipped" ? "已发货" : "未发货"}
                      </Badge>
                    </Td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-3 py-8 text-center text-xs text-muted-foreground">
                      没有符合条件的发货任务
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === "import" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-10 text-center">
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <div className="text-sm font-medium">拖拽 Excel 文件到此处</div>
              <div className="mt-1 text-xs text-muted-foreground">
                支持 .xlsx / .xls，单次最多 5000 行 · 用于批量给「已打包 / 已发货」任务回填运单号 & 物流节点
              </div>
              <Button className="mt-4" size="sm">选择文件</Button>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">需要模板？</span>
              <Button variant="outline" size="sm">
                <Download className="mr-1 h-3 w-3" />下载模板 v1
              </Button>
            </div>
            <div className="mt-4 rounded-md bg-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
              <b className="text-foreground">导入逻辑：</b>系统按「订单号」匹配发货任务，将「运单号 / 物流商」写入发货队列并推进状态至<b className="text-foreground">已发货</b>；同一订单号后续行只更新「物流节点 / 时间」到订单时间线。异常行（订单不存在、状态非法、节点枚举错误）打包成错误报告可下载。
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <FileSpreadsheet className="h-4 w-4" /> 模板 v1 字段
            </div>
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1 text-left">字段</th>
                  <th className="py-1 text-left">必填</th>
                  <th className="py-1 text-left">示例</th>
                </tr>
              </thead>
              <tbody>
                {TEMPLATE_FIELDS.map((f) => (
                  <tr key={f.name} className="border-t border-border">
                    <td className="py-1 font-medium">{f.name}</td>
                    <td className="py-1">{f.required ? "是" : "否"}</td>
                    <td className="py-1 font-mono text-muted-foreground">{f.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-[11px] text-muted-foreground">
              「当前节点」枚举值：{NODE_ENUM.join(" / ")}
            </div>
          </Card>

          <Card className="p-4 md:col-span-2">
            <div className="text-sm font-semibold">近期上传记录</div>
            <table className="mt-2 w-full text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1 text-left">文件名</th>
                  <th className="py-1 text-left">上传时间</th>
                  <th className="py-1 text-left">总行数</th>
                  <th className="py-1 text-left">成功</th>
                  <th className="py-1 text-left">异常</th>
                  <th className="py-1 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: "logistics_1128.xlsx", t: "2025-11-28 19:42", total: 412, ok: 408, err: 4 },
                  { f: "logistics_1127.xlsx", t: "2025-11-27 18:30", total: 356, ok: 356, err: 0 },
                ].map((r) => (
                  <tr key={r.f} className="border-t border-border">
                    <td className="py-1">{r.f}</td>
                    <td className="py-1">{r.t}</td>
                    <td className="py-1">{r.total}</td>
                    <td className="py-1 text-emerald-600">{r.ok}</td>
                    <td className="py-1 text-rose-500">{r.err}</td>
                    <td className="py-1">
                      {r.err > 0 ? (
                        <Button size="sm" variant="outline">下载异常报告</Button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">发货管理说明</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li><b>新订单代订</b>：档口 2 件起拍时用户下 1 件，系统代订 2 件；1 件出库给买手，另 1 件自动入现货库。</li>
          <li><b>现货库出库</b>：在<span className="text-foreground">新订单管理</span>点「是否发现货 · 是」后，该 SKU 会自动切换到现货库出库，无需再向档口下单。</li>
          <li><b>批量操作</b>：勾选后可批量推进拣货中 / 已打包 / 已发货。</li>
          <li><b>批量物流导入</b>：通关社回单 Excel 上传后，系统按订单号匹配任务并回填运单号 / 推进物流节点。也可在发货队列的「运单号」列手动填写。</li>
          <li><b>现货库</b>请到<span className="text-foreground">现货管理</span>页维护。</li>
        </ul>
      </Card>

      <Dialog open={!!confirmRow} onOpenChange={(o) => !o && setConfirmRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认发货</DialogTitle>
            <DialogDescription>
              {confirmRow ? `订单 ${confirmRow.orderId} · ${confirmRow.productName}` : ""}
              <br />
              填写运单号与物流方式后，将同步到用户订单后台。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="tracking">
                运单号<span className="text-rose-500">*</span>
              </Label>
              <Input
                id="tracking"
                value={formTracking}
                maxLength={64}
                onChange={(e) => {
                  setFormTracking(e.target.value);
                  if (formErr.t) setFormErr((s) => ({ ...s, t: undefined }));
                }}
                placeholder="例如 DDKR202511280001"
                className="font-mono text-sm"
              />
              {formErr.t && <p className="text-xs text-rose-500">{formErr.t}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="carrier">
                物流方式<span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formCarrier}
                onValueChange={(v) => {
                  setFormCarrier(v);
                  if (formErr.c) setFormErr((s) => ({ ...s, c: undefined }));
                }}
              >
                <SelectTrigger id="carrier">
                  <SelectValue placeholder="请选择物流方式" />
                </SelectTrigger>
                <SelectContent>
                  {CARRIERS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErr.c && <p className="text-xs text-rose-500">{formErr.c}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRow(null)}>
              取消
            </Button>
            <Button onClick={submitConfirm}>确认发货并同步</Button>
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