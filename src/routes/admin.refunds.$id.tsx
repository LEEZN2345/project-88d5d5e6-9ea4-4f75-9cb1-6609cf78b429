import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { REFUNDS, formatCNY } from "@/lib/mock-data";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
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

function RefundDetail() {
  const { id } = Route.useParams();
  const r = REFUNDS.find((x) => x.id === id) ?? REFUNDS[0]!;

  const steps = [
    { label: "买手申请", done: true, who: "陈**", time: "2025-11-28 10:00" },
    { label: "客服提单", done: !!r.csUser, who: r.csUser, time: r.createdAt },
    { label: "财务复核", done: r.status === "paid" || r.status === "rejected", who: r.financeUser, time: r.status === "paid" ? "2025-11-29 14:20" : undefined },
    { label: r.status === "rejected" ? "已驳回" : "已打款", done: r.status === "paid" || r.status === "rejected", who: r.financeUser },
  ];

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/refunds" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回退款列表
        </Link>
        <div className="flex gap-2">
          {r.status === "cs_pending" && <Button size="sm" onClick={() => toast.success("已提单至财务")}>客服提单</Button>}
          {r.status === "finance_pending" && (
            <>
              <Button size="sm" variant="destructive" onClick={() => toast.warning("已驳回")}><XCircle className="mr-1 h-4 w-4" />驳回</Button>
              <Button size="sm" onClick={() => toast.success("已打款")}><CheckCircle2 className="mr-1 h-4 w-4" />复核打款</Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="font-mono text-xl font-semibold">{r.id}</h1>
        <Badge>{STATUS[r.status]}</Badge>
        <span className="text-xs text-muted-foreground">关联订单 {r.orderId}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-muted-foreground">退款金额</span><div className="text-lg font-semibold">{formatCNY(r.amountCNY)}</div></div>
            <div><span className="text-xs text-muted-foreground">申请时间</span><div>{r.createdAt}</div></div>
            <div className="col-span-2"><span className="text-xs text-muted-foreground">退款原因</span><div>{r.reason}</div></div>
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
    </AdminShell>
  );
}