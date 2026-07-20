import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  EXCHANGES,
  EXCHANGE_STATUS_LABEL,
  EXCHANGE_REASON_LABEL,
  EXCHANGE_WAREHOUSE,
  type ExchangeStatus,
} from "@/lib/mock-data";
import { ArrowLeft, CheckCircle2, XCircle, Warehouse, Plane, PackageCheck, Send, Wallet, Info, AlertTriangle } from "lucide-react";
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

// 各状态下管理员应做的动作与注意事项
const STEP_TIP: Partial<Record<ExchangeStatus, { title: string; desc: string; tone: "info" | "warn" }>> = {
  applied: { tone: "warn", title: "待审核", desc: "请核对：① 签收 ≤ 7 天；② 属可换货情形；③ 目标 SKU 可复购。必要时驳回并写明原因。" },
  approved_wait_ship: { tone: "info", title: "等待买手寄回", desc: "已向买手推送集运仓地址。收到快递后请在此录入运单并「确认集运仓已签收」。" },
  cn_received: { tone: "info", title: "待转寄韩国", desc: "请合并至最近一趟韩国批次并录入批次号。" },
  forwarded_kr: { tone: "info", title: "运输至韩国途中", desc: "韩国仓库签收后立即更新，避免档口交换延误。" },
  kr_received: { tone: "info", title: "档口配合中", desc: "确认档口已接货并开始交换。" },
  shop_exchanging: { tone: "warn", title: "档口交换中", desc: "如需买手补运费，请点击「需要补运费」并填写金额；否则等待完成后直接安排重发。" },
  awaiting_return_fee: { tone: "warn", title: "等待买手付款", desc: "买手支付到账后系统自动推进到「运费已收 · 待发货」。" },
  return_fee_paid: { tone: "info", title: "待重新发出", desc: "请录入国际快递单号后点击「重新发出」。" },
  reshipped: { tone: "info", title: "已重发", desc: "买手签收后请点击「标记完成」结束工单。" },
};

type ActionKey =
  | "reject"
  | "approve"
  | "cn_receive"
  | "forward"
  | "kr_receive"
  | "shop_exchange"
  | "request_fee"
  | "reship"
  | "complete";

type FieldDef = {
  key: string;
  label: string;
  required?: boolean;
  type?: "text" | "textarea" | "number";
  placeholder?: string;
  hint?: string;
};

type ActionConfig = {
  title: string;
  desc: string;
  confirmLabel: string;
  destructive?: boolean;
  fields: FieldDef[];
  successToast: (v: Record<string, string>) => string;
};

