import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/user-groups")({
  head: () => ({ meta: [{ title: "人群包 · 运营后台" }] }),
  component: UserGroups,
});

type Cond = {
  field: "totalSpend" | "orderCount" | "lastOrderDays" | "level" | "tag";
  op: ">=" | "<=" | "=";
  value: string;
};

type Group = {
  id: string;
  name: string;
  desc: string;
  conditions: Cond[];
  matched: number;
  updatedAt: string;
};

const FIELD_LABEL: Record<Cond["field"], string> = {
  totalSpend: "历史消费总额 (¥)",
  orderCount: "累计下单次数",
  lastOrderDays: "最近下单天数内",
  level: "会员等级",
  tag: "含标签",
};

const INITIAL: Group[] = [
  {
    id: "g1",
    name: "高价值买手",
    desc: "历史消费 ≥ ¥10000 且下单 ≥ 20 次",
    conditions: [
      { field: "totalSpend", op: ">=", value: "10000" },
      { field: "orderCount", op: ">=", value: "20" },
    ],
    matched: 87,
    updatedAt: "2026-07-10",
  },
  {
    id: "g2",
    name: "流失预警",
    desc: "≥30 天未下单 + 历史消费 ≥ ¥3000",
    conditions: [
      { field: "lastOrderDays", op: ">=", value: "30" },
      { field: "totalSpend", op: ">=", value: "3000" },
    ],
    matched: 214,
    updatedAt: "2026-07-12",
  },
  {
    id: "g3",
    name: "钻石会员待激活",
    desc: "钻石等级 + 最近 14 天未下单",
    conditions: [
      { field: "level", op: "=", value: "diamond" },
      { field: "lastOrderDays", op: ">=", value: "14" },
    ],
    matched: 12,
    updatedAt: "2026-07-11",
  },
];

function UserGroups() {
  const [groups, setGroups] = useState<Group[]>(INITIAL);
  const [name, setName] = useState("");
  const [conds, setConds] = useState<Cond[]>([{ field: "totalSpend", op: ">=", value: "" }]);

  const addCond = () => setConds((p) => [...p, { field: "orderCount", op: ">=", value: "" }]);
  const rmCond = (i: number) => setConds((p) => p.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<Cond>) =>
    setConds((p) => p.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const save = () => {
    if (!name.trim()) return toast.error("请输入分组名");
    if (conds.some((c) => !c.value)) return toast.error("请填写所有条件值");
    const matched = Math.floor(Math.random() * 500);
    setGroups((prev) => [
      {
        id: `g${Date.now()}`,
        name,
        desc: conds.map((c) => `${FIELD_LABEL[c.field]} ${c.op} ${c.value}`).join(" 且 "),
        conditions: conds,
        matched,
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setName("");
    setConds([{ field: "totalSpend", op: ">=", value: "" }]);
    toast.success(`人群包已保存，命中 ${matched} 人`);
  };

  return (
    <AdminShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">人群包 / 用户分组</h1>
        <p className="text-xs text-muted-foreground">条件组合出可复用的用户群，后续挂到营销活动/通知/优惠券使用。</p>
      </div>

      <Card className="mb-4 p-4">
        <div className="mb-3 text-sm font-semibold">新建人群包</div>
        <Input placeholder="分组名（如：618 大促预热）" value={name} onChange={(e) => setName(e.target.value)} className="mb-3 max-w-md" />
        <div className="space-y-2">
          {conds.map((c, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <Select value={c.field} onValueChange={(v) => update(i, { field: v as Cond["field"] })}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(FIELD_LABEL) as Cond["field"][]).map((f) => (
                    <SelectItem key={f} value={f}>{FIELD_LABEL[f]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={c.op} onValueChange={(v) => update(i, { op: v as Cond["op"] })}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=">=">≥</SelectItem>
                  <SelectItem value="<=">≤</SelectItem>
                  <SelectItem value="=">=</SelectItem>
                </SelectContent>
              </Select>
              <Input className="w-40" placeholder="值" value={c.value} onChange={(e) => update(i, { value: e.target.value })} />
              {conds.length > 1 && (
                <Button size="sm" variant="ghost" onClick={() => rmCond(i)}>
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={addCond}><Plus className="mr-1 h-3 w-3" />新增条件</Button>
            <Button size="sm" onClick={save}>保存人群包</Button>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {groups.map((g) => (
          <Card key={g.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{g.name}</span>
                  <Badge variant="secondary">命中 {g.matched} 人</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{g.desc}</div>
                <div className="mt-1 text-xs text-muted-foreground">更新于 {g.updatedAt}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.info("已刷新命中数")}>刷新</Button>
                <Button size="sm" variant="ghost" onClick={() => setGroups((p) => p.filter((x) => x.id !== g.id))}>删除</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}