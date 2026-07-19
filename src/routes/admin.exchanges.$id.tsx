import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EXCHANGES,
  EXCHANGE_STATUS_LABEL,
  EXCHANGE_REASON_LABEL,
  EXCHANGE_WAREHOUSE,
  type ExchangeStatus,
} from "@/lib/mock-data";
import { ArrowLeft, CheckCircle2, XCircle, Warehouse, Plane, PackageCheck, Send, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/exchanges/$id")({
  head: () => ({ meta: [{ title: "换货工单详情 · 运营后台" }] }),
  component: AdminExchangeDetail,
});

const STEPS: { key: ExchangeStatus; label: string }[] = [
  { key: "applied", label: "买手提交" },
  { key: "approved_wait_ship", label: "客服审核通过" },
  { key: "cn_received", label: "集运仓签收" },
  { key: "forwarded_kr", label: "转寄韩国" },
  { key: "kr_received", label: "韩国档口签收" },
  { key: "shop_exchanging", label: "档口交换中" },
  { key: "awaiting_return_fee", label: "待买家补运费" },
  { key: "return_fee_paid", label: "运费已收 · 待发货" },
  { key: "reshipped", label: "重新发出" },
  { key: "completed", label: "完成" },
];

function stepIndex(s: ExchangeStatus) {
  if (s === "rejected") return -1;
  return STEPS.findIndex((x) => x.key === s);
}

