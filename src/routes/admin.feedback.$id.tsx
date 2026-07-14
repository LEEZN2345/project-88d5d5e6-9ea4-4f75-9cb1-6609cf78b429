import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/feedback/$id")({
  head: () => ({ meta: [{ title: "反馈工单详情 · 运营后台" }] }),
  component: FeedbackDetail,
});

type Msg = { role: "buyer" | "cs"; name: string; text: string; time: string };

function FeedbackDetail() {
  const { id } = Route.useParams();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "buyer", name: "陈**", text: "收到货物后发现有一件针织开衫掉毛严重，能否退款？", time: "2026-07-12 10:20" },
    { role: "cs", name: "客服-小南", text: "您好，麻烦提供开衫上身平铺照片，我们联系档口核实。", time: "2026-07-12 10:35" },
    { role: "buyer", name: "陈**", text: "[附图] 已发", time: "2026-07-12 11:02" },
  ]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMsgs((p) => [...p, { role: "cs", name: "客服-你", text: text.trim(), time: new Date().toLocaleString("zh-CN") }]);
    setText("");
    toast.success("已回复买手");
  };

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/feedback" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回反馈列表
        </Link>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("已流转到退款工单")}>转退款</Button>
          <Button size="sm" onClick={() => toast.success("工单已关闭")}>标记已解决</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="font-mono text-xl font-semibold">工单 {id}</h1>
        <Badge>处理中</Badge>
        <Badge variant="outline">质量问题</Badge>
        <span className="text-xs text-muted-foreground">关联订单 DD20251128001</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 text-sm font-semibold">会话</div>
          <div className="space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "cs" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.role === "cs" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <div className="text-[10px] opacity-70">{m.name} · {m.time}</div>
                  <div className="mt-0.5 whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <Textarea placeholder="输入回复…" value={text} onChange={(e) => setText(e.target.value)} className="min-h-20" />
            <div className="mt-2 flex justify-end gap-2">
              <Button size="sm" variant="outline">插入常用语</Button>
              <Button size="sm" onClick={send}><Send className="mr-1 h-4 w-4" />发送</Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-2 text-sm font-semibold">工单信息</div>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-xs text-muted-foreground">工单号</dt><dd className="font-mono">{id}</dd></div>
            <div><dt className="text-xs text-muted-foreground">买手</dt><dd>陈** · 138****2211</dd></div>
            <div><dt className="text-xs text-muted-foreground">关联订单</dt><dd className="font-mono text-xs">DD20251128001</dd></div>
            <div><dt className="text-xs text-muted-foreground">分类</dt><dd>质量问题</dd></div>
            <div><dt className="text-xs text-muted-foreground">优先级</dt><dd>普通</dd></div>
            <div><dt className="text-xs text-muted-foreground">负责人</dt><dd>客服-小南</dd></div>
          </dl>
        </Card>
      </div>
    </AdminShell>
  );
}