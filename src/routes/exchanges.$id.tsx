import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EXCHANGES,
  EXCHANGE_STATUS_LABEL,
  EXCHANGE_REASON_LABEL,
  EXCHANGE_WAREHOUSE,
  type ExchangeStatus,
} from "@/lib/mock-data";
import { Copy, Warehouse, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/exchanges/$id")({
  component: BuyerExchangeDetail,
  notFoundComponent: () => (
    <MobileShell>
      <div className="p-8 text-center text-sm">工单不存在</div>
    </MobileShell>
  ),
});

const STEPS: { key: ExchangeStatus; label: string; hint: string }[] = [
  { key: "applied", label: "申请已提交", hint: "客服会在 24 小时内审核" },
  { key: "approved_wait_ship", label: "审核通过 · 请寄回集运仓", hint: "填写快递单号后系统会追踪签收" },
  { key: "cn_received", label: "国内集运仓已签收", hint: "等待并入韩国转寄批次" },
  { key: "forwarded_kr", label: "已转寄韩国", hint: "跨境物流约 3-5 个工作日" },
  { key: "kr_received", label: "韩国档口已签收", hint: "档口开始为你配货" },
  { key: "shop_exchanging", label: "档口交换中", hint: "档口正在为你更换新品，请耐心等待" },
  { key: "awaiting_return_fee", label: "待补运费", hint: "请在下方支付国际回运运费" },
  { key: "return_fee_paid", label: "运费已收 · 待发货", hint: "平台正在为你安排出库" },
  { key: "reshipped", label: "已重新发出", hint: "跨境物流回到你手上" },
  { key: "completed", label: "换货完成", hint: "本次换货已结案" },
];

