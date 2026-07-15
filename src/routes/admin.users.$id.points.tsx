import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const Route = createFileRoute("/admin/users/$id/points")({
  head: () => ({ meta: [{ title: "积分调整 · 运营后台" }] }),
  component: PointsAdjust,
});

type Reason = "compensate" | "activity" | "violation" | "correction" | "other";
const REASON_LABEL: Record<Reason, string> = {
  compensate: "客服补偿",
  activity: "活动奖励",
  violation: "违规扣减",
  correction: "手工订正",
  other: "其他",
};

type Entry = {
  id: string;
  time: string;
  operator: string;
  delta: number;
  reason: Reason;
  note: string;
  relatedOrder?: string;
};

const INITIAL: Entry[] = [
  { id: "e1", time: "2026-07-12 10:22", operator: "客服-小南", delta: 100, reason: "compensate", note: "订单延迟发货补偿", relatedOrder: "DD20260710" },
  { id: "e2", time: "2026-07-08 15:40", operator: "运营-Ken", delta: -500, reason: "violation", note: "刷单风控扣减" },
  { id: "e3", time: "2026-06-30 09:12", operator: "运营-Ken", delta: 200, reason: "activity", note: "618 活动全勤奖励" },
];

function PointsAdjust() {
  const { id } = Route.useParams();
  const [entries, setEntries] = useState<Entry[]>(INITIAL);
  const [delta, setDelta] = useState("");
  const [sign, setSign] = useState<"+" | "-">("+");
  const [reason, setReason] = useState<Reason>("compensate");
  const [note, setNote] = useState("");
  const [orderNo, setOrderNo] = useState("");

  const balance = 3240 + entries.reduce((s, e) => s + e.delta, 0) - INITIAL.reduce((s, e) => s + e.delta, 0);

  const submit = () => {
    const n = Number(delta);
    if (!n || n <= 0) return toast.error("请输入正数");
    if (!note.trim()) return toast.error("请填写备注");
    const finalDelta = sign === "+" ? n : -n;
    setEntries((p) => [
      {
        id: `e${Date.now()}`,
        time: new Date().toISOString().slice(0, 16).replace("T", " "),
        operator: "运营-Ken",
        delta: finalDelta,
        reason,
        note,
        relatedOrder: orderNo || undefined,
      },
      ...p,
    ]);
    setDelta("");
    setNote("");
    setOrderNo("");
    toast.success(`已${sign === "+" ? "增加" : "扣减"} ${n} 积分`);
  };

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/users/$id" params={{ id }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回用户详情
        </Link>
        <div className="text-sm">
          <span className="text-muted-foreground">当前积分：</span>
          <span className="text-lg font-semibold tabular-nums">{balance.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">手动调整</div>
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs text-muted-foreground">变动</div>
              <div className="flex gap-2">
                <Select value={sign} onValueChange={(v) => setSign(v as "+" | "-")}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+">增加</SelectItem>
                    <SelectItem value="-">扣减</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="积分数量" value={delta} onChange={(e) => setDelta(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">原因</div>
              <Select value={reason} onValueChange={(v) => setReason(v as Reason)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(REASON_LABEL) as Reason[]).map((r) => (
                    <SelectItem key={r} value={r}>{REASON_LABEL[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">关联订单号（选填）</div>
              <Input placeholder="DD20260712" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">备注（必填）</div>
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button className="w-full" onClick={submit}>提交调整</Button>
            <p className="text-[11px] text-muted-foreground">
              所有调整会追加流水，不可撤销。审计日志会保留操作人与时间。
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">积分流水</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">时间</th>
                  <th className="px-3 py-2 text-left font-medium">操作员</th>
                  <th className="px-3 py-2 text-right font-medium">变动</th>
                  <th className="px-3 py-2 text-left font-medium">原因</th>
                  <th className="px-3 py-2 text-left font-medium">备注</th>
                  <th className="px-3 py-2 text-left font-medium">关联单</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-3 py-2 text-xs">{e.time}</td>
                    <td className="px-3 py-2 text-xs">{e.operator}</td>
                    <td className={`px-3 py-2 text-right font-semibold tabular-nums ${e.delta > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      <span className="inline-flex items-center gap-0.5">
                        {e.delta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {e.delta > 0 ? "+" : ""}{e.delta}
                      </span>
                    </td>
                    <td className="px-3 py-2"><Badge variant="outline">{REASON_LABEL[e.reason]}</Badge></td>
                    <td className="px-3 py-2 text-xs">{e.note}</td>
                    <td className="px-3 py-2 font-mono text-xs">{e.relatedOrder ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}