const ACTIONS: Record<ActionKey, ActionConfig> = {
  reject: {
    title: "驳回换货申请",
    desc: "驳回后买手将收到通知，工单不可再恢复。请填写清晰的驳回理由，便于买手复申。",
    confirmLabel: "确认驳回",
    destructive: true,
    fields: [
      { key: "reason", label: "驳回原因（对买手展示）", required: true, type: "textarea", placeholder: "例：已超过 7 天签收售后期限…" },
    ],
    successToast: () => "已驳回并通知买手",
  },
  approve: {
    title: "通过并通知寄回",
    desc: "通过后系统会向买手推送集运仓地址与寄回须知，请确认已核对换货信息。",
    confirmLabel: "通过并推送地址",
    fields: [
      { key: "note", label: "补充说明（可选，将推送给买手）", type: "textarea", placeholder: "例：请随包附上换货单 PDF…" },
    ],
    successToast: () => "已通过 · 集运仓地址已推送买手",
  },
  cn_receive: {
    title: "确认集运仓已签收",
    desc: "请核对到货实物与买手申请一致，并录入国内快递单号与到货重量。",
    confirmLabel: "确认签收",
    fields: [
      { key: "trackingNo", label: "买手寄回单号", required: true, placeholder: "SF12345678" },
      { key: "weight", label: "到货重量 (g)", required: true, type: "number", placeholder: "如 350" },
    ],
    successToast: (v) => `已确认集运仓签收 · ${v.trackingNo}`,
  },
  forward: {
    title: "并入韩国转寄批次",
    desc: "将该件并入最近一趟韩国批次，确认后无法回退。",
    confirmLabel: "并入批次",
    fields: [
      { key: "batchNo", label: "批次号", required: true, placeholder: "KRB2025W02" },
      { key: "shippedAt", label: "预计寄出时间", required: true, placeholder: "2025-01-08 18:00" },
    ],
    successToast: (v) => `已并入批次 ${v.batchNo}`,
  },
  kr_receive: {
    title: "韩国仓签收",
    desc: "确认档口/韩国仓已接货，请录入实际签收时间。",
    confirmLabel: "确认韩国签收",
    fields: [
      { key: "receivedAt", label: "签收时间", required: true, placeholder: "2025-01-10 15:20" },
    ],
    successToast: () => "已确认韩国签收",
  },
  shop_exchange: {
    title: "进入档口交换",
    desc: "确认档口开始进行换货操作，之后可选择是否需要买手补运费。",
    confirmLabel: "进入档口交换",
    fields: [
      { key: "shop", label: "档口名称", required: true, placeholder: "MILK 女装 · A-102" },
    ],
    successToast: () => "已进入档口交换流程",
  },
  request_fee: {
    title: "通知买手补运费",
    desc: "买手支付到账后工单自动进入「运费已收 · 待发货」。请确认金额准确。",
    confirmLabel: "推送买手支付",
    fields: [
      { key: "amount", label: "补运费金额 (CNY)", required: true, type: "number", placeholder: "如 45" },
      { key: "reason", label: "费用说明（对买手展示）", required: true, type: "textarea", placeholder: "例：一件羽绒服国际快递差额…" },
    ],
    successToast: (v) => `已通知买手支付 ¥${v.amount}`,
  },
  reship: {
    title: "重新发出",
    desc: "请录入国际快递承运商与运单号，确认后将同步给买手。",
    confirmLabel: "确认发出",
    fields: [
      { key: "carrier", label: "承运商", required: true, placeholder: "SF / EMS / CJ 大韩通运…" },
      { key: "trackingNo", label: "国际运单号", required: true, placeholder: "SF88888888888" },
    ],
    successToast: (v) => `已重发 · ${v.carrier} ${v.trackingNo}`,
  },
  complete: {
    title: "标记工单完成",
    desc: "确认买手已签收换货并无异议后再操作，完成后不可撤回。",
    confirmLabel: "确认完成",
    fields: [],
    successToast: () => "工单已完成",
  },
};