function BuyerExchangeDetail() {
  const { id } = Route.useParams();
  const e = EXCHANGES.find((x) => x.id === id);
  if (!e) throw notFound();
  const idx = e.status === "rejected" ? -1 : STEPS.findIndex((s) => s.key === e.status);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    toast.success("已复制");
  };

  return (
    <MobileShell>
      <MobileHeader title="换货详情" back />
      <div className="bg-primary px-4 py-5 text-primary-foreground">
        <Badge variant="secondary" className="mb-2">{EXCHANGE_STATUS_LABEL[e.status]}</Badge>
        <div className="text-xs opacity-80">{e.id} · 关联订单 {e.orderId}</div>
      </div>

      {e.status === "approved_wait_ship" && (
        <div className="mx-4 mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 dark:bg-rose-950/30">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Warehouse className="h-4 w-4" /> 请将货物寄回平台国内集运仓
          </div>
          <div className="mt-2 space-y-1 rounded-lg bg-background/60 p-2.5 text-xs">
            <RowCopy k="收件方" v={EXCHANGE_WAREHOUSE.name} onCopy={copy} />
            <RowCopy k="地址" v={EXCHANGE_WAREHOUSE.address} onCopy={copy} />
            <RowCopy k="电话" v={EXCHANGE_WAREHOUSE.contact} onCopy={copy} />
            <RowCopy k="邮编" v={EXCHANGE_WAREHOUSE.zip} onCopy={copy} />
            <div className="pt-1 text-[11px] text-muted-foreground">
              寄件时请在包裹外注明工单号 <b className="text-rose-600">{e.id}</b>，签收时段 {EXCHANGE_WAREHOUSE.hours}。
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <Label className="text-xs">寄回快递单号</Label>
            <div className="flex gap-2">
              <Input placeholder="例：SF1234567890" className="h-9 flex-1 text-sm" />
              <Button size="sm" onClick={() => toast.success("已提交，等待集运仓签收")}>提交</Button>
            </div>
          </div>
        </div>
      )}

      {e.status === "awaiting_return_fee" && (
        <div className="mx-4 mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 dark:bg-rose-950/30">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="h-4 w-4" /> 请补交国际回运运费
          </div>
          <div className="mt-2 rounded-lg bg-background/60 p-2.5 text-xs text-muted-foreground">
            档口交换完成，重新发出需补交国际回运运费。支付后平台将安排出库。
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-background/60 p-2.5">
            <div>
              <div className="text-[11px] text-muted-foreground">应付金额</div>
              <div className="text-lg font-semibold text-rose-600">
                ¥{(e.returnFee?.amountCNY ?? 45).toFixed(2)}
              </div>
            </div>
            <Button size="sm" onClick={() => toast.success("已支付，等待平台确认发货")}>
              立即补运费
            </Button>
          </div>
        </div>
      )}

      {(e.status === "return_fee_paid" || e.status === "reshipped" || e.status === "completed") && e.returnFee && (
        <div className="mx-4 mt-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs dark:bg-emerald-950/30 dark:text-emerald-200">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="h-4 w-4" /> 补运费 ¥{e.returnFee.amountCNY.toFixed(2)} 已收
          </div>
          <div className="mt-1 text-muted-foreground">平台正在安排出库，请留意物流通知。</div>
        </div>
      )}

      {e.status === "rejected" && e.rejectReason && (
        <div className="mx-4 mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          <div className="mb-1 font-medium">申请未通过</div>
          {e.rejectReason}
          <div className="mt-2 text-right">
            <Link to="/support">
              <Button size="sm" variant="outline">联系客服</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mx-4 mt-3 rounded-xl border border-border bg-card p-3">
        <div className="mb-2 text-sm font-medium">换货明细</div>
        <div className="flex gap-3">
          <img src={e.item.image} alt="" className="h-16 w-16 rounded-md object-cover" />
          <div className="flex-1 text-xs">
            <div className="line-clamp-2">{e.item.productName}</div>
            <div className="mt-1">
              <span className="text-muted-foreground line-through">原：{e.item.fromColor} / {e.item.fromSize}</span>
            </div>
            <div>
              <span className="font-medium">换：{e.item.toColor} / {e.item.toSize} ×{e.item.qty}</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              原因：{EXCHANGE_REASON_LABEL[e.reason]}
            </div>
            {e.note && (
              <div className="mt-1 rounded-md bg-muted/50 p-2 text-[11px]">{e.note}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-xl border border-border bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
          <Truck className="h-4 w-4" /> 物流轨迹
        </div>
        <ul className="space-y-2 text-xs">
          <Leg label="① 我 → 国内集运仓" data={e.buyerToCn} placeholder="待寄出" />
          <Leg
            label="② 集运仓 → 韩国档口"
            data={
              e.cnToKr && {
                carrier: `批次 ${e.cnToKr.batchNo}`,
                trackingNo: "跨境集运",
                shippedAt: e.cnToKr.shippedAt,
                receivedAt: e.cnToKr.receivedAt,
              }
            }
            placeholder="等待集运仓签收后并入批次"
          />
          <Leg label="③ 韩国 → 我" data={e.krToBuyer} placeholder="档口配货完成后寄出" />
        </ul>
      </div>

      <div className="mx-4 mt-3 mb-6 rounded-xl border border-border bg-card p-3">
        <div className="mb-2 text-sm font-medium">状态进度</div>
        <ol className="space-y-2">
          {STEPS.map((s, i) => {
            const done = e.status !== "rejected" && i <= idx;
            const active = i === idx;
            return (
              <li key={s.key} className="flex gap-3">
                <div
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    active ? "bg-primary" : done ? "bg-primary/60" : "bg-muted"
                  }`}
                />
                <div className="text-xs">
                  <div className={`font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </div>
                  {active && (
                    <div className="text-[11px] text-muted-foreground">{s.hint}</div>
                  )}
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
      </div>
    </MobileShell>
  );
}

function RowCopy({ k, v, onCopy }: { k: string; v: string; onCopy: (t: string) => void }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="shrink-0 text-muted-foreground">{k}</span>
      <button onClick={() => onCopy(v)} className="flex items-start gap-1 text-right text-foreground">
        <span className="text-xs">{v}</span>
        <Copy className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
      </button>
    </div>
  );
}

function Leg({
  label,
  data,
  placeholder,
}: {
  label: string;
  data?: { carrier: string; trackingNo: string; shippedAt?: string; receivedAt?: string };
  placeholder: string;
}) {
  return (
    <li className="rounded-md bg-muted/40 p-2">
      <div className="mb-1 font-medium">{label}</div>
      {data ? (
        <div className="space-y-0.5 text-muted-foreground">
          <div>{data.carrier} · <span className="font-mono">{data.trackingNo}</span></div>
          {data.shippedAt && <div>寄出 {data.shippedAt}</div>}
          {data.receivedAt && <div>签收 {data.receivedAt}</div>}
        </div>
      ) : (
        <div className="text-[11px] text-muted-foreground">{placeholder}</div>
      )}
    </li>
  );
}