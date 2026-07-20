import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { REFUNDS, formatCNY } from "@/lib/mock-data";
import { ArrowLeft, CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/refunds/$id")({
  head: () => ({ meta: [{ title: "退款工单详情 · 运营后台" }] }),
  component: RefundDetail,
});

const STATUS: Record<string, string> = {
  cs_pending: "待客服提单",
  finance_pending: "待财务复核",
  paid: "已打款",
  rejected: "已驳回",
};

const SCENARIO: Record<string, string> = {
  out_of_stock: "订单断货",
  platform_initiated: "平台主动联系退款",
};

const STEP_TIP: Record<string, { tone: "info" | "warn"; title: string; desc: string }> = {
  cs_pending: { tone: "warn", title: "待客服提单", desc: "请核对退款场景、金额与订单一致，无异常后提单至财务。" },
  finance_pending: { tone: "warn", title: "待财务复核", desc: "复核前请上传回执截图并填写流水号；驳回需填写清晰原因。" },
  paid: { tone: "info", title: "已打款", desc: "已完成资金流出，如需补充凭证请通过运营备注登记。" },
  rejected: { tone: "info", title: "已驳回", desc: "工单已终止，如买手异议请另开工单。" },
};

type ActionKey = "cs_submit" | "finance_pay" | "reject";

type FieldDef = { key: string; label: string; required?: boolean; type?: "text" | "textarea"; placeholder?: string };
type ActionConfig = {
  title: string;
  desc: string;
  confirmLabel: string;
  destructive?: boolean;
  fields: FieldDef[];
  successToast: string;
};

const ACTIONS: Record<ActionKey, ActionConfig> = {
  cs_submit: {
    title: "客服提单至财务",
    desc: "提单后工单不可再由客服修改，请确认金额、场景与订单一致。",
    confirmLabel: "确认提单",
    fields: [
      { key: "note", label: "提单备注（内部可见）", required: true, type: "textarea", placeholder: "例：档口断货 2 件，已与买手确认…" },
    ],
    successToast: "已提单至财务",
  },
  finance_pay: {
    title: "财务复核打款",
    desc: "请确认退款账户、流水号与回执截图齐全，提交后即视为对外打款。",
    confirmLabel: "确认打款",
    fields: [
      { key: "account", label: "退款账户", required: true, placeholder: "微信 · 张** / 支付宝 · 李**" },
      { key: "txn", label: "退款流水号", required: true, placeholder: "如 4200002345XXXXXXXX" },
      { key: "receipt", label: "回执截图 URL", required: true, placeholder: "https://…" },
    ],
    successToast: "已完成打款",
  },
  reject: {
    title: "驳回退款申请",
    desc: "驳回后工单终止，请写明清晰原因，避免二次工单反复。",
    confirmLabel: "确认驳回",
    destructive: true,
    fields: [
      { key: "reason", label: "驳回原因（对客服/买手可见）", required: true, type: "textarea", placeholder: "例：金额与订单实付不一致，请复核后重开工单…" },
    ],
    successToast: "已驳回",
  },
};