function AdminExchangeDetail() {
  const { id } = Route.useParams();
  const e = EXCHANGES.find((x) => x.id === id);
  if (!e) throw notFound();
  const idx = stepIndex(e.status);
  const [pending, setPending] = useState<ActionKey | null>(null);
  const tip = STEP_TIP[e.status];

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/admin/after-sales"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回售后管理
        </Link>
        <div className="flex flex-wrap gap-2">
          {e.status === "applied" && (
            <>
              <Button size="sm" variant="destructive" onClick={() => setPending("reject")}>
                <XCircle className="mr-1 h-4 w-4" />
                驳回
              </Button>
              <Button size="sm" onClick={() => setPending("approve")}>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                通过并通知寄回
              </Button>
            </>
          )}
          {e.status === "approved_wait_ship" && (
            <Button size="sm" onClick={() => setPending("cn_receive")}>
              <Warehouse className="mr-1 h-4 w-4" />
              确认集运仓已签收
            </Button>
          )}
          {e.status === "cn_received" && (
            <Button size="sm" onClick={() => setPending("forward")}>
              <Plane className="mr-1 h-4 w-4" />
              并入转寄批次
            </Button>
          )}
          {e.status === "forwarded_kr" && (
            <Button size="sm" onClick={() => setPending("kr_receive")}>
              <PackageCheck className="mr-1 h-4 w-4" />
              韩国签收
            </Button>
          )}
          {e.status === "kr_received" && (
            <Button size="sm" onClick={() => setPending("shop_exchange")}>
              进入档口交换
            </Button>
          )}
          {e.status === "shop_exchanging" && (
            <Button size="sm" onClick={() => setPending("request_fee")}>
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
            <Button size="sm" onClick={() => setPending("reship")}>
              <Send className="mr-1 h-4 w-4" />
              重新发出
            </Button>
          )}
          {e.status === "reshipped" && (
            <Button size="sm" onClick={() => setPending("complete")}>
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

      {tip && (
        <div
          className={`mb-4 flex gap-2 rounded-md border p-3 text-xs ${
            tip.tone === "warn"
              ? "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
              : "border-sky-300 bg-sky-50 text-sky-900 dark:bg-sky-950/30 dark:text-sky-200"
          }`}
        >
          {tip.tone === "warn" ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div>
            <div className="font-medium">{tip.title} · 下一步指引</div>
            <div className="mt-0.5 opacity-90">{tip.desc}</div>
          </div>
        </div>
      )}

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

      <ActionDialog
        actionKey={pending}
        onClose={() => setPending(null)}
      />
    </AdminShell>
  );
}

function ActionDialog({ actionKey, onClose }: { actionKey: ActionKey | null; onClose: () => void }) {
  const cfg = actionKey ? ACTIONS[actionKey] : null;
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // reset values whenever the dialog opens on a new action
  const open = !!cfg;
  const currentKey = actionKey ?? "";
  // Simple reset via key prop on inner form
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setValues({});
          setErrors({});
          onClose();
        }
      }}
    >
      {cfg && (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{cfg.title}</DialogTitle>
            <DialogDescription>{cfg.desc}</DialogDescription>
          </DialogHeader>
          <form
            key={currentKey}
            className="space-y-3"
            onSubmit={(ev) => {
              ev.preventDefault();
              const nextErr: Record<string, string> = {};
              for (const f of cfg.fields) {
                const v = (values[f.key] ?? "").trim();
                if (f.required && !v) nextErr[f.key] = "此项必填";
                else if (f.type === "number" && v && !(Number(v) > 0)) nextErr[f.key] = "请输入大于 0 的数值";
              }
              if (Object.keys(nextErr).length) {
                setErrors(nextErr);
                toast.error("请补全必填项后再提交");
                return;
              }
              toast.success(cfg.successToast(values));
              setValues({});
              setErrors({});
              onClose();
            }}
          >
            {cfg.fields.length === 0 && (
              <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                无需额外填写，请确认后提交。
              </div>
            )}
            {cfg.fields.map((f) => (
              <div key={f.key}>
                <Label className="text-xs">
                  {f.label}
                  {f.required && <span className="ml-1 text-destructive">*</span>}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea
                    className="mt-1"
                    rows={3}
                    placeholder={f.placeholder}
                    value={values[f.key] ?? ""}
                    onChange={(ev) => setValues((s) => ({ ...s, [f.key]: ev.target.value }))}
                  />
                ) : (
                  <Input
                    className="mt-1"
                    type={f.type === "number" ? "number" : "text"}
                    placeholder={f.placeholder}
                    value={values[f.key] ?? ""}
                    onChange={(ev) => setValues((s) => ({ ...s, [f.key]: ev.target.value }))}
                  />
                )}
                {(errors[f.key] || f.hint) && (
                  <div className={`mt-1 text-[11px] ${errors[f.key] ? "text-destructive" : "text-muted-foreground"}`}>
                    {errors[f.key] ?? f.hint}
                  </div>
                )}
              </div>
            ))}
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" variant={cfg.destructive ? "destructive" : "default"}>
                {cfg.confirmLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
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