function AdminExchangeDetail() {
  const { id } = Route.useParams();
  const e = EXCHANGES.find((x) => x.id === id);
  if (!e) throw notFound();
  const idx = stepIndex(e.status);

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/admin/exchanges"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回换货列表
        </Link>
        <div className="flex flex-wrap gap-2">
          {e.status === "applied" && (
            <>
              <Button size="sm" variant="destructive" onClick={() => toast.warning("已驳回")}>
                <XCircle className="mr-1 h-4 w-4" />
                驳回
              </Button>
              <Button size="sm" onClick={() => toast.success("已通过 · 已推送国内集运仓地址给买手")}>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                通过并通知寄回
              </Button>
            </>
          )}
          {e.status === "approved_wait_ship" && (
            <Button size="sm" onClick={() => toast.success("已确认集运仓签收")}>
              <Warehouse className="mr-1 h-4 w-4" />
              确认集运仓已签收
            </Button>
          )}
          {e.status === "cn_received" && (
            <Button size="sm" onClick={() => toast.success("已并入韩国转寄批次")}>
              <Plane className="mr-1 h-4 w-4" />
              并入转寄批次
            </Button>
          )}
          {e.status === "forwarded_kr" && (
            <Button size="sm" onClick={() => toast.success("韩国已签收")}>
              <PackageCheck className="mr-1 h-4 w-4" />
              韩国签收
            </Button>
          )}
          {e.status === "kr_received" && (
            <Button size="sm" onClick={() => toast.success("已进入档口交换流程")}>
              进入档口交换
            </Button>
          )}
          {e.status === "shop_exchanging" && (
            <Button size="sm" onClick={() => toast.success("已通知买家补运费")}>
              <Wallet className="mr-1 h-4 w-4" />
              需要补运费
            </Button>
          )}
          {e.status === "awaiting_return_fee" && (
            <Button size="sm" variant="outline" disabled>
              等待买家支付
            </Button>
          )}
          {e.status === "return_fee_paid" && (
            <Button size="sm" onClick={() => toast.success("已重新发出")}>
              <Send className="mr-1 h-4 w-4" />
              重新发出
            </Button>
          )}
          {e.status === "reshipped" && (
            <Button size="sm" onClick={() => toast.success("工单已完成")}>
              标记完成
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="font-mono text-xl font-semibold">{e.id}</h1>
        <Badge>{EXCHANGE_STATUS_LABEL[e.status]}</Badge>
        <span className="text-xs text-muted-foreground">关联订单 {e.orderId}</span>
        <span className="text-xs text-muted-foreground">提交于 {e.createdAt}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">换货明细</div>
            <div className="flex gap-3">
              <img src={e.item.image} alt="" className="h-20 w-20 rounded object-cover" />
              <div className="flex-1 text-sm">
                <div>{e.item.productName}</div>
                <div className="mt-1 text-xs">
                  <span className="text-muted-foreground line-through">
                    原：{e.item.fromColor} / {e.item.fromSize}
                  </span>
                  <span className="mx-2">→</span>
                  <span className="font-medium">
                    换：{e.item.toColor} / {e.item.toSize} ×{e.item.qty}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  原因：{EXCHANGE_REASON_LABEL[e.reason]}
                </div>
                {e.note && (
                  <div className="mt-1 rounded-md bg-muted/50 p-2 text-xs">{e.note}</div>
                )}
              </div>
            </div>
            {e.photos && e.photos.length > 0 && (
              <div className="mt-3">
                <div className="mb-1 text-xs text-muted-foreground">买手上传凭证</div>
                <div className="flex gap-2">
                  {e.photos.map((p, i) => (
                    <img
                      key={i}
                      src={p}
                      alt="凭证"
                      className="h-20 w-20 rounded border border-border object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="mb-3 text-sm font-semibold">物流三段</div>
            <div className="grid gap-3 md:grid-cols-3">
              <LegCard
                title="① 买手 → 国内集运仓"
                data={e.buyerToCn}
                empty="待买手寄出后由系统 / 客服录入"
                canEdit={e.status === "approved_wait_ship" || e.status === "cn_received"}
              />
              <LegCard
                title="② 集运仓 → 韩国档口"
                data={
                  e.cnToKr && {
                    carrier: `批次 ${e.cnToKr.batchNo}`,
                    trackingNo: "—",
                    shippedAt: e.cnToKr.shippedAt,
                    receivedAt: e.cnToKr.receivedAt,
                  }
                }
                empty="集运仓签收后合并批次转寄"
                canEdit={e.status === "cn_received" || e.status === "forwarded_kr"}
              />
              <LegCard
                title="③ 韩国 → 买手"
                data={e.krToBuyer}
                empty="档口配货完成后再录入"
                canEdit={e.status === "return_fee_paid" || e.status === "reshipped"}
              />
            </div>
          </Card>

          {(e.status === "awaiting_return_fee" || e.status === "return_fee_paid" || e.status === "reshipped" || e.status === "completed") && (
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Wallet className="h-4 w-4" /> 补运费
              </div>
              <div className="grid gap-3 md:grid-cols-3 text-xs">
                <div>
                  <Label className="text-[11px]">金额(CNY)</Label>
                  <Input defaultValue={e.returnFee?.amountCNY ?? 45} className="mt-1 h-8" />
                </div>
                <div>
                  <Label className="text-[11px]">发起时间</Label>
                  <div className="mt-1 text-muted-foreground">{e.returnFee?.requestedAt ?? "—"}</div>
                </div>
                <div>
                  <Label className="text-[11px]">买家支付时间</Label>
                  <div className="mt-1 text-muted-foreground">
                    {e.status === "awaiting_return_fee" ? (
                      <span className="text-rose-600">等待中</span>
                    ) : (
                      e.returnFee?.paidAt ?? "已收款"
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                运费到账后，工单自动进入「运费已收 · 待发货」，可在物流管理「不良交换 · 待发货」队列中发货。
              </div>
            </Card>
          )}

          {e.status === "applied" && (
            <Card className="border-rose-200 bg-rose-50/60 p-4 text-xs dark:bg-rose-950/20">
              <div className="mb-1 font-medium text-rose-700 dark:text-rose-300">审核提醒</div>
              请核对：① 是否在签收后 7 日内；② 是否属于可换货情形；③ 期望 SKU 是否可复购。若不受理请勾选"驳回"并填写原因，买手端将同步展示。
            </Card>
          )}

          {e.status === "rejected" && e.rejectReason && (
            <Card className="border-rose-200 p-4 text-xs">
              <div className="mb-1 font-medium text-rose-600">已驳回</div>
              {e.rejectReason}
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">流转轨迹</div>
            <ol className="space-y-3">
              {STEPS.map((s, i) => {
                const done = e.status !== "rejected" && i <= idx;
                const active = i === idx;
                return (
                  <li key={s.key} className="flex gap-3">
                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        done ? (active ? "bg-primary" : "bg-primary/60") : "bg-muted"
                      }`}
                    />
                    <div className="text-xs">
                      <div className={`font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {s.label}
                      </div>
                    </div>
                  </li>
                );
              })}
              {e.status === "rejected" && (
                <li className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  <div className="text-xs font-medium text-rose-600">已驳回</div>
                </li>
              )}
            </ol>
          </Card>

          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">国内集运仓</div>
            <div className="space-y-0.5 text-xs text-muted-foreground">
              <div className="text-foreground">{EXCHANGE_WAREHOUSE.name}</div>
              <div>{EXCHANGE_WAREHOUSE.address}</div>
              <div>
                {EXCHANGE_WAREHOUSE.contact} · 邮编 {EXCHANGE_WAREHOUSE.zip}
              </div>
              <div>签收 {EXCHANGE_WAREHOUSE.hours}</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">运营备注</div>
            <Textarea placeholder="内部备注（买手不可见）…" className="min-h-24" />
            <div className="mt-2 text-right">
              <Button size="sm" onClick={() => toast.success("备注已保存")}>
                保存
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function LegCard({
  title,
  data,
  empty,
  canEdit,
}: {
  title: string;
  data?: { carrier: string; trackingNo: string; shippedAt?: string; receivedAt?: string };
  empty: string;
  canEdit: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 text-xs font-medium">{title}</div>
      {data ? (
        <div className="space-y-1 text-xs">
          <div>
            <span className="text-muted-foreground">承运：</span>
            {data.carrier}
          </div>
          <div className="font-mono">{data.trackingNo}</div>
          {data.shippedAt && (
            <div className="text-muted-foreground">寄出 {data.shippedAt}</div>
          )}
          {data.receivedAt && (
            <div className="text-muted-foreground">签收 {data.receivedAt}</div>
          )}
        </div>
      ) : (
        <div className="text-[11px] text-muted-foreground">{empty}</div>
      )}
      {canEdit && (
        <div className="mt-3 space-y-1">
          <Label className="text-[11px]">录入/更新单号</Label>
          <Input placeholder="快递单号 / 批次号" className="h-8 text-xs" />
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => toast.success("已更新")}
          >
            保存
          </Button>
        </div>
      )}
    </div>
  );
}