function RefundDetail() {
  const { id } = Route.useParams();
  const r = REFUNDS.find((x) => x.id === id) ?? REFUNDS[0]!;
  const [pending, setPending] = useState<ActionKey | null>(null);
  const tip = STEP_TIP[r.status];

  const steps = [
    { label: "买手申请", done: true, who: "陈**", time: "2025-11-28 10:00" },
    { label: "客服提单", done: !!r.csUser, who: r.csUser, time: r.createdAt },
    { label: "财务复核", done: r.status === "paid" || r.status === "rejected", who: r.financeUser, time: r.status === "paid" ? "2025-11-29 14:20" : undefined },
    { label: r.status === "rejected" ? "已驳回" : "已打款", done: r.status === "paid" || r.status === "rejected", who: r.financeUser },
  ];

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/after-sales" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回售后管理
        </Link>
        <div className="flex gap-2">
          {r.status === "cs_pending" && <Button size="sm" onClick={() => setPending("cs_submit")}>客服提单</Button>}
          {r.status === "finance_pending" && (
            <>
              <Button size="sm" variant="destructive" onClick={() => setPending("reject")}><XCircle className="mr-1 h-4 w-4" />驳回</Button>
              <Button size="sm" onClick={() => setPending("finance_pay")}><CheckCircle2 className="mr-1 h-4 w-4" />复核打款</Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="font-mono text-xl font-semibold">{r.id}</h1>
        <Badge>{STATUS[r.status]}</Badge>
        <Badge variant={r.scenario === "out_of_stock" ? "destructive" : "secondary"}>{SCENARIO[r.scenario]}</Badge>
        <span className="text-xs text-muted-foreground">关联订单 {r.orderId}</span>
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
        <Card className="p-4 lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-muted-foreground">退款金额</span><div className="text-lg font-semibold">{formatCNY(r.amountCNY)}</div></div>
            <div><span className="text-xs text-muted-foreground">申请时间</span><div>{r.createdAt}</div></div>
            <div>
              <span className="text-xs text-muted-foreground">退款场景</span>
              <div>{SCENARIO[r.scenario]}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">发起方</span>
              <div>{r.scenario === "out_of_stock" ? "档口断货触发" : "平台客服主动联系"}</div>
            </div>
            <div className="col-span-2"><span className="text-xs text-muted-foreground">退款原因</span><div>{r.reason}</div></div>
            <div className="col-span-2 rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
              说明：平台不受理买手主观意愿的退款；仅「订单断货」与「平台主动联系退款」两种场景可进入本工单流程。
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <div className="mb-2 text-sm font-semibold">财务复核字段</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">退款账户</Label>
                <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option>微信 · 张**</option>
                  <option>支付宝 · 李**</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">退款流水号</Label>
                <Input placeholder="平台生成" className="mt-1 font-mono" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">回执截图 URL</Label>
                <Input placeholder="上传后自动填充" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">备注</Label>
                <Textarea rows={2} className="mt-1" placeholder="内部备注（用户不可见）…" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">流转轨迹</div>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${s.done ? "bg-primary" : "bg-muted"}`} />
                <div className="text-xs">
                  <div className={`font-medium ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                  {s.done && (s.who || s.time) && (
                    <div className="text-muted-foreground">{s.who}{s.time ? ` · ${s.time}` : ""}</div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <RefundActionDialog actionKey={pending} onClose={() => setPending(null)} />
    </AdminShell>
  );
}

function RefundActionDialog({ actionKey, onClose }: { actionKey: ActionKey | null; onClose: () => void }) {
  const cfg = actionKey ? ACTIONS[actionKey] : null;
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const open = !!cfg;
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
            key={actionKey ?? ""}
            className="space-y-3"
            onSubmit={(ev) => {
              ev.preventDefault();
              const nextErr: Record<string, string> = {};
              for (const f of cfg.fields) {
                const v = (values[f.key] ?? "").trim();
                if (f.required && !v) nextErr[f.key] = "此项必填";
              }
              if (Object.keys(nextErr).length) {
                setErrors(nextErr);
                toast.error("请补全必填项后再提交");
                return;
              }
              toast.success(cfg.successToast);
              setValues({});
              setErrors({});
              onClose();
            }}
          >
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
                    placeholder={f.placeholder}
                    value={values[f.key] ?? ""}
                    onChange={(ev) => setValues((s) => ({ ...s, [f.key]: ev.target.value }))}
                  />
                )}
                {errors[f.key] && (
                  <div className="mt-1 text-[11px] text-destructive">{errors[f.key]}</div>
                )}
              </div>
            ))}
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>取消</Button>
              <Button type="submit" variant={cfg.destructive ? "destructive" : "default"}>{cfg.confirmLabel}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}