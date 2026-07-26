import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Tag as TagIcon } from "lucide-react";

export const Route = createFileRoute("/admin/user-tags")({
  head: () => ({ meta: [{ title: "会员标签 · 运营后台" }] }),
  component: UserTags,
});

type Tag = {
  id: string;
  name: string;
  type: "manual" | "system";
  color: string;
  desc: string;
  userCount: number;
};

const INITIAL: Tag[] = [
  { id: "t1", name: "VIP 大客户", type: "manual", color: "bg-amber-100 text-amber-700", desc: "月消费 ≥ ¥5,000 手动标注", userCount: 42 },
  { id: "t2", name: "内部测试", type: "manual", color: "bg-slate-100 text-slate-700", desc: "运营/开发内部账号", userCount: 8 },
  { id: "t3", name: "刷单可疑", type: "manual", color: "bg-rose-100 text-rose-700", desc: "风控人工标注", userCount: 3 },
  { id: "t4", name: "新用户 (7 天)", type: "system", color: "bg-emerald-100 text-emerald-700", desc: "注册 ≤ 7 天", userCount: 128 },
  { id: "t5", name: "7 日未下单", type: "system", color: "bg-orange-100 text-orange-700", desc: "最近 7 天无订单", userCount: 356 },
  { id: "t6", name: "高客单 (≥¥1000)", type: "system", color: "bg-primary/15 text-primary", desc: "单笔订单 ≥ ¥1000", userCount: 67 },
  { id: "t7", name: "沉睡用户", type: "system", color: "bg-zinc-100 text-zinc-700", desc: "≥30 天无登录", userCount: 214 },
];

function UserTags() {
  const [tags, setTags] = useState<Tag[]>(INITIAL);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const add = () => {
    if (!name.trim()) return toast.error("请输入标签名");
    setTags((prev) => [
      { id: `t${Date.now()}`, name, type: "manual", color: "bg-primary/15 text-primary", desc, userCount: 0 },
      ...prev,
    ]);
    setName("");
    setDesc("");
    toast.success("已新增标签");
  };

  const del = (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    toast.success("已删除");
  };

  return (
    <AdminShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">会员标签</h1>
        <p className="text-xs text-muted-foreground">手动标签 + 系统自动标签，用于人群包与精细化运营。</p>
      </div>

      <Card className="mb-4 p-4">
        <div className="mb-2 text-sm font-semibold">新增手动标签</div>
        <div className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
          <Input placeholder="标签名（如：直播间用户）" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="用途说明" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Button onClick={add}><Plus className="mr-1 h-4 w-4" />新增</Button>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {(["manual", "system"] as const).map((type) => (
          <Card key={type} className="p-4">
            <div className="mb-3 text-sm font-semibold">
              {type === "manual" ? "手动标签" : "系统标签（自动）"}
              <span className="ml-2 text-xs text-muted-foreground">
                共 {tags.filter((t) => t.type === type).length} 个
              </span>
            </div>
            <div className="space-y-2">
              {tags.filter((t) => t.type === type).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={t.color} variant="secondary"><TagIcon className="mr-1 h-3 w-3" />{t.name}</Badge>
                      <span className="text-xs text-muted-foreground">{t.userCount} 人</span>
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{t.desc}</div>
                  </div>
                  {type === "manual" && (
                    <Button size="sm" variant="ghost" onClick={() => del(t.id)}>